# error_handler.py
# Purpose: Global exception handler to catch all unhandled errors.
# Responsibilities:
#   - Capture errors, log traceback details, and format JSON responses
#   - Prevent direct application crashes by wrapping ASGI execution
# DO NOT: Expose internal Python system tracebacks in production mode.
# DO NOT: Catch and swallow exceptions silently without log statements.

import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catches all unhandled exceptions and returns a consistent error response."""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": "An internal server error occurred.",
                    "code": "INTERNAL_SERVER_ERROR",
                },
            )
