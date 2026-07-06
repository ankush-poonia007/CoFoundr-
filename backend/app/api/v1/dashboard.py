# dashboard.py
# Purpose: Dashboard analytics API endpoint router.
# Responsibilities:
#   - Expose endpoints for dashboard metrics and state query
# DO NOT: Write business logic here.
# DO NOT: Query database tables directly here.

from fastapi import APIRouter

router = APIRouter(prefix="/dashboard")
