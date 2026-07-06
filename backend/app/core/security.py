# security.py
# Purpose: Authentication JWT signing, token decoding, and user crypt secrets hashing.
# Responsibilities:
#   - Generate cryptographically secure JWT tokens
#   - Decode and validate JWT payloads
# DO NOT: Store private cryptographic keys in plain text files.
# DO NOT: Use weak encryption algorithms (always use JWT_ALGORITHM from settings).

import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

logger = logging.getLogger(__name__)

# Password hashing context (defaulting to bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """
    Create a JWT access token.

    Args:
        data: The payload dictionary to encode.
        expires_delta: Optional expiration duration.

    Returns:
        str: The signed JWT token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Dict[str, Any] | None:
    """
    Decode and validate a JWT access token.

    Args:
        token: The signed JWT string.

    Returns:
        dict: The decoded token payload, or None if invalid.
    """
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"Failed to decode access token: {e}")
        return None
