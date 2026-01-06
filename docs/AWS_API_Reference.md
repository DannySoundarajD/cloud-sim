# CloudSim AWS API Reference & Testing Guide

This document provides detailed information about every AWS API call made by CloudSim, including request/response formats and curl commands for testing.

---

## Table of Contents

1. [Authentication Setup](#authentication-setup)
2. [EC2 Instance Operations](#ec2-instance-operations)
3. [CloudWatch Metrics](#cloudwatch-metrics)
4. [Cost Explorer](#cost-explorer)
5. [Debugging Tips](#debugging-tips)

---

## Authentication Setup

### Get JWT Token

Before testing protected endpoints, you need a JWT token:

```bash
# Login to get token
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@gmail.com&password=yourpassword"
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Store token for subsequent requests:**
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## EC2 Instance Operations

### 1. List All Instances

**CloudSim Endpoint:** `GET /api/ec2/instances`

**curl Command:**
```bash
curl -X GET http://localhost:8000/api/ec2/instances \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: EC2
Action: DescribeInstances
boto3: ec2.describe_instances()
```

**AWS Request (boto3 equivalent):**
```python
response = ec2.describe_instances()
```

**Response (CloudSim format):**
```json
[
  {
    "instance_id": "i-0834eaf5fc105be28",
    "name": "web-server-01",
    "instance_type": "t2.micro",
    "state": "running",
    "public_ip": "54.123.45.67",
    "private_ip": "172.31.16.22",
    "launch_time": "2025-12-28T16:30:00+00:00",
    "availability_zone": "us-east-1a"
  }
]
```

**Raw AWS Response (simplified):**
```json
{
  "Reservations": [
    {
      "Instances": [
        {
          "InstanceId": "i-0834eaf5fc105be28",
          "InstanceType": "t2.micro",
          "State": {"Name": "running"},
          "PublicIpAddress": "54.123.45.67",
          "PrivateIpAddress": "172.31.16.22",
          "Placement": {"AvailabilityZone": "us-east-1a"},
          "LaunchTime": "2025-12-28T16:30:00+00:00",
          "Tags": [{"Key": "Name", "Value": "web-server-01"}]
        }
      ]
    }
  ]
}
```

---

### 2. Get Instance Details

**CloudSim Endpoint:** `GET /api/ec2/instances/{instance_id}`

**curl Command:**
```bash
curl -X GET http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28 \
  -H "Authorization: Bearer $TOKEN"
```

**AWS APIs Called:**
```
1. EC2 DescribeInstances (for instance details)
2. EC2 DescribeVolumes (for EBS volume details)
```

**boto3 Calls:**
```python
# Step 1: Get instance details
response = ec2.describe_instances(InstanceIds=["i-0834eaf5fc105be28"])

# Step 2: Get volume details
volume_ids = [bd["Ebs"]["VolumeId"] for bd in instance["BlockDeviceMappings"]]
vol_response = ec2.describe_volumes(VolumeIds=volume_ids)
```

**Response (CloudSim format):**
```json
{
  "instance_id": "i-0834eaf5fc105be28",
  "name": "web-server-01",
  "instance_type": "t2.micro",
  "state": "running",
  "public_ip": "54.123.45.67",
  "private_ip": "172.31.16.22",
  "public_dns": "ec2-54-123-45-67.compute-1.amazonaws.com",
  "private_dns": "ip-172-31-16-22.ec2.internal",
  "vpc_id": "vpc-0abc123",
  "subnet_id": "subnet-0def456",
  "availability_zone": "us-east-1a",
  "launch_time": "2025-12-28T16:30:00+00:00",
  "key_name": "my-key-pair",
  "platform": "Linux/UNIX",
  "tenancy": "default",
  "ami_id": "ami-0abcdef1234567890",
  "monitoring": "disabled",
  "security_groups": [
    {"GroupId": "sg-0123456789abcdef0", "GroupName": "default"}
  ],
  "block_devices": [
    {
      "device_name": "/dev/xvda",
      "volume_id": "vol-0abc123def456",
      "size": 8,
      "volume_type": "gp3",
      "iops": 3000,
      "throughput": 125,
      "encrypted": false,
      "delete_on_termination": true
    }
  ],
  "tags": [
    {"Key": "Name", "Value": "web-server-01"},
    {"Key": "Environment", "Value": "production"}
  ],
  "iam_role": "EC2-S3-Access-Role"
}
```

---

### 3. Create Instance

**CloudSim Endpoint:** `POST /api/ec2/instances`

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/ec2/instances \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "new-server", "instance_type": "t2.micro"}'
```

**AWS APIs Called:**
```
1. EC2 DescribeImages (to find latest Amazon Linux AMI)
2. EC2 RunInstances (to create the instance)
```

**boto3 Calls:**
```python
# Step 1: Find latest AMI
response = ec2.describe_images(
    Owners=["amazon"],
    Filters=[
        {"Name": "name", "Values": ["al2023-ami-*-x86_64"]},
        {"Name": "state", "Values": ["available"]},
    ],
)
image_id = sorted(response["Images"], key=lambda x: x["CreationDate"], reverse=True)[0]["ImageId"]

# Step 2: Create instance
response = ec2_resource.create_instances(
    ImageId=image_id,
    InstanceType="t2.micro",
    MinCount=1,
    MaxCount=1,
    TagSpecifications=[{
        "ResourceType": "instance",
        "Tags": [{"Key": "Name", "Value": "new-server"}]
    }]
)
```

**Response:**
```json
{
  "message": "Created instance i-0abc123def456789",
  "instance_id": "i-0abc123def456789",
  "name": "new-server",
  "instance_type": "t2.micro"
}
```

---

### 4. Start Instance

**CloudSim Endpoint:** `POST /api/ec2/instances/{instance_id}/start`

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28/start \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: EC2
Action: StartInstances
```

**boto3 Call:**
```python
ec2.start_instances(InstanceIds=["i-0834eaf5fc105be28"])
```

**Response:**
```json
{
  "message": "Starting instance i-0834eaf5fc105be28",
  "instance_id": "i-0834eaf5fc105be28"
}
```

---

### 5. Stop Instance

**CloudSim Endpoint:** `POST /api/ec2/instances/{instance_id}/stop`

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28/stop \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: EC2
Action: StopInstances
```

**boto3 Call:**
```python
ec2.stop_instances(InstanceIds=["i-0834eaf5fc105be28"])
```

**Response:**
```json
{
  "message": "Stopping instance i-0834eaf5fc105be28",
  "instance_id": "i-0834eaf5fc105be28"
}
```

---

### 6. Reboot Instance

**CloudSim Endpoint:** `POST /api/ec2/instances/{instance_id}/reboot`

**curl Command:**
```bash
curl -X POST http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28/reboot \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: EC2
Action: RebootInstances
```

**boto3 Call:**
```python
ec2.reboot_instances(InstanceIds=["i-0834eaf5fc105be28"])
```

**Response:**
```json
{
  "message": "Rebooting instance i-0834eaf5fc105be28",
  "instance_id": "i-0834eaf5fc105be28"
}
```

---

### 7. Terminate Instance

**CloudSim Endpoint:** `DELETE /api/ec2/instances/{instance_id}`

**⚠️ Admin Role Required**

**curl Command:**
```bash
curl -X DELETE http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28 \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: EC2
Action: TerminateInstances
```

**boto3 Call:**
```python
ec2.terminate_instances(InstanceIds=["i-0834eaf5fc105be28"])
```

**Response:**
```json
{
  "message": "Terminating instance i-0834eaf5fc105be28",
  "instance_id": "i-0834eaf5fc105be28"
}
```

---

## CloudWatch Metrics

### Get Instance Metrics

**CloudSim Endpoint:** `GET /api/ec2/instances/{instance_id}/metrics?period=60`

**curl Command:**
```bash
curl -X GET "http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28/metrics?period=60" \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: CloudWatch
Action: GetMetricStatistics (called 5 times for different metrics)
```

**boto3 Calls:**
```python
from datetime import datetime, timedelta

end_time = datetime.utcnow()
start_time = end_time - timedelta(minutes=60)

# CPU Utilization
cloudwatch.get_metric_statistics(
    Namespace="AWS/EC2",
    MetricName="CPUUtilization",
    Dimensions=[{"Name": "InstanceId", "Value": "i-0834eaf5fc105be28"}],
    StartTime=start_time,
    EndTime=end_time,
    Period=300,  # 5-minute intervals
    Statistics=["Average"],
    Unit="Percent"
)

# Network In
cloudwatch.get_metric_statistics(
    Namespace="AWS/EC2",
    MetricName="NetworkIn",
    ...
    Unit="Bytes"
)

# Network Out
cloudwatch.get_metric_statistics(
    Namespace="AWS/EC2",
    MetricName="NetworkOut",
    ...
    Unit="Bytes"
)

# Disk Read Ops
cloudwatch.get_metric_statistics(
    Namespace="AWS/EC2",
    MetricName="DiskReadOps",
    ...
    Unit="Count"
)

# Disk Write Ops
cloudwatch.get_metric_statistics(
    Namespace="AWS/EC2",
    MetricName="DiskWriteOps",
    ...
    Unit="Count"
)
```

**Response (CloudSim format):**
```json
{
  "instance_id": "i-0834eaf5fc105be28",
  "cpu_utilization": [
    {"timestamp": "2025-12-28T16:00:00+00:00", "value": 2.5},
    {"timestamp": "2025-12-28T16:05:00+00:00", "value": 3.1},
    {"timestamp": "2025-12-28T16:10:00+00:00", "value": 1.8}
  ],
  "network_in": [
    {"timestamp": "2025-12-28T16:00:00+00:00", "value": 45123},
    {"timestamp": "2025-12-28T16:05:00+00:00", "value": 52341}
  ],
  "network_out": [
    {"timestamp": "2025-12-28T16:00:00+00:00", "value": 12345},
    {"timestamp": "2025-12-28T16:05:00+00:00", "value": 15678}
  ],
  "disk_read_ops": [
    {"timestamp": "2025-12-28T16:00:00+00:00", "value": 100}
  ],
  "disk_write_ops": [
    {"timestamp": "2025-12-28T16:00:00+00:00", "value": 50}
  ]
}
```

---

## Cost Explorer

### ⚠️ Cost Warning
Cost Explorer API costs **$0.01 per API call**. Each page refresh makes 2 calls.

### Get Daily Costs

**CloudSim Endpoint:** `GET /api/ec2/costs/daily?days=7`

**curl Command:**
```bash
curl -X GET "http://localhost:8000/api/ec2/costs/daily?days=7" \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: Cost Explorer
Action: GetCostAndUsage
Region: us-east-1 (Cost Explorer is only available here)
```

**boto3 Call:**
```python
from datetime import datetime, timedelta

end_date = datetime.utcnow().date()
start_date = end_date - timedelta(days=7)

cost_explorer.get_cost_and_usage(
    TimePeriod={
        "Start": start_date.isoformat(),  # "2025-12-21"
        "End": end_date.isoformat()       # "2025-12-28"
    },
    Granularity="DAILY",
    Metrics=["BlendedCost"],
    GroupBy=[
        {"Type": "DIMENSION", "Key": "SERVICE"}
    ]
)
```

**Raw AWS Response (simplified):**
```json
{
  "ResultsByTime": [
    {
      "TimePeriod": {"Start": "2025-12-21", "End": "2025-12-22"},
      "Groups": [
        {
          "Keys": ["Amazon Elastic Compute Cloud - Compute"],
          "Metrics": {"BlendedCost": {"Amount": "1.50", "Unit": "USD"}}
        },
        {
          "Keys": ["Amazon Simple Storage Service"],
          "Metrics": {"BlendedCost": {"Amount": "0.25", "Unit": "USD"}}
        }
      ]
    }
  ]
}
```

**Response (CloudSim format):**
```json
[
  {
    "date": "2025-12-21",
    "compute": 1.50,
    "storage": 0.25,
    "network": 0.10,
    "total": 1.85
  },
  {
    "date": "2025-12-22",
    "compute": 1.75,
    "storage": 0.30,
    "network": 0.15,
    "total": 2.20
  }
]
```

---

### Get Monthly Cost Summary

**CloudSim Endpoint:** `GET /api/ec2/costs/summary`

**curl Command:**
```bash
curl -X GET http://localhost:8000/api/ec2/costs/summary \
  -H "Authorization: Bearer $TOKEN"
```

**AWS API Called:**
```
Service: Cost Explorer
Action: GetCostAndUsage
```

**boto3 Call:**
```python
today = datetime.utcnow().date()
month_start = today.replace(day=1)

cost_explorer.get_cost_and_usage(
    TimePeriod={
        "Start": month_start.isoformat(),
        "End": today.isoformat()
    },
    Granularity="MONTHLY",
    Metrics=["BlendedCost"]
)
```

**Response (CloudSim format):**
```json
{
  "month_to_date": 45.50,
  "projected_monthly": 78.25,
  "days_elapsed": 28
}
```

---

## Debugging Tips

### Enable AWS Request Logging

Add this to `aws_service.py` to see all AWS API calls:

```python
import logging

# Enable boto3 debug logging
boto3.set_stream_logger('boto3', logging.DEBUG)
boto3.set_stream_logger('botocore', logging.DEBUG)
```

### Test AWS Credentials

```bash
# Using AWS CLI
aws sts get-caller-identity

# Expected output:
{
    "UserId": "AIDAEXAMPLEID",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-user"
}
```

### Check CloudSim Backend Logs

```bash
# Run with verbose output
cd backend
uvicorn app.main:app --reload --log-level debug
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `NoCredentialsError` | AWS credentials not found | Run `aws configure` or set in `.env` |
| `AccessDenied` | IAM permissions missing | Add required permissions to IAM user/role |
| `InvalidInstanceID.NotFound` | Instance doesn't exist | Check instance ID is correct |
| `AuthorizationError` | Cost Explorer not enabled | Enable Cost Explorer in AWS Console |

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeVolumes",
        "ec2:DescribeImages",
        "ec2:StartInstances",
        "ec2:StopInstances",
        "ec2:RebootInstances",
        "ec2:TerminateInstances",
        "ec2:RunInstances",
        "ec2:CreateTags",
        "cloudwatch:GetMetricStatistics",
        "ce:GetCostAndUsage"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## Quick Reference

| Action | CloudSim Endpoint | AWS Service | AWS Action |
|--------|-------------------|-------------|------------|
| List Instances | `GET /api/ec2/instances` | EC2 | DescribeInstances |
| Get Instance | `GET /api/ec2/instances/{id}` | EC2 | DescribeInstances, DescribeVolumes |
| Create Instance | `POST /api/ec2/instances` | EC2 | DescribeImages, RunInstances |
| Start Instance | `POST /api/ec2/instances/{id}/start` | EC2 | StartInstances |
| Stop Instance | `POST /api/ec2/instances/{id}/stop` | EC2 | StopInstances |
| Reboot Instance | `POST /api/ec2/instances/{id}/reboot` | EC2 | RebootInstances |
| Terminate Instance | `DELETE /api/ec2/instances/{id}` | EC2 | TerminateInstances |
| Get Metrics | `GET /api/ec2/instances/{id}/metrics` | CloudWatch | GetMetricStatistics |
| Get Daily Costs | `GET /api/ec2/costs/daily` | Cost Explorer | GetCostAndUsage |
| Get Cost Summary | `GET /api/ec2/costs/summary` | Cost Explorer | GetCostAndUsage |

---

*Last Updated: January 2026*
