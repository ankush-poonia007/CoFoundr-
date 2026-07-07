# deps.py
# Purpose: Shared dependency injection helpers for API routers.
# Responsibilities:
#   - Validate request.state.user payloads populated by middleware
#   - Expose current authenticated user details
# DO NOT: Run cryptographic hashing or database transaction logic here.
# DO NOT: Raise raw system errors (always raise HTTPException).

import logging
import uuid
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer
from app.core.exceptions import UnauthorizedException

logger = logging.getLogger(__name__)

reusable_oauth2 = HTTPBearer(auto_error=False)


async def get_current_user_id(
    request: Request,
    token: str | None = Depends(reusable_oauth2)
) -> uuid.UUID:
    """
    Dependency to retrieve the authenticated user ID from the request state.
    Raises HTTPException 401 if missing or invalid.
    """
    user_payload = getattr(request.state, "user", None)
    if not user_payload or "sub" not in user_payload:
        raise UnauthorizedException("Authentication token is missing or invalid.")
    try:
        return uuid.UUID(user_payload["sub"])
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token subject identifier."
        )
