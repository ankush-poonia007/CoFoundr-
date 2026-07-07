# chat.py
# Purpose: Chat session and message ORM models.
# Responsibilities:
#   - Define schemas for chat_sessions and chat_messages tables
#   - Define relationship between User, Startup, and Chat Session elements
# DO NOT: Store large files in raw database text fields.
# DO NOT: Place state machine or agent transition logic here.

import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy import String, ForeignKey, Text, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import MessageRole


class ChatSession(Base, UUIDMixin, TimestampMixin):
    """ORM model for chat threads/sessions."""

    __tablename__ = "chat_sessions"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    startup_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("startups.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), default="New Chat Session")

    # ─── Relationships ────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="chat_sessions")
    startup: Mapped[Optional["Startup"]] = relationship("Startup", back_populates="chat_sessions")
    messages: Mapped[List["ChatMessage"]] = relationship("ChatMessage", back_populates="chat_session", cascade="all, delete-orphan")


class ChatMessage(Base, UUIDMixin, TimestampMixin):
    """ORM model for messages within a chat session."""

    __tablename__ = "chat_messages"

    chat_session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    role: Mapped[MessageRole] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)
    metadata_json: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    # ─── Relationships ────────────────────────────────────────────────────────
    chat_session: Mapped["ChatSession"] = relationship("ChatSession", back_populates="messages")
