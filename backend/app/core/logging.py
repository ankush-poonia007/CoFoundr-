# logging.py
# Purpose: Configure structured logging for the entire application.
# Responsibilities:
#   - Set log format, level, and handlers
#   - Provide a single setup function called once at startup
# DO NOT: Use print() anywhere in the project. Always use logging.
# DO NOT: Call setup_logging() more than once.

import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    """
    Configure structured logging for the application.
    Call once at application startup in main.py.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    log_format = (
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
    )

    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # ─── Silence noisy third-party loggers ────────────────────────────────────
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
