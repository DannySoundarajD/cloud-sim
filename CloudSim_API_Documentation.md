# CloudSim API Documentation

## Overview
This document describes the REST API endpoints for CloudSim, a cloud infrastructure simulation platform. The API supports EC2 instance management, monitoring, scaling, and resource provisioning operations.

**Base URL:** `https://api.cloudsim.com/v1`

**Authentication:** Bearer token in `Authorization` header
```
Authorization: Bearer <token>
```

**Content-Type:** `application/json`

---

## Table of Contents
1. [Instance Management](#instance-management)
2. [Dashboard & Overview](#dashboard--overview)
3. [Instance Details](#instance-details)
4. [Scaling & Configuration](#scaling--configuration)
5. [Monitoring & Metrics](#monitoring--metrics)
6. [Storage Management](#storage-management)
7. [Network Management](#network-management)
8. [Alarms & Alerts](#alarms--alerts)
9. [Cost Management](#cost-management)
10. [System Configuration](#system-configuration)
11. [User Management](#user-management)
12. [WebSocket Events](#websocket-events)

---

## Instance Management

### 1. Create Instance
Create a new EC2 instance with specified configuration.

**Endpoint:** `POST /api/instances/create`

**Request Body:**
```json
{
  "name": "web-server-01",
  "ami_id": "ami-0c55b159cbfafe1f0",
  "instance_type": "t2.micro",
  "cpu": 1,
  "memory": 1024,
  "region": "us-east-1",
  "availability_zone": "us-east-1a",
  "vpc_id": "vpc-0a1b2c3d4e5f",
  "subnet_id": "subnet-0a1b2c3d",
  "security_group_ids": ["sg-0a1b2c3d"],
  "key_pair_name": "my-ec2-keypair",
  "auto_assign_public_ip": true,
  "storage": {
    "root_volume": {
      "size_gb": 8,
      "type": "gp3",
      "delete_on_termination": true
    }
  },
  "iam_role": "EC2-S3-Read-Only-Role",
  "monitoring": {
    "enabled": false,
    "detailed": false
  },
  "tags": [
    {"key": "Name", "value": "web-server-01"},
    {"key": "Environment", "value": "Production"}
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "name": "web-server-01",
  "status": "creating",
  "instance_type": "t2.micro",
  "region": "us-east-1",
  "availability_zone": "us-east-1a",
  "public_ip": null,
  "private_ip": "172.31.16.22",
  "created_at": "2025-11-13T08:30:45Z",
  "message": "Instance creation initiated"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input parameters
- `403 Forbidden` - Insufficient permissions
- `409 Conflict` - Resource limit exceeded

---

### 2. List Instances
Retrieve a list of all instances with optional filtering.

**Endpoint:** `GET /api/instances`

**Query Parameters:**
- `state` (optional) - Filter by state: `running`, `stopped`, `pending`, `terminated`
- `region` (optional) - Filter by region
- `instance_type` (optional) - Filter by instance type
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "instances": [
    {
      "id": "i-0a1b2c3d4e5f6g7h8",
      "name": "web-server-01",
      "type": "t2.micro",
      "state": "running",
      "zone": "us-east-1a",
      "public_ip": "54.123.45.67",
      "private_ip": "172.31.16.22",
      "uptime": "5d 14h",
      "created_at": "2025-11-08T08:30:45Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### 3. Get Instance Details
Retrieve detailed information about a specific instance.

**Endpoint:** `GET /api/instances/{id}`

**Response:** `200 OK`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "name": "web-server-01",
  "state": "running",
  "instance_type": "t2.micro",
  "ami_id": "ami-0c55b159cbfafe1f0",
  "ami_name": "Amazon Linux 2023 AMI",
  "platform": "Linux/UNIX",
  "region": "us-east-1",
  "availability_zone": "us-east-1a",
  "public_ip": "54.123.45.67",
  "private_ip": "172.31.16.22",
  "public_dns": "ec2-54-123-45-67.compute-1.amazonaws.com",
  "private_dns": "ip-172-31-16-22.ec2.internal",
  "uptime": "5 days, 14 hours",
  "launch_time": "2025-11-08T08:30:45Z",
  "created_at": "2025-11-08T08:30:45Z",
  "cpu": {
    "vcpus": 1,
    "credits": "T2 Unlimited Disabled"
  },
  "memory": {
    "total_gb": 1.0,
    "allocated_gb": 1.0
  },
  "monitoring": "Basic (5 min)",
  "tenancy": "Default",
  "vpc": {
    "id": "vpc-0a1b2c3d4e5f",
    "name": "default-vpc"
  },
  "subnet": {
    "id": "subnet-0a1b2c3d",
    "name": "subnet-0a1b2c3d"
  },
  "security_groups": [
    {
      "id": "sg-0a1b2c3d4e5f6g7h",
      "name": "default",
      "description": "Default security group"
    }
  ],
  "iam_role": "EC2-S3-Read-Only-Role",
  "key_pair_name": "my-ec2-keypair",
  "tags": [
    {"key": "Name", "value": "web-server-01"},
    {"key": "Environment", "value": "Production"}
  ]
}
```

**Error Responses:**
- `404 Not Found` - Instance not found

---

### 4. Start Instance
Start a stopped instance.

**Endpoint:** `POST /api/instances/{id}/start`

**Response:** `200 OK`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "status": "pending",
  "previous_state": "stopped",
  "message": "Instance start initiated"
}
```

---

### 5. Stop Instance
Stop a running instance.

**Endpoint:** `POST /api/instances/{id}/stop`

**Request Body (optional):**
```json
{
  "force": false
}
```

**Response:** `200 OK`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "status": "stopping",
  "previous_state": "running",
  "message": "Instance stop initiated"
}
```

---

### 6. Reboot Instance
Reboot a running instance.

**Endpoint:** `POST /api/instances/{id}/reboot`

**Response:** `200 OK`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "status": "rebooting",
  "message": "Instance reboot initiated"
}
```

---

### 7. Terminate Instance
Permanently delete an instance.

**Endpoint:** `DELETE /api/instances/{id}`

**Query Parameters:**
- `force` (optional) - Force termination (default: false)

**Response:** `200 OK`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "status": "terminated",
  "message": "Instance successfully terminated"
}
```

---

## Dashboard & Overview

### 8. Get Account Overview
Retrieve summary statistics for the account.

**Endpoint:** `GET /api/dashboard/overview`

**Response:** `200 OK`
```json
{
  "summary": {
    "total_instances": 5,
    "running_instances": 4,
    "stopped_instances": 1,
    "active_alarms": 1
  },
  "resource_usage": {
    "cpu": {
      "used": 7,
      "limit": 20,
      "percentage": 35
    },
    "memory": {
      "used_gb": 15,
      "limit_gb": 64,
      "percentage": 23
    },
    "storage": {
      "used_gb": 180,
      "limit_gb": 1000,
      "percentage": 18
    }
  },
  "availability_zones": [
    {
      "name": "us-east-1a",
      "status": "healthy",
      "instances": 2,
      "cpu_avg": 23
    },
    {
      "name": "us-east-1b",
      "status": "healthy",
      "instances": 2,
      "cpu_avg": 34
    },
    {
      "name": "us-east-1c",
      "status": "healthy",
      "instances": 1,
      "cpu_avg": 0
    }
  ],
  "last_updated": "2025-11-13T14:32:45Z"
}
```

---

### 9. Get Instance Alarms Summary
Get summary of CloudWatch alarms for instances.

**Endpoint:** `GET /api/dashboard/alarms`

**Response:** `200 OK`
```json
{
  "alarms": [
    {
      "id": "alarm-001",
      "name": "web-server-01-cpu-high",
      "instance_id": "i-0a1b2c3d4e5f6g7h8",
      "instance_name": "web-server-01",
      "metric": "CPU Utilization",
      "status": "ok",
      "threshold": 80,
      "current_value": 15.2
    },
    {
      "id": "alarm-002",
      "name": "db-server-01-disk",
      "instance_id": "i-2c3d4e5f6g7h8i9j0",
      "instance_name": "db-server-01",
      "metric": "Disk Space",
      "status": "alarm",
      "threshold": 85,
      "current_value": 92.3
    }
  ],
  "summary": {
    "total": 4,
    "ok": 3,
    "alarm": 1
  }
}
```

---

## Instance Details

### 10. Get Instance Networking Details
Get network interfaces and VPC information for an instance.

**Endpoint:** `GET /api/instances/{id}/networking`

**Response:** `200 OK`
```json
{
  "network_interfaces": [
    {
      "id": "eni-0a1b2c3d4e5f",
      "type": "Primary",
      "private_ip": "172.31.16.22",
      "public_ip": "54.123.45.67",
      "subnet_id": "subnet-0a1b2c3d",
      "mac_address": "02:42:ac:1f:10:16"
    }
  ],
  "vpc": {
    "id": "vpc-0a1b2c3d4e5f",
    "name": "default-vpc",
    "cidr": "172.31.0.0/16"
  },
  "subnet": {
    "id": "subnet-0a1b2c3d",
    "name": "subnet-0a1b2c3d",
    "cidr": "172.31.16.0/20",
    "availability_zone": "us-east-1a"
  },
  "dns": {
    "public_dns": "ec2-54-123-45-67.compute-1.amazonaws.com",
    "private_dns": "ip-172-31-16-22.ec2.internal"
  }
}
```

---

### 11. Get Instance Storage Details
Get block devices and volumes attached to an instance.

**Endpoint:** `GET /api/instances/{id}/storage`

**Response:** `200 OK`
```json
{
  "block_devices": [
    {
      "device_name": "/dev/xvda",
      "volume_id": "vol-0a1b2c3d4e5f6g7h",
      "type": "gp3",
      "size_gb": 8,
      "iops": 3000,
      "throughput_mbps": 125,
      "delete_on_termination": true,
      "encrypted": false
    }
  ],
  "total_storage_gb": 8
}
```

---

### 12. Get Instance Tags
Get all tags associated with an instance.

**Endpoint:** `GET /api/instances/{id}/tags`

**Response:** `200 OK`
```json
{
  "tags": [
    {"key": "Name", "value": "web-server-01"},
    {"key": "Environment", "value": "Production"},
    {"key": "Owner", "value": "DevOps Team"},
    {"key": "Project", "value": "WebApp-2025"}
  ]
}
```

---

### 13. Update Instance Tags
Add or update tags for an instance.

**Endpoint:** `PUT /api/instances/{id}/tags`

**Request Body:**
```json
{
  "tags": [
    {"key": "Name", "value": "web-server-01"},
    {"key": "Environment", "value": "Production"},
    {"key": "Owner", "value": "DevOps Team"}
  ]
}
```

**Response:** `200 OK`
```json
{
  "status": "updated",
  "message": "Tags updated successfully",
  "tags": [
    {"key": "Name", "value": "web-server-01"},
    {"key": "Environment", "value": "Production"},
    {"key": "Owner", "value": "DevOps Team"}
  ]
}
```

---

## Scaling & Configuration

### 14. Scale Instance (Modify Resources)
Modify instance compute resources (CPU, memory, instance type).

**Endpoint:** `PUT /api/instances/scale/{id}`

**Request Body:**
```json
{
  "instance_type": "t3.medium",
  "cpu": 2,
  "memory": 4096,
  "cpu_allocation_percent": 75,
  "memory_allocation_gb": 3
}
```

**Response:** `200 OK`
```json
{
  "id": "i-0a1b2c3d4e5f6g7h8",
  "status": "updating",
  "previous_config": {
    "instance_type": "t2.micro",
    "cpu": 1,
    "memory": 1024
  },
  "new_config": {
    "instance_type": "t3.medium",
    "cpu": 2,
    "memory": 4096
  },
  "message": "Scaling initiated"
}
```

---

### 15. Configure Instance Settings
Update advanced instance settings (monitoring, auto-restart, backup, etc.).

**Endpoint:** `PATCH /api/instances/{id}/configure`

**Request Body:**
```json
{
  "monitoring": {
    "enabled": true,
    "detailed": true
  },
  "auto_restart_on_failure": true,
  "backup": {
    "frequency": "daily",
    "retention_days": 7
  },
  "storage": {
    "size_gb": 50,
    "type": "gp3"
  }
}
```

**Response:** `200 OK`
```json
{
  "status": "updated",
  "message": "Instance configuration updated successfully"
}
```

---

## Monitoring & Metrics

### 16. Get Instance Metrics
Retrieve current and historical metrics for an instance.

**Endpoint:** `GET /api/metrics/{instance_id}`

**Query Parameters:**
- `range` (optional) - Time range: `15m`, `1h`, `6h`, `24h`, `7d` (default: `1h`)
- `metric` (optional) - Specific metric: `cpu`, `memory`, `network`, `disk` (default: all)

**Response:** `200 OK`
```json
{
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "current": {
    "cpu": 15.2,
    "memory": {
      "used_mb": 512,
      "total_mb": 1024,
      "percentage": 50
    },
    "network": {
      "in_mbps": 1.2,
      "out_mbps": 0.8
    },
    "disk": {
      "read_ops": 48,
      "write_ops": 35,
      "utilization_percent": 24
    },
    "timestamp": "2025-11-13T14:32:45Z"
  },
  "historical": {
    "cpu": [
      {"time": "2025-11-13T13:00:00Z", "value": 12.0},
      {"time": "2025-11-13T13:15:00Z", "value": 8.0},
      {"time": "2025-11-13T13:30:00Z", "value": 25.0}
    ],
    "memory": [
      {"time": "2025-11-13T13:00:00Z", "used": 512, "available": 512},
      {"time": "2025-11-13T13:15:00Z", "used": 486, "available": 538}
    ],
    "network": [
      {"time": "2025-11-13T13:00:00Z", "in": 120, "out": 80},
      {"time": "2025-11-13T13:15:00Z", "in": 90, "out": 60}
    ],
    "disk": [
      {"time": "2025-11-13T13:00:00Z", "read": 45, "write": 32},
      {"time": "2025-11-13T13:15:00Z", "read": 38, "write": 28}
    ]
  },
  "statistics": {
    "cpu": {
      "average": 23.7,
      "peak": 45.0,
      "min": 8.0
    },
    "memory": {
      "average_used_mb": 599,
      "peak_used_mb": 768,
      "total_mb": 1024
    },
    "network": {
      "total_in_gb": 2.1,
      "total_out_gb": 1.5,
      "packet_loss_percent": 0.02
    },
    "disk": {
      "avg_read_ops": 58.7,
      "avg_write_ops": 43.1,
      "utilization_percent": 24
    }
  }
}
```

---

### 17. Export Metrics
Export metrics data as CSV for offline analysis.

**Endpoint:** `GET /api/metrics/export`

**Query Parameters:**
- `instance_id` (required) - Instance ID
- `range` (optional) - Time range: `1h`, `6h`, `24h`, `7d`, `30d` (default: `24h`)
- `format` (optional) - Export format: `csv`, `json` (default: `csv`)

**Response:** `200 OK`
```
Content-Type: text/csv
Content-Disposition: attachment; filename="metrics_i-0a1b2c3d4e5f6g7h8_2025-11-13.csv"

timestamp,cpu,memory_used,memory_total,network_in,network_out,disk_read,disk_write
2025-11-13T13:00:00Z,12.0,512,1024,120,80,45,32
2025-11-13T13:15:00Z,8.0,486,1024,90,60,38,28
...
```

---

### 18. Get Instance Logs
Retrieve system logs for an instance.

**Endpoint:** `GET /api/instances/{id}/logs`

**Query Parameters:**
- `level` (optional) - Filter by log level: `ERROR`, `WARN`, `INFO`, `DEBUG` (default: all)
- `limit` (optional) - Number of log entries (default: 100, max: 1000)
- `since` (optional) - ISO 8601 timestamp to fetch logs since

**Response:** `200 OK`
```json
{
  "logs": [
    {
      "timestamp": "2025-11-13T14:32:45Z",
      "level": "INFO",
      "message": "Instance health check passed",
      "source": "system"
    },
    {
      "timestamp": "2025-11-13T14:30:12Z",
      "level": "INFO",
      "message": "Network interface eth0 traffic normal",
      "source": "network"
    },
    {
      "timestamp": "2025-11-13T14:28:03Z",
      "level": "WARN",
      "message": "CPU utilization spike detected (78%)",
      "source": "monitoring"
    }
  ],
  "total": 100,
  "limit": 100
}
```

---

## Storage Management

### 19. Create and Attach Storage Volume
Create a new storage volume and attach it to an instance.

**Endpoint:** `POST /api/storage/create`

**Request Body:**
```json
{
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "name": "vol-01",
  "size_gb": 50,
  "type": "SSD",
  "volume_type": "gp3",
  "iops": 3000,
  "throughput_mbps": 125,
  "encrypted": false
}
```

**Response:** `201 Created`
```json
{
  "id": "vol-01",
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "status": "attached",
  "size_gb": 50,
  "type": "SSD",
  "volume_type": "gp3",
  "created_at": "2025-11-13T14:32:45Z"
}
```

---

### 20. List Storage Volumes
Get all storage volumes, optionally filtered by instance.

**Endpoint:** `GET /api/storage/volumes`

**Query Parameters:**
- `instance_id` (optional) - Filter by instance ID
- `status` (optional) - Filter by status: `attached`, `detached`, `available`

**Response:** `200 OK`
```json
{
  "volumes": [
    {
      "id": "vol-01",
      "instance_id": "i-0a1b2c3d4e5f6g7h8",
      "name": "vol-01",
      "size_gb": 50,
      "type": "SSD",
      "volume_type": "gp3",
      "status": "attached",
      "created_at": "2025-11-13T14:32:45Z"
    }
  ]
}
```

---

### 21. Detach Storage Volume
Detach a volume from an instance.

**Endpoint:** `POST /api/storage/{volume_id}/detach`

**Response:** `200 OK`
```json
{
  "id": "vol-01",
  "status": "detached",
  "message": "Volume successfully detached"
}
```

---

### 22. Delete Storage Volume
Permanently delete a storage volume.

**Endpoint:** `DELETE /api/storage/{volume_id}`

**Response:** `200 OK`
```json
{
  "id": "vol-01",
  "status": "deleted",
  "message": "Volume successfully deleted"
}
```

---

## Network Management

### 23. Get Network Topology
Retrieve network topology graph data for visualization.

**Endpoint:** `GET /api/network/topology`

**Response:** `200 OK`
```json
{
  "nodes": [
    {
      "id": "i-0a1b2c3d4e5f6g7h8",
      "label": "web-server-01",
      "type": "instance",
      "region": "us-east-1",
      "zone": "us-east-1a"
    },
    {
      "id": "i-1b2c3d4e5f6g7h8i9",
      "label": "api-server-01",
      "type": "instance",
      "region": "us-east-1",
      "zone": "us-east-1b"
    }
  ],
  "connections": [
    {
      "id": "conn-01",
      "from": "i-0a1b2c3d4e5f6g7h8",
      "to": "i-1b2c3d4e5f6g7h8i9",
      "latency_ms": 20,
      "bandwidth_mbps": 100,
      "type": "internal"
    }
  ]
}
```

---

### 24. Update Network Connection
Modify bandwidth or latency for a network connection.

**Endpoint:** `PUT /api/network/update`

**Request Body:**
```json
{
  "connection_id": "conn-01",
  "bandwidth_mbps": 200,
  "latency_ms": 10
}
```

**Response:** `200 OK`
```json
{
  "connection_id": "conn-01",
  "status": "updated",
  "bandwidth_mbps": 200,
  "latency_ms": 10
}
```

---

## Alarms & Alerts

### 25. Set Alert Thresholds
Configure alert thresholds for instance metrics.

**Endpoint:** `POST /api/alerts/set`

**Request Body:**
```json
{
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "alerts": [
    {
      "metric": "cpu",
      "threshold": 80,
      "duration_minutes": 5,
      "action": "notify"
    },
    {
      "metric": "memory",
      "threshold": 4096,
      "duration_minutes": 5,
      "action": "notify"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "status": "configured",
  "message": "Alert thresholds saved successfully",
  "alerts": [
    {
      "id": "alert-001",
      "metric": "cpu",
      "threshold": 80,
      "status": "active"
    }
  ]
}
```

---

### 26. Get Instance Alarms
Retrieve all CloudWatch alarms for an instance.

**Endpoint:** `GET /api/instances/{id}/alarms`

**Response:** `200 OK`
```json
{
  "alarms": [
    {
      "id": "alarm-001",
      "name": "CPU-High-Utilization",
      "metric": "CPU Utilization",
      "threshold": 80,
      "duration_minutes": 5,
      "status": "OK",
      "current_value": 15.2,
      "description": "Triggers when CPU > 80% for 5 minutes"
    },
    {
      "id": "alarm-002",
      "name": "Memory-High-Usage",
      "metric": "Memory Usage",
      "threshold": 90,
      "duration_minutes": 5,
      "status": "OK",
      "current_value": 50.0,
      "description": "Triggers when memory usage > 90%"
    }
  ]
}
```

---

### 27. Create CloudWatch Alarm
Create a new CloudWatch alarm for an instance.

**Endpoint:** `POST /api/alarms/create`

**Request Body:**
```json
{
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "name": "CPU-High-Utilization",
  "metric": "CPU Utilization",
  "threshold": 80,
  "comparison": "GreaterThanThreshold",
  "evaluation_periods": 1,
  "period_minutes": 5,
  "statistic": "Average"
}
```

**Response:** `201 Created`
```json
{
  "id": "alarm-001",
  "name": "CPU-High-Utilization",
  "status": "created",
  "message": "Alarm created successfully"
}
```

---

## Cost Management

### 28. Get Instance Cost
Retrieve cost breakdown for an instance.

**Endpoint:** `GET /api/costs/{instance_id}`

**Query Parameters:**
- `range` (optional) - Time range: `today`, `week`, `month` (default: `today`)

**Response:** `200 OK`
```json
{
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "period": "today",
  "costs": {
    "compute_cost_hr": 0.12,
    "storage_cost_hr": 0.03,
    "network_cost_hr": 0.01,
    "total_cost_hr": 0.16
  },
  "daily": {
    "compute": 2.88,
    "storage": 0.72,
    "network": 0.24,
    "total": 3.84
  },
  "monthly_projected": {
    "compute": 87.60,
    "storage": 21.90,
    "network": 7.30,
    "total": 116.80
  }
}
```

---

### 29. Get Cost Analytics
Get detailed cost analytics with trends and breakdowns.

**Endpoint:** `GET /api/costs/analytics`

**Query Parameters:**
- `range` (optional) - Time range: `7d`, `30d` (default: `7d`)
- `instance_id` (optional) - Filter by instance ID

**Response:** `200 OK`
```json
{
  "period": "7d",
  "daily_costs": [
    {
      "date": "2025-11-08",
      "compute": 2.5,
      "storage": 0.8,
      "network": 0.3,
      "total": 3.6
    },
    {
      "date": "2025-11-09",
      "compute": 2.8,
      "storage": 0.8,
      "network": 0.4,
      "total": 4.0
    }
  ],
  "breakdown": {
    "compute": 19.8,
    "storage": 6.1,
    "network": 2.9,
    "other": 0.5,
    "total": 29.3
  },
  "summary": {
    "week_to_date": 29.30,
    "month_to_date": 116.50,
    "projected_monthly": 249.80,
    "vs_last_month_percent": 12.5
  },
  "recommendations": [
    {
      "type": "right_size",
      "title": "Right-size Instance",
      "description": "Your average CPU is only 23.7%. Consider downsizing to t2.nano to save up to $5.50/month.",
      "potential_savings": 5.50
    },
    {
      "type": "reserved_instance",
      "title": "Reserved Instance Savings",
      "description": "Switch to a 1-year reserved instance to save up to 40% ($99.92/year).",
      "potential_savings": 99.92
    }
  ]
}
```

---

## System Configuration

### 30. Get Resource Limits
Retrieve global resource limits configuration.

**Endpoint:** `GET /api/config/resources`

**Response:** `200 OK`
```json
{
  "max_cpu": 128,
  "max_storage_gb": 5000,
  "max_network_mbps": 1000,
  "max_instances": 100
}
```

---

### 31. Update Resource Limits
Update global resource limits (admin only).

**Endpoint:** `PUT /api/config/resources`

**Request Body:**
```json
{
  "max_cpu": 128,
  "max_storage_gb": 5000,
  "max_network_mbps": 1000,
  "max_instances": 100
}
```

**Response:** `200 OK`
```json
{
  "status": "updated",
  "message": "Global resource limits applied",
  "limits": {
    "max_cpu": 128,
    "max_storage_gb": 5000,
    "max_network_mbps": 1000,
    "max_instances": 100
  }
}
```

---

### 32. Get Orchestration Configuration
Get backend orchestration parameters.

**Endpoint:** `GET /api/config/orchestration`

**Response:** `200 OK`
```json
{
  "scheduler_interval_seconds": 15,
  "max_concurrent_jobs": 10,
  "instance_refresh_rate_seconds": 5,
  "metrics_collection_interval_seconds": 60
}
```

---

### 33. Update Orchestration Configuration
Update backend orchestration parameters (DevOps only).

**Endpoint:** `PATCH /api/config/orchestration`

**Request Body:**
```json
{
  "scheduler_interval_seconds": 15,
  "max_concurrent_jobs": 10
}
```

**Response:** `200 OK`
```json
{
  "status": "ok",
  "message": "Orchestration configuration updated"
}
```

---

## User Management

### 34. Create User
Create a new user account (admin only).

**Endpoint:** `POST /api/users/create`

**Request Body:**
```json
{
  "username": "tinh",
  "email": "tinh@cloudsim.com",
  "role": "devops",
  "permissions": ["instances:create", "instances:delete", "monitoring:view"]
}
```

**Response:** `201 Created`
```json
{
  "user_id": "u-001",
  "username": "tinh",
  "email": "tinh@cloudsim.com",
  "role": "devops",
  "status": "created",
  "message": "User successfully added"
}
```

---

### 35. List Users
Get list of all users (admin only).

**Endpoint:** `GET /api/users`

**Response:** `200 OK`
```json
{
  "users": [
    {
      "user_id": "u-001",
      "username": "tinh",
      "email": "tinh@cloudsim.com",
      "role": "devops",
      "created_at": "2025-11-01T10:00:00Z"
    }
  ]
}
```

---

## WebSocket Events

### WebSocket Connection
Connect to WebSocket endpoint for real-time updates.

**Endpoint:** `wss://api.cloudsim.com/v1/ws`

**Connection:**
```javascript
const ws = new WebSocket('wss://api.cloudsim.com/v1/ws?token=<bearer_token>');
```

---

### 36. Metrics WebSocket Stream
Subscribe to real-time metrics updates for an instance.

**Endpoint:** `wss://api.cloudsim.com/v1/ws/metrics/{instance_id}`

**Subscribe Message:**
```json
{
  "action": "subscribe",
  "instance_id": "i-0a1b2c3d4e5f6g7h8"
}
```

**Metrics Update Event:**
```json
{
  "type": "metrics_update",
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "timestamp": "2025-11-13T14:32:45Z",
  "metrics": {
    "cpu": 15.2,
    "memory": {
      "used_mb": 512,
      "total_mb": 1024,
      "percentage": 50
    },
    "network": {
      "in_mbps": 1.2,
      "out_mbps": 0.8
    },
    "disk": {
      "read_ops": 48,
      "write_ops": 35
    }
  }
}
```

---

### 37. Alert WebSocket Stream
Subscribe to real-time alert notifications.

**Endpoint:** `wss://api.cloudsim.com/v1/ws/alerts`

**Alert Event:**
```json
{
  "type": "alert_triggered",
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "alert_id": "alert-001",
  "metric": "cpu",
  "value": 92.3,
  "threshold": 80,
  "status": "alert_triggered",
  "timestamp": "2025-11-13T14:32:45Z"
}
```

---

### 38. Auto-Scaling WebSocket Stream
Subscribe to auto-scaling events.

**Endpoint:** `wss://api.cloudsim.com/v1/ws/autoscale`

**Auto-Scale Event:**
```json
{
  "type": "autoscale_event",
  "action": "scale_out",
  "instance_id": "i-002",
  "trigger_metric": "cpu",
  "value": 87,
  "timestamp": "2025-11-13T14:32:45Z"
}
```

---

### 39. Instance Status WebSocket Stream
Subscribe to instance status changes.

**Endpoint:** `wss://api.cloudsim.com/v1/ws/instances/{id}/status`

**Status Update Event:**
```json
{
  "type": "status_update",
  "instance_id": "i-0a1b2c3d4e5f6g7h8",
  "previous_status": "creating",
  "current_status": "running",
  "timestamp": "2025-11-13T14:32:45Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid input parameters",
  "details": {
    "field": "instance_type",
    "reason": "Invalid instance type specified"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Resource not found",
  "resource": "instance",
  "id": "i-0a1b2c3d4e5f6g7h8"
}
```

### 409 Conflict
```json
{
  "error": "conflict",
  "message": "Resource limit exceeded",
  "limit": "max_instances",
  "current": 100,
  "maximum": 100
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred",
  "request_id": "req-1234567890"
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Standard users:** 100 requests per minute
- **Premium users:** 500 requests per minute
- **Admin users:** 1000 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1636800000
```

---

## Pagination

List endpoints support pagination with the following query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)

Pagination metadata is included in responses:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Versioning

API versioning is handled through the URL path:
- Current version: `/v1`
- Future versions: `/v2`, `/v3`, etc.

The API version is also included in response headers:
```
API-Version: 1.0
```

---

## Changelog

### Version 1.0 (2025-11-13)
- Initial API release
- Instance management endpoints
- Monitoring and metrics endpoints
- Dashboard and overview endpoints
- WebSocket support for real-time updates

