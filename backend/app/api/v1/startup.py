# startup.py
# Purpose: Startup profile management API endpoint router.
# Responsibilities:
#   - Expose endpoints to create, fetch, and update startup profiles
# DO NOT: Write business logic here.
# DO NOT: Query database tables directly here.

from fastapi import APIRouter

router = APIRouter(prefix="/startups")
