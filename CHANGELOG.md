# Changelog
All notable changes to CoFoundr are documented here.
Format based on Keep a Changelog (https://keepachangelog.com)

## [1.0.0] - 2026-07-07
### Added
- Integrated all 5 developmental phases into a production-grade multi-agent release release.
- Master project documentation detailing system topography, service directories, and scoring calculations.
- Comprehensive user setup and developer configuration guides.
- Pytest unit tests verifying security mechanisms, scoring calculators, PDF compilation outputs, and dashboard service averages.
- Structured code style validations conforming to PEP-8 standards using Ruff linters.

### Security
- Injected `check_env.py` environment validator running at server launch to assert required environment variables.
- Structured `.gitignore` policy preventing credentials leaks of all local `.env` configuration files.
- Signed cryptographic JWT session tokens verifying API permissions using RS256/HS256 algorithms.
- Enforced rate limiting middleware restricting client IPs to 60 requests/min generally and 20 requests/min for chats.
- Enforced file upload validations verifying supported formats (PDF, DOCX, PPTX, TXT) and restricting file sizes below 10MB.
- Sanitized filenames during upload to prevent path traversal vectors.

---

## [0.5.0] - 2026-07-06
### Added
- Implemented real-time dashboard analytics tracking, integrating static REST fetches with dynamic connection managers.
- In-memory PDF compiling utility converting strategic advisory audits into styled documents using ReportLab.
- Supports 7 strategic report categories (market_research, competitor_analysis, risk_assessment, mvp_roadmap, tech_stack, investor_readiness, growth_strategy).
- WebSocket handshake endpoints validating JWT query tokens and registering connections in a connection manager registry.
- Live telemetry event broads pushing updates to client browsers.

---

## [0.3.0] - 2026-07-05
### Added
- Built-in scoring calculators assessing startups across multiple developmental dimensions.
- Rule-based venture health score calculator mapping weighted indicators: Market Fit (25%), Team (20%), Traction (20%), Financials (20%), and Competition (15%).
- Venture risk audit engine mapping market, execution, financial, and tech risks.
- Roadmap generation tool selecting release schedules and phase features.
- Tech stack recommender mapping startup verticals to specific backend frameworks, database architectures, and host providers.
- B2B/B2C growth strategy generator estimating channels and focus advice.
- Investor readiness scorer tracking venture funding gaps and recommendation stage buckets.

---

## [0.2.0] - 2026-07-04
### Added
- Implemented state-machine orchestration workflow utilizing LangGraph.
- Built `MainAgent` intent router classifying user queries into specialized nodes.
- Built `WebSearchAgent` generating keyword parameters and calling Tavily search.
- Built `RAGAgent` fetching semantic segments to ground advisor queries.
- Built `RecommendationAgent` executing rules-based calculators and synthesizing audits.
- Implemented shared `AgentState` TypedDict passing conversation context, UUIDs, and scoring metadata.

---

## [0.1.0] - 2026-07-03
### Added
- Initialized project scaffolding, directory configurations, and docker services.
- FastAPI backend framework running on Uvicorn ASGI server.
- Integrated PostgreSQL 15 database running on async connection pools.
- ChromaDB vector client with HttpClient connectivity and Ephemeral Client local fallbacks.
- Passwordless Google & GitHub OAuth sign-in and account linking callback integrations.
- Middleware stack order (CORSMiddleware, Auth, RateLimiter, RequestLogger, ErrorHandler, ResponseFormatter).
- Declarative SQLAlchemy models and Alembic database migration scripts.
