# __init__.py
# Purpose: Initialize api/v1 package.
# Responsibilities:
#   - Import and expose all API endpoint router modules
# DO NOT: Place endpoint route functions directly in this initialization file.

from app.api.v1 import auth, chat, dashboard, onboarding, reports, startup
