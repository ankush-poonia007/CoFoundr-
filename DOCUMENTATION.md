# CoFoundr Project Documentation

Welcome to the official, complete technical documentation for **CoFoundr**.

---

## 1. Executive Summary

### Description
CoFoundr is a production-grade AI-powered startup research, analysis, and strategic advisory agent designed to act as an automated Y Combinator Managing Partner. It evaluates early-stage ventures, compiles risk vector audits, recommends scalable software architecture stacks, and generates immediate MVP release roadmaps. By parsing user answers and uploaded company documents, it synthesizes institutional-grade startup evaluations alongside actionable execution guides.

### Target Audience
* **Early-Stage Founders:** Entrepreneurs seeking validation of their business model, tech stack guidance, and MVP roadmaps.
* **Incubators & Accelerators:** Programs looking to automate initial venture assessments and pre-seed due diligence.
* **Angel Investors:** Investors seeking a systematic, data-driven approach to evaluating fundraising readiness and venture health scores.

### Key Differentiators
* **State-Machine Orchestration:** Leverage LangGraph to model multi-agent workflows as transition systems, separating intent classification from specialized domain tasks.
* **Dynamic PDF Compilation:** High-quality downloadable report documents compiled in-memory using ReportLab and styled with a premium color palette.
* **Deterministic Venture Scoring:** Built-in heuristic calculation engines assessing startup health, execution risks, tech stack moats, and fundraising barriers.
* **Vector-Grounded RAG:** Parse and chunk uploaded PDFs/DOCXs/PPTXs/TXTs and index them in ChromaDB vector space to ground advisor recommendations.

---

## 2. System Overview

### High-Level Architecture Topology
The diagram below outlines the system topology and communication flow:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│                [Next.js 14 App / Zustand / CSS]             │
└──────────────────────────────┬──────────────────────────────┘
                               │ JWT / WebSockets / REST API
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                       FastAPI Gateway                       │
│                        (Uvicorn Host)                       │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
       ▼                       ▼                       ▼
┌──────────────┐       ┌───────────────┐       ┌───────────────┐
│  SQLAlchemy  │       │   LangGraph   │       │   ChromaDB    │
│  2.0 Async   │       │  State Engine │       │  Vector Space │
└──────┬───────┘       └───────┬───────┘       └───────────────┘
       │                       │ (Gemini/Groq)
       ▼                       ▼
