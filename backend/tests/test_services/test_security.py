# test_security.py
# Purpose: Unit tests for core security functionalities.
# Responsibilities:
#   - Verify password hashing and verification match
#   - Test JWT creation and token parsing/decoding validity
# DO NOT: Hardcode expired times or crypt secrets in tests.

from datetime import timedelta
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token


def test_password_hashing():
    """Verify password encryption and verification works as expected."""
    pwd = "supersecretpassword123"
    hashed = get_password_hash(pwd)

    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongpassword", hashed) is False


def test_jwt_generation_and_decoding():
    """Verify JWT access token serialization and signature parsing."""
    payload = {"sub": "test_user_id", "email": "test@cofoundr.ai"}
    token = create_access_token(data=payload, expires_delta=timedelta(minutes=10))

    assert token is not None
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.get("sub") == payload["sub"]
    assert decoded.get("email") == payload["email"]
    assert "exp" in decoded
