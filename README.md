# CoFoundr

> **The AI co-founder you always needed.**

CoFoundr is a production-grade AI-powered startup research, analysis, and strategic advisory agent. It is designed to act as an automated Y Combinator Managing Partner—evaluating startups, identifying risk vectors, recommending software architecture stacks, and generating release roadmaps.

---

## Key Features

- **Multi-Agent LangGraph Orchestrator:** Intelligent classification and routing across dedicated researcher, RAG, and recommender agent nodes.
- **Strategic Scoring Suite:** Built-in calculation engines scoring venture health, risk severities, MVP timeline targets, and fundraising readiness.
- **RAG Document Indexer:** Parse uploaded files (PDF/TXT) and index them in ChromaDB vector space for targeted contextual grounding.
- **Real-Time Analytics Dashboard:** Real-time updates delivered to a Next.js front-end using FastAPI WebSocket channels.
- **Dynamic PDF Compilation:** High-quality downloadable report documents styled using ReportLab.

---

## Technology Stack

- **Backend:** FastAPI, Async SQLAlchemy 2.0, PostgreSQL 15, Alembic
- **Multi-Agent Orchestrations:** LangGraph, LangChain, Gemini Flash LLM
- **Vector Database:** ChromaDB (with Ephemeral client fallback for offline environments)
- **Frontend:** Next.js 14 (App Router), Zustand, TypeScript, TailwindCSS
- **Containerization:** Docker, Docker Compose

---

## Directory Structure

```
├── backend/
│   ├── app/
│   │   ├── agents/          # LangGraph orchestrator, agent nodes
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── core/            # Global constants, settings, security configs
│   │   ├── db/              # SQLAlchemy sessions, migrations metadata
│   │   ├── models/          # Declarative schemas
│   │   ├── providers/       # LLM provider abstractions (Gemini, Groq)
│   │   ├── services/        # Orchestrations, database transaction services
│   │   ├── tools/           # Custom calculators, search, embeddings
│   │   └── websockets/      # Connection managers
│   ├── alembic/             # Alembic database migrations scripts
│   ├── tests/               # Pytest suite
│   ├── requirements.txt     # Python requirements manifest
│   └── Dockerfile           # Backend container build
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router pages and layouts
│   │   ├── components/      # Shared components
│   │   ├── lib/             # API clients, utils
│   │   ├── providers/       # Auth Provider wraps
│   │   └── store/           # Zustand state store slices
│   ├── package.json         # Node requirements manifest
│   └── Dockerfile           # Frontend container build
├── docker-compose.yml       # Production services compose spec
└── README.md
```

---

## Setup & Installation

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory (use `backend/.env.example` as a template):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cofoundr
CHROMA_HOST=localhost
CHROMA_PORT=8001
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
JWT_SECRET_KEY=your_secure_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
GITHUB_CLIENT_ID=your_github_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### 2. Run with Docker Compose (Recommended)

Start the entire application (PostgreSQL, ChromaDB, Backend, and Frontend) in single command:

```bash
docker compose up --build
```

Access the frontend at `http://localhost:3000` and view backend interactive API documentation at `http://localhost:8000/docs`.

### 3. Local Development Setup

#### Backend

1. Navigate to the backend directory and create a virtual environment:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run Alembic migrations:
   ```bash
   alembic upgrade head
   ```
4. Start the development server:
   ```bash
   uvicorn main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## Running Verification Tests

Execute the comprehensive test suites:

```bash
cd backend
pytest
```
