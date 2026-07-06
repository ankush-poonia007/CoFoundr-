# graph.py
# Purpose: Define the LangGraph multi-agent graph.
# Responsibilities:
#   - Register all specialized agent nodes (Main, WebSearch, RAG, Recommendation)
#   - Configure conditional routing edges and compile graph runnable
# DO NOT: Write business tools or API routing controllers here.
# DO NOT: Write direct LLM client requests in this module.

import logging
from langgraph.graph import StateGraph, END
from app.agents.main_agent import MainAgent, AgentState
from app.agents.web_search_agent import WebSearchAgent
from app.agents.rag_agent import RAGAgent
from app.agents.recommendation_agent import RecommendationAgent

logger = logging.getLogger(__name__)


def build_agent_graph() -> StateGraph:
    """
    Build and compile the LangGraph multi-agent graph.

    Graph Flow:
        main_agent → (routes to) → web_search_agent | rag_agent | recommendation_agent
        all agents → response_optimizer (or END) → END

    Returns:
        Compiled LangGraph StateGraph
    """
    graph = StateGraph(AgentState)

    # ─── Register Nodes ───────────────────────────────────────────────────────
    graph.add_node("main_agent", MainAgent().run)
    graph.add_node("web_search_agent", WebSearchAgent().run)
    graph.add_node("rag_agent", RAGAgent().run)
    graph.add_node("recommendation_agent", RecommendationAgent().run)

    # ─── Entry Point ──────────────────────────────────────────────────────────
    graph.set_entry_point("main_agent")

    # ─── Conditional Routing ──────────────────────────────────────────────────
    graph.add_conditional_edges(
        "main_agent",
        MainAgent.route,
        {
            "web_search": "web_search_agent",
            "rag": "rag_agent",
            "recommendation": "recommendation_agent",
            "end": END,
        },
    )

    # ─── Routing edges back to termination node ────────────────────────────────
    graph.add_edge("web_search_agent", END)
    graph.add_edge("rag_agent", END)
    graph.add_edge("recommendation_agent", END)

    return graph.compile()


# ─── Compiled graph instance (used by services) ───────────────────────────────
agent_graph = build_agent_graph()
