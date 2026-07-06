# CoFoundr Verification & API Keys Guide

This document is a developer handbook for verifying the CoFoundr stack, registering API credentials, and debugging error paths.

---

## 1. Project Configuration Scan

The following environment parameters have been configured across the CoFoundr codebase:

| Variable | Scope | Purpose | Required For |
| --- | --- | --- | --- |
| `DATABASE_URL` | Backend | PostgreSQL connection string | User registration, chats, report storage |
| `CHROMA_HOST` / `PORT` | Backend | Vector search coordinates | ChromaDB storage mapping |
| `GEMINI_API_KEY` | Backend | Gemini LLM access token | Document embeddings & YC partner audits |
| `GROQ_API_KEY` | Backend | Groq LLM access token | Intent classifications & chat routing |
| `TAVILY_API_KEY` | Backend | Web Search access token | Competitor tracking and market sizes |
| `JWT_SECRET_KEY` | Backend | JWT tokens signature | User session verification |
| `GOOGLE_CLIENT_ID` / `SECRET` | Backend | Google OAuth API secrets | Sign in with Google |
| `GITHUB_CLIENT_ID` / `SECRET` | Backend | GitHub OAuth API secrets | Sign in with GitHub |
| `SUPABASE_URL` / `KEY` | Backend | Supabase API connection | Dynamic report PDF uploads |

---

## 2. API Keys & OAuth Setup Checklist

Here is how and where to register for all API keys, including local development setup instructions.

### A. Gemini API Key (Google AI Studio)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Log in with your Google account.
3. Click **Get API Key** and generate a new token.

### B. Groq API Key (Groq Console)
1. Go to the [Groq Console](https://console.groq.com/).
2. Create a developer profile.
3. Navigate to **API Keys** and generate a new key.

### C. Tavily API Key (Tavily Search)
1. Go to [Tavily Search](https://tavily.com/).
2. Sign up for a free developer tier (1,000 queries per month).
3. Copy the key from your user panel.

### D. Google & GitHub OAuth Integration
> [!IMPORTANT]
> **Do I need to deploy the project to get OAuth keys?**
> **No.** You can run and test OAuth locally on `localhost`. When registering OAuth clients in Google Cloud or GitHub, register the redirect/callback parameters to target your local server.

- **Google Cloud Console Setup:**
  - Create a project at [Google Cloud Console](https://console.cloud.google.com/).
  - Set up your OAuth Consent Screen.
  - Create Credentials > **OAuth Client ID** > Web Application.
  - **Origins:** `http://localhost:3000` (Frontend)
  - **Redirect URIs:** `http://localhost:8000/api/v1/auth/google/callback` (Backend)
- **GitHub Developer Settings Setup:**
  - Go to your GitHub profile settings > Developer Settings > **OAuth Apps** > New OAuth App.
  - **Homepage URL:** `http://localhost:3000`
  - **Callback URL:** `http://localhost:8000/api/v1/auth/github/callback`

### E. Supabase Storage Setup
1. Create a project at [Supabase](https://supabase.com/).
2. Navigate to **Project Settings** > **API** and copy your **Project URL** and **Anon Key**.
3. Create a public bucket in **Storage** named `uploads` to accept PDF reports.

---

## 3. Error Analysis & Fallback Logic

CoFoundr is designed to fail gracefully. Below is a breakdown of why specific errors occur and how the application handles them:

### A. Missing API Keys
- **Behavior:** The test suites still pass. The backend instantiates Groq and Gemini clients using placeholder fallback values (`"mock_key"`).
- **Error Trigger:** If you run the server and send a message without entering valid keys, the console will log a `ProviderException` with a `401 Unauthorized` or `Invalid API Key` response from the LLM provider.

### B. Database / Chroma DB Offline
- **Behavior:**
  - If Postgres is unreachable at startup, the database pool will raise a connection error.
  - If ChromaDB is offline during local test runs, the [`hybrid_search_tool.py`](file:///d:/PROJECTS/cofoundr/backend/app/tools/hybrid_search_tool.py) catches the connection timeout and automatically falls back to an **in-memory EphemeralClient**. This ensures developer productivity is not blocked by configuration issues.

### C. Client Input Errors (422 Unprocessable Entity)
- **Behavior:**
  - If the client uploads an unsupported file format (e.g., `.exe` or `.png`) to the uploader endpoint, the system catches the parser warning and returns a standard `FileParsingException` response.
  - Form validation errors are intercepted by FastAPI's default request verification schemas.
