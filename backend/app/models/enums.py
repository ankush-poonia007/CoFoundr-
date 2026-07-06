# enums.py
# Purpose: All database and application enums.
# Responsibilities:
#   - Define Python Enum classes used in ORM models and schemas (StartupStage, ReportType, etc.)
# DO NOT: Define non-enum classes here.
# DO NOT: Add business logic or external helpers here.

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
