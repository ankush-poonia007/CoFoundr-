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

    # Autocommit safety patchers for existing databases
    async with engine.connect() as conn:
        await conn.execution_options(isolation_level="AUTOCOMMIT")
        try:
            from sqlalchemy import text
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(50)"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_connected BOOLEAN DEFAULT FALSE"))
            await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS github_connected BOOLEAN DEFAULT FALSE"))
        except Exception as e:
            logger.warning(f"Failed to check password_hash/mobile_number/oauth columns: {e}")

        try:
            await conn.execute(text("ALTER TYPE authprovider ADD VALUE 'email'"))
        except Exception:
            pass # Already exists

    logger.info("Database tables initialized successfully.")
