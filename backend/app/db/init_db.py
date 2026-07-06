# init_db.py
# Purpose: Initialize database tables on application startup.
# Responsibilities:
#   - Create all tables if they do not exist
#   - Run once at startup in main.py lifespan event
# DO NOT: Use this for production migrations. Use Alembic.
# DO NOT: Run database initialization queries outside lifespan.

import logging
from app.db.base import Base
from app.db.session import engine
from app.models import user, startup, chat, report  # noqa: F401 - import models to register them

logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Create all database tables on startup.
    Called from main.py lifespan context manager.
    """
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")
