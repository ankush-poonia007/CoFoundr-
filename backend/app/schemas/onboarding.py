# onboarding.py
# Purpose: Onboarding schema definition.
# Responsibilities:
#   - Validate onboarding request payload containing user name and initial startup information
# DO NOT: Store sensitive authentication credentials here.
# DO NOT: Mix onboarding schemas with database transaction logic.

import uuid
from pydantic import BaseModel, Field
from app.models.enums import StartupStage
from app.schemas.startup import StartupResponse


class OnboardingRequest(BaseModel):
    """Model validating onboarding input for user and startup creation."""
    user_name: str = Field(..., max_length=255, description="The real name of the user to register")
    startup_name: str = Field(..., max_length=255, description="The name of the startup to register")
    startup_tagline: str | None = Field(None, max_length=500, description="Startup tagline")
    startup_stage: StartupStage = Field(StartupStage.IDEA, description="Startup initial developmental stage")
    problem_statement: str | None = Field(None, max_length=2000, description="Detailed problem statement")


class OnboardingResponse(BaseModel):
    """Response representing onboarding success with created resources."""
    user_id: uuid.UUID
    startup: StartupResponse
