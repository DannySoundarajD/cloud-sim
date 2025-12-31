from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .auth_routes import router as auth_router
from .admin_routes import router as admin_router
from .ec2_routes import router as ec2_router
from .db import engine, Base

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CloudSim API", version="1.0.0")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Include authentication routes
app.include_router(auth_router)

# Include admin routes
app.include_router(admin_router)

# Include EC2 routes (instances, metrics, costs)
app.include_router(ec2_router)


