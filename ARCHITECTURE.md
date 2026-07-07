# CoFoundr Technical Architecture Specification

This document defines the production architecture, multi-agent orchestrations, data models, real-time channels, security frameworks, and frontend state designs of **CoFoundr (v1.0.0)**.

---

## 1. Architecture Overview

### System Design Philosophy
CoFoundr is architected around the principles of **separation of concerns, state-machine determinism, and provider independence**. The system decouples REST/WebSocket routing gateways from background multi-agent orchestrations. By dividing core processes into discrete, unidirectional layers, the codebase ensures high testability, easy maintenance, and horizontal scaling potential.

### Key Architectural Decisions

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                   DESIGN DECISIONS MATRIX                                 │
├───────────────────┬───────────────────────────────────┬───────────────────────────────────┤
│ What              │ Why                               │ Trade-offs Considered             │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┤
│ LangGraph State   │ Replaces brittle linear chains    │ Higher upfront modeling           │
│ Machines          │ with structured state-machine     │ complexity compared to simple     │
│                   │ transition graphs.                │ sequential LangChain runnables.   │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┤
│ Async SQLAlchemy  │ Prevents event loop starvation    │ Requires careful usage of         │
│ 2.0 ORM           │ under high concurrent FastAPI REST│ async session factories and       │
│                   │ and WebSocket workloads.          │ eager loading relations.          │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┤
│ In-Memory PDF     │ Protects privacy and avoids       │ Increased RAM utilization         │
│ Rendering         │ temporary disk pollution by       │ during large multi-page PDF       │
│                   │ compiling bytes directly in RAM.  │ generation requests.              │
├───────────────────┼───────────────────────────────────┼───────────────────────────────────┤
│ Local ChromaDB    │ Protects local developer cycles   │ Ephemeral client falls back to    │
│ HttpClient with   │ from being blocked by offline     │ in-memory arrays, losing index    │
│ Ephemeral Fallback│ external vector server crashes.   │ persistence across restarts.      │
└───────────────────┴───────────────────────────────────┴───────────────────────────────────┘
```

### Full System Component Diagram
The diagram below details the runtime system component layout:

```
                            [ Next.js 14 Web UI ]
                                      │
              ┌───────────────────────┴───────────────────────┐
              │ REST (Axios API Client) / WebSocket (WS Port) │
              ▼                                               ▼
     [ FastAPI Gateway ] ─────────────────────────────► [ ConnectionManager ]
              │                                               │
              ├───────────────────────┐                       │ Broadcasts
              ▼                       ▼                       ▼
      [ Service Layer ]       [ Database Layer ]      [ Live WS Updates ]
              │                       │
              ▼                       ▼
      [ LangGraph Engine ]    [ PostgreSQL 15 ]
              │
      ┌───────┴───────┐
      ▼               ▼
[ ChromaDB ]   [ LLM Providers ]
               (Gemini & Groq)
```

---

## 2. Layered Architecture

CoFoundr implements a strict layered architecture pattern. Downward calls are permitted; upward execution is prohibited.

```
       Next.js Frontend
              │
              ▼
       FastAPI Gateway  [main.py]
              │
              ▼
       Middleware Layer  (CORS, Auth, Limiter, Error, Formatter)
              │
              ▼
       API Route Layer  [app/api/v1/]
              │
              ▼
       Service Layer  [app/services/]
              │
              ▼
       Agent Layer  [app/agents/]
              │
              ▼
       Tools Layer  [app/tools/]
              │
              ▼
       Provider Layer  [app/providers/]
              │
              ▼
       Repository Layer  [app/repositories/]
              │
              ▼
       PostgreSQL + ChromaDB
