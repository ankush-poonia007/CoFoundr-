# auth.py
# Purpose: Authentication schema definitions.
# Responsibilities:
#   - Define validation schemas for login, callbacks, and token outputs
# DO NOT: Store plaintext passwords in schema validation models.
# DO NOT: Mix API validation schemas with database ORM class objects.

import uuid
from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    """Pydantic model representing JWT access token payload."""
    access_token: str
    token_type: str = "bearer"
    user_id: uuid.UUID
    email: EmailStr


class OAuthCallbackRequest(BaseModel):
    """Pydantic model representing incoming OAuth redirect code."""
    code: str
