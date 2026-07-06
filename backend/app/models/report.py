# report.py
# Purpose: Startup report ORM model.
# Responsibilities:
#   - Define the reports table schema for the database
#   - Define relationships to parent Startup profile and document outputs
# DO NOT: Run PDF generation logic directly inside this model class.
# DO NOT: Store large PDF blobs in this database table.

import uuid
from typing import Dict, Any
from sqlalchemy import ForeignKey, Text, Float, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import ReportType


class Report(Base, UUIDMixin, TimestampMixin):
    """ORM model for startup reports."""

    __tablename__ = "reports"

    startup_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("startups.id", ondelete="CASCADE"), nullable=False, index=True)
    report_type: Mapped[ReportType] = mapped_column(nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    metadata_json: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    # ─── Relationships ────────────────────────────────────────────────────────
    startup: Mapped["Startup"] = relationship("Startup", back_populates="reports")
