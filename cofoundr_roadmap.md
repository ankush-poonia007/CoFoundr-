# CoFoundr — Complete Antigravity Implementation Roadmap (v1.0)

> **Purpose:** Step-by-step implementation guide for Antigravity code generation.
> Every file includes: responsibility, imports, structure, do's, don'ts, and comments.
> Follow phases in strict order. Never skip a phase or a gate.

---

## Development Philosophy

- One file = one responsibility
- No business logic in API layer
- No DB queries in service layer
- No direct LLM calls outside provider layer
- Every function has type hints + docstring + logging
- Never hardcode values — use `config.py` or `constants.py`

---

## Layered Architecture (Strict — Never Skip)

```
Next.js Frontend
      ↓
FastAPI (main.py)
      ↓
Middleware Layer
      ↓
API Layer (api/v1/)
      ↓
Service Layer (services/)
      ↓
Agent Layer (agents/)
      ↓
Tools Layer (tools/)
      ↓
Provider Layer (providers/)
      ↓
Repository Layer (repositories/)
      ↓
Database (PostgreSQL + ChromaDB)
```

---

## Engineering Gates (Apply to EVERY phase before moving on)

| Gate | Requirement |
|------|-------------|
| 🏛️ Architecture | File is in correct layer, correct responsibility |
| 💻 Implementation | Type hints, docstrings, logging, error handling |
| 🧪 Testing | Pytest/Jest tests written and passing |
| 📚 Documentation | Docstrings updated, README updated if needed |
| 🔍 Review | Self-review checklist passed |
| 📝 Git | Conventional commit: `feat:`, `fix:`, `chore:` |

---

# PHASE 1 — Foundation

**Goal:** Project boots successfully. Auth works. DB connected. Frontend renders.

---

## Step 1.1 — Root Project Setup

### Files to create at root:

```
cofoundr/
├── .gitignore
├── .env.example
├── docker-compose.yml
├── README.md
└── ARCHITECTURE.md
```

---

### `.gitignore`

```
# Python
__pycache__/
*.pyc
*.pyo
.env
*.egg-info/
dist/
build/
.pytest_cache/
htmlcov/

# Node
node_modules/
.next/
.env.local

# Docker
*.log

# IDE
.vscode/
.idea/

# DB
*.sqlite3
```

---

### Root `.env.example`

```env
# ─── DATABASE ───────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/cofoundr

# ─── VECTOR DATABASE ─────────────────────────
CHROMA_HOST=localhost
CHROMA_PORT=8001

# ─── AI PROVIDERS ────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# ─── SEARCH ──────────────────────────────────
TAVILY_API_KEY=your_tavily_api_key_here

# ─── AUTH ────────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET_KEY=your_jwt_secret_key_minimum_32_chars
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# ─── BACKEND ─────────────────────────────────
BACKEND_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000

# ─── FRONTEND ────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# ─── FILE STORAGE ────────────────────────────
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
MAX_FILE_SIZE_MB=10
```

---

### `docker-compose.yml`

```yaml
# docker-compose.yml
# Purpose: Orchestrates all services for local development
# Services: backend, frontend, postgres, chromadb

version: "3.9"

services:

  postgres:
    image: postgres:15-alpine
    container_name: cofoundr_postgres
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: cofoundr
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 10s
      timeout: 5s
      retries: 5

  chromadb:
    image: chromadb/chroma:latest
    container_name: cofoundr_chroma
    ports:
      - "8001:8000"
    volumes:
      - chroma_data:/chroma/chroma

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cofoundr_backend
    env_file:
      - ./backend/.env
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    depends_on:
      postgres:
        condition: service_healthy
      chromadb:
        condition: service_started
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: cofoundr_frontend
    env_file:
      - ./frontend/.env.local
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  postgres_data:
  chroma_data:
```

---

## Step 1.2 — Backend Foundation

### `backend/requirements.txt`

