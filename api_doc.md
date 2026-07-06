# CoFoundr API & Auth Credentials Guide

This guide details all API keys and OAuth secrets required to run CoFoundr, where to obtain them, and how to configure them for local development.

---

## 1. Credentials Checklist

To activate all modules, configure the following variables in your `backend/.env` file:

```env
# ─── LLM PROVIDERS ──────────────────────────────────────
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# ─── WEB SEARCH ─────────────────────────────────────────
TAVILY_API_KEY=your_tavily_api_key_here

# ─── OAUTH LOGINS (LOCAL DEVELOPMENT SUPPORTED) ─────────
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# ─── SECURE TOKENS ──────────────────────────────────────
JWT_SECRET_KEY=your_jwt_secret_key_minimum_32_chars

# ─── FILE STORAGE ──────────────────────────────────────
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

---

## 2. Where & How to Get Your Keys

### A. Google Gemini API Key
- **Role:** Generates strategic startup evaluations and YC advisor reports.
- **Registration steps:**
  1. Go to [Google AI Studio](https://aistudio.google.com/).
  2. Log in with your Google account.
  3. Click **Get API key** in the left sidebar and create a new key.

### B. Groq API Key
- **Role:** Used for ultra-fast chat thread routing and intent classification.
- **Registration steps:**
  1. Go to the [Groq Console](https://console.groq.com/).
  2. Sign in and go to **API Keys** in the sidebar.
  3. Click **Create API Key** and copy the generated token.

### C. Tavily API Key
- **Role:** Performs real-time web searches for competitors and market research.
- **Registration steps:**
  1. Go to [Tavily Search API](https://tavily.com/).
  2. Register for a free developer account (includes 1,000 free search queries per month).
  3. Copy the API key from your developer panel.

---

## 3. How to Set Up Auth Keys (Google & GitHub OAuth)

> [!IMPORTANT]
> **Do I need to deploy the project to get OAuth keys?**
> **No.** You can create OAuth credentials for local development. During setup in the Google/GitHub developer consoles, set your homepage and redirect parameters to your local server URLs. When you deploy the project to production later, you simply add your production URL to the redirect list.

### Google OAuth Credentials
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project named `CoFoundr`.
3. Search for **OAuth consent screen** in the top bar. Choose **External** user type and complete the basic form.
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**.
5. Select **Web application** and enter:
   - **Authorized JavaScript origins:** `http://localhost:3000` (Your frontend address)
   - **Authorized redirect URIs:** `http://localhost:8000/api/v1/auth/google/callback` (Your backend API endpoint)
6. Click **Create** and copy the **Client ID** and **Client Secret**.

### GitHub OAuth Credentials
1. Go to [GitHub Settings](https://github.com/settings/profile).
2. Click on **Developer settings** at the bottom of the left sidebar.
3. Click on **OAuth Apps** > **New OAuth App**.
4. Fill in the parameters:
   - **Application name:** `CoFoundr`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:8000/api/v1/auth/github/callback`
5. Click **Register application**.
6. Generate a client secret and copy both the **Client ID** and **Client Secret**.

---

## 4. Supabase Storage URLs (Optional)
- **Role:** Uploads report PDFs to cloud storage buckets. If omitted, the service falls back to direct browser byte downloads.
1. Create a free profile at [Supabase](https://supabase.com/).
2. Go to your project settings > **API** and copy the **Project URL** and **Anon Key**.
3. Create a public bucket in **Storage** named `uploads` to accept PDF reports.