┌──────────────┐       ┌───────────────┐
│  PostgreSQL  │       │ LLM Providers │
│ 15 Database  │       │ (Gemini/Groq) │
└──────────────┘       └───────────────┘
```

### Tech Stack Specification
The application is built on the following technologies:

| Layer | Technology / Library | Version | Purpose |
| --- | --- | --- | --- |
| **Frontend Framework** | Next.js (App Router) | `14.2.x` | User interface structure and page routes |
| **State Management** | Zustand | `4.5.x` | Client-side reactive state slices |
| **Styling** | TailwindCSS + Lucide Icons | `3.4.x` | Modern typography, harmonious grids, dark mode |
| **Backend Gateway** | FastAPI | `0.111.x` | Async REST gateway & WebSocket endpoint management |
| **ASGI Web Server** | Uvicorn | `0.30.x` | Hot-reloading server process host |
| **Agent Orchestrator** | LangGraph | `0.0.x` | Stateful agent execution and routing |
| **LLM Integration** | LangChain | `0.2.x` | Prompt formatting and parser abstractions |
| **Vector Database** | ChromaDB | `0.5.x` | Vector database for storage and semantic document search |
| **Relational Database**| PostgreSQL | `15` | Relational storage for users, chats, startups, reports |
| **Database ORM** | SQLAlchemy | `2.0.x` (Async) | Async Python SQL toolkit and Object Relational Mapper |
| **Migrations** | Alembic | `1.13.x` | Declarative schema migration control |
| **PDF Compilation** | ReportLab | `4.2.x` | Dynamic in-memory PDF generation from Markdown |
| **Auth Cryptography** | python-jose / bcrypt | `3.3.x` / `4.1.x`| JWT token signatures and password hashing |

### Key Design Decisions and Rationale
1. **Async SQLAlchemy 2.0 & PostgreSQL:** All database transactions are executed asynchronously to ensure FastAPI can handle high concurrent request volumes without event loop starvation.
2. **LangGraph State-Machine Transitions:** Modeling multi-agent workflows as state-machine graphs prevents spaghetti agent chains and allows clean conditional routing.
3. **ChromaDB Ephemeral Fallback:** The vector search class checks connection parameters and falls back to an in-memory client (`chromadb.EphemeralClient()`) if the HTTP client is offline. This ensures local developers can run tests immediately.
4. **Zustand Lightweight State Slices:** Zustand eliminates complex Redux wrappers, keeping frontend state files under 40 lines while preserving client reactivity.
5. **In-Memory PDF Buffering:** ReportLab compiles markdown reports directly to in-memory `BytesIO` buffers, which are streamed to the browser as binary chunks. This protects user privacy by avoiding temporary files on the server's disk.

---

## 3. Multi-Agent Architecture

### Agent Registrations

| Agent Name | Class / Source File | Primary Role | LLM Engine | Associated Tools |
| --- | --- | --- | --- | --- |
| **MainAgent** | [MainAgent](file:///d:/PROJECTS/cofoundr/backend/app/agents/main_agent.py) | Classify query intent and route flow | Gemini 2.5 Flash | None |
| **WebSearchAgent**| [WebSearchAgent](file:///d:/PROJECTS/cofoundr/backend/app/agents/web_search_agent.py) | Perform online market research | Groq Llama 3 (Query) & Gemini 2.5 Flash (Synthesis) | `search_web`, `search_competitors`, `search_market_size`, `search_funding`, `search_tech_stack` |
| **RAGAgent** | [RAGAgent](file:///d:/PROJECTS/cofoundr/backend/app/agents/rag_agent.py) | Search user uploaded business files | Gemini 2.5 Flash | `search_documents` |
| **RecommendationAgent** | [RecommendationAgent](file:///d:/PROJECTS/cofoundr/backend/app/agents/recommendation_agent.py) | Compute metrics & synthesize reports | Gemini 2.5 Flash | `calculate_health_score`, `analyze_startup_risks`, `generate_mvp_roadmap`, `recommend_tech_stack`, `generate_growth_strategy`, `calculate_investor_readiness` |

### LangGraph Workflow Flowchart
The multi-agent graph flows as follows:

```
          ┌──────────────────────┐
          │      User Query      │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   MainAgent Router   │
          └──────────┬───────────┘
                     │
         ┌───────────┼───────────┬───────────┐
         │ (Search)  │ (RAG)     │ (Recs)    │ (End / Conversation)
         ▼           ▼           ▼           ▼
   ┌───────────┐┌───────────┐┌───────────┐┌───────────┐
   │ WebSearch ││ RAGAgent  ││ RecsAgent ││ Return    │
   │   Agent   ││ (Chroma)  ││ (Scores)  ││ Direct    │
   └─────┬─────┘└─────┬─────┘└─────┬─────┘└─────┬─────┘
         │            │            │            │
         └────────────┼────────────┴────────────┘
                      ▼
               ┌─────────────┐
               │     END     │
               └─────────────┘
