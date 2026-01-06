"""
Configuration module for CloudSim Backend.

Loads environment variables from .env file and provides
typed configuration classes for different parts of the application.

USAGE:
    from .config import settings
    print(settings.aws_region)
"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


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
    # DATABASE
    # =========================================================================
    database_url: str = "postgresql://postgres:1@localhost:5432/cloudsim"
    
    # =========================================================================
    # JWT AUTHENTICATION
    # =========================================================================
    secret_key: str = "your-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    
    # =========================================================================
    # AWS CONFIGURATION
    # =========================================================================
    # AWS credentials (optional - boto3 can use ~/.aws/credentials)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_session_token: Optional[str] = None  # For temporary credentials
    
    # AWS profile name (optional - use instead of explicit credentials)
    aws_profile: Optional[str] = None
    
    # AWS region
    aws_region: str = "us-east-1"
    
    # =========================================================================
    # APPLICATION SETTINGS
    # =========================================================================
    environment: str = "development"
    enable_cost_explorer: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False  # AWS_REGION or aws_region both work


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance.
    Use this function to get settings throughout the application.
    """
    return Settings()


# Convenience alias
settings = get_settings()
