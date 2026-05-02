# =============================================================================
# simulator_service.py - Local Cloud Simulation Service
# =============================================================================
# Provides mock cloud operations by storing state in the local database.
# This allows CloudSim to run without real AWS credentials.
# =============================================================================

from sqlalchemy.orm import Session
from .models import Instance
from datetime import datetime, timedelta
import uuid
import random
import threading
from typing import Any

_SIM_LOCK = threading.Lock()
_SAMPLE_INTERVAL_SECONDS = 5
_MAX_HISTORY_POINTS = 2880  # ~4 hours at 5s intervals

_METRIC_STATE: dict[str, dict[str, float | datetime]] = {}
_METRIC_HISTORY: dict[str, dict[str, list[dict[str, Any]]]] = {}

INSTANCE_CPU_FACTORS = {
    "t2.nano": 0.7,
    "t2.micro": 0.9,
    "t2.small": 1.0,
    "t2.medium": 1.2,
    "t2.large": 1.4,
}

INSTANCE_HOURLY_COST = {
    "t2.nano": 0.0065,
    "t2.micro": 0.0116,
    "t2.small": 0.0230,
    "t2.medium": 0.0464,
    "t2.large": 0.0928,
}


def _to_iso(ts: datetime) -> str:
    return ts.replace(microsecond=0).isoformat()


def _new_state(instance_type: str) -> dict[str, float | datetime]:
    cpu_factor = INSTANCE_CPU_FACTORS.get(instance_type, 1.0)
    return {
        "cpu": random.uniform(10, 28) * cpu_factor,
        "network_in": random.uniform(120_000, 620_000) * cpu_factor,
        "network_out": random.uniform(80_000, 420_000) * cpu_factor,
        "disk_read": random.uniform(3, 14) * cpu_factor,
        "disk_write": random.uniform(2, 8) * cpu_factor,
        "last_updated": datetime.utcnow(),
    }


def _seed_history(instance_id: str, now: datetime, state: dict[str, float | datetime]) -> None:
    _METRIC_HISTORY[instance_id] = {
        "cpu_utilization": [{"timestamp": _to_iso(now), "value": round(float(state["cpu"]), 2)}],
        "network_in": [{"timestamp": _to_iso(now), "value": round(float(state["network_in"]), 2)}],
        "network_out": [{"timestamp": _to_iso(now), "value": round(float(state["network_out"]), 2)}],
        "disk_read_ops": [{"timestamp": _to_iso(now), "value": round(float(state["disk_read"]), 2)}],
        "disk_write_ops": [{"timestamp": _to_iso(now), "value": round(float(state["disk_write"]), 2)}],
    }


def _bounded(value: float, minimum: float, maximum: float) -> float:
    return max(min(value, maximum), minimum)


def _next_running_value(current: float, floor: float, ceiling: float, volatility: float) -> float:
    drift = random.uniform(-volatility, volatility)
    target_pull = (floor + ceiling) / 2
    return _bounded((current * 0.85) + (target_pull * 0.15) + drift, floor, ceiling)


def _next_idle_value(current: float, floor: float = 0.0) -> float:
    return max(floor, current * random.uniform(0.45, 0.75))


def _append_sample(
    instance_id: str,
    ts: datetime,
    state: dict[str, float | datetime],
) -> None:
    history = _METRIC_HISTORY[instance_id]
    history["cpu_utilization"].append({"timestamp": _to_iso(ts), "value": round(float(state["cpu"]), 2)})
    history["network_in"].append({"timestamp": _to_iso(ts), "value": round(float(state["network_in"]), 2)})
    history["network_out"].append({"timestamp": _to_iso(ts), "value": round(float(state["network_out"]), 2)})
    history["disk_read_ops"].append({"timestamp": _to_iso(ts), "value": round(float(state["disk_read"]), 2)})
    history["disk_write_ops"].append({"timestamp": _to_iso(ts), "value": round(float(state["disk_write"]), 2)})

    for metric_points in history.values():
        if len(metric_points) > _MAX_HISTORY_POINTS:
            del metric_points[:-_MAX_HISTORY_POINTS]


