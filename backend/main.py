# main.py
# Purpose: FastAPI application entry point.
# Responsibilities:
#   - Instantiate FastAPI application object with metadata
#   - Register all request-response middlewares in correct order
#   - Include API routers and configure lifecycle events (lifespan)
# DO NOT: Write business logic, database query operations, or agent code here.
# DO NOT: Instantiate the database engine directly inside route definitions.

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import auth, chat, dashboard, onboarding, reports, startup
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.init_db import init_db
from app.middleware.auth_middleware import AuthMiddleware
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware
from app.middleware.request_logger import RequestLoggerMiddleware
from app.middleware.response_formatter import ResponseFormatterMiddleware

# ─── Setup structured logging ─────────────────────────────────────────────────
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    logger.info("Starting CoFoundr API...")
    await init_db()
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down CoFoundr API...")


# ─── App Instance ──────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered Startup Research, Analysis & Advisory Agent",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# ─── Middleware Registration (Order matters: bottom runs first) ────────────────
app.add_middleware(ResponseFormatterMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestLoggerMiddleware)
app.add_middleware(RateLimiterMiddleware)
app.add_middleware(AuthMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Router Registration ───────────────────────────────────────────────────────
API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX, tags=["Authentication"])
app.include_router(onboarding.router, prefix=API_PREFIX, tags=["Onboarding"])
app.include_router(startup.router, prefix=API_PREFIX, tags=["Startup"])
app.include_router(chat.router, prefix=API_PREFIX, tags=["Chat"])
app.include_router(dashboard.router, prefix=API_PREFIX, tags=["Dashboard"])
app.include_router(reports.router, prefix=API_PREFIX, tags=["Reports"])


# ─── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Health check endpoint for Docker and deployment platforms."""
    return {"status": "healthy", "version": settings.APP_VERSION}
