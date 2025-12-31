"""
Authentication routes for CloudSim.

Endpoints:
- POST /api/auth/register - Create new user account
- POST /api/auth/login - Authenticate and get JWT token
- GET /api/auth/me - Get current user info (protected)

DESIGN DECISIONS:
-----------------
1. Separate router for auth - Clean separation of concerns
2. OAuth2PasswordRequestForm - Standard form for username/password submission
3. Email used as "username" - More intuitive for users
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .auth import (
    Token,
    UserCreate,
    UserRead,
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


# ============================================================================
# REGISTER ENDPOINT
# ============================================================================
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user account.
    
    Process:
    1. Check if email already exists (409 Conflict if so)
    2. Hash the password (never store plain text!)
    3. Create user record in database
    4. Return user data (without password)
    
    Security note: We return 409 for existing emails. In high-security apps,
    you might return 201 always to prevent email enumeration attacks.
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


# ============================================================================
# LOGIN ENDPOINT
# ============================================================================
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT token.
    
    Uses OAuth2PasswordRequestForm which expects:
    - username (we use email here)
    - password
    
    Returns JWT token to be used in Authorization header:
    Authorization: Bearer <token>
    
    Security: Same error message for invalid email or password
    to prevent user enumeration.
    """
    # Find user by email (username field contains email)
    user = db.query(User).filter(User.email == form_data.username).first()
    
    # Validate credentials (same message for both failures)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled"
        )
    
    # Create access token with user email as subject
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


# ============================================================================
# GET CURRENT USER (Protected Route Example)
# ============================================================================
@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    
    This is a protected endpoint - requires valid JWT token.
    The get_current_user dependency handles token validation.
    
    Usage example:
    curl -H "Authorization: Bearer <token>" http://localhost:8000/api/auth/me
    """
    return current_user
