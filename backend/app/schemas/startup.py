# startup.py
# Purpose: Startup input/output Pydantic schemas.
# Responsibilities:
#   - Validate payload for startup profile creation and updates
#   - Structure startup database models for JSON API responses
# DO NOT: Place database query functions in schema definitions.
# DO NOT: Hardcode default stages (always import from model enums).

import uuid
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.enums import StartupStage


class StartupBase(BaseModel):
    """Base Pydantic model for startup data."""
    name: str = Field(..., max_length=255, description="The name of the startup")
    tagline: str | None = Field(None, max_length=500)
    problem_statement: str | None = Field(None, max_length=2000)
    solution_description: str | None = Field(None, max_length=2000)
    target_market: str | None = Field(None, max_length=500)
    unique_value_proposition: str | None = Field(None, max_length=1000)
    founder_name: str | None = Field(None, max_length=255)
    team_size: int = Field(1, ge=1)
    domain_expertise: str | None = Field(None, max_length=1000)
    stage: StartupStage = Field(StartupStage.IDEA)
    business_model: str | None = Field(None, max_length=500)
    revenue_model: str | None = Field(None, max_length=500)
    has_revenue: bool = Field(False)
    competitors_known: bool = Field(False)
    competitive_advantage: str | None = Field(None, max_length=1000)


class StartupCreate(StartupBase):
    """Model for creating a startup."""
    pass


class StartupUpdate(BaseModel):
    """Model for updating a startup (all fields optional)."""
    name: str | None = Field(None, max_length=255)
    tagline: str | None = Field(None, max_length=500)
    problem_statement: str | None = Field(None, max_length=2000)
    solution_description: str | None = Field(None, max_length=2000)
    target_market: str | None = Field(None, max_length=500)
    unique_value_proposition: str | None = Field(None, max_length=1000)
    founder_name: str | None = Field(None, max_length=255)
    team_size: int | None = Field(None, ge=1)
    domain_expertise: str | None = Field(None, max_length=1000)
    stage: StartupStage | None = Field(None)
    business_model: str | None = Field(None, max_length=500)
    revenue_model: str | None = Field(None, max_length=500)
    has_revenue: bool | None = Field(None)
    competitors_known: bool | None = Field(None)
    competitive_advantage: str | None = Field(None, max_length=1000)


class StartupResponse(StartupBase):
    """Response model for startup queries."""
    id: uuid.UUID
    user_id: uuid.UUID
    health_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