```txt
# ─── Web Framework ────────────────────────────
fastapi==0.111.0
uvicorn[standard]==0.29.0

# ─── Database ─────────────────────────────────
sqlalchemy==2.0.30
asyncpg==0.29.0
alembic==1.13.1
psycopg2-binary==2.9.9

# ─── Vector Database ──────────────────────────
chromadb==0.5.0

# ─── AI / LLM ─────────────────────────────────
langchain==0.2.0
langchain-google-genai==1.0.5
langchain-groq==0.1.4
langchain-community==0.2.0
langgraph==0.1.5
google-generativeai==0.5.4
groq==0.8.0

# ─── Search ───────────────────────────────────
tavily-python==0.3.3

# ─── Auth ─────────────────────────────────────
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
authlib==1.3.0
httpx==0.27.0

# ─── File Parsing ─────────────────────────────
pypdf2==3.0.1
python-docx==1.1.0
python-pptx==0.6.23
pillow==10.3.0

# ─── PDF Generation ───────────────────────────
reportlab==4.2.0

# ─── Validation ───────────────────────────────
pydantic==2.7.1
pydantic-settings==2.2.1
email-validator==2.1.1

# ─── Utilities ────────────────────────────────
python-multipart==0.0.9
python-dotenv==1.0.1
aiofiles==23.2.1

# ─── Rate Limiting ────────────────────────────
slowapi==0.1.9

# ─── WebSockets ───────────────────────────────
websockets==12.0

# ─── Testing ──────────────────────────────────
pytest==8.2.0
pytest-asyncio==0.23.6
httpx==0.27.0
```

---

### `backend/main.py`

```python
# main.py
# Purpose: FastAPI application entry point.
# Responsibilities:
#   - Create FastAPI app instance
#   - Register all middleware (order matters)
#   - Include all API routers
#   - Define startup and shutdown events
# DO NOT: Add business logic, DB queries, or agent calls here.

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
```

---

### `backend/app/core/config.py`

```python
# app/core/config.py
# Purpose: Central configuration management using Pydantic Settings.
# Responsibilities:
#   - Load all environment variables
#   - Validate types at startup
#   - Provide a single `settings` instance used across the app
# DO NOT: Hardcode any values here. All values come from .env file.
# DO NOT: Import this from models or DB files (causes circular imports).

from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # ─── App ──────────────────────────────────────────────────────────────────
    APP_NAME: str = "CoFoundr"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ─── Database ─────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ─── Vector DB ────────────────────────────────────────────────────────────
    CHROMA_HOST: str = "localhost"
    CHROMA_PORT: int = 8001

    # ─── AI Providers ─────────────────────────────────────────────────────────
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    TAVILY_API_KEY: str

    # ─── Auth ─────────────────────────────────────────────────────────────────
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 1440

    # ─── CORS ─────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # ─── File Upload ──────────────────────────────────────────────────────────
    MAX_FILE_SIZE_MB: int = 10
    SUPABASE_URL: str
    SUPABASE_KEY: str

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, value: str | List[str]) -> List[str]:
        """Parse comma-separated origins string into list."""
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",")]
        return value

    class Config:
        env_file = ".env"
        case_sensitive = True


# ─── Singleton instance ───────────────────────────────────────────────────────
settings = Settings()
```

---

### `backend/app/core/constants.py`