```

### Agent Routing Logic
The [MainAgent.run](file:///d:/PROJECTS/cofoundr/backend/app/agents/main_agent.py#L30-L84) function sends the user inquiry to Gemini 2.5 Flash with a detailed system prompt to classify the intent into one of four routing keys:
1. `web_search`: Triggered for live market trends, competitor checks, or funding details.
2. `rag`: Triggered when users refer to "my PDF", "our business plan", "my pitch deck", or "this file".
3. `recommendation`: Triggered for tech stacks, timelines, venture scores, risk vectors, or fundraising audits.
4. `end`: Triggered for general conversation, greetings, or direct replies.

The response must be returned in raw JSON format:
```json
{
  "intent": "web_search | rag | recommendation | end",
  "reasoning": "A concise explanation of why this route was selected."
}
```
If classification fails, the route defaults to `end` to prevent system failures.

### Agent Communications
Agents communicate by writing to the shared [AgentState](file:///d:/PROJECTS/cofoundr/backend/app/agents/main_agent.py#L18-L24) TypedDict:
* `messages`: A list of dictionaries representing the chat history.
* `startup_id`: The UUID of the startup profile under review.
* `next_agent`: The next node key targeted by the routing handler.
* `response`: The synthesized Markdown advice generated by the active agent node.
* `metadata`: In-memory storage for computed score matrices.

---

## 4. Backend Documentation

### Architecture Layers
1. **API Layer (`app/api/v1/`):** FastAPI endpoints parsing query arguments and returning standardized JSON payloads.
2. **Service Layer (`app/services/`):** Coordinates business transactions, database commits, and runs LangGraph executions.
3. **Agent Layer (`app/agents/`):** LangGraph execution nodes and classifiers.
4. **Tools Layer (`app/tools/`):** Strategic scoring formulas, vector searches, and document parsers.
5. **Provider Layer (`app/providers/`):** Abstractions for LLMs (Gemini, Groq) via factory configurations.
6. **Repository Layer (`app/repositories/`):** Direct SQLAlchemy ORM query methods inheriting from a generic repository class.
7. **Database Layer (`app/db/`):** Engine instantiation and async session sessionmakers.

### API Endpoints
All backend endpoints are prefixed with `/api/v1`.

#### Authentication (`/auth`)
* `GET /auth/google`: Redirect to Google login consent screen.
* `GET /auth/google/callback`: Handle Google OAuth redirect, provision user account, and issue JWT access token.
* `GET /auth/github`: Redirect to GitHub login screen.
* `GET /auth/github/callback`: Handle GitHub callback, register user, and issue JWT access token.
* `POST /auth/logout`: Success indicator client-side cleanup event.
* `POST /auth/register`: Create a new user with Email, Name, and password hash.
* `POST /auth/login`: Authenticate email and password credentials, returning a JWT token.
* `PUT /auth/profile`: Update name and mobile number. Requires JWT.
* `PUT /auth/password`: Update user password. Requires JWT.
* `GET /auth/me`: Retrieve current logged-in user profile details. Requires JWT.

#### Startup Manager (`/startups`)
* `GET /startups`: Retrieve all startup profiles registered by the active user. Requires JWT.
* `POST /startups`: Register a new startup profile. Requires JWT.
* `GET /startups/{id}`: Fetch detailed metrics of a specific startup profile. Requires JWT.
* `PUT /startups/{id}`: Modify parameters of an existing startup profile. Requires JWT.
* `POST /startups/{id}/analyze`: Run the YC partner recommendations workflow, computing scoring parameters and caching health values in Postgres. Requires JWT.
* `POST /startups/{id}/documents`: Upload and vector-index a document for a specific startup profile. Requires JWT.

#### Advisor Chat (`/chats`)
* `GET /chats`: List all chat sessions owned by the active user. Requires JWT.
* `POST /chats`: Start a new advisor chat thread session. Requires JWT.
* `GET /chats/{id}`: Retrieve a detailed session transcript including message history. Requires JWT.
* `POST /chats/{id}/messages`: Post a message to a session, running the LangGraph agent graph. Requires JWT.

#### Reports (`/reports`)
* `GET /reports`: List all reports generated for the user's startups. Requires JWT.
* `GET /reports/{id}`: Retrieve details of a specific report. Requires JWT.
* `GET /reports/{id}/download`: Compile and stream the report PDF directly to the client browser. Requires JWT.

#### Dashboard Analytics (`/dashboard`)
* `GET /dashboard`: Fetch aggregated static analytics metrics. Requires JWT.
* `WS /dashboard/ws`: Establish a real-time WebSocket connection. Requires authentication via `token` query parameters.

#### Customer Support (`/support`)
* `POST /support/contact`: Accept contact inquiries and forward them via SMTP.

---

### Database Schema Definition
The database schema consists of 5 main tables:

```
  ┌───────────────────────┐          ┌───────────────────────┐          ┌───────────────────────┐
  │         users         │1       * │       startups        │1       * │        reports        │
  ├───────────────────────┤ ───────► ├───────────────────────┤ ───────► ├───────────────────────┤
  │ id (UUID, PK)         │          │ id (UUID, PK)         │          │ id (UUID, PK)         │
  │ email (String, Unique)│          │ user_id (UUID, FK)    │          │ startup_id (UUID, FK) │
  │ name (String)         │          │ name (String)         │          │ report_type (Enum)    │
  │ avatar_url (String)   │          │ tagline (String)      │          │ content (Text)        │
  │ auth_provider (Enum)  │          │ problem_statement     │          │ score (Float)         │
  │ provider_id (String)  │          │ target_market (String)│          │ pdf_url (String)      │
  │ password_hash (String)│          │ UVP (String)          │          │ metadata_json (JSON)  │
  │ mobile_number (String)│          │ founder_name (String) │          │ created_at (DateTime) │
  │ google_connected (Bool)          │ team_size (Integer)   │          │ updated_at (DateTime) │
  │ github_connected (Bool)          │ domain_expertise      │          └───────────────────────┘
  │ is_active (Bool)      │          │ stage (Enum)          │
  │ created_at (DateTime) │          │ business_model (String)
  │ updated_at (DateTime) │          │ revenue_model (String)│
  └───────────────────────┘          │ has_revenue (Boolean) │
              │                      │ competitors_known(Bool)
              │ 1                    │ competitive_advantage │
              │                      │ health_score (Float)  │
              │                      │ created_at (DateTime) │
              ▼ *                    │ updated_at (DateTime) │
  ┌───────────────────────┐          └───────────────────────┘
  │     chat_sessions     │                      ▲
  ├───────────────────────┤                      │ 1
  │ id (UUID, PK)         │                      │
  │ user_id (UUID, FK)    │ ─────────────────────┘ * (Nullable)
  │ startup_id (UUID, FK) │
  │ title (String)        │
  │ created_at (DateTime) │
  │ updated_at (DateTime) │
  └───────────┬───────────┘
              │ 1
              ▼ *
  ┌───────────────────────┐
  │     chat_messages     │
  ├───────────────────────┤
  │ id (UUID, PK)         │
  │ session_id (UUID, FK) │
  │ role (Enum)           │
  │ content (Text)        │
  │ tokens_used (Integer) │
  │ metadata_json (JSON)  │
  │ created_at (DateTime) │
  │ updated_at (DateTime) │
  └───────────────────────┘
