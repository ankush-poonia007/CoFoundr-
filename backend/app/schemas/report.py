# report.py
# Purpose: Startup report schemas.
# Responsibilities:
#   - Validate payload for creating a report entry in the database
#   - Serialize report models for API JSON responses
# DO NOT: Write PDF generation or content formatting logic here.
# DO NOT: Import report generation tools directly.

import uuid
from datetime import datetime
from typing import Dict, Any
from pydantic import BaseModel, Field
from app.models.enums import ReportType


class ReportBase(BaseModel):
    """Base Pydantic model for startup reports."""
    startup_id: uuid.UUID
    report_type: ReportType
    content: str
    score: float | None = Field(None, ge=0.0, le=100.0)
    metadata_json: Dict[str, Any] | None = Field(None)


class ReportCreate(ReportBase):
    """Model for creating a report."""
    pass


class ReportResponse(ReportBase):
    """Response model for startup reports."""
    id: uuid.UUID
    pdf_url: str | None
    created_at: datetime

    class Config:
        from_attributes = True
