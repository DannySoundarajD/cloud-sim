from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .db import engine, Base

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CloudSim API", version="1.0.0")

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


# Include instance routes
app.include_router(router)
