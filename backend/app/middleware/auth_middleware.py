# auth_middleware.py
# Purpose: Authentication token verification helper operating prior to router access.
# Responsibilities:
#   - Check request headers for Authorization Bearer tokens
#   - Decode JWT token and inject payload into request.state.user
# DO NOT: Throw direct HTTP 401 exceptions for public endpoints.
# DO NOT: Run database queries in the middleware thread.

import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.security import decode_access_token

logger = logging.getLogger(__name__)


class AuthMiddleware(BaseHTTPMiddleware):
    """Parses JWT Authorization header and attaches the user payload to the request state."""

    async def dispatch(self, request: Request, call_next) -> Response:
        request.state.user = None
        auth_header = request.headers.get("Authorization")
        token = None

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.query_params.get("token")

        if token:
            payload = decode_access_token(token)
            if payload:
                # Store decoded token payload (e.g. {"sub": user_id, "email": ...})
                request.state.user = payload
                logger.debug(f"AuthMiddleware: authenticated user_id={payload.get('sub')}")

        return await call_next(request)
