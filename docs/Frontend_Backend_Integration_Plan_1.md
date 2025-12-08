# Weekly Implementation Guide

This step‑by‑step plan walks through the weekly tasks, explaining the tech in use (FastAPI, SQLAlchemy, React, Axios) and how to stitch frontend ↔ backend ↔ DB. Follow in order.

## 0) Prereqs & Environment
- Install Python 3.11+ and create a venv: `python -m venv .venv && source .venv/bin/activate`
- Install backend deps: `pip install fastapi uvicorn[standard] sqlalchemy psycopg2-binary pydantic`
- Install frontend deps (already present) plus Axios: `cd frontend && npm install axios`
- Ensure a database is available (e.g., Postgres). Set `DATABASE_URL` (e.g., `postgresql://user:pass@localhost:5432/cloudsim`).

## 1) FastAPI Backend Skeleton
- **Tech:** FastAPI (ASGI framework) + Uvicorn (server).
- Create `backend/app/main.py`:
  ```python
  from fastapi import FastAPI

  app = FastAPI(title="CloudSim API", version="1.0.0")

  @app.get("/health")
  def health():
      return {"status": "ok"}
  ```
- Run dev server: `uvicorn app.main:app --reload --port 8000`

## 2) Database Setup with SQLAlchemy
- **Tech:** SQLAlchemy ORM for models and DB session management.
- Create `backend/app/db.py`:
  ```python
  from sqlalchemy import create_engine
  from sqlalchemy.orm import sessionmaker, declarative_base
  import os

  DATABASE_URL = os.getenv("DATABASE_URL")
  engine = create_engine(DATABASE_URL, echo=False, future=True)
  SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, future=True)
  Base = declarative_base()
  ```
- Add dependency helper `get_db()` in `db.py` to yield a session in routes.

## 3) Instance Model & Schema
- **Tech:** SQLAlchemy model for persistence; Pydantic schemas for request/response validation.
- In `backend/app/models.py`:
  ```python
  from sqlalchemy import Column, String, Integer, DateTime
  from datetime import datetime
  from .db import Base

  class Instance(Base):
      __tablename__ = "instances"
      id = Column(String, primary_key=True, index=True)
      name = Column(String, nullable=False)
      type = Column(String, nullable=False)
      state = Column(String, default="creating")
      cpu = Column(Integer, nullable=False)
      memory = Column(Integer, nullable=False)
      created_at = Column(DateTime, default=datetime.utcnow)
  ```
- In `backend/app/schemas.py`:
  ```python
  from pydantic import BaseModel

  class InstanceCreate(BaseModel):
      id: str
      name: str
      type: str
      cpu: int
      memory: int

  class InstanceRead(BaseModel):
      id: str
      name: str
      type: str
      state: str
      cpu: int
      memory: int
      class Config: from_attributes = True
  ```
- Create/migrate tables (simplest): add `Base.metadata.create_all(engine)` in a setup script or startup hook.

## 4) Implement /instances POST & GET
- **Tech:** FastAPI dependency injection + SQLAlchemy sessions.
- In `backend/app/routes.py`:
  ```python
  from fastapi import APIRouter, Depends, HTTPException, status
  from sqlalchemy.orm import Session
  from .db import get_db
  from .models import Instance
  from .schemas import InstanceCreate, InstanceRead

  router = APIRouter()

  @router.post("/instances", response_model=InstanceRead, status_code=status.HTTP_201_CREATED)
  def create_instance(payload: InstanceCreate, db: Session = Depends(get_db)):
      if db.get(Instance, payload.id):
          raise HTTPException(status_code=409, detail="Instance already exists")
      inst = Instance(**payload.dict(), state="running")
      db.add(inst)
      db.commit()
      db.refresh(inst)
      return inst

  @router.get("/instances", response_model=list[InstanceRead])
  def list_instances(db: Session = Depends(get_db)):
      return db.query(Instance).all()
  ```
- In `main.py`, include the router: `app.include_router(router)`

## 5) Connect React Frontend via Axios
- **Tech:** Axios for HTTP client in React.
- In `frontend/`, add `src/api/client.ts`:
  ```ts
  import axios from "axios";

  export const api = axios.create({
    baseURL: "http://localhost:8000", // adjust for env
    headers: { "Content-Type": "application/json" },
  });
  ```
- Add instance API helpers `src/api/instances.ts`:
  ```ts
  import { api } from "./client";

  export type Instance = { id: string; name: string; type: string; state: string; cpu: number; memory: number; };
  export type InstanceCreate = { id: string; name: string; type: string; cpu: number; memory: number; };

  export const fetchInstances = () => api.get<Instance[]>("/instances");
  export const createInstance = (data: InstanceCreate) => api.post<Instance>("/instances", data);
  ```

## 6) Build EC2-like Instance Creation Page
- **Tech:** React form + Axios; reuse existing UI components (inputs/buttons/cards/table).
- Steps in `frontend/src/components` (e.g., `InstanceCreatePage.tsx`):
  - Form fields: id/name/type/cpu/memory.
  - On submit: call `createInstance`, then refresh list via `fetchInstances`.
  - Display instances in a table (id, name, type, state, cpu, memory).
- Wire page into `App.tsx` or an Instances tab.

## 7) End-to-End Testing (Frontend → Backend → DB)
- **Manual smoke:**
  - Start backend: `uvicorn app.main:app --reload --port 8000`
  - Start frontend: `npm run dev -- --host --port 5173`
  - Use the UI to create an instance; verify it appears and state persists after refresh.
- **API verification (CLI):**
  ```bash
  curl -X POST http://localhost:8000/instances \
    -H "Content-Type: application/json" \
    -d '{"id":"i-001","name":"web","type":"t2.micro","cpu":1,"memory":1024}'
  curl http://localhost:8000/instances
  ```
- **Automated idea:** Add a simple integration test with `httpx` (backend) and a frontend e2e (Playwright/Cypress) later.

## 8) Role Alignment (per docs)
- Enforce authorization later via dependencies, e.g., FastAPI dependency checks on role claims in the bearer token. For now, keep endpoints open for development, but design with roles in mind: User (view/start/stop), DevOps (CRUD instances), Admin (quotas/users).

## 9) What to check in each step
- Backend: `uvicorn` starts without errors; `/health` returns ok.
- DB: Table `instances` exists; CRUD works (check via psql/CLI).
- Frontend: Form validates required fields; handles errors from API; renders list.
- E2E: Create → stored in DB → listed back in UI; server logs show requests.
