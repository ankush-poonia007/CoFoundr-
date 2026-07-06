# main_agent.py
# Purpose: Intent classifier and graph orchestrator node.
# Responsibilities:
#   - Classify user message intent using reasoning LLMs
#   - Set the routing state parameter next_agent to direct the workflow
# DO NOT: Run web searches or parse files in this node.
# DO NOT: Generate final advisory responses directly (delegate to domain agents).

import json
import logging
from typing import TypedDict, List, Dict, Any

from app.providers.provider_factory import ProviderFactory

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """Represents the global state passed between LangGraph agent nodes."""
    messages: List[Dict[str, Any]]
    startup_id: str | None
    next_agent: str | None
    response: str | None
    metadata: Dict[str, Any]


class MainAgent:
    """The orchestrator agent responsible for routing user inquiries to specialized nodes."""

    async def run(self, state: AgentState) -> AgentState:
        """
        Classifies user query intent and updates next_agent state route.
        """
        logger.info("MainAgent: Classifying user intent...")
        last_message = state["messages"][-1]["content"] if state.get("messages") else ""

        system_prompt = (
            "You are the Main Router for CoFoundr, an AI startup advisor.\n"
            "Your task is to classify the user's latest query into exactly one of four routing keys:\n\n"
            "1. 'web_search': If the query asks for live information, market sizes, trends, competitors, "
            "funding rounds, crunchbase, news, or general real-time industry research.\n"
            "2. 'rag': If the user explicitly asks about their uploaded documents, pitch decks, business files, "
            "or references 'our doc', 'my PDF', 'this uploaded file'.\n"
            "3. 'recommendation': If the query asks for startup scoring, technology stacks, MVP roadmaps, "
            "risk assessments, growth strategies, or investor readiness evaluations.\n"
            "4. 'end': If the query is a simple greeting, general conversation, or doesn't require tools or "
            "deep external resources to answer.\n\n"
            "You MUST respond ONLY with a raw JSON object containing the key 'intent' (with value 'web_search', "
            "'rag', 'recommendation', or 'end') and the key 'reasoning'. "
            "Do not include markdown tags like ```json or other text."
        )

        try:
            provider = ProviderFactory.get_reasoning_provider()
            response = await provider.generate(prompt=last_message, system_prompt=system_prompt)

            # Strip markdown formatting block tags if generated
            cleaned_content = response.content.strip().strip("`").replace("json\n", "").strip()
            result = json.loads(cleaned_content)
            intent = result.get("intent", "end")
            reasoning = result.get("reasoning", "")
            logger.info(f"MainAgent: Classified intent as '{intent}' because: {reasoning}")

            # Safe routing key default
            if intent not in ["web_search", "rag", "recommendation", "end"]:
                intent = "end"

            # Direct response if classified as 'end'
            direct_reply = None
            if intent == "end":
                direct_reply = response.content # Or we can let it go to END for default reply

            state["next_agent"] = intent
            if direct_reply and not state.get("response"):
                # If direct chat and no response, we can write a simple reply or let the service run
                pass

        except Exception as e:
            logger.error(f"MainAgent: Classification failed: {e}. Defaulting route to 'end'.")
            state["next_agent"] = "end"

        return state

    @staticmethod
    def route(state: AgentState) -> str:
        """
        Conditional edge router callback returning next node.
        """
        next_step = state.get("next_agent", "end")
        logger.info(f"MainAgent Edge Router: Routing workflow to '{next_step}'")
        return next_step
