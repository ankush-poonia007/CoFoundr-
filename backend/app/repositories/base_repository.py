# base_repository.py
# Purpose: Generic repository class for SQLAlchemy models.
# Responsibilities:
#   - Centralize CRUD database actions (get, get_multi, create, update, delete)
#   - Enforce database transaction logic via async DB sessions
# DO NOT: Run complex business validations here.
# DO NOT: Instantiate sessions directly (pass session via constructor).

import uuid
from typing import TypeVar, Type, Generic, List, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic repository implementing basic CRUD operations."""

    def __init__(self, model: Type[ModelType], db: AsyncSession):
        self.model = model
        self.db = db

    async def get(self, id: uuid.UUID) -> ModelType | None:
        """Fetch a single record by its primary key ID."""
        result = await self.db.execute(select(self.model).filter(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        """Fetch multiple records with pagination."""
        result = await self.db.execute(select(self.model).offset(skip).limit(limit))
        return list(result.scalars().all())

    async def create(self, obj_in: Dict[str, Any]) -> ModelType:
        """Create a new database record."""
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        await self.db.flush()  # Retrieve primary key ID and system defaults
        return db_obj

    async def update(self, db_obj: ModelType, obj_in: Dict[str, Any]) -> ModelType:
        """Update fields of an existing record."""
        for field, value in obj_in.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)

        self.db.add(db_obj)
        await self.db.flush()
        return db_obj

    async def delete(self, id: uuid.UUID) -> ModelType | None:
        """Delete a record by its ID."""
        db_obj = await self.get(id)
        if db_obj:
            await self.db.delete(db_obj)
            await self.db.flush()
        return db_obj