```python
# app/core/constants.py
# Purpose: All application-wide constants and magic strings.
# Responsibilities:
#   - Define fixed values used across the app
#   - Prevent magic strings and numbers in code
# DO NOT: Import settings here. Constants are static values only.
# DO NOT: Define mutable objects here.

# ─── AI Models ────────────────────────────────────────────────────────────────
GEMINI_FLASH_MODEL = "gemini-1.5-flash"
GEMINI_EMBEDDING_MODEL = "models/embedding-001"
GROQ_MODEL = "llama3-70b-8192"

# ─── Agent Names ──────────────────────────────────────────────────────────────
MAIN_AGENT = "main_agent"
WEB_SEARCH_AGENT = "web_search_agent"
RAG_AGENT = "rag_agent"
RECOMMENDATION_AGENT = "recommendation_agent"

# ─── Startup Stages ───────────────────────────────────────────────────────────
STARTUP_STAGES = ["idea", "validation", "prototype", "mvp", "early", "growing", "scaling"]

# ─── Report Types ─────────────────────────────────────────────────────────────
REPORT_MARKET = "market_research"
REPORT_COMPETITOR = "competitor_analysis"
REPORT_RISK = "risk_assessment"
REPORT_MVP = "mvp_roadmap"
REPORT_TECH = "tech_stack"
REPORT_INVESTOR = "investor_readiness"
REPORT_GROWTH = "growth_strategy"

# ─── File Types ───────────────────────────────────────────────────────────────
ALLOWED_FILE_TYPES = [".pdf", ".docx", ".pptx", ".txt", ".png", ".jpg", ".jpeg"]

# ─── WebSocket Events ─────────────────────────────────────────────────────────
WS_EVENT_DASHBOARD_UPDATE = "dashboard_update"
WS_EVENT_AGENT_THINKING = "agent_thinking"
WS_EVENT_AGENT_DONE = "agent_done"

# ─── Health Score ─────────────────────────────────────────────────────────────
HEALTH_SCORE_MAX = 100
HEALTH_SCORE_MIN = 0
HEALTH_SCORE_WEIGHTS = {
    "market_fit": 0.25,
    "team": 0.20,
    "traction": 0.20,
    "financials": 0.20,
    "competition": 0.15,
}

# ─── Rate Limiting ────────────────────────────────────────────────────────────
RATE_LIMIT_PER_MINUTE = 60
RATE_LIMIT_CHAT_PER_MINUTE = 20
```

---

### `backend/app/core/exceptions.py`

```python
# app/core/exceptions.py
# Purpose: All custom exception classes for the application.
# Responsibilities:
#   - Define domain-specific exceptions
#   - Provide consistent error messages
# DO NOT: Catch exceptions here. Only define them.
# DO NOT: Import from services or agents (circular imports).

from fastapi import HTTPException, status


class StartupAgentException(Exception):
    """Base exception for all CoFoundr errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class NotFoundException(HTTPException):
    """Raised when a resource is not found."""
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{resource_id}' not found.",
        )


class UnauthorizedException(HTTPException):
    """Raised when user is not authenticated."""
    def __init__(self, message: str = "Not authenticated."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(HTTPException):
    """Raised when user lacks permission."""
    def __init__(self, message: str = "Permission denied."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
        )


class ValidationException(HTTPException):
    """Raised when input validation fails."""
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message,
        )


class AgentException(StartupAgentException):
    """Raised when an agent fails to execute."""
    pass


class ProviderException(StartupAgentException):
    """Raised when an LLM provider fails."""
    pass


class FileParsingException(StartupAgentException):
    """Raised when file parsing fails."""
    pass
```

---

### `backend/app/core/logging.py`

```python
# app/core/logging.py
# Purpose: Configure structured logging for the entire application.
# Responsibilities:
#   - Set log format, level, and handlers
#   - Provide a single setup function called once at startup
# DO NOT: Use print() anywhere in the project. Always use logging.
# DO NOT: Call setup_logging() more than once.

import logging
import sys
from app.core.config import settings


def setup_logging() -> None:
    """
    Configure structured logging for the application.
    Call once at application startup in main.py.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    log_format = (
        "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
    )

    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # ─── Silence noisy third-party loggers ────────────────────────────────────
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
```

---

### `backend/app/db/base.py`

```python
# app/db/base.py
# Purpose: SQLAlchemy declarative base and shared model mixins.
# Responsibilities:
#   - Define Base class for all ORM models
#   - Define reusable mixins: UUIDMixin, TimestampMixin
# DO NOT: Define actual table models here.
# DO NOT: Import services or repositories here.

import uuid
from datetime import datetime

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


class UUIDMixin:
    """Adds a UUID primary key to any model."""
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )


class TimestampMixin:
    """Adds created_at and updated_at timestamps to any model."""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
```

---

### `backend/app/models/enums.py`

