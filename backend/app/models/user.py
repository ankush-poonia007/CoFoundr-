# user.py
# Purpose: User ORM model.
# Responsibilities:
#   - Define the users table schema for the database
#   - Define relationships to startups and chat sessions
# DO NOT: Add business logic or methods here.
# DO NOT: Import services or API layers here.

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import AuthProvider


class User(Base, UUIDMixin, TimestampMixin):
    """ORM model for application users."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    auth_provider: Mapped[AuthProvider] = mapped_column(nullable=False)
    provider_id: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mobile_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    google_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    github_connected: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ─── Relationships ────────────────────────────────────────────────────────
    startups: Mapped[list["Startup"]] = relationship("Startup", back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[list["ChatSession"]] = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