```

---

### Middleware Stack
Middlewares are executed in reverse order of registration for requests, and normal order for responses. The stack is configured as follows in [main.py](file:///d:/PROJECTS/cofoundr/backend/main.py#L51-L63):

```
(Request In)
     │
     ▼
┌─────────────────────────────┐
│ 1. CORSMiddleware           │ -> Asserts allowable origins and CORS request headers
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 2. AuthMiddleware           │ -> Decodes Authorization headers and attaches user payload
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 3. RateLimiterMiddleware    │ -> Restricts request rates per IP address
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 4. RequestLoggerMiddleware  │ -> Measures and logs endpoint request durations
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 5. ErrorHandlerMiddleware   │ -> Catches exceptions and returns clean JSON error structures
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 6. ResponseFormatterMiddleware│ -> Wraps successful 2xx JSON payloads in dynamic envelopes
└────────────┬────────────────┘
             │
             ▼
      (FastAPI Route)
```

---

## 5. Frontend Documentation

### Next.js Pages and Layouts
The frontend is built using Next.js 14 App Router:
* `(marketing)/page.tsx`: Landing page with marketing grids, tagline, and CTA options.
* `(auth)/login/page.tsx` & `(auth)/signup/page.tsx`: Unified onboarding login screens.
* `(dashboard)/dashboard/page.tsx`: The primary analytics dashboard. Shows startup metrics, average health index, recent audits, and chats.
* `(dashboard)/onboarding/page.tsx`: Multiphase onboarding form to create a new startup profile.
* `(dashboard)/chat/page.tsx`: Responsive chat screen to select threads, post questions, and receive streaming advisor updates.
* `(dashboard)/reports/page.tsx`: Dedicated archive showcasing generated strategic audits with direct PDF download hooks.
* `settings/page.tsx`: Developer credentials page enabling password modifications, profile details updates, and Google/GitHub OAuth links connections.

### Component Hierarchy
* **Layout Wrappers:** `src/app/layout.tsx` injects the Global CSS and registers the unified `ThemeProvider` and `QueryProvider` wrappers.
* **Shared Navigation:** `Navbar.tsx` displays navigation links, dark mode toggle, user profiles, and login status.
* **Chat Modules:** `chat/ChatList.tsx` lists active threads, and `chat/ChatBox.tsx` displays message logs and loading indicators.
* **Forms:** `onboarding/StartupForm.tsx` collects venture profiles using type-checked schemas.
* **UI Base elements:** Standard buttons, modals, inputs, and skeleton placeholders.

### Zustand Stores
1. **`authStore.ts`:** Manages user state and stores JWT access tokens in `localStorage`.
2. **`chatStore.ts`:** Manages active chat sessions, messages lists, and state triggers.
3. **`dashboardStore.ts`:** Caches computed aggregates like average health indexes and lists of recent reports.

### WebSocket Integration
The frontend is ready to integrate with the backend WebSocket gateway.
1. **Handshake Initialization:** Establish a connection to `/api/v1/dashboard/ws?token=<JWT>`.
2. **Dynamic Updates:** The client listens for the `dashboard_update` event. When received, it updates the `dashboardStore` to reflect new metrics.
3. **Stay-Alive Loop:** The socket runs a heartbeat query loop, discarding other text payloads to maintain connection health.

### API Integration Pattern
The frontend uses Axios to interact with the backend:
* **Base Config:** Located in `src/lib/api.ts`, initialized with `baseURL` from settings.
* **Interceptor:** An interceptor automatically injects the JWT token as a `Bearer` token in the `Authorization` header of every request:
  ```typescript
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  ```

---

## 6. AI Tools Documentation

CoFoundr implements 10 custom tools in [backend/app/tools/](file:///d:/PROJECTS/cofoundr/backend/app/tools/):

### Tool Specifications

| # | Tool Name | Purpose | Inputs | Outputs | Algorithm |
| --- | --- | --- | --- | --- | --- |
| 1 | `search_web` | Run search queries via Tavily | `query: str`, `max_results: int` | List of results with title, url, content | Forward query directly to Tavily HTTP API client |
| 2 | `parse_file` | Extract text from uploaded documents | `file_content: bytes`, `filename: str` | Raw extracted text string | Checks file extension. PDF uses `PdfReader`; DOCX uses `docx.Document`; PPTX uses `pptx.Presentation`; TXT is decoded as `utf-8`. |
| 3 | `embed_text` | Generate embedding vector for a string | `text: str` | Float list representation | Calls Gemini Provider using `models/text-embedding-004` |
| 4 | `index_document` | Chunk and index document in ChromaDB | `startup_id: UUID`, `filename: str`, `content: str` | Count of indexed chunks | Splits text using a sliding window of 1000 characters (200 overlap), embeds them via Gemini, and adds them to `cofoundr_documents` collection |
| 5 | `search_documents`| Retrieve vector search matches | `startup_id: UUID`, `query: str`, `limit: int` | List of matching chunks | Queries ChromaDB using query embeddings and filters results by metadata `startup_id` |
| 6 | `calculate_health_score` | Score venture health across 5 dimensions | `startup_data: dict` | Detailed breakdown dictionary | Calculates weighted sum using predefined weights and returns grade/summary |
| 7 | `analyze_startup_risks` | Identify venture risk factors | `startup_data: dict` | Risk ratings and concerns | Rules-based rating of execution, market, financial, and tech risks |
| 8 | `generate_mvp_roadmap` | Draft MVP release timelines | `startup_data: dict` | Phases list & core features | Selects development milestones (4-6, 8-12, or 12-16 weeks) based on startup stage |
| 9 | `recommend_tech_stack` | Recommend architecture stacks | `startup_data: dict` | Recommended tech stack | Keyword matching in problem statement to recommend Fintech, AI/ML, E-commerce, or SaaS stacks |
| 10 | `generate_growth_strategy` | Outline marketing advice | `startup_data: dict` | Primary channels & milestone goals | Checks business model to recommend B2B enterprise sales or B2C consumer growth strategies |

---

### Venture Health Scorer Formula
The venture health score is calculated as a weighted sum of 5 dimensions:
$$\text{Health Score} = \sum (\text{Dimension Score} \times \text{Weight})$$

* **Dimension Weights:**
  * Market Fit: **25%**
  * Team Strength: **20%**
  * Traction / Stage: **20%**
  * Financial Runway / Model: **20%**
  * Competitive Position: **15%**
* **Dimension Scores (0 - 100):**
  * **Market Fit:** UVP present (+20), Target market defined (+15), Problem statement defined (+15). Base: 50.
  * **Team:** Domain expertise (+20), Team size > 1 (+20), Founder named (+20). Base: 40.
  * **Traction:** Stage based: idea (10), validation (25), prototype (40), mvp (55), early (70), growing (85), scaling (100).
  * **Financials:** Has revenue (+20), Business model (+25), Revenue model (+25). Base: 30.
  * **Competition:** Known competitors (+25), Competitive advantage (+25). Base: 50.

---

### Risk Analyzer Dimensions
* **Market Risk:** High if UVP or target market is missing. Low if competitors and competitive advantages are known. Otherwise Medium.
* **Execution Risk:** High if solo founder. Low if team size > 3 and domain expertise is present. Otherwise Medium.
* **Financial Risk:** High if no active revenue. Medium if business model or revenue model is present. Low if active revenue is present.
* **Tech Risk:** High if startup is in Idea/Validation stage. Low if in Growing/Scaling stage. Otherwise Medium.
* **Overall Rating:** High if 2 or more categories are High. Medium if 1 category is High. Otherwise Low.

---

### Report Generation Pipeline
```
[Markdown Text] ──► [Parser splits lines] ──► [Inline Formatting] ──► [Template Setup] ──► [PDF Compiler] ──► [Raw PDF Bytes]
```
1. **Header Identification:** Lines starting with `#` are compiled into `Heading1` Paragraphs, and `##` / `###` into `Heading2` Paragraphs.
2. **Bold text parser:** The compiler parses inline markdown tags (`**`) and wraps the text in HTML bold tags (`<b>...</b>`).
3. **Bullet conversions:** Lines starting with `-` or `*` are compiled as bullet points with a custom indentation style (`leftIndent=15`).
4. **Canvas callback:** Adds footers containing page numbers dynamically during rendering.
5. **Stream compile:** SimpleDocTemplate builds the document in-memory and returns the raw bytes.

