#!/usr/bin/env python3
# scripts/check_env.py
# Purpose: Validate all required environment variables before startup.
# Run: python scripts/check_env.py
# DO NOT: Import app modules here. This runs before the app starts.

import os
import sys

REQUIRED_VARS = [
    "DATABASE_URL",
    "CHROMA_HOST",
    "CHROMA_PORT",
    "GEMINI_API_KEY",
    "GROQ_API_KEY",
    "TAVILY_API_KEY",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "JWT_SECRET_KEY",
    "SUPABASE_URL",
    "SUPABASE_KEY",
]

def check_env() -> None:
    """Check all required environment variables are set."""
    # Attempt to load from local .env files if running locally outside Docker
    for path in [".env", "backend/.env", "../.env", "../backend/.env"]:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if not line or line.startswith("#") or "=" not in line:
                            continue
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        if key and not os.environ.get(key):
                            os.environ[key] = val
            except Exception:
                pass

    # Map alias/fallback keys
    if os.getenv("SUPABASE_ANON_KEY") and not os.getenv("SUPABASE_KEY"):
        os.environ["SUPABASE_KEY"] = os.getenv("SUPABASE_ANON_KEY")

    missing = [var for var in REQUIRED_VARS if not os.getenv(var)]

    if missing:
        print("❌ CoFoundr ENV Check Failed — Missing variables:")
        for var in missing:
            print(f"   - {var}")
        print("\n💡 Copy .env.example to .env and fill in all values.")
        sys.exit(1)

    print("✅ All environment variables are set. CoFoundr is ready.")

if __name__ == "__main__":
    check_env()