```python
# app/models/enums.py
# Purpose: All database and application enums.
# Responsibilities:
#   - Define Python Enum classes used in ORM models and schemas
# DO NOT: Define non-enum classes here.

import enum


class StartupStage(str, enum.Enum):
    IDEA = "idea"
    VALIDATION = "validation"
    PROTOTYPE = "prototype"
    MVP = "mvp"
    EARLY = "early"
    GROWING = "growing"
    SCALING = "scaling"


class ReportType(str, enum.Enum):
    MARKET_RESEARCH = "market_research"
    COMPETITOR_ANALYSIS = "competitor_analysis"
    RISK_ASSESSMENT = "risk_assessment"
    MVP_ROADMAP = "mvp_roadmap"
    TECH_STACK = "tech_stack"
    INVESTOR_READINESS = "investor_readiness"
    GROWTH_STRATEGY = "growth_strategy"


class AuthProvider(str, enum.Enum):
    GOOGLE = "google"
    GITHUB = "github"


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
```

---

### `backend/app/models/user.py`

```python
# app/models/user.py
# Purpose: User ORM model.
# Responsibilities:
#   - Define the users table schema
#   - Define relationships to startups and chat sessions
# DO NOT: Add business logic or methods here.
# DO NOT: Import services here.

from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, UUIDMixin, TimestampMixin
from app.models.enums import AuthProvider


class User(Base, UUIDMixin, TimestampMixin):
    """ORM model for application users."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    auth_provider: Mapped[AuthProvider] = mapped_column(nullable=False)
    provider_id: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ─── Relationships ────────────────────────────────────────────────────────
    startups: Mapped[list["Startup"]] = relationship("Startup", back_populates="user", cascade="all, delete-orphan")
    chat_sessions: Mapped[list["ChatSession"]] = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
```

---

### `backend/app/providers/base_provider.py`

```python
# app/providers/base_provider.py
# Purpose: Abstract base class for all LLM providers.
# Responsibilities:
#   - Define the interface every provider must implement
#   - Enforce provider independence across the app
# DO NOT: Add provider-specific logic here.
# DO NOT: Import Gemini or Groq libraries here.

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ProviderResponse:
    """Normalized response from any LLM provider."""
    content: str
    model: str
    provider: str
    tokens_used: int | None = None


class BaseProvider(ABC):
    """
    Abstract base class for LLM providers.
    All providers (Gemini, Groq) must implement this interface.
    This ensures the rest of the app is provider-independent.
    """

    @abstractmethod
    async def generate(self, prompt: str, system_prompt: str = "") -> ProviderResponse:
        """
        Generate a response from the LLM.

        Args:
            prompt: The user prompt to send to the model.
            system_prompt: Optional system-level instructions.

        Returns:
            ProviderResponse: Normalized response object.
        """
        pass

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """
        Generate an embedding vector for the given text.

        Args:
            text: The text to embed.

        Returns:
            list[float]: Embedding vector.
        """
        pass
```

---

### `backend/app/providers/provider_factory.py`

```python
# app/providers/provider_factory.py
# Purpose: Factory for creating LLM provider instances.
# Responsibilities:
#   - Return correct provider based on task type
#   - Centralize all provider instantiation
# DO NOT: Use providers directly in agents or services. Always use this factory.

import logging
from app.providers.base_provider import BaseProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider

logger = logging.getLogger(__name__)


class ProviderFactory:
    """
    Factory class for LLM providers.

    Usage:
        provider = ProviderFactory.get_provider("gemini")
        response = await provider.generate(prompt="Hello")
    """

    _providers: dict[str, BaseProvider] = {}

    @classmethod
    def get_provider(cls, provider_name: str) -> BaseProvider:
        """
        Get or create a provider instance by name.

        Args:
            provider_name: "gemini" or "groq"

        Returns:
            BaseProvider: The requested provider instance.

        Raises:
            ValueError: If provider name is not supported.
        """
        if provider_name not in cls._providers:
            logger.info(f"Initializing provider: {provider_name}")
            if provider_name == "gemini":
                cls._providers[provider_name] = GeminiProvider()
            elif provider_name == "groq":
                cls._providers[provider_name] = GroqProvider()
            else:
                raise ValueError(f"Unsupported provider: {provider_name}")

        return cls._providers[provider_name]

    @classmethod
    def get_reasoning_provider(cls) -> BaseProvider:
        """Returns Gemini Flash for complex reasoning tasks."""
        return cls.get_provider("gemini")

    @classmethod
    def get_fast_provider(cls) -> BaseProvider:
        """Returns Groq for fast tool-calling tasks."""
        return cls.get_provider("groq")
```

