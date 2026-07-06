# tech_recommender_tool.py
# Purpose: Formulate architecture technology stack recommendations.
# Responsibilities:
#   - Match stack components based on domain categories (e.g. Fintech, AI/ML, SaaS, E-commerce)
#   - Expose backend, database, and infrastructure lists
# DO NOT: Run LLM model calls directly inside rules.
# DO NOT: Direct database integrations.

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TechStackRecommendation:
    """Represents compiled technology recommendations."""
    language: str
    backend: str
    frontend: str
    database: str
    hosting: str
    rationale: str


def recommend_tech_stack(startup_data: dict) -> TechStackRecommendation:
    """
    Recommend a software technology stack matching startup vertical profile.

    Args:
        startup_data: Dictionary of startup metrics.

    Returns:
        TechStackRecommendation: Detailed architectural choices.
    """
    logger.info(f"Generating Tech Stack recommendations for startup: {startup_data.get('name', 'Unknown')}")

    # Check for domain matches in startup profile description
    problem = (startup_data.get("problem_statement") or "").lower()
    tagline = (startup_data.get("tagline") or "").lower()
    industry = "saas"

    if "fintech" in problem or "finance" in problem or "banking" in problem or "payment" in problem:
        industry = "fintech"
    elif "ai" in problem or "ml" in problem or "artificial" in problem or "intelligence" in problem or "data" in problem:
        industry = "ai_ml"
    elif "ecommerce" in problem or "shop" in problem or "retail" in problem or "store" in problem:
        industry = "ecommerce"

    # Select stack mapping matching classification
    if industry == "fintech":
        return TechStackRecommendation(
            language="Python / Go",
            backend="FastAPI or Go Standard Library (high security & speed)",
            frontend="Next.js (React) + TypeScript (structured, robust interfaces)",
            database="PostgreSQL (ACID compliance & relational transactions)",
            hosting="AWS ECS/Fargate (secure VPC networks, HIPAA/PCI-DSS setups)",
            rationale="Fintech architectures require strong transactional guarantees, strict database schema models, and secure hosted virtual environments."
        )
    elif industry == "ai_ml":
        return TechStackRecommendation(
            language="Python",
            backend="FastAPI (high async request performance & python native integration)",
            frontend="Next.js (React) + TailwindCSS (premium styling & real-time socket flows)",
            database="PostgreSQL + ChromaDB / pgvector (hybrid search capability)",
            hosting="AWS Fargate with GPU attachments, or GCP Vertex integration",
            rationale="AI systems leverage Python for core inference, combined with specialized vector stores (like ChromaDB/pgvector) for Retrieval Augmented Generation."
        )
    elif industry == "ecommerce":
        return TechStackRecommendation(
            language="TypeScript / Node",
            backend="NestJS or MedusaJS (extensible Node e-commerce frameworks)",
            frontend="Next.js + Vercel (excellent SEO rankings and fast initial rendering)",
            database="PostgreSQL + Redis (for product catalog caching)",
            hosting="Vercel + Supabase (fast, serverless, scale-on-demand scaling)",
            rationale="E-commerce values SEO optimization, fast static site generation (Vercel), and responsive backend catalogs."
        )
    else:
        # Default B2B SaaS
        return TechStackRecommendation(
            language="Python / TypeScript",
            backend="FastAPI + SQLAlchemy 2.0 (high speed & modern async ORM)",
            frontend="Next.js 14 + Zustand (responsive state management)",
            database="PostgreSQL (robust default relational database)",
            hosting="Docker containers on Railway or Fly.io (developer-friendly, fast deploys)",
            rationale="Standard SaaS platforms prioritize developer velocity, async API speed (FastAPI), and straightforward deployment pipelines (Railway)."
        )
