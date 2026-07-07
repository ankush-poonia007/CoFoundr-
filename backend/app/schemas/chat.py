# chat.py
# Purpose: Chat Session and Chat Message validation models.
# Responsibilities:
#   - Define validation schemas for chat sessions, messages, and prompt payloads
#   - Serialize chat models into API-ready JSON representations
# DO NOT: Put large payload fields (like parsing file content) directly into ChatMessageCreate.
# DO NOT: Import agents or run inference logic from validation classes.

import uuid
from datetime import datetime
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from app.models.enums import MessageRole


class ChatMessageBase(BaseModel):
    """Base Pydantic model for chat messages."""
    role: MessageRole
    content: str


class ChatMessageCreate(BaseModel):
    """Model for creating/sending a message."""
    content: str = Field(..., min_length=1, max_length=5000)
    metadata_json: Dict[str, Any] | None = Field(None)


class ChatMessageResponse(ChatMessageBase):
    """Response model representing a chat message."""
    id: uuid.UUID
    chat_session_id: uuid.UUID
    tokens_used: int | None
    metadata_json: Dict[str, Any] | None
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSessionBase(BaseModel):
    """Base model for chat session information."""
    title: str = Field("New Chat Session", max_length=255)
    startup_id: uuid.UUID | None = Field(None)


class ChatSessionCreate(ChatSessionBase):
    """Model for creating a new chat session."""
    pass


class ChatSessionResponse(ChatSessionBase):
    """Response model for a chat session, containing metadata and creation details."""
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatSessionDetailResponse(ChatSessionResponse):
    """Response model for chat session with detailed list of messages."""
    messages: List[ChatMessageResponse] = []

    class Config:
        from_attributes = True
