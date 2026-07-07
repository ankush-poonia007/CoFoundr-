# auth.py
# Purpose: Authentication API endpoints.
# Responsibilities:
#   - Expose Google and GitHub OAuth redirect URL and callback endpoints
#   - Issue JWT auth tokens via AuthService delegates
# DO NOT: Write authentication process flow or token signing logic directly inside routes.
# DO NOT: Query PostgreSQL user tables directly from API router controllers.

import logging
import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService

from fastapi.responses import RedirectResponse
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth")


@router.get("/google")
async def google_oauth_redirect(state: str | None = None):
    """Redirect user to Google OAuth consent screen."""
    return AuthService.get_google_auth_url(state=state)


@router.get("/google/callback")
async def google_oauth_callback(
    code: str,
    state: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Handle Google OAuth callback and redirect to frontend with JWT token."""
    logger.info("Google OAuth callback received.")
    token_data = await AuthService(db).handle_google_callback(code, state=state)
    if state and state.startswith("link:"):
        redirect_url = f"{settings.FRONTEND_URL}/settings?success=Google addon connected successfully"
    else:
        redirect_url = f"{settings.FRONTEND_URL}/?token={token_data.access_token}"
    return RedirectResponse(url=redirect_url)


@router.get("/github")
async def github_oauth_redirect(state: str | None = None):
    """Redirect user to GitHub OAuth consent screen."""
    return AuthService.get_github_auth_url(state=state)


@router.get("/github/callback")
async def github_oauth_callback(
    code: str,
    state: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Handle GitHub OAuth callback and redirect to frontend with JWT token."""
    logger.info("GitHub OAuth callback received.")
    token_data = await AuthService(db).handle_github_callback(code, state=state)
    if state and state.startswith("link:"):
        redirect_url = f"{settings.FRONTEND_URL}/settings?success=GitHub addon connected successfully"
    else:
        redirect_url = f"{settings.FRONTEND_URL}/?token={token_data.access_token}"
    return RedirectResponse(url=redirect_url)


@router.post("/logout")
async def logout() -> dict:
    """Logout endpoint — client must discard the JWT token."""
    return {"message": "Logged out successfully."}


from app.api.deps import get_current_user_id
from app.repositories.user_repository import UserRepository
from pydantic import BaseModel, Field
import uuid

class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    mobile_number: str | None = Field(None, max_length=50)

@router.put("/profile")
async def update_profile(
    payload: ProfileUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update active user name & mobile number permanently in database."""
    user_repo = UserRepository(db)
    user = await user_repo.get(user_id)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found.")
    
    await user_repo.update(user, {
        "name": payload.name,
        "mobile_number": payload.mobile_number
    })
    await db.commit()
    return {
        "status": "success",
        "message": "Profile updated successfully.",
        "name": user.name,
        "mobile_number": user.mobile_number
    }


from app.core.security import get_password_hash, verify_password, create_access_token

class EmailRegister(BaseModel):
    email: str = Field(..., max_length=255)
    name: str = Field(..., max_length=255)
    password: str = Field(..., min_length=6, max_length=100)

class EmailLogin(BaseModel):
    email: str = Field(..., max_length=255)
    password: str = Field(..., max_length=100)

class PasswordUpdate(BaseModel):
    current_password: str | None = Field(None, max_length=100)
    new_password: str = Field(..., min_length=6, max_length=100)

@router.post("/register")
async def email_register(
    payload: EmailRegister,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user with email, name, and hashed password."""
    user_repo = UserRepository(db)
    
    # 1. Check if user already exists
    existing = await user_repo.get_by_email(payload.email)
    if existing:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
        
    # 2. Hash password and create user
    hashed = get_password_hash(payload.password)
    user = await user_repo.create({
        "email": payload.email,
        "name": payload.name,
        "password_hash": hashed,
        "auth_provider": AuthProvider.EMAIL,
        "provider_id": "email_auth_" + str(uuid.uuid4())[:8],
        "is_active": True
    })
    await db.commit()
    
    # 3. Create Access Token
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "status": "success",
        "access_token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name
        }
    }

@router.post("/login")
async def email_login(
    payload: EmailLogin,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate email and password credentials, returning JWT token."""
    user_repo = UserRepository(db)
    
    # 1. Fetch user by email
    user = await user_repo.get_by_email(payload.email)
    if not user or not user.password_hash:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    # 2. Verify password
    if not verify_password(payload.password, user.password_hash):
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid email or password.")
        
    # 3. Create Access Token
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "status": "success",
        "access_token": token,
        "user": {
            "id": str(user.id),
            "email": user.email,
            "name": user.name
        }
    }

@router.put("/password")
async def update_password(
    payload: PasswordUpdate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update active user password after validating current password."""
    user_repo = UserRepository(db)
    user = await user_repo.get(user_id)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found.")
        
    # If user was created via Google/Github and has no password hash set yet, allow setting one
    if user.password_hash:
        if not verify_password(payload.current_password, user.password_hash):
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Incorrect current password.")
        
    # Hash and save new password
    user.password_hash = get_password_hash(payload.new_password)
    await db.commit()
    return {"status": "success", "message": "Password updated successfully."}


@router.get("/me")
async def get_me(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Retrieve logged-in user profile details."""
    user_repo = UserRepository(db)
    user = await user_repo.get(user_id)
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found.")
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "auth_provider": user.auth_provider.value if hasattr(user.auth_provider, "value") else user.auth_provider,
        "avatar_url": user.avatar_url,
        "has_password": user.password_hash is not None,
        "mobile_number": user.mobile_number
    }



