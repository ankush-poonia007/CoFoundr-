# test_health.py
# Purpose: Health check endpoint routing verification.
# Responsibilities:
#   - Request GET /health and check response status code and JSON content
# DO NOT: Run database initialization logic inside endpoint tests.

from fastapi.testclient import TestClient


def test_health_endpoint(client: TestClient):
    """Verify that the health check endpoint returns 200 and success status."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