def _ensure_and_advance_state(instance: Instance) -> None:
    now = datetime.utcnow()
    instance_id = instance.instance_id
    instance_type = instance.instance_type or "t2.micro"
    cpu_factor = INSTANCE_CPU_FACTORS.get(instance_type, 1.0)

    with _SIM_LOCK:
        if instance_id not in _METRIC_STATE:
            _METRIC_STATE[instance_id] = _new_state(instance_type)
            _seed_history(instance_id, now, _METRIC_STATE[instance_id])
            return

        state = _METRIC_STATE[instance_id]
        last_updated = state.get("last_updated")
        if not isinstance(last_updated, datetime):
            last_updated = now

        elapsed = (now - last_updated).total_seconds()
        if elapsed < _SAMPLE_INTERVAL_SECONDS:
            return

        steps = int(elapsed // _SAMPLE_INTERVAL_SECONDS)
        for step in range(steps):
            sample_time = last_updated + timedelta(seconds=(step + 1) * _SAMPLE_INTERVAL_SECONDS)
            is_running = instance.state == "running"

            if is_running:
                state["cpu"] = _next_running_value(float(state["cpu"]), 5 * cpu_factor, 82 * cpu_factor, 4.0)
                state["network_in"] = _next_running_value(float(state["network_in"]), 60_000, 2_200_000 * cpu_factor, 60_000)
                state["network_out"] = _next_running_value(float(state["network_out"]), 40_000, 1_800_000 * cpu_factor, 45_000)
                state["disk_read"] = _next_running_value(float(state["disk_read"]), 0.2, 75 * cpu_factor, 2.5)
                state["disk_write"] = _next_running_value(float(state["disk_write"]), 0.1, 48 * cpu_factor, 1.7)
            else:
                state["cpu"] = _next_idle_value(float(state["cpu"]), 0.1)
                state["network_in"] = _next_idle_value(float(state["network_in"]), 20.0)
                state["network_out"] = _next_idle_value(float(state["network_out"]), 15.0)
                state["disk_read"] = _next_idle_value(float(state["disk_read"]), 0.0)
                state["disk_write"] = _next_idle_value(float(state["disk_write"]), 0.0)

            _append_sample(instance_id, sample_time, state)

        state["last_updated"] = last_updated + timedelta(seconds=steps * _SAMPLE_INTERVAL_SECONDS)


def _filtered_history(instance_id: str, period_minutes: int) -> dict[str, list[dict[str, Any]]]:
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=period_minutes)
    history = _METRIC_HISTORY.get(instance_id)
    if not history:
        return {
            "cpu_utilization": [],
            "network_in": [],
            "network_out": [],
            "disk_read_ops": [],
            "disk_write_ops": [],
        }

    filtered: dict[str, list[dict[str, Any]]] = {}
    for key, points in history.items():
        filtered[key] = [p for p in points if datetime.fromisoformat(p["timestamp"]) >= cutoff]
    return filtered

def list_simulated_instances(db: Session):
    """List instances from the local database as if they were from AWS."""
    instances = db.query(Instance).all()
    result = []
    for inst in instances:
        result.append({
            "instance_id": inst.instance_id,
            "name": inst.name or "Unnamed",
            "instance_type": inst.instance_type,
            "state": inst.state,
            "public_ip": inst.public_ip,
            "private_ip": inst.private_ip,
            "launch_time": inst.launch_time.isoformat() if inst.launch_time else None,
            "availability_zone": inst.availability_zone or "us-east-1a",
            "tags": [
                {"Key": "Name", "Value": inst.name or ""},
                {"Key": "CreatedBy", "Value": str(inst.created_by_user_id or "")}
            ],
        })
    return result

def get_simulated_instance(db: Session, instance_id: str):
    """Get detailed instance info from local DB."""
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        return None
    
    _ensure_and_advance_state(inst)

    return {
        "instance_id": inst.instance_id,
        "name": inst.name or "Unnamed",
        "instance_type": inst.instance_type,
        "state": inst.state,
        "public_ip": inst.public_ip,
        "private_ip": inst.private_ip,
        "launch_time": inst.launch_time.isoformat() if inst.launch_time else None,
        "availability_zone": inst.availability_zone or "us-east-1a",
        "platform": "Linux/UNIX",
        "tenancy": "default",
        "ami_id": "ami-simulated-001",
        "monitoring": "enabled",
        "key_name": f"{(inst.name or 'instance').lower().replace(' ', '-')}-key",
        "public_dns": f"ec2-{(inst.public_ip or '0.0.0.0').replace('.', '-')}.compute-1.amazonaws.com" if inst.public_ip else None,
        "private_dns": f"ip-{(inst.private_ip or '0.0.0.0').replace('.', '-')}.ec2.internal" if inst.private_ip else None,
        "vpc_id": "vpc-simulated-001",
        "subnet_id": "subnet-simulated-001",
        "iam_role": "arn:aws:iam::123456789012:instance-profile/CloudSimDefaultRole",
        "tags": [
            {"Key": "Name", "Value": inst.name or ""},
            {"Key": "CreatedBy", "Value": str(inst.created_by_user_id or "")},
            {"Key": "Environment", "Value": "simulation"},
            {"Key": "ManagedBy", "Value": "CloudSim"},
        ],
        "block_devices": [
            {
                "device_name": "/dev/xvda",
                "volume_id": "vol-" + inst.instance_id[-8:],
                "size": 8,
                "volume_type": "gp3",
                "iops": 3000,
                "throughput": 125,
                "encrypted": False,
                "delete_on_termination": True
            }
        ],
        "security_groups": [{"GroupId": "sg-sim-01", "GroupName": "default"}]
    }