```

---

### Layer Specifications

#### 1. Next.js Frontend
* **Purpose:** Handles layout routing, reactive UI views, and socket event mappings.
* **Key Files:** `src/app/`, `src/components/`, `src/store/authStore.ts`, `src/store/chatStore.ts`, `src/store/dashboardStore.ts`.
* **Layer Rules:** Must interact with the backend solely via the Axios API client wrapper or WebSocket ports.
* **CANNOT:** Query databases or load backend Python modules.

#### 2. FastAPI Gateway
* **Purpose:** Acts as the ASGI server manager, registers lifespan hooks, and binds routers.
* **Key Files:** [main.py](file:///d:/PROJECTS/cofoundr/backend/main.py).
* **Layer Rules:** Registers middleware chains and endpoints.
* **CANNOT:** Write business transaction logic, execute SQL queries, or invoke LLM models.

#### 3. Middleware Layer
* **Purpose:** Validates CORS origins, decodes JWT user tokens, enforces rate limits, logs requests, and catches exceptions.
* **Key Files:** [auth_middleware.py](file:///d:/PROJECTS/cofoundr/backend/app/middleware/auth_middleware.py), [rate_limiter.py](file:///d:/PROJECTS/cofoundr/backend/app/middleware/rate_limiter.py), [error_handler.py](file:///d:/PROJECTS/cofoundr/backend/app/middleware/error_handler.py), [response_formatter.py](file:///d:/PROJECTS/cofoundr/backend/app/middleware/response_formatter.py).
* **Layer Rules:** Intercepts ASGI request-response cycles.
* **CANNOT:** Bind domain-specific validation patterns.

#### 4. API Route Layer
* **Purpose:** Parses query values, injects JWT user dependencies, and routes data to backend services.
* **Key Files:** [auth.py](file:///d:/PROJECTS/cofoundr/backend/app/api/v1/auth.py), [startup.py](file:///d:/PROJECTS/cofoundr/backend/app/api/v1/startup.py), [chat.py](file:///d:/PROJECTS/cofoundr/backend/app/api/v1/chat.py), [reports.py](file:///d:/PROJECTS/cofoundr/backend/app/api/v1/reports.py), [dashboard.py](file:///d:/PROJECTS/cofoundr/backend/app/api/v1/dashboard.py).
* **Layer Rules:** Uses Pydantic schemas to validate client payloads.
* **CANNOT:** Access database transaction logs directly without repository helpers.

#### 5. Service Layer
* **Purpose:** Executes business transaction rules and manages database commits.
* **Key Files:** [startup_service.py](file:///d:/PROJECTS/cofoundr/backend/app/services/startup_service.py), [chat_service.py](file:///d:/PROJECTS/cofoundr/backend/app/services/chat_service.py), [report_service.py](file:///d:/PROJECTS/cofoundr/backend/app/services/report_service.py), [dashboard_service.py](file:///d:/PROJECTS/cofoundr/backend/app/services/dashboard_service.py).
* **Layer Rules:** Handles database session rollbacks and invokes the LangGraph runtime.
* **CANNOT:** Parse raw HTTP requests or write HTML templates.

#### 6. Agent Layer
* **Purpose:** Manages intent routing and runs agent nodes.
* **Key Files:** [graph.py](file:///d:/PROJECTS/cofoundr/backend/app/agents/graph.py), [main_agent.py](file:///d:/PROJECTS/cofoundr/backend/app/agents/main_agent.py), [web_search_agent.py](file:///d:/PROJECTS/cofoundr/backend/app/agents/web_search_agent.py), [rag_agent.py](file:///d:/PROJECTS/cofoundr/backend/app/agents/rag_agent.py), [recommendation_agent.py](file:///d:/PROJECTS/cofoundr/backend/app/agents/recommendation_agent.py).
* **Layer Rules:** Interacts with the shared `AgentState` context.
* **CANNOT:** Parse raw files or write database tables.

#### 7. Tools Layer
* **Purpose:** Performs specialized tasks (Tavily search, document indexing, scoring calculations).
* **Key Files:** [health_scorer_tool.py](file:///d:/PROJECTS/cofoundr/backend/app/tools/health_scorer_tool.py), [risk_analyzer_tool.py](file:///d:/PROJECTS/cofoundr/backend/app/tools/risk_analyzer_tool.py), [mvp_generator_tool.py](file:///d:/PROJECTS/cofoundr/backend/app/tools/mvp_generator_tool.py), [tech_recommender_tool.py](file:///d:/PROJECTS/cofoundr/backend/app/tools/tech_recommender_tool.py), [growth_generator_tool.py](file:///d:/PROJECTS/cofoundr/backend/app/tools/growth_generator_tool.py), [investor_scorer_tool.py](file:///d:/PROJECTS/cofoundr/backend/app/tools/investor_scorer_tool.py).
* **Layer Rules:** Deterministic helper methods designed as mathematical rules.
* **CANNOT:** Connect directly to relational database instances.

#### 8. Provider Layer
* **Purpose:** Exposes unified API adapters for LLMs (Gemini, Groq).
* **Key Files:** [provider_factory.py](file:///d:/PROJECTS/cofoundr/backend/app/providers/provider_factory.py), [gemini_provider.py](file:///d:/PROJECTS/cofoundr/backend/app/providers/gemini_provider.py), [groq_provider.py](file:///d:/PROJECTS/cofoundr/backend/app/providers/groq_provider.py).
* **Layer Rules:** Extends base provider interfaces.
* **CANNOT:** Define state configurations or write database transactions.

#### 9. Repository Layer
* **Purpose:** Executes SQL queries via the SQLAlchemy engine.
* **Key Files:** [base_repository.py](file:///d:/PROJECTS/cofoundr/backend/app/repositories/base_repository.py), [user_repository.py](file:///d:/PROJECTS/cofoundr/backend/app/repositories/user_repository.py), [startup_repository.py](file:///d:/PROJECTS/cofoundr/backend/app/repositories/startup_repository.py), [chat_repository.py](file:///d:/PROJECTS/cofoundr/backend/app/repositories/chat_repository.py), [report_repository.py](file:///d:/PROJECTS/cofoundr/backend/app/repositories/report_repository.py).
* **Layer Rules:** Focuses solely on SQL generation.
* **CANNOT:** Trigger LLMs or execute agent routing workflows.

---

## 3. Multi-Agent System Design

### LangGraph Workflow Transition Graph
CoFoundr configures all specialized agent nodes on a compiled `StateGraph` object:

```
                  ┌──────────────────────┐
                  │      User Entry      │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │   main_agent Node    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┼────────────────┐
            │ (web_search)   │ (rag)          │ (recommendation)
            ▼                ▼                ▼
      ┌───────────┐    ┌───────────┐    ┌───────────┐
      │web_search_│    │ rag_agent │    │recommenda-│
      │agent Node │    │   Node    │    │tion_agent │
      └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │     END     │
                      └─────────────┘
