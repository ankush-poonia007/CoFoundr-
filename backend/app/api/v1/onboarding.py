# onboarding.py
# Purpose: Onboarding API endpoint router.
# Responsibilities:
#   - Expose endpoints for registering user and startup details in a single step
# DO NOT: Write business logic here.
# DO NOT: Query database tables directly here.

from fastapi import APIRouter

router = APIRouter(prefix="/onboarding")
