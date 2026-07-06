# risk_analyzer_tool.py
# Purpose: Formulate startup risk profile evaluations.
# Responsibilities:
#   - Compute risk categories based on team size, revenue status, stage, and competitor details
#   - Format risk profiles containing rating labels (Low, Medium, High)
# DO NOT: Run LLM model calls directly inside calculation logic.
# DO NOT: Connect to database instances.

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class RiskBreakdown:
    """Represents compiled risk evaluation details."""
    market_risk: str
    execution_risk: str
    financial_risk: str
    tech_risk: str
    overall_rating: str
    concerns: list[str]


def analyze_startup_risks(startup_data: dict) -> RiskBreakdown:
    """
    Perform a multi-dimensional risk assessment on startup profile data.

    Args:
        startup_data: Dictionary of startup metrics.

    Returns:
        RiskBreakdown: Computed risk dimensions and concerns list.
    """
    logger.info(f"Analyzing risks for startup: {startup_data.get('name', 'Unknown')}")

    # 1. Market Risk
    market_risk = "Medium"
    if not startup_data.get("unique_value_proposition") or not startup_data.get("target_market"):
        market_risk = "High"
    elif startup_data.get("competitors_known") and startup_data.get("competitive_advantage"):
        market_risk = "Low"

    # 2. Execution Risk (single founder dependency check)
    execution_risk = "Medium"
    team_size = startup_data.get("team_size", 1)
    if team_size == 1:
        execution_risk = "High"
    elif team_size > 3 and startup_data.get("domain_expertise"):
        execution_risk = "Low"

    # 3. Financial Risk (revenue validation check)
    financial_risk = "High"
    if startup_data.get("has_revenue"):
        financial_risk = "Low"
    elif startup_data.get("business_model") or startup_data.get("revenue_model"):
        financial_risk = "Medium"

    # 4. Tech Risk (product maturity check)
    tech_risk = "Medium"
    stage = startup_data.get("stage", "idea")
    if hasattr(stage, "value"):
        stage = stage.value
    if str(stage) in ["idea", "validation"]:
        tech_risk = "High"
    elif str(stage) in ["growing", "scaling"]:
        tech_risk = "Low"

    # 5. Compile specific concerns
    concerns = []
    if team_size == 1:
        concerns.append("Single founder bottleneck: high operational dependency.")
    if not startup_data.get("has_revenue"):
        concerns.append("Zero active revenue: high burn rate vulnerability.")
    if not startup_data.get("unique_value_proposition"):
        concerns.append("Missing distinct Unique Value Proposition (UVP).")
    if not startup_data.get("competitors_known"):
        concerns.append("Unidentified market landscape; lack of competitor profiling.")

    # Calculate overall risk status
    high_count = [market_risk, execution_risk, financial_risk, tech_risk].count("High")
    if high_count >= 2:
        overall = "High"
    elif high_count == 1:
        overall = "Medium"
    else:
        overall = "Low"

    return RiskBreakdown(
        market_risk=market_risk,
        execution_risk=execution_risk,
        financial_risk=financial_risk,
        tech_risk=tech_risk,
        overall_rating=overall,
        concerns=concerns,
    )
