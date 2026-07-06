# reports.py
# Purpose: Startup analysis reports API endpoint router.
# Responsibilities:
#   - Expose endpoints to generate, list, and download PDF reports
# DO NOT: Write business logic here.
# DO NOT: Query database tables directly here.

from fastapi import APIRouter

router = APIRouter(prefix="/reports")