---

### `backend/app/middleware/cors_middleware.py`

```python
# app/middleware/cors_middleware.py
# Purpose: CORS configuration — registered in main.py via FastAPI's built-in CORSMiddleware.
# This file documents the CORS settings used.
# Actual registration is in main.py.
# DO NOT: Duplicate CORS setup anywhere else.

# CORS is configured in main.py using FastAPI's CORSMiddleware:
# allow_origins  = settings.ALLOWED_ORIGINS  (from .env)
# allow_methods  = ["*"]
# allow_headers  = ["*"]
# allow_credentials = True
```

---

### `backend/app/middleware/request_logger.py`

```python
# app/middleware/request_logger.py
# Purpose: Log every incoming HTTP request and its response time.
# Responsibilities:
#   - Log method, path, status code, and duration
# DO NOT: Log request bodies (security risk).
# DO NOT: Add business logic here.

import logging
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class RequestLoggerMiddleware(BaseHTTPMiddleware):
    """Logs all incoming requests with method, path, status, and duration."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

        logger.info(
            f"{request.method} {request.url.path} "
            f"| status={response.status_code} "
            f"| duration={duration_ms}ms"
        )
        return response
```

---

### `backend/app/middleware/error_handler.py`

```python
# app/middleware/error_handler.py
# Purpose: Global exception handler — catches all unhandled errors.
# Responsibilities:
#   - Return consistent JSON error responses
#   - Log all unexpected errors
# DO NOT: Swallow exceptions silently.
# DO NOT: Expose internal error details in production.

import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Catches all unhandled exceptions and returns a consistent error response."""

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as exc:
            logger.exception(f"Unhandled exception on {request.method} {request.url.path}: {exc}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "error": "An internal server error occurred.",
                    "code": "INTERNAL_SERVER_ERROR",
                },
            )
```

---

### `backend/app/middleware/response_formatter.py`

```python
# app/middleware/response_formatter.py
# Purpose: Wrap all successful API responses in a consistent envelope.
# Responsibilities:
#   - Add success=True to all 2xx responses
# DO NOT: Modify error responses here (handled by error_handler.py).

# NOTE: Response formatting is handled at the API layer using a
# standard response schema. See schemas/base.py for the envelope format.

# Standard success response format:
# {
#   "success": true,
#   "data": { ... },
#   "message": "optional message"
# }
```

---

## Step 1.3 — Database Setup

### `backend/app/db/session.py`

```python
# app/db/session.py
# Purpose: Create and manage SQLAlchemy async database sessions.
# Responsibilities:
#   - Create async engine
#   - Provide session factory
#   - Provide get_db dependency for FastAPI routes
# DO NOT: Create sessions manually outside this file.

import logging
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── Async Engine ─────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
)

# ─── Session Factory ──────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides a database session per request.
    Automatically closes the session after the request completes.

    Usage in routes:
        async def my_route(db: AsyncSession = Depends(get_db)):
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
```

---

### `backend/app/db/init_db.py`

```python
# app/db/init_db.py
# Purpose: Initialize database tables on application startup.
# Responsibilities:
#   - Create all tables if they don't exist
#   - Run only once at startup via lifespan in main.py
# DO NOT: Use this for migrations. Use Alembic for schema changes.

import logging
from app.db.base import Base
from app.db.session import engine
from app.models import user, startup, chat, report  # noqa: F401 - import models to register them

logger = logging.getLogger(__name__)


async def init_db() -> None:
    """
    Create all database tables on startup.
    Called from main.py lifespan context manager.
    """
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully.")
```

---

## Step 1.4 — Auth API

### `backend/app/api/v1/auth.py`

