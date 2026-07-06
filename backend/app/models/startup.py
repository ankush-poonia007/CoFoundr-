# startup.py
# Purpose: Startup ORM model.
# Responsibilities:
#   - Define the startups table schema for the database
#   - Define relationships to owners (User) and analytics reports
# DO NOT: Add business logic or score calculation methods here.
# DO NOT: Import services or API layers here.

import uuid
from sqlalchemy import String, Boolean, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import StartupStage


class Startup(Base, UUIDMixin, TimestampMixin):
    """ORM model for startups."""

    __tablename__ = "startups"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    tagline: Mapped[str | None] = mapped_column(String(500), nullable=True)
    problem_statement: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    solution_description: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    target_market: Mapped[str | None] = mapped_column(String(500), nullable=True)
    unique_value_proposition: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    founder_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    team_size: Mapped[int] = mapped_column(Integer, default=1)
    domain_expertise: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    stage: Mapped[StartupStage] = mapped_column(default=StartupStage.IDEA)
    business_model: Mapped[str | None] = mapped_column(String(500), nullable=True)
    revenue_model: Mapped[str | None] = mapped_column(String(500), nullable=True)
    has_revenue: Mapped[bool] = mapped_column(Boolean, default=False)
    competitors_known: Mapped[bool] = mapped_column(Boolean, default=False)
    competitive_advantage: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    health_score: Mapped[float] = mapped_column(Float, default=0.0)

    # ─── Relationships ────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="startups")
    chat_sessions: Mapped[list["ChatSession"]] = relationship("ChatSession", back_populates="startup", cascade="all, delete-orphan")
    reports: Mapped[list["Report"]] = relationship("Report", back_populates="startup", cascade="all, delete-orphan")
