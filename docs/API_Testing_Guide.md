# CloudSim API Testing Guide

Complete testing documentation for all implemented APIs.

---

## Prerequisites

```bash
# Start backend
cd /home/tinhc/CloudSim/backend
source ../.venv/bin/activate
uvicorn app.main:app --reload

# Start frontend (separate terminal)
cd /home/tinhc/CloudSim/frontend
npm run dev
```

---

## 1. Authentication API

### 1.1 Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```
**Expected:** `{"id":3,"email":"test@example.com","role":"User","is_active":true}`

### 1.2 Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=admin@gmail.com&password=1"
```
**Expected:** `{"access_token":"eyJ...","token_type":"bearer"}`

### 1.3 Get Current User (Protected)
```bash
# First, get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -d "username=admin@gmail.com&password=1" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Then use it
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/auth/me
```
**Expected:** `{"id":2,"email":"admin@gmail.com","role":"Admin","is_active":true}`

---

## 2. Admin User Management API

> **Requires Admin role**

### 2.1 List All Users
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/admin/users
```
**Expected:** Array of users

### 2.2 Create User with Role
```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@example.com","password":"dev123","role":"Developer"}' \
  http://localhost:8000/api/admin/users
```
**Expected:** `{"id":...,"email":"dev@example.com","role":"Developer","is_active":true}`

### 2.3 Delete User
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/admin/users/3
```
**Expected:** `{"message":"User ... deleted successfully"}`

---

## 3. EC2 API

> **Requires authentication**

### 3.1 List EC2 Instances
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/ec2/instances
```
**Expected:** `[]` (empty if no instances) or array of instances

### 3.2 Get Instance Types
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/ec2/instance-types
```
**Expected:** `{"instance_types":["t2.micro","t2.small","t2.medium","t3.micro","t3.small","t3.medium"]}`

### 3.3 Create EC2 Instance
```bash
# Create a t2.micro instance (free tier eligible)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"cloudsim-test","instance_type":"t2.micro"}' \
  http://localhost:8000/api/ec2/instances
```
**Expected:**
```json
{
    "message": "Created instance i-0834eaf5fc105be28",
    "instance_id": "i-0834eaf5fc105be28"
}
```

### 3.4 Start/Stop Instance
```bash
# Start a stopped instance
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28/start

# Stop a running instance
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28/stop
```

### 3.5 Terminate Instance (Admin only)
```bash
# Terminate the instance (permanent deletion!)
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/ec2/instances/i-0834eaf5fc105be28
```
**Expected:** `{"message": "Terminating instance i-0834eaf5fc105be28", "instance_id": "i-0834eaf5fc105be28"}`

> ⚠️ **Warning:** Terminated instances cannot be recovered!

---

## 4. Quick Test Script

Save as `test_api.sh`:
```bash
#!/bin/bash
BASE=http://localhost:8000

echo "=== Login ==="
TOKEN=$(curl -s -X POST $BASE/api/auth/login -d "username=admin@gmail.com&password=1" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "Token: ${TOKEN:0:20}..."

echo -e "\n=== Current User ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/auth/me | python3 -m json.tool

echo -e "\n=== Users (Admin) ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/admin/users | python3 -m json.tool

echo -e "\n=== EC2 Instances ==="
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/ec2/instances | python3 -m json.tool
```

Run: `chmod +x test_api.sh && ./test_api.sh`

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Missing/invalid token | Re-login to get new token |
| 403 Forbidden | Wrong role | Use admin account |
| 500 Internal Error | Backend issue | Check uvicorn terminal |
| Connection refused | Backend not running | Start uvicorn |