```

---

### Agent Specifications

#### 1. MainAgent
* **Logic:** Receives the user query and uses Gemini 2.5 Flash to classify intent.
* **Routing Keys:**
  * `web_search`: Live trends, competitor analysis, funding records.
  * `rag`: Specific queries about uploaded documents.
  * `recommendation`: Venture scoring audits, tech stack recommendations, timeline evaluations.
  * `end`: Simple greetings and general chit-chat.
* **Implementation:** Exposes [MainAgent.route()](file:///d:/PROJECTS/cofoundr/backend/app/agents/main_agent.py#L87-L93) as a conditional edge callback to steer the workflow.

#### 2. WebSearchAgent
* **Logic:** Formulates optimized query keywords and calls the Tavily Search API.
* **synthesis:** Consolidates up to 5 web results, compiling titles, source URLs, and snippet contents. It uses Gemini 2.5 Flash to synthesize the final markdown research summary.

#### 3. RAGAgent
* **Logic:** Checks the `startup_id` context. If set, it executes document search tool actions to retrieve relevant context.
* **synthesis:** Compiles the matching vector segments into a context block and asks Gemini 2.5 Flash to generate a grounded analysis.

#### 4. RecommendationAgent
* **Logic:** Automatically runs the 6 mathematical scoring tools using the startup profile context.
* **synthesis:** Aggregates health, risk, and readiness metrics into a prompt, instructing Gemini Flash to synthesize a YC-partner style startup audit.

### Agent State Management
Agents read and write context using the shared state dictionary:
```python
class AgentState(TypedDict):
    messages: List[Dict[str, Any]]
    startup_id: str | None
    next_agent: str | None
    response: str | None
    metadata: Dict[str, Any]
