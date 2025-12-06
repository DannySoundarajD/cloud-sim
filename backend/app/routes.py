from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .db import get_db
from .models import Instance
from .schemas import InstanceCreate, InstanceRead

router = APIRouter()


@router.post("/api/instances", response_model=InstanceRead, status_code=status.HTTP_201_CREATED)
def create_instance(payload: InstanceCreate, db: Session = Depends(get_db)):
    """Create a new EC2 instance."""
    if db.get(Instance, payload.id):
        raise HTTPException(status_code=409, detail="Instance already exists")
    inst = Instance(**payload.model_dump(), state="running")
    db.add(inst)
    db.commit()
    db.refresh(inst)
    return inst


@router.get("/api/instances", response_model=list[InstanceRead])
def list_instances(db: Session = Depends(get_db)):
    """List all instances."""
    return db.query(Instance).all()


@router.get("/api/instances/{instance_id}", response_model=InstanceRead)
def get_instance(instance_id: str, db: Session = Depends(get_db)):
    """Get a specific instance by ID."""
    inst = db.get(Instance, instance_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instance not found")
    return inst


@router.delete("/api/instances/{instance_id}")
def delete_instance(instance_id: str, db: Session = Depends(get_db)):
    """Delete an instance."""
    inst = db.get(Instance, instance_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Instance not found")
    db.delete(inst)
    db.commit()
    return {"id": instance_id, "status": "terminated", "message": "Instance successfully terminated"}
