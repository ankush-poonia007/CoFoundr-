# report_repository.py
# Purpose: Specialized report database actions.
# Responsibilities:
#   - Fetch reports associated with individual startup profiles
#   - Save and update PDF URLs or metadata for generated startup documents
# DO NOT: Run PDF generation logic here.
# DO NOT: Throw direct HTTPExceptions.

import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.report import Report
from app.models.enums import ReportType
from app.repositories.base_repository import BaseRepository


class ReportRepository(BaseRepository[Report]):
    """Repository helper for report model operations."""

    def __init__(self, db: AsyncSession):
        super().__init__(Report, db)

    async def get_by_startup_id(self, startup_id: uuid.UUID) -> List[Report]:
        """Retrieve all reports generated for a specific startup ID."""
        result = await self.db.execute(select(Report).filter(Report.startup_id == startup_id))
        return list(result.scalars().all())

    async def get_by_startup_and_type(
        self,
        startup_id: uuid.UUID,
        report_type: ReportType
    ) -> Report | None:
        """Retrieve a specific report type for a given startup ID."""
        result = await self.db.execute(
            select(Report).filter(
                Report.startup_id == startup_id,
                Report.report_type == report_type
            )
        )
        return result.scalar_one_or_none()