---

## 7. Security Documentation

### OAuth 2.0 Flow
Google and GitHub OAuth endpoints use a secure callback flow:
```
[User clicks Auth] ──► [FastAPI Redirects to Google/GitHub] ──► [User Logs In]
                                                                        │
[Next.js Homepage] ◄── [FastAPI callback issues JWT] ◄── [OAuth Callback Code]
```
* **Existing account linking:** The client can pass a JWT in the `state` parameter (as `link:<token>`) to connect OAuth providers to an existing logged-in account.

### JWT Session Token Implementation
* **Signing Algorithm:** HS256 hashing.
* **Token Expiration:** Defaults to 1440 minutes (24 hours).
* **Payload structure:**
  ```json
  {
    "sub": "user_id_uuid",
    "email": "user@example.com",
    "exp": 1799834892
  }
  ```

### Rate Limiting Rules
* **General API Endpoint Limit:** **60 requests per minute** per client IP.
* **Chat API Endpoint Limit:** **20 requests per minute** per client IP.
* **Bypass cases:** Rate limiting is bypassed for WebSockets, health checks, and API docs. Exceeding limits returns a `429 Too Many Requests` error.

### File Upload Security
* **Format enforcement:** Uploads are restricted to configured extensions (`.pdf`, `.docx`, `.pptx`, `.txt`).
* **File size checks:** Uploads exceeding `MAX_FILE_SIZE_MB` (default: 10MB) are blocked, returning a `FileParsingException`.
* **Sanitization:** Filenames are sanitized to allow only alphanumeric characters, dashes, and underscores. This protects the server from path traversal attacks.