```
The FastAPI session loads the initial parameters and reads the compiled `response` and computed `metadata` values once execution reaches the `END` node.

---

## 4. Database Architecture

### Entity Relationship Diagram
CoFoundr uses PostgreSQL 15 for data persistence. The database schema maps users, startups, reports, and chat sessions:

```
  ┌────────────────────────┐          ┌────────────────────────┐          ┌────────────────────────┐
  │         users          │          │        startups        │          │        reports         │
  ├────────────────────────┤          ├────────────────────────┤          ├────────────────────────┤
  │ id: uuid (PK)          │1        *│ id: uuid (PK)          │1        *│ id: uuid (PK)          │
  │ email: varchar(255)    │─────────►│ user_id: uuid (FK)     │─────────►│ startup_id: uuid (FK)  │
  │ name: varchar(255)     │          │ name: varchar(255)     │          │ report_type: varchar   │
  │ password_hash: varchar │          │ health_score: float    │          │ content: text          │
  └────────────────────────┘          │ stage: varchar         │          │ score: float           │
              │                       └────────────────────────┘          └────────────────────────┘
              │ 1
              │
              ▼ *
  ┌────────────────────────┐1        *┌────────────────────────┐
  │     chat_sessions      │─────────►│     chat_messages      │
  ├────────────────────────┤          ├────────────────────────┤
  │ id: uuid (PK)          │          │ id: uuid (PK)          │
  │ user_id: uuid (FK)     │          │ chat_session_id: uuid  │
  │ title: varchar(255)    │          │ role: varchar(50)      │
  │ startup_id: uuid (FK)  │          │ content: text          │
  └────────────────────────┘          └────────────────────────┘
```

---

### Database Tables and Columns

#### 1. `users` Table
* `id` (`UUID`, PK, Index): Unique user identifier.
* `email` (`VARCHAR(255)`, Unique, Index): Email address.
* `name` (`VARCHAR(255)`): User's name.
* `avatar_url` (`VARCHAR(500)`): OAuth avatar image URL.
* `auth_provider` (`VARCHAR(50)`): Login provider (email, google, github).
* `provider_id` (`VARCHAR(255)`): OAuth unique identifier.
* `password_hash` (`VARCHAR(255)`): Bcrypt hashed password.
* `google_connected` (`BOOLEAN`): Connection status flag.
* `github_connected` (`BOOLEAN`): Connection status flag.
* `is_active` (`BOOLEAN`): Active profile status flag.
* `created_at` / `updated_at` (`TIMESTAMP WITH TIME ZONE`): Audit timestamps.

#### 2. `startups` Table
* `id` (`UUID`, PK, Index): Unique startup identifier.
* `user_id` (`UUID`, FK -> `users.id`, Cascade): Owner identifier.
* `name` (`VARCHAR(255)`): Startup name.
* `tagline` (`VARCHAR(500)`): Short elevator pitch.
* `problem_statement` / `solution_description` (`VARCHAR(2000)`): Venture metrics.
* `target_market` (`VARCHAR(500)`): Target customer profile.
* `unique_value_proposition` (`VARCHAR(1000)`): Key competitive differentiator.
* `founder_name` / `domain_expertise` (`VARCHAR`): Team credentials.
* `team_size` (`INTEGER`): Total team headcount.
* `stage` (`VARCHAR(50)`): Development stage (idea, validation, prototype, mvp, early, growing, scaling).
* `business_model` / `revenue_model` (`VARCHAR(500)`): Business model.
* `has_revenue` (`BOOLEAN`): Revenue status flag.
* `competitors_known` (`BOOLEAN`): Competitor landscape status flag.
* `competitive_advantage` (`VARCHAR(1000)`): Defensibility strategy.
* `health_score` (`FLOAT`): Cached health score.

#### 3. `reports` Table
* `id` (`UUID`, PK, Index): Unique report identifier.
* `startup_id` (`UUID`, FK -> `startups.id`, Cascade): Associated startup.
* `report_type` (`VARCHAR(50)`): Type of report (market_research, competitor_analysis, risk_assessment, etc.).
* `content` (`TEXT`): Compiled markdown report text.
* `score` (`FLOAT`): Score associated with the report.
* `pdf_url` (`VARCHAR(500)`): Supabase PDF download link (if uploaded).
* `metadata_json` (`JSON`): Extracted scoring properties.

#### 4. `chat_sessions` Table
* `id` (`UUID`, PK): Unique chat session identifier.
* `user_id` (`UUID`, FK -> `users.id`, Cascade): Associated user.
* `startup_id` (`UUID`, FK -> `startups.id`, Set Null): Optional startup context.
* `title` (`VARCHAR(255)`): Chat thread title.

#### 5. `chat_messages` Table
* `id` (`UUID`, PK): Unique message identifier.
* `chat_session_id` (`UUID`, FK -> `chat_sessions.id`, Cascade): Associated session.
* `role` (`VARCHAR(50)`): Message sender role (user, assistant, system).
* `content` (`TEXT`): Chat message content.
* `tokens_used` (`INTEGER`): Token count.
* `metadata_json` (`JSON`): Context properties.

---

### ChromaDB Collections Design
* **Collection Name:** `cofoundr_documents`
* **Metadata Schema:**
  ```json
  {
    "startup_id": "uuid_string",
    "filename": "string_name.pdf",
    "chunk": 0
  }
  ```
* **Embedding Model:** `models/text-embedding-004` (768 dimensions).
* **Chunking Strategy:** Sliding character window (1000 characters size, 200 overlap).

### Hybrid Search Strategy
When querying documents, the search service:
1. Generates query embeddings using the Gemini embedding API.
2. Queries the vector database, filtering the search by the active `startup_id` metadata tag:
   ```python
   collection.query(
       query_embeddings=[query_vector],
       n_results=limit,
       where={"startup_id": str(startup_id)}
   )
   ```
3. Returns vector similarity segments to ground the advisor's response.

---

## 5. Provider Abstraction Pattern

### Why Provider Independence Matters
Relying on a single LLM vendor introduces platform lock-in risks, rate limiting constraints, and vulnerability to downtime. The provider abstraction pattern decouples core agent logic from vendor-specific API structures, allowing developers to switch models or providers via configuration.

### Provider Class Diagram

```
                 ┌──────────────────────────┐
                 │       BaseProvider       │
                 ├──────────────────────────┤
                 │ + generate(prompt)       │
                 │ + embed(text)            │
                 └────────────┬─────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           ┌────────────────┐   ┌────────────────┐
           │ GeminiProvider │   │  GroqProvider  │
           ├────────────────┤   ├────────────────┤
           │ uses Gemini SDK│   │ uses Groq SDK  │
           └────────────────┘   └────────────────┘