def create_simulated_instance(db: Session, name: str, instance_type: str, user_id: int):
    """Create a new instance record in the local DB."""
    instance_id = "i-" + str(uuid.uuid4())[:17].replace("-", "")
    new_inst = Instance(
        instance_id=instance_id,
        name=name,
        instance_type=instance_type,
        state="running",
        public_ip=f"13.{random.randint(1,254)}.{random.randint(1,254)}.{random.randint(1,254)}",
        private_ip=f"172.31.{random.randint(1,254)}.{random.randint(1,254)}",
        availability_zone="us-east-1a",
        launch_time=datetime.utcnow(),
        created_by_user_id=user_id,
        last_synced=datetime.utcnow()
    )
    db.add(new_inst)
    db.commit()
    db.refresh(new_inst)
    _ensure_and_advance_state(new_inst)
    return {"message": f"Created instance {instance_id}", "instance_id": instance_id}

def update_simulated_instance_state(db: Session, instance_id: str, new_state: str):
    """Update instance state in local DB."""
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if inst:
        inst.state = new_state
        db.commit()
        _ensure_and_advance_state(inst)
        return {"message": f"Instance {instance_id} is now {new_state}", "instance_id": instance_id}
    return None

def get_simulated_metrics(db: Session, instance_id: str, period_minutes: int = 60):
    """Return stateful, time-evolving metrics for the requested period."""
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        return {
            "instance_id": instance_id,
            "cpu_utilization": [],
            "network_in": [],
            "network_out": [],
            "disk_read_ops": [],
            "disk_write_ops": [],
        }

    _ensure_and_advance_state(inst)
    history = _filtered_history(instance_id, max(5, period_minutes))
    return {"instance_id": instance_id, **history}


def _compute_usage_multiplier(db: Session) -> float:
    instances = db.query(Instance).all()
    if not instances:
        return 1.0

    running = [inst for inst in instances if inst.state == "running"]
    if not running:
        return 0.55

    cpu_values = []
    for inst in running:
        _ensure_and_advance_state(inst)
        state = _METRIC_STATE.get(inst.instance_id)
        if state:
            cpu_values.append(float(state["cpu"]))
    if not cpu_values:
        return 1.0
    avg_cpu = sum(cpu_values) / len(cpu_values)
    return _bounded(0.6 + (avg_cpu / 100), 0.65, 1.75)


def get_simulated_costs(db: Session, days: int = 7):
    """Generate deterministic cost trend based on current simulated load."""
    days = max(1, min(days, 31))
    today = datetime.utcnow().date()
    instances = db.query(Instance).all()
    usage_multiplier = _compute_usage_multiplier(db)

    base_hourly = 0.0
    for inst in instances:
        hourly = INSTANCE_HOURLY_COST.get(inst.instance_type or "t2.micro", 0.0116)
        if inst.state == "running":
            base_hourly += hourly
        elif inst.state in ("stopped", "terminated"):
            base_hourly += hourly * 0.08
        else:
            base_hourly += hourly * 0.45

    if base_hourly == 0:
        base_hourly = 0.02

    costs = []
    for i in range(days):
        day = today - timedelta(days=days - 1 - i)
        trend = 0.92 + (i / max(days - 1, 1)) * 0.18
        daily_total = round(base_hourly * 24 * usage_multiplier * trend, 2)
        compute = round(daily_total * 0.78, 2)
        storage = round(daily_total * 0.17, 2)
        network = round(max(daily_total - compute - storage, 0.01), 2)
        costs.append(
            {
                "date": day.isoformat(),
                "compute": compute,
                "storage": storage,
                "network": network,
                "total": round(compute + storage + network, 2),
            }
        )
    return costs


def get_simulated_monthly_summary(db: Session):
    """Return month summary derived from current simulated inventory + usage."""
    today = datetime.utcnow().date()
    month_days = max(today.day, 1)
    daily = get_simulated_costs(db, days=1)[0]["total"]
    usage_multiplier = _compute_usage_multiplier(db)

    month_to_date = round(daily * month_days * usage_multiplier, 2)
    projected_monthly = round(month_to_date / month_days * 30, 2)
    return {
        "month_to_date": month_to_date,
        "projected_monthly": projected_monthly,
        "days_elapsed": month_days,
    }


def get_simulated_current_metrics(db: Session, instance_id: str):
    """Return the latest stateful sample for dashboard quick stats."""
    inst = db.query(Instance).filter(Instance.instance_id == instance_id).first()
    if not inst:
        return {
            "instance_id": instance_id,
            "cpu_percent": 0.0,
            "network_in_bytes": 0,
            "network_out_bytes": 0,
        }

    _ensure_and_advance_state(inst)
    state = _METRIC_STATE.get(instance_id) or _new_state(inst.instance_type or "t2.micro")

    return {
        "instance_id": instance_id,
        "cpu_percent": round(float(state["cpu"]), 1),
        "network_in_bytes": int(float(state["network_in"])),
        "network_out_bytes": int(float(state["network_out"])),
    }
