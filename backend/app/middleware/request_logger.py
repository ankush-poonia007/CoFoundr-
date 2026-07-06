# request_logger.py
# Purpose: Log every incoming HTTP request and its response time.
# Responsibilities:
#   - Track request method, path, status, and duration
#   - Standardize logging formatted output
# DO NOT: Log request bodies to prevent security leakage of PII.
# DO NOT: Add application routing or database lookup operations here.

import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Logs all incoming requests with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            f"{request.method} {request.url.path} "
            f"| status={response.status_code} "
            f"| duration={duration_ms}ms"
        )
        return response
