# constants.py
# Purpose: Define all application-wide static constants.
# Responsibilities:
#   - Define fixed values used across the app (AI models, stages, report types)
#   - Prevent magic strings and numbers in code
# DO NOT: Import settings or Config here. Constants are static values only.
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
