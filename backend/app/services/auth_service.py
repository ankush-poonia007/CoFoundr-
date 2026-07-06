# auth_service.py
# Purpose: Authentication service layer processing user registry, passwords, token generation, and OAuth validation.
# Responsibilities:
#   - Exchange authorization codes for user details via Google and GitHub OAuth APIs
#   - Locate or provision user accounts in the database
#   - Issue JWT session tokens
# DO NOT: Store plaintext passwords in user models.
# DO NOT: Throw raw HTTP 500 exceptions (use custom exceptions or raise HTTP 401).

import logging
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from fastapi import status, HTTPException

from app.core.config import settings
from app.core.security import create_access_token
from app.models.enums import AuthProvider
from app.repositories.user_repository import UserRepository
from app.schemas.auth import TokenResponse

logger = logging.getLogger(__name__)


class AuthService:
    """Authentication and session management handler."""

    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)

    @staticmethod
    def get_google_auth_url() -> dict:
        """Build the redirect URL for Google OAuth consent screen."""
        if settings.GOOGLE_CLIENT_ID == "your_google_client_id":
            # Return mock redirect payload for sandbox testing
            mock_url = f"{settings.BACKEND_URL}/api/v1/auth/google/callback?code=mock_google_code"
            logger.info("Google OAuth configured with placeholder secrets. Returning mock URL.")
            return {"url": mock_url}

        params = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "redirect_uri": f"{settings.BACKEND_URL}/api/v1/auth/google/callback",
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}

    @staticmethod
    def get_github_auth_url() -> dict:
        """Build the redirect URL for GitHub OAuth consent screen."""
        if settings.GITHUB_CLIENT_ID == "your_github_client_id":
            # Return mock redirect payload for sandbox testing
            mock_url = f"{settings.BACKEND_URL}/api/v1/auth/github/callback?code=mock_github_code"
            logger.info("GitHub OAuth configured with placeholder secrets. Returning mock URL.")
            return {"url": mock_url}

        params = {
            "client_id": settings.GITHUB_CLIENT_ID,
            "redirect_uri": f"{settings.BACKEND_URL}/api/v1/auth/github/callback",
            "scope": "user:email",
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return {"url": f"https://github.com/login/oauth/authorize?{query}"}

    async def handle_google_callback(self, code: str) -> TokenResponse:
        """Exchange Google authorization code for token and authenticate user."""
        logger.info("Exchanging code for Google OAuth session.")

        # Check if running in mock developer mode
        if settings.GOOGLE_CLIENT_ID == "your_google_client_id" or code == "mock_google_code":
            logger.info("Using mock Google OAuth provider path.")
            user_info = {
                "email": "developer@cofoundr.ai",
                "name": "CoFoundr Developer",
                "picture": "https://avatar.vercel.sh/developer",
                "sub": "mock_google_user_id_999",
            }
        else:
            # Production HTTP integration
            async with httpx.AsyncClient() as client:
                # Exchange token
                token_res = await client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": settings.GOOGLE_CLIENT_ID,
                        "client_secret": settings.GOOGLE_CLIENT_SECRET,
                        "redirect_uri": f"{settings.BACKEND_URL}/api/v1/auth/google/callback",
                        "grant_type": "authorization_code",
                    },
                )
                if token_res.status_code != 200:
                    logger.error(f"Google Token Exchange error: {token_res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Failed to authenticate with Google oauth token endpoint."
                    )

                access_token = token_res.json().get("access_token")

                # Get user profile info
                profile_res = await client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if profile_res.status_code != 200:
                    logger.error(f"Google Profile Fetch error: {profile_res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Failed to fetch Google user profile."
                    )
                user_info = profile_res.json()

        # Provision user
        user = await self._provision_user(
            email=user_info["email"],
            name=user_info["name"],
            avatar_url=user_info.get("picture"),
            auth_provider=AuthProvider.GOOGLE,
            provider_id=user_info["sub"]
        )

        # Generate JWT
        jwt_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        return TokenResponse(
            access_token=jwt_token,
            user_id=user.id,
            email=user.email
        )

    async def handle_github_callback(self, code: str) -> TokenResponse:
        """Exchange GitHub authorization code for token and authenticate user."""
        logger.info("Exchanging code for GitHub OAuth session.")

        # Check if running in mock developer mode
        if settings.GITHUB_CLIENT_ID == "your_github_client_id" or code == "mock_github_code":
            logger.info("Using mock GitHub OAuth provider path.")
            user_info = {
                "email": "dev-github@cofoundr.ai",
                "name": "GitHub Developer",
                "avatar_url": "https://avatar.vercel.sh/github-dev",
                "id": "mock_github_user_id_777",
            }
        else:
            # Production HTTP integration
            async with httpx.AsyncClient() as client:
                # Exchange token
                token_res = await client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "code": code,
                        "client_id": settings.GITHUB_CLIENT_ID,
                        "client_secret": settings.GITHUB_CLIENT_SECRET,
                        "redirect_uri": f"{settings.BACKEND_URL}/api/v1/auth/github/callback",
                    },
                )
                if token_res.status_code != 200:
                    logger.error(f"GitHub Token Exchange error: {token_res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Failed to authenticate with GitHub oauth token endpoint."
                    )

                access_token = token_res.json().get("access_token")
                if not access_token:
                    logger.error(f"GitHub callback response missing access_token: {token_res.json()}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid GitHub auth callback response."
                    )

                # Get user profile info
                profile_res = await client.get(
                    "https://api.github.com/user",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json"
                    }
                )
                if profile_res.status_code != 200:
                    logger.error(f"GitHub Profile Fetch error: {profile_res.text}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Failed to fetch GitHub user profile."
                    )
                user_data = profile_res.json()

                # Get primary email since it might not be public
                email_res = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/json"
                    }
                )
                email = None
                if email_res.status_code == 200:
                    emails = email_res.json()
                    for email_obj in emails:
                        if email_obj.get("primary") and email_obj.get("verified"):
                            email = email_obj.get("email")
                            break

                if not email:
                    email = user_data.get("email") or f"{user_data.get('login')}@github.user"

                user_info = {
                    "email": email,
                    "name": user_data.get("name") or user_data.get("login"),
                    "avatar_url": user_data.get("avatar_url"),
                    "id": str(user_data.get("id")),
                }

        # Provision user
        user = await self._provision_user(
            email=user_info["email"],
            name=user_info["name"],
            avatar_url=user_info.get("avatar_url"),
            auth_provider=AuthProvider.GITHUB,
            provider_id=user_info["id"]
        )

        # Generate JWT
        jwt_token = create_access_token(data={"sub": str(user.id), "email": user.email})
        return TokenResponse(
            access_token=jwt_token,
            user_id=user.id,
            email=user.email
        )

    async def _provision_user(
        self,
        email: str,
        name: str,
        avatar_url: str | None,
        auth_provider: AuthProvider,
        provider_id: str,
    ):
        """Locate user by OAuth identifier or create a new user profile in db."""
        user = await self.user_repo.get_by_provider(auth_provider, provider_id)
        if not user:
            # Also check by email to prevent duplicate accounts
            user = await self.user_repo.get_by_email(email)
            if user:
                # Update provider details for existing email
                logger.info(f"Link OAuth provider {auth_provider} to email {email}.")
                await self.user_repo.update(
                    user,
                    {"auth_provider": auth_provider, "provider_id": provider_id}
                )
            else:
                # Create a new user record
                logger.info(f"Registering new user account: {email}")
                user = await self.user_repo.create({
                    "email": email,
                    "name": name,
                    "avatar_url": avatar_url,
                    "auth_provider": auth_provider,
                    "provider_id": provider_id,
                    "is_active": True,
                })
        return user