```

### ProviderFactory Switching Logic
The [ProviderFactory](file:///d:/PROJECTS/cofoundr/backend/app/providers/provider_factory.py) handles model switching:
* **Reasoning Provider:** [ProviderFactory.get_reasoning_provider()](file:///d:/PROJECTS/cofoundr/backend/app/providers/provider_factory.py#L54-L56) returns a `GeminiProvider` running `gemini-2.5-flash` for complex strategic synthesis and document embedding.
* **Fast Provider:** [ProviderFactory.get_fast_provider()](file:///d:/PROJECTS/cofoundr/backend/app/providers/provider_factory.py#L59-L61) returns a `GroqProvider` running `llama3-70b-8192` for fast intent classification and routing.

### How to Add a New Provider
1. Inherit from `BaseProvider` in `app/providers/base_provider.py`.
2. Implement the async `generate` and `embed` methods.
3. Update `ProviderFactory` in `app/providers/provider_factory.py` to register the new class.

---

## 6. Authentication Architecture

### OAuth2 Callback Flow

```
Next.js Client             FastAPI Server           OAuth Portal (Google/GitHub)
      │                           │                              │
      │ 1. Click Login            │                              │
      ├──────────────────────────►│                              │
      │                           │ 2. Build redirect URL        │
      │                           ├─────────────────────────────►│
      │                           │                              │
      │ 3. Sign In & Consent      │                              │
      │◄──────────────────────────┼──────────────────────────────┤
      │                           │                              │
      │ 4. Send Auth Code         │                              │
      ├───────────────────────────┼─────────────────────────────►│
      │                           │                              │
      │                           │ 5. Exchange Token & Profile  │
      │                           │◄─────────────────────────────┤
      │                           │                              │
      │ 6. Create User & Token    │                              │
      │◄──────────────────────────┤                              │
```

---

### OAuth Details
* **Google OAuth Callback:** Exchanged via `https://oauth2.googleapis.com/token`, retrieving user details from `https://www.googleapis.com/oauth2/v3/userinfo`.
* **GitHub OAuth Callback:** Exchanged via `https://github.com/login/oauth/access_token`, retrieving user profile data from `https://api.github.com/user` and primary verified emails from `https://api.github.com/user/emails`.
* **Existing account linking:** If a user is already authenticated and triggers an OAuth login with a `state` parameter containing `link:<token>`, FastAPI parses the token and links the new provider (Google/GitHub) to the active account.

