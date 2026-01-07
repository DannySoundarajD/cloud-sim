"""
CloudSim API - Main FastAPI Application

Security Features:
- Dynamic CORS from config
- Security headers middleware
- Health check endpoints
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from .config import settings
from .auth_routes import router as auth_router
from .admin_routes import router as admin_router
from .ec2_routes import router as ec2_router
from .db import engine, Base

# Create database tables on startup
Base.metadata.create_all(bind=engine)


# ============================================================================
# SECURITY HEADERS MIDDLEWARE
# ============================================================================
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Prevent XSS attacks
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy (disable unnecessary features)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response


# ============================================================================
# APPLICATION SETUP
# ============================================================================
app = FastAPI(
    title="CloudSim API",
    version="1.0.0",
    description="Cloud infrastructure management API",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Add security headers
app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================
@app.get("/health")
def health_check():
    """Basic health check for load balancers."""
    return {
        "status": "healthy",
        "environment": settings.environment,
    }


# ============================================================================
# INCLUDE ROUTERS
# ============================================================================
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(ec2_router)


# ============================================================================
# STARTUP EVENT
# ============================================================================
@app.on_event("startup")
async def startup_event():
    """Log startup configuration."""
    import logging
    logger = logging.getLogger("uvicorn")
    
    logger.info(f"CloudSim API starting in {settings.environment} mode")
    logger.info(f"CORS origins: {settings.cors_origins}")
