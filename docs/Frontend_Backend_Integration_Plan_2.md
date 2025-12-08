# Frontend-Backend Integration Plan

This document tracks the progress of integrating the React frontend with the FastAPI backend.

## 1. Backend Verification [Completed]
- [x] **API Connectivity**: Verified `/health` endpoint is reachable.
- [x] **Database Connectivity**: Verified `instances` table is created in PostgreSQL.
- [x] **CORS Configuration**: Configured to allow requests from `localhost` and `127.0.0.1`.

## 2. Frontend API Layer [Completed]
- [x] **Axios Client**: Created `src/api/client.ts` with base URL `http://localhost:8000`.
- [x] **API Methods**: Created `src/api/instances.ts` with:
  - `fetchInstances`
  - `createInstance`
  - `deleteInstance`
  - `getInstance`
- [x] **Adapter Pattern**: Implemented `enrichInstance` to handle missing backend fields (`zone`, `publicIp`, `privateIp`, `uptime`).

## 3. UI Component Integration [Completed]
- [x] **Dashboard Page**:
  - Replaced mock data with `fetchInstances()` hook.
  - Implemented `handleDelete` using API.
  - Added loading states and empty state handling.
- [x] **Create Instance Modal**:
  - Connected "Launch" button to `createInstance()` API.
  - Added loading spinner during creation.
  - Fixed syntax/import errors and restored missing state logic.

## 4. Remaining Tasks & Technical Debt
- [ ] **Data Parity**:
  - Backend `Instance` model needs `zone`, `public_ip`, `private_ip`, `uptime` fields.
  - Update `enrichInstance` adapter to use real data once backend supports it.
- [ ] **Instance Actions**:
  - Implement endpoints for `start`, `stop`, `reboot` in backend.
  - Wire up Dashboard action buttons to these endpoints.
- [ ] **Auto-Refresh**:
  - Implement auto-refresh or polling on Dashboard to see status changes (e.g., `creating` -> `running`).
- [ ] **Error Handling**:
  - Improve global error handling (e.g., network disconnects).

## 5. Developer Guide: Running & Verifying

### Starting the Application

**Backend (Terminal 1):**
```bash
cd backend
source ../.venv/bin/activate
uvicorn app.main:app --reload
```
*Server will run at `http://127.0.0.1:8000`*

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
*App will run at `http://localhost:5173`*

### Verification Commands

**1. Check Backend Health:**
```bash
curl -v http://127.0.0.1:8000/health
```

**2. Test Instance Listing (API):**
```bash
curl -v http://127.0.0.1:8000/api/instances
```

**3. Test CORS Options (Pre-flight check):**
```bash
curl -X OPTIONS http://127.0.0.1:8000/api/instances \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**4. Check Database Directly:**
```bash
PGPASSWORD=1 psql -h localhost -U postgres -d cloudsim -c "SELECT * FROM instances;"
```
