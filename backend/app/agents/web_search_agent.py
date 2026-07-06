# web_search_agent.py
# Purpose: Research agent node performing web search and synthesis.
# Responsibilities:
#   - Parse user queries into keyword search strings
#   - Call Tavily search helper utilities
#   - Synthesize web findings into unified advisor reports using fast inference
# DO NOT: Parse user upload documents here.
# DO NOT: Query PostgreSQL startup tables directly.

import logging
from app.providers.provider_factory import ProviderFactory
from app.tools.web_search_tool import search_web
from app.agents.main_agent import AgentState

logger = logging.getLogger(__name__)


class WebSearchAgent:
    """Agent node responsible for real-time web research and compilation."""

    async def run(self, state: AgentState) -> AgentState:
        logger.info("WebSearchAgent: Initiating web research...")
        last_message = state["messages"][-1]["content"] if state.get("messages") else ""

        # Formulate search queries optimized for search engine retrieval
        query_prompt = (
            f"Given the user request: '{last_message}', write a single, optimized search engine query to fetch the "
            "most relevant and up-to-date startup information, competitors, or market trends. "
            "Respond ONLY with the search query text, without quotes, notes, or explanations."
        )

        try:
            fast_provider = ProviderFactory.get_fast_provider()
            query_response = await fast_provider.generate(prompt=query_prompt)
            search_query = query_response.content.strip().strip('"')

            # Search Tavily index
            search_results = await search_web(search_query, max_results=5)

            # Compile context
            context = "\n\n".join([
                f"Source: {res['url']}\nTitle: {res['title']}\nSnippet: {res['content']}"
                for res in search_results
            ])

            synthesis_prompt = (
                f"You are the Research Co-Founder at CoFoundr. Analyze the search results below to answer the user inquiry: '{last_message}'\n\n"
                f"Search Results:\n{context}\n\n"
                "Synthesize a highly professional, detailed analysis with bullet points, citing competitors or market metrics. "
                "Format URLs inline as citations. Be direct, startup-focused, and concise."
            )

            reasoning_provider = ProviderFactory.get_reasoning_provider()
            synthesis_response = await reasoning_provider.generate(
                prompt=synthesis_prompt,
                system_prompt="You are a professional YC partner and market research analyst. Provide top-tier professional advisory reports."
            )

            state["response"] = synthesis_response.content
            state["metadata"]["search_query"] = search_query
            state["metadata"]["search_results_count"] = len(search_results)

        except Exception as e:
            logger.error(f"WebSearchAgent: Execution failed: {e}")
            state["response"] = "I encountered an issue gathering web research data to answer your question."

        return state