### JWT Lifecycle & Validation
1. **Creation:** [create_access_token()](file:///d:/PROJECTS/cofoundr/backend/app/core/security.py#L35-L54) signs the token using the secret key (`JWT_SECRET_KEY`) with the `HS256` algorithm. It sets the expiration timestamp to 1440 minutes (24 hours) from creation.
2. **Interception:** The [AuthMiddleware](file:///d:/PROJECTS/cofoundr/backend/app/middleware/auth_middleware.py) intercepts incoming HTTP request headers or URL query parameters, decodes the token, and attaches the payload (`sub` user ID and `email`) to `request.state.user`.
3. **Dependency Injection:** FastAPI endpoints use `Depends(get_current_user_id)` to extract the authenticated user's ID, automatically raising a `401 Unauthorized` exception if the token is missing or expired.

---

## 7. Realtime Architecture

### WebSocket Connection Lifecycle
1. **Handshake:** The client establishes a connection to `/api/v1/dashboard/ws?token=<JWT_TOKEN>`.
2. **Authentication:** The dashboard WebSocket endpoint validates the token. If validation fails, the server closes the connection with code `4008` (Policy Violation).
3. **Registry:** On successful connection, the server registers the connection in the `ConnectionManager` singleton, mapping the `user_id` string to the active socket.
4. **Heartbeat Loop:** A stay-alive loop listens for client-side ping events and echoes back heartbeat pong messages:
   ```json
   { "event": "pong" }
   ```
5. **Disconnect:** If a disconnect event occurs, the server removes the user's connection from the active connections registry.

### ConnectionManager Broadcasts
The `ConnectionManager` exposes methods to push updates:
```python
async def send_dashboard_update(self, user_id: str, data: dict) -> None:
    websocket = self.active_connections.get(user_id)
    if websocket:
        await websocket.send_json({
            "event": "dashboard_update",
            "data": data
        })
```
This is triggered by service endpoints (such as onboarding or report generation) to update the client-side dashboard in real time.

---

## 8. File Processing Pipeline

CoFoundr implements a secure file processing pipeline to index uploaded documents:

```
[Upload File] ──► [Sanitize Filename] ──► [Format Parser] ──► [Text Extractor] ──► [Sliding Chunking] ──► [Gemini Embeddings] ──► [Chroma Indexing]
```

1. **Upload:** Endpoint receives document payloads.
2. **Sanitize:** The server sanitizes the filename to allow only alphanumeric characters, dashes, and underscores, protecting the system from directory traversal attacks.
3. **Validate:** Checks that the file size is within the allowed limit (default: 10MB) and that the extension is supported (`.pdf`, `.docx`, `.pptx`, `.txt`).
4. **Parse:**
   * **PDF:** Parsed using `PyPDF2.PdfReader` to extract text page-by-page.
   * **DOCX:** Parsed using `docx.Document` to extract text paragraph-by-paragraph.
   * **PPTX:** Parsed using `pptx.Presentation` to extract text slide-by-slide.
   * **TXT:** Decoded directly as `utf-8` text.
5. **Index:** Chunks the extracted text, generates embeddings, and indexes them in ChromaDB under the active `startup_id`.

---

## 9. Report Generation Pipeline

### Supported Report Types
CoFoundr supports 7 types of reports:
1. `market_research`: TAM/SAM/SOM metrics and market sizing.
2. `competitor_analysis`: Competitor profiles and differentiation strategies.
3. `risk_assessment`: Execution, market, financial, and tech risk matrices.
4. `mvp_roadmap`: Phase-based development timelines.
5. `tech_stack`: Infrastructure recommendations.
6. `investor_readiness`: Pre-seed readiness evaluations and checklists.
7. `growth_strategy`: B2B and B2C marketing channel strategies.

### PDF Compiler Execution Steps
```
[Markdown Content] ──► [Regex bold tags parser] ──► [Paragraph / HR flowables mappings] ──► [Canvas page count footers] ──► [Stream PDF Bytes]
```
1. **Markdown Parsing:** Splits markdown text into lines. It compiles headers (`#`, `##`, `###`) and list items (`-`, `*`) into ReportLab `Paragraph` objects. Bold text (`**`) is wrapped in HTML bold tags (`<b>...</b>`).
2. **Styling:** Applies a premium color palette (Indigo `#4f46e5`, Slate Navy `#1e1b4b`, Charcoal `#374151`) and configures custom heading typography styles.
3. **Header Rule:** Injects a horizontal line (`HRFlowable`) under the report title.
4. **Footer Callback:** Injects the page number footer during document generation:
   ```python
   def add_page_number(canvas, doc_template):
       canvas.setFont('Helvetica', 8)
       canvas.drawString(letter[0] - 54, 36, f"Page {doc_template.page}")
   ```
5. **Byte Stream Compilation:** `doc.build` compiles the layout in-memory and returns the raw PDF bytes.

---

## 10. Security Architecture

### Middleware Execution Order

```
(Request In)
     │
     ▼
┌─────────────────────────────┐
│ 1. CORSMiddleware           │ -> Asserts allowable origins
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 2. AuthMiddleware           │ -> Decodes JWT and attaches user payload
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 3. RateLimiterMiddleware    │ -> Restricts request rates per IP address
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 4. RequestLoggerMiddleware  │ -> Logs endpoint request durations
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 5. ErrorHandlerMiddleware   │ -> Catches exceptions and returns JSON errors
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│ 6. ResponseFormatterMiddleware│ -> Wraps successful JSON payloads
└────────────┬────────────────┘
             │
             ▼
      (FastAPI Route)
```

---

### Security Policies
* **Rate Limiting:** Enforces a general rate limit of 60 requests/minute per IP address, and a chat-specific limit of 20 requests/minute. Bypasses rate limiting for WebSockets, health checks, and API docs.
* **JWT Signature Validation:** Decodes JWTs using the algorithm specified in settings (default: `HS256`). Discards expired tokens and returns `401 Unauthorized` for endpoints that require authentication.
* **File Upload Policies:** Enforces file size limits (default: 10MB) and checks file extensions. Sanitizes filenames to prevent path traversal attacks.
* **Environment Variable Validation:** `check_env.py` validates that all required environment variables are set before backend startup.

---

## 11. Docker Architecture

### Container Relationship Topology
Docker Compose orchestrates 4 services:

```
                  ┌──────────────────────┐
                  │  frontend Container  │
                  │     (Next.js 14)     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  backend Container   │
                  │   (FastAPI / ASGI)   │
                  └────┬────────────┬────┘
                       │            │
         ┌─────────────┘            └─────────────┐
         ▼                                        ▼
┌──────────────────┐                     ┌──────────────────┐
│postgres Container│                     │chromadb Container│
│ (PostgreSQL 15)  │                     │ (HttpClient Port)│
└──────────────────┘                     └──────────────────┘
```

* **Network Configuration:** Services communicate within a shared custom bridge network.
* **Volume Mounts:** Persistent volumes are mounted for database storage:
  * `postgres_data` -> `/var/lib/postgresql/data` (PostgreSQL)
  * `chroma_data` -> `/chroma/chroma` (ChromaDB)
* **Backend Volume Mount:** The backend project directory is mounted to `/app` during local development, allowing code changes to reload the server hot.
* **Health Checks:**
  * PostgreSQL: `pg_isready -U user` verifies readiness before the backend starts up.
  * ChromaDB: The HTTP client sends heartbeats to verify socket health before document indexing.

---

## 12. Frontend Architecture

### Component Hierarchy Diagram

```
                     ┌──────────────────────┐
                     │    Layout Wrapper    │
                     │ (Theme/Query/Auth)   │
                     └──────────┬───────────┘
                                │
                                ▼
                     ┌──────────────────────┐
                     │    Navbar Component  │
                     │  (Route Navigator)   │
                     └──────────┬───────────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
  │Onboarding   │        │Chat Component│        │Reports Grid │
  │Form Inputs  │        │ (ChatBox)   │        │ (Downloads) │
  └─────────────┘        └─────────────┘        └─────────────┘
```

* **Zustand Store Slices:**
  * `authStore.ts`: Stores logged-in user profile, avatar URL, active connection status (Google, GitHub), and JWT token. It syncs the token with `localStorage`.
  * `chatStore.ts`: Stores active chat session ID, messages list, and active sessions.
  * `dashboardStore.ts`: Stores aggregated metrics (total startups, average health index, recent audits, recent chats).
* **API Client Wrapper:** Axios instance with request interceptors to automatically inject the JWT token as a Bearer token in the `Authorization` header of every request.
