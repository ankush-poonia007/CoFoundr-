# mvp_generator_tool.py
# Purpose: Formulate MVP roadmap definitions.
# Responsibilities:
#   - Compile core feature backlog items and timeline phase recommendations based on startup development stage
#   - Expose roadmap dictionaries mapping phases to feature components
# DO NOT: Run LLM model calls directly inside rules.
# DO NOT: Direct database integrations.

import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class MVPRoadmap:
    """Represents compiled MVP roadmap definition details."""
    target_timeline: str
    phases: list[dict]
    key_features: list[str]


def generate_mvp_roadmap(startup_data: dict) -> MVPRoadmap:
    """
    Construct a step-by-step MVP feature roadmap based on startup details.

    Args:
        startup_data: Dictionary of startup metrics.

    Returns:
        MVPRoadmap: Timeline phases and core backlog items.
    """
    logger.info(f"Generating MVP Roadmap for: {startup_data.get('name', 'Unknown')}")

    stage = startup_data.get("stage", "idea")
    if hasattr(stage, "value"):
        stage = stage.value

    # Adjust roadmap velocity depending on startup developmental stage
    if str(stage) in ["idea", "validation"]:
        timeline = "4-6 Weeks"
        phases = [
            {
                "phase": "Phase 1: User Discovery & Mockups",
                "duration": "2 Weeks",
                "goal": "Validate problem statement with landing pages and clickable prototypes."
            },
            {
                "phase": "Phase 2: Core Flow Implementation",
                "duration": "3 Weeks",
                "goal": "Build minimal backend routing and basic landing signups."
            },
            {
                "phase": "Phase 3: Feedback Cycle",
                "duration": "1 Week",
                "goal": "Deploy and test with initial beta cohort."
            }
        ]
        features = ["Landing Page with Email Capture", "Analytics tracking integration", "Basic User onboarding signup flow"]
    elif str(stage) in ["prototype", "mvp"]:
        timeline = "8-12 Weeks"
        phases = [
            {
                "phase": "Phase 1: Infrastructure & DB Schema Setup",
                "duration": "3 Weeks",
                "goal": "Wired database base, auth mechanisms, and API layers."
            },
            {
                "phase": "Phase 2: Core UVP Feature Build",
                "duration": "6 Weeks",
                "goal": "Implement key functional features representing value proposition."
            },
            {
                "phase": "Phase 3: Security & Polish",
                "duration": "2 Weeks",
                "goal": "Implement input validations, error catching, and visual polishing."
            },
            {
                "phase": "Phase 4: Release & Launch",
                "duration": "1 Week",
                "goal": "Production deploy and launch script runs."
            }
        ]
        features = ["User Authentication & OAuth", "Core UVP dashboard flow", "Data exports & analytics charts", "Billing/Stripe placeholder integrations"]
    else:
        timeline = "12-16 Weeks"
        phases = [
            {
                "phase": "Phase 1: Refactoring & Scale Prep",
                "duration": "4 Weeks",
                "goal": "Clean legacy skeletons, index database tables, configure cache engines."
            },
            {
                "phase": "Phase 2: Automation & Notifications",
                "duration": "6 Weeks",
                "goal": "Wired background workers, transactional email, and dashboard logs."
            },
            {
                "phase": "Phase 3: Optimization & Release",
                "duration": "4 Weeks",
                "goal": "Performance test execution, CDN setups, and scaling load tests."
            }
        ]
        features = ["Realtime WebSocket feeds", "Background workers & queues", "Role-based authorization", "Advanced reports engine"]

    return MVPRoadmap(
        target_timeline=timeline,
        phases=phases,
        key_features=features
    )
