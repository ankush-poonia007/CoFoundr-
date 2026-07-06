# auth.py
# Purpose: Authentication API endpoints.
# Responsibilities:
#   - Expose Google and GitHub OAuth redirect URL and callback endpoints
#   - Issue JWT auth tokens via AuthService delegates
# DO NOT: Write authentication process flow or token signing logic directly inside routes.
# DO NOT: Query PostgreSQL user tables directly from API router controllers.

import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth")


@router.get("/google")
async def google_oauth_redirect():
    """Redirect user to Google OAuth consent screen."""
    return AuthService.get_google_auth_url()


@router.get("/google/callback")
async def google_oauth_callback(
    code: str,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Handle Google OAuth callback and return JWT token."""
    logger.info("Google OAuth callback received.")
    return await AuthService(db).handle_google_callback(code)


@router.get("/github")
async def github_oauth_redirect():
    """Redirect user to GitHub OAuth consent screen."""
    return AuthService.get_github_auth_url()


@router.get("/github/callback")
async def github_oauth_callback(
    code: str,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Handle GitHub OAuth callback and return JWT token."""
    logger.info("GitHub OAuth callback received.")
    return await AuthService(db).handle_github_callback(code)


@router.post("/logout")
async def logout() -> dict:
    """Logout endpoint — client must discard the JWT token."""
    return {"message": "Logged out successfully."}