### Environment Variable Validation
A utility script `backend/scripts/check_env.py` runs before backend startup. It parses `.env`, validates that all required parameters are set, maps alias variables, and exits with status 1 if any required parameters are missing.

---

## 8. Database Documentation

### Database Tables (SQLAlchemy Declarative Models)

#### Table: `users`
* `id`: UUID (Primary Key, Index)
* `email`: String(255) (Unique, Nullable=False, Index)
* `name`: String(255) (Nullable=False)
* `avatar_url`: String(500) (Nullable=True)
* `auth_provider`: AuthProvider Enum (Google, GitHub, Email)
* `provider_id`: String(255)
* `password_hash`: String(255) (Nullable=True)
* `mobile_number`: String(50) (Nullable=True)
* `google_connected`: Boolean (Default=False)
* `github_connected`: Boolean (Default=False)
* `is_active`: Boolean (Default=True)
* `created_at`: DateTime (Timezone=True)
* `updated_at`: DateTime (Timezone=True)

#### Table: `startups`
* `id`: UUID (Primary Key, Index)
* `user_id`: UUID (Foreign Key -> `users.id`, ondelete="CASCADE", Index)
* `name`: String(255) (Nullable=False)
* `tagline`: String(500) (Nullable=True)
* `problem_statement`: String(2000) (Nullable=True)
* `solution_description`: String(2000) (Nullable=True)
* `target_market`: String(500) (Nullable=True)
* `unique_value_proposition`: String(1000) (Nullable=True)
* `founder_name`: String(255) (Nullable=True)
* `team_size`: Integer (Default=1)
* `domain_expertise`: String(1000) (Nullable=True)
* `stage`: StartupStage Enum (Default=StartupStage.IDEA)
* `business_model`: String(500) (Nullable=True)
* `revenue_model`: String(500) (Nullable=True)
* `has_revenue`: Boolean (Default=False)
* `competitors_known`: Boolean (Default=False)
* `competitive_advantage`: String(1000) (Nullable=True)
* `health_score`: Float (Default=0.0)
* `created_at`: DateTime (Timezone=True)
* `updated_at`: DateTime (Timezone=True)

