# health_scorer_tool.py
# Purpose: Calculate a startup health score index.
# Responsibilities:
#   - Score startups across 5 dimensions using weighted heuristics
#   - Grade and return score summaries
# DO NOT: Run LLM model calls directly inside scoring functions.
# DO NOT: Load database instances (evaluate using passed dictionary inputs).

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
    if data.get("problem_statement"):
        score += 15
    if data.get("target_market"):
        score += 15
    if data.get("unique_value_proposition"):
        score += 20
    return min(score, 100)


def _score_team(data: dict) -> float:
    """Score team strength based on founder info."""
    score = 40.0
    if data.get("founder_name"):
        score += 20
    if data.get("team_size", 0) > 1:
        score += 20
    if data.get("domain_expertise"):
        score += 20
    return min(score, 100)


def _score_traction(data: dict) -> float:
    """Score traction based on stage and user metrics."""
    stage_scores = {
        "idea": 10,
        "validation": 25,
        "prototype": 40,
        "mvp": 55,
        "early": 70,
        "growing": 85,
        "scaling": 100,
    }
    # Treat enum objects or strings gracefully
    stage = data.get("stage", "idea")
    if hasattr(stage, "value"):
        stage = stage.value
    return stage_scores.get(str(stage), 10)


def _score_financials(data: dict) -> float:
    """Score financials based on revenue and business model clarity."""
    score = 30.0
    if data.get("business_model"):
        score += 25
    if data.get("revenue_model"):
        score += 25
    if data.get("has_revenue"):
        score += 20
    return min(score, 100)


def _score_competition(data: dict) -> float:
    """Score competitive position."""
    score = 50.0
    if data.get("competitors_known"):
        score += 25
    if data.get("competitive_advantage"):
        score += 25
    return min(score, 100)


def _get_grade(score: float) -> str:
    """Convert numeric score to letter grade."""
    if score >= 80:
        return "A"
    if score >= 65:
        return "B"
    if score >= 50:
        return "C"
    if score >= 35:
        return "D"
    return "F"


def _get_summary(score: float) -> str:
    """Return human-readable summary for the score."""
    if score >= 80:
        return "Strong startup with solid fundamentals."
    if score >= 65:
        return "Good foundation with areas to improve."
    if score >= 50:
        return "Average — needs work on key areas."
    if score >= 35:
        return "Early stage — significant gaps to address."
    return "High risk — foundational work needed."
