# rate_limiter.py
# Purpose: Rate limiter protecting api endpoints.
# Responsibilities:
#   - Track requests per IP address
#   - Return HTTP 429 Too Many Requests if client exceeds limit
# DO NOT: Block websocket connections under normal rate limit rules.
# DO NOT: Block health checks or local developer addresses.

import logging
import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from app.core.constants import RATE_LIMIT_PER_MINUTE

logger = logging.getLogger(__name__)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Simple in-memory window rate limiter middleware per client IP."""

    def __init__(self, app, limit: int = RATE_LIMIT_PER_MINUTE, window_seconds: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window_seconds = window_seconds
        # Maps IP -> list of request timestamps
        self.request_history = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Bypass rate limiter for WebSocket connections, health checks, and API docs
        path = request.url.path
        if (
            request.scope.get("type") == "websocket"
            or path == "/health"
            or path.startswith("/api/docs")
            or path.startswith("/api/redoc")
        ):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Clean old timestamps outside the window
        history = self.request_history[client_ip]
        self.request_history[client_ip] = [t for t in history if now - t < self.window_seconds]

        if len(self.request_history[client_ip]) >= self.limit:
            logger.warning(f"Rate limit exceeded for client IP: {client_ip} on path {path}")
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "error": "Rate limit exceeded. Please try again later.",
                    "code": "RATE_LIMIT_EXCEEDED",
                },
            )

        self.request_history[client_ip].append(now)
        return await call_next(request)
