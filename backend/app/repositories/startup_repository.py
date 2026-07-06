# startup_repository.py
# Purpose: Specialized startup database actions.
# Responsibilities:
#   - Fetch startups owned by specific users
#   - Handle updates to startup profiles and health scores
# DO NOT: Calculate startup health scores here.
# DO NOT: Raise HTTPExceptions directly.

import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.startup import Startup
from app.repositories.base_repository import BaseRepository


class StartupRepository(BaseRepository[Startup]):
    """Repository helper for startup model operations."""

    def __init__(self, db: AsyncSession):
        super().__init__(Startup, db)

    async def get_by_user_id(self, user_id: uuid.UUID) -> List[Startup]:
        """Retrieve all startups belonging to a specific user ID."""
        result = await self.db.execute(select(Startup).filter(Startup.user_id == user_id))
        return list(result.scalars().all())