#### Table: `reports`
* `id`: UUID (Primary Key, Index)
* `startup_id`: UUID (Foreign Key -> `startups.id`, ondelete="CASCADE", Index)
* `report_type`: ReportType Enum
* `content`: Text (Nullable=False)
* `score`: Float (Nullable=True)
* `pdf_url`: String(500) (Nullable=True)
* `metadata_json`: JSON (Nullable=True)
* `created_at`: DateTime (Timezone=True)
* `updated_at`: DateTime (Timezone=True)

#### Table: `chat_sessions`
* `id`: UUID (Primary Key, Index)
* `user_id`: UUID (Foreign Key -> `users.id`, ondelete="CASCADE", Index)
* `startup_id`: UUID (Foreign Key -> `startups.id`, ondelete="SET NULL", Nullable=True, Index)
* `title`: String(255) (Default="New Chat Session")
* `created_at`: DateTime (Timezone=True)
* `updated_at`: DateTime (Timezone=True)

#### Table: `chat_messages`
* `id`: UUID (Primary Key, Index)
* `chat_session_id`: UUID (Foreign Key -> `chat_sessions.id`, ondelete="CASCADE", Index)
* `role`: MessageRole Enum (USER, ASSISTANT, SYSTEM)
* `content`: Text (Nullable=False)
* `tokens_used`: Integer (Nullable=True)
* `metadata_json`: JSON (Nullable=True)
* `created_at`: DateTime (Timezone=True)
* `updated_at`: DateTime (Timezone=True)

### Alembic Migration Strategy
1. **Initialize Migrations:** Executing `alembic init alembic` creates the migration files and environment configurations.
2. **Metadata binding:** `alembic/env.py` is configured to import model class metadata from `app.db.base`.
3. **Autogenerate Migrations:** To detect model updates and create migration scripts, run:
   ```bash
   alembic revision --autogenerate -m "description of migration changes"
   ```
4. **Upgrade database schema:** Apply migrations to target databases by running:
   ```bash
   alembic upgrade head
   ```

### ChromaDB Collections and Indexing
* **Collection Name:** `cofoundr_documents`
* **Indexing Mechanism:** Chunks documents into overlapping segments, generates embeddings using `models/text-embedding-004`, and indexes them in ChromaDB.
* **Vector filtering:** Queries use vector cosine similarity and are filtered by `startup_id` in metadata to isolate venture contexts:
  ```python
  collection.query(
      query_embeddings=[query_vector],
      n_results=limit,
      where={"startup_id": str(startup_id)}
  )
  ```

---

## 9. Deployment Documentation

