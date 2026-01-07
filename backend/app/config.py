"""
Configuration module for CloudSim Backend.

Loads environment variables from .env file and provides
typed configuration classes for different parts of the application.

USAGE:
    from .config import settings
    print(settings.aws_region)

SECURITY:
    - SECRET_KEY validation in production
    - Allowed origins for CORS whitelist
    - Rate limiting configuration
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
from functools import lru_cache
import secrets
import warnings


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    
    Pydantic BaseSettings automatically:
    - Reads from environment variables
    - Reads from .env file
    - Validates types
    - Provides defaults
    """
    
    # =========================================================================
    # ENVIRONMENT
    # =========================================================================
    environment: str = "development"  # development, staging, production
    debug: bool = True  # Set to False in production
    
    # =========================================================================
    # DATABASE
    # =========================================================================
    database_url: str = "postgresql://postgres:1@localhost:5432/cloudsim"
    database_pool_size: int = 5
    database_max_overflow: int = 10
    
    # =========================================================================
    # JWT AUTHENTICATION
    # =========================================================================
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    
    # =========================================================================
    # CORS & SECURITY
    # =========================================================================
    # Comma-separated list of allowed origins (e.g., "http://localhost:5173,https://app.example.com")
    allowed_origins: str = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    
    # =========================================================================
    # AWS CONFIGURATION
    # =========================================================================
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_session_token: Optional[str] = None
    aws_profile: Optional[str] = None
    aws_region: str = "us-east-1"
    aws_account_id: str = "096615316348"  # Your AWS account ID
    
    # =========================================================================
    # IAM ROLE ARNS (for role-based AWS access)
    # =========================================================================
    # Format: arn:aws:iam::{account_id}:role/{role_name}
    aws_role_admin: Optional[str] = None      # Full access
    aws_role_developer: Optional[str] = None  # Create/manage instances
    aws_role_readonly: Optional[str] = None   # View only
    aws_role_student: Optional[str] = None    # Limited to micro instances
    
    # =========================================================================
    # APPLICATION SETTINGS
    # =========================================================================
    enable_cost_explorer: bool = True
    enable_role_based_access: bool = False  # Set to True to enable IAM role assumption
    
    @field_validator('secret_key')
    @classmethod
    def validate_secret_key(cls, v: str, info) -> str:
        """
        Validate SECRET_KEY security.
        - In production: must be at least 32 characters and not the default
        - In development: warn if using default key
        """
        default_key = "your-secret-key-change-in-production"
        
        # We can't access other fields directly in validators, so check via environment
        import os
        env = os.getenv("ENVIRONMENT", "development").lower()
        
        if env == "production":
            if v == default_key:
                raise ValueError(
                    "SECRET_KEY must be changed from default in production. "
                    "Generate one with: openssl rand -hex 32"
                )
            if len(v) < 32:
                raise ValueError(
                    "SECRET_KEY must be at least 32 characters in production"
                )
        elif v == default_key:
            warnings.warn(
                "Using default SECRET_KEY. Generate a secure key for production: "
                "openssl rand -hex 32",
                UserWarning
            )
        
        return v
    
    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated origins into list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


def generate_secret_key() -> str:
    """Generate a cryptographically secure secret key."""
    return secrets.token_hex(32)


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance.
    Use this function to get settings throughout the application.
    """
    return Settings()


# Convenience alias
settings = get_settings()
