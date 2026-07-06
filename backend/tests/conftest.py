# conftest.py
# Purpose: Pytest configuration and shared test fixtures.
# Responsibilities:
#   - Define database and client fixtures for testing
#   - Enable asynchronous testing using pytest-asyncio
# DO NOT: Connect to production databases during test executions.
# DO NOT: Store sensitive developer environment API keys in test code.

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture(scope="module")
def client():
    """Provides a synchronous FastAPI TestClient for routing checks."""
    with TestClient(app) as c:
        yield c