### Docker Services and Configurations
The system defines 4 containerized services in [docker-compose.yml](file:///d:/PROJECTS/cofoundr/docker-compose.yml):

1. **`postgres`:** Database server running `postgres:15-alpine`. Standard health check: `pg_isready -U user`. Uses volume mount `postgres_data` to persist data.
2. **`chromadb`:** Vector database running `chromadb/chroma:latest` mapped to port `8001:8000`. Uses volume mount `chroma_data` to persist data.
3. **`backend`:** FastAPI application containerized using Python 3.11 configurations. Depends on PostgreSQL (healthy status) and ChromaDB (started status). Runs env audits and starts the ASGI web server:
   ```bash
   sh -c "python scripts/check_env.py && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
   ```
4. **`frontend`:** Next.js application served on port `3000`. Built using multi-stage builds.

---

### Environment Variables Reference
The following parameters must be configured in `backend/.env` before startup:

```env
# ─── DATABASE ───────────────────────────────────────────
DATABASE_URL=postgresql://user:password@postgres:5432/cofoundr

# ─── VECTOR DB ──────────────────────────────────────────
CHROMA_HOST=chromadb
CHROMA_PORT=8000

# ─── LLM PROVIDER CREDENTIALS ───────────────────────────
GEMINI_API_KEY=AIzaSy...   # Google AI Studio Gemini Flash Key
GROQ_API_KEY=gsk_...       # Groq API access token
TAVILY_API_KEY=tvly-...    # Tavily Web Search access token

# ─── SECURE TOKENS ──────────────────────────────────────
JWT_SECRET_KEY=yoursupersecurejwtkey... # Min 32 characters
JWT_ALGORITHM=HS256

# ─── OAUTH CREDENTIALS ──────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# ─── FILE STORAGE ───────────────────────────────────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

---

### Railway Deployment Steps
To deploy CoFoundr to Railway:
1. **Provision PostgreSQL Database:**
   * Create a PostgreSQL database instance in your Railway workspace.
   * Copy the generated database connection string.
2. **Deploy Backend Service:**
   * Create a service from the GitHub repository, pointing the root path to `backend/`.
   * Add the required backend environment variables. Replace `DATABASE_URL` with the connection string from step 1.
   * Railway will build the backend using the `Dockerfile` in the `backend/` directory.
3. **Deploy Frontend Service:**
   * Create a service pointing to `frontend/`.
   * Add the required frontend environment variables, setting `NEXT_PUBLIC_API_URL` to your backend's public domain URL.
   * Railway will build and deploy the Next.js frontend.

### Health Check Endpoint
* **Path:** `GET /health`
* **Response payload:**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0"
  }
  ```
This endpoint is used by Docker Compose and cloud platforms to verify service availability.

---

## 10. Testing Documentation

### Test Coverage by Layer
CoFoundr uses `pytest` to verify key components across three main layers:

* **API Layer:**
  * [test_health.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_api/test_health.py): Verifies the `/health` API endpoint response status and version.
* **Services Layer:**
  * [test_dashboard.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_services/test_dashboard.py): Mocks database repositories to verify that dashboard metric aggregation compiles totals and averages correctly.
  * [test_pdf.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_services/test_pdf.py): Verifies that ReportLab compiles markdown text into valid PDF bytes starting with the `%PDF-` signature.
  * [test_security.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_services/test_security.py): Verifies password hashing, password verification, and JWT signature verification.
  * [test_providers.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_services/test_providers.py): Verifies LLM API client interfaces and sandbox fallback behavior.
* **Tools Layer:**
  * [test_file_parser.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_tools/test_file_parser.py): Verifies parsing of PDF, DOCX, PPTX, and TXT file formats.
  * [test_recommendations.py](file:///d:/PROJECTS/cofoundr/backend/tests/test_services/test_recommendations.py): Verifies scoring formulas, risk dimension rating, and MVP milestone selection.

### Running Tests
To run backend tests locally:
1. Navigate to the `backend/` directory and activate your virtual environment:
   ```bash
   cd backend
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the test suite:
   ```bash
   pytest -v
   ```

---

### Key Test Cases Explained

#### 1. PDF Generation Bytes Signature (`test_pdf_generation_bytes`)
Tests the ReportLab parser to ensure that generated files start with the standard PDF magic file header signature (`b"%PDF-"`). This verifies that the byte compilation was successful.

#### 2. Health Scorer Weighted Aggregation (`test_health_scorer_math`)
Validates the strategic scoring engine logic. It verifies that the calculated venture health score is within the `[0, 100]` range and that the correct letter grade is assigned based on the score.

#### 3. Security Cryptography Integrity (`test_security`)
Verifies the cryptographic security layer:
* Validates that `get_password_hash` hashes plain passwords and that `verify_password` correctly compares hashes.
* Verifies that `create_access_token` generates valid signed JWT tokens and that `decode_access_token` extracts the payload accurately.
