# response_formatter.py
# Purpose: Wrap all successful API responses in a consistent envelope.
# Responsibilities:
#   - Format 2xx JSON responses to match the global structure: {"success": true, "data": ...}
# DO NOT: Modify error responses (handled by error_handler.py or exceptions).
# DO NOT: Wrap non-JSON (like streaming file downloads) or OpenAPI docs.

import json
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class ResponseFormatterMiddleware(BaseHTTPMiddleware):
    """Intercepts and formats successful JSON responses to a standardized structure."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Skip formatting for API docs, OpenAPI schema, and health checks
        path = request.url.path
        if (
            path.startswith("/api/docs")
            or path.startswith("/api/redoc")
            or path == "/openapi.json"
            or path == "/health"
            or response.status_code >= 400
        ):
            return response

        # Check content-type, format only JSON responses
        content_type = response.headers.get("content-type", "")
        if "application/json" in content_type:
            response_body = b""
            async for chunk in response.body_iterator:
                response_body += chunk

            try:
                data = json.loads(response_body.decode("utf-8"))
                # If already wrapped, don't double wrap
                if isinstance(data, dict) and "success" in data and "data" in data:
                    formatted_data = data
                else:
                    formatted_data = {
                        "success": True,
                        "data": data,
                        "message": None
                    }

                formatted_body = json.dumps(formatted_data).encode("utf-8")

                # Reconstruct Response with updated body and recalculated headers
                new_response = Response(
                    content=formatted_body,
                    status_code=response.status_code,
                    media_type="application/json",
                    headers=dict(response.headers)
                )
                new_response.headers["content-length"] = str(len(formatted_body))
                return new_response
            except Exception:
                # Fallback to the original response in case of JSON decode errors
                async def body_iterator():
                    yield response_body
                response.body_iterator = body_iterator()
                return response

        return response