```python
# app/api/v1/auth.py
# Purpose: Authentication API endpoints.
# Responsibilities:
#   - Handle OAuth callback for Google and GitHub
#   - Return JWT tokens
#   - Handle logout
# DO NOT: Write auth business logic here. Delegate to auth_service.py.
# DO NOT: Query the database directly here.

import logging
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import TokenResponse, OAuthCallbackRequest
from app.services.auth_service import AuthService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth")


@router.get("/google")
async def google_oauth_redirect():
    """Redirect user to Google OAuth consent screen."""
    return AuthService.get_google_auth_url()


@router.get("/google/callback")
async def google_oauth_callback(
    code: str,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Handle Google OAuth callback and return JWT token."""
    logger.info("Google OAuth callback received.")
    return await AuthService(db).handle_google_callback(code)


@router.get("/github")
async def github_oauth_redirect():
    """Redirect user to GitHub OAuth consent screen."""
    return AuthService.get_github_auth_url()


@router.get("/github/callback")
async def github_oauth_callback(
    code: str,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Handle GitHub OAuth callback and return JWT token."""
    logger.info("GitHub OAuth callback received.")
    return await AuthService(db).handle_github_callback(code)


@router.post("/logout")
async def logout() -> dict:
    """Logout endpoint — client must discard the JWT token."""
    return {"message": "Logged out successfully."}
```

---

# PHASE 2 — Core Agents

**Goal:** Main Agent, Web Search Agent, and RAG Agent are functional.

---

### `backend/app/agents/graph.py`

```python
# app/agents/graph.py
# Purpose: Define the LangGraph multi-agent graph.
# Responsibilities:
#   - Define agent nodes
#   - Define routing edges
#   - Compile the graph
# DO NOT: Write tool logic here. Tools live in tools/ directory.
# DO NOT: Write prompt templates here. Those go in each agent file.

import logging
from langgraph.graph import StateGraph, END
from app.agents.main_agent import MainAgent, AgentState
from app.agents.web_search_agent import WebSearchAgent
from app.agents.rag_agent import RAGAgent
from app.agents.recommendation_agent import RecommendationAgent

logger = logging.getLogger(__name__)


def build_agent_graph() -> StateGraph:
    """
    Build and compile the LangGraph multi-agent graph.

    Graph Flow:
        main_agent → (routes to) → web_search_agent | rag_agent | recommendation_agent
        all agents → response_optimizer → END

    Returns:
        Compiled LangGraph StateGraph
    """
    graph = StateGraph(AgentState)

    # ─── Register Nodes ───────────────────────────────────────────────────────
    graph.add_node("main_agent", MainAgent().run)
    graph.add_node("web_search_agent", WebSearchAgent().run)
    graph.add_node("rag_agent", RAGAgent().run)
    graph.add_node("recommendation_agent", RecommendationAgent().run)

    # ─── Entry Point ──────────────────────────────────────────────────────────
    graph.set_entry_point("main_agent")

    # ─── Conditional Routing ──────────────────────────────────────────────────
    graph.add_conditional_edges(
        "main_agent",
        MainAgent.route,
        {
            "web_search": "web_search_agent",
            "rag": "rag_agent",
            "recommendation": "recommendation_agent",
            "end": END,
        },
    )

    # ─── All agents return to END after execution ─────────────────────────────
    graph.add_edge("web_search_agent", END)
    graph.add_edge("rag_agent", END)
    graph.add_edge("recommendation_agent", END)

    return graph.compile()


# ─── Compiled graph instance (used by services) ───────────────────────────────
agent_graph = build_agent_graph()
```

---

### `backend/app/tools/web_search_tool.py`

