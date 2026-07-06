# chat_repository.py
# Purpose: Specialized chat database actions.
# Responsibilities:
#   - Fetch chat sessions by user or startup IDs
#   - Fetch full message logs associated with individual sessions
#   - Append messages to existing session tables
# DO NOT: Run chat LLM calls or format messages here.
# DO NOT: Throw direct HTTPExceptions.

import uuid
from typing import List
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.chat import ChatSession, ChatMessage
from app.models.enums import MessageRole
from app.repositories.base_repository import BaseRepository


class ChatRepository(BaseRepository[ChatSession]):
    """Repository helper for chat sessions and message operations."""

    def __init__(self, db: AsyncSession):
        super().__init__(ChatSession, db)

    async def get_by_user_id(self, user_id: uuid.UUID) -> List[ChatSession]:
        """Retrieve all chat sessions belonging to a specific user."""
        result = await self.db.execute(select(ChatSession).filter(ChatSession.user_id == user_id))
        return list(result.scalars().all())

    async def get_with_messages(self, session_id: uuid.UUID) -> ChatSession | None:
        """Retrieve a chat session along with all its loaded message logs."""
        result = await self.db.execute(
            select(ChatSession)
            .filter(ChatSession.id == session_id)
            .options(selectinload(ChatSession.messages))
        )
        return result.scalar_one_or_none()

    async def create_message(
        self,
        chat_session_id: uuid.UUID,
        role: MessageRole,
        content: str,
        tokens_used: int | None = None,
        metadata_json: dict | None = None,
    ) -> ChatMessage:
        """Create and append a message to a chat session."""
        message = ChatMessage(
            chat_session_id=chat_session_id,
            role=role,
            content=content,
            tokens_used=tokens_used,
            metadata_json=metadata_json,
        )
        self.db.add(message)
        await self.db.flush()
        return message
