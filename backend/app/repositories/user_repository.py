# user_repository.py
# Purpose: Specialized user database actions.
# Responsibilities:
#   - Fetch users by email, oauth provider info, or active status
#   - Manage user profile updates
# DO NOT: Store plaintext passwords or write hashing logic here (use security.py).
# DO NOT: Raise HTTPExceptions directly in the repository layer.

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.models.enums import AuthProvider
from app.repositories.base_repository import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository helper for user model operations."""

    def __init__(self, db: AsyncSession):
        super().__init__(User, db)

    async def get_by_email(self, email: str) -> User | None:
        """Retrieve a user by their email address."""
        result = await self.db.execute(select(User).filter(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_provider(self, auth_provider: AuthProvider, provider_id: str) -> User | None:
        """Retrieve a user by their OAuth provider credentials."""
        result = await self.db.execute(
            select(User).filter(
                User.auth_provider == auth_provider,
                User.provider_id == provider_id
            )
        )
        return result.scalar_one_or_none()