```python
# app/tools/web_search_tool.py
# Purpose: Tavily web search tool used by Web Search Agent.
# Responsibilities:
#   - Perform web searches via Tavily API
#   - Return structured search results
# DO NOT: Parse or summarize results here. That's the agent's job.
# DO NOT: Call LLMs here.

import logging
from tavily import TavilyClient
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── Tavily client singleton ──────────────────────────────────────────────────
_tavily_client: TavilyClient | None = None


def get_tavily_client() -> TavilyClient:
    """Return singleton Tavily client."""
    global _tavily_client
    if _tavily_client is None:
        _tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    return _tavily_client


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """
    Search the web using Tavily API.

    Args:
        query: Search query string.
        max_results: Maximum number of results to return.

    Returns:
        list[dict]: List of search results with title, url, and content.
    """
    logger.info(f"Web search query: {query}")
    client = get_tavily_client()
    response = client.search(query=query, max_results=max_results)
    return response.get("results", [])


async def search_competitors(startup_name: str, industry: str) -> list[dict]:
    """Search for competitors of a given startup."""
    query = f"{startup_name} competitors {industry} startups 2024"
    return await search_web(query)


async def search_market_size(industry: str) -> list[dict]:
    """Search for market size and TAM/SAM/SOM data."""
    query = f"{industry} market size TAM SAM SOM 2024 report"
    return await search_web(query)


async def search_funding(startup_name: str) -> list[dict]:
    """Search for funding rounds and investor information."""
    query = f"{startup_name} funding rounds investors crunchbase 2024"
    return await search_web(query)


async def search_tech_stack(use_case: str) -> list[dict]:
    """Search for recommended tech stacks for a given use case."""
    query = f"best tech stack for {use_case} startup 2024"
    return await search_web(query)
```

---

# PHASE 3 — Intelligence Layer

**Goal:** Recommendation Agent, Health Scorer, Risk Analyzer are functional.

---

### `backend/app/tools/health_scorer_tool.py`

```python
# app/tools/health_scorer_tool.py
# Purpose: Calculate a startup health score (0-100).
# Responsibilities:
#   - Analyze startup data across 5 dimensions
#   - Return weighted score and breakdown
# DO NOT: Call LLMs here. Use structured data only.
# DO NOT: Fetch data here. Data is passed in from the agent.

import logging
from dataclasses import dataclass
from app.core.constants import HEALTH_SCORE_WEIGHTS, HEALTH_SCORE_MAX

logger = logging.getLogger(__name__)


@dataclass
class HealthScoreBreakdown:
    """Detailed breakdown of startup health score."""
    market_fit: float
    team: float
    traction: float
    financials: float
    competition: float
    total_score: float
    grade: str
    summary: str


def calculate_health_score(startup_data: dict) -> HealthScoreBreakdown:
    """
    Calculate startup health score from structured startup data.

    Args:
        startup_data: Dictionary containing startup metrics and info.

    Returns:
        HealthScoreBreakdown: Detailed score with breakdown and grade.
    """
    logger.info(f"Calculating health score for: {startup_data.get('name', 'Unknown')}")

    scores = {
        "market_fit": _score_market_fit(startup_data),
        "team": _score_team(startup_data),
        "traction": _score_traction(startup_data),
        "financials": _score_financials(startup_data),
        "competition": _score_competition(startup_data),
    }

    total = sum(
        score * HEALTH_SCORE_WEIGHTS[dimension]
        for dimension, score in scores.items()
    )
    total = round(min(total, HEALTH_SCORE_MAX), 2)

    return HealthScoreBreakdown(
        **scores,
        total_score=total,
        grade=_get_grade(total),
        summary=_get_summary(total),
    )


def _score_market_fit(data: dict) -> float:
    """Score market fit based on problem clarity and target market."""
    score = 50.0
    if data.get("problem_statement"): score += 15
    if data.get("target_market"): score += 15
    if data.get("unique_value_proposition"): score += 20
    return min(score, 100)


def _score_team(data: dict) -> float:
    """Score team strength based on founder info."""
    score = 40.0
    if data.get("founder_name"): score += 20
    if data.get("team_size", 0) > 1: score += 20
    if data.get("domain_expertise"): score += 20
    return min(score, 100)


def _score_traction(data: dict) -> float:
    """Score traction based on stage and user metrics."""
    stage_scores = {
        "idea": 10, "validation": 25, "prototype": 40,
        "mvp": 55, "early": 70, "growing": 85, "scaling": 100,
    }
    return stage_scores.get(data.get("stage", "idea"), 10)


def _score_financials(data: dict) -> float:
    """Score financials based on revenue and business model clarity."""
    score = 30.0
    if data.get("business_model"): score += 25
    if data.get("revenue_model"): score += 25
    if data.get("has_revenue"): score += 20
    return min(score, 100)


def _score_competition(data: dict) -> float:
    """Score competitive position."""
    score = 50.0
    if data.get("competitors_known"): score += 25
    if data.get("competitive_advantage"): score += 25
    return min(score, 100)


def _get_grade(score: float) -> str:
    """Convert numeric score to letter grade."""
    if score >= 80: return "A"
    if score >= 65: return "B"
    if score >= 50: return "C"
    if score >= 35: return "D"
    return "F"


def _get_summary(score: float) -> str:
    """Return human-readable summary for the score."""
    if score >= 80: return "Strong startup with solid fundamentals."
    if score >= 65: return "Good foundation with areas to improve."
    if score >= 50: return "Average — needs work on key areas."
    if score >= 35: return "Early stage — significant gaps to address."
    return "High risk — foundational work needed."
```

---

# PHASE 4 — Dashboard & Reports

**Goal:** Realtime dashboard via WebSockets. All 7 reports generated and downloadable as PDF.

---

### `backend/app/websockets/dashboard_ws.py`

```python
# app/websockets/dashboard_ws.py
# Purpose: WebSocket endpoint for realtime dashboard updates.
# Responsibilities:
#   - Accept WebSocket connections per user
#   - Broadcast dashboard updates when agent completes tasks
#   - Manage connection lifecycle
# DO NOT: Run agent logic here. Only handle connections and messages.

import logging
from fastapi import WebSocket, WebSocketDisconnect
from app.core.constants import WS_EVENT_DASHBOARD_UPDATE

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections per user."""

    def __init__(self):
        # Maps user_id → WebSocket connection
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        logger.info(f"WebSocket connected: user_id={user_id}")

    def disconnect(self, user_id: str) -> None:
        """Remove a disconnected WebSocket."""
        self.active_connections.pop(user_id, None)
        logger.info(f"WebSocket disconnected: user_id={user_id}")

    async def send_dashboard_update(self, user_id: str, data: dict) -> None:
        """Send a dashboard update to a specific user."""
        websocket = self.active_connections.get(user_id)
        if websocket:
            await websocket.send_json({
                "event": WS_EVENT_DASHBOARD_UPDATE,
                "data": data,
            })


# ─── Singleton manager ────────────────────────────────────────────────────────
connection_manager = ConnectionManager()
```

---

# PHASE 5 — Polish & Deploy

**Goal:** All pages complete. Tests passing. Deployed on Railway.

---

### `backend/Dockerfile`

```dockerfile
# backend/Dockerfile
# Purpose: Containerize the FastAPI backend for production.

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

### `frontend/Dockerfile`

```dockerfile
# frontend/Dockerfile
# Purpose: Containerize the Next.js frontend for production.

FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

---

# Complete Phase Summary

| Phase | Milestone | Gate |
|-------|-----------|------|
| **1** | Foundation: Docker, DB, Auth, Config, Middleware | 🏛️💻🧪📚🔍📝 |
| **2** | Core Agents: Main, WebSearch, RAG + LangGraph Graph | 🏛️💻🧪📚🔍📝 |
| **3** | Intelligence: Recommendation Agent, Health Score, Risk | 🏛️💻🧪📚🔍📝 |
| **4** | Dashboard + Reports: WebSockets, 7 Reports, PDF export | 🏛️💻🧪📚🔍📝 |
| **5** | Polish + Deploy: Tests, Docs, Railway deployment | 🏛️💻🧪📚🔍📝 |

---

# Build Order Within Each Phase

```
1. core/config.py
2. core/constants.py
3. core/exceptions.py
4. core/logging.py
5. db/base.py
6. db/session.py
7. models/
8. repositories/
9. schemas/
10. providers/
11. tools/
12. agents/
13. services/
14. api/v1/
15. middleware/
16. tests/
17. main.py
```

---

# Frontend Build Order

```
1. types/
2. constants/
3. lib/api.ts
4. store/
5. hooks/
6. components/ui/
7. components/shared/
8. components/dashboard/
9. components/chat/
10. app/pages
```

---

*End of CoFoundr Implementation Roadmap v1.0*
