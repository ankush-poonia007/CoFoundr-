# web_search_tool.py
# Purpose: Tavily web search tool integration.
# Responsibilities:
#   - Expose query search parameters for competitor analyses, market reports, and tech recommendation tools
#   - Return structured dictionary results mapping URLs, titles, and text contents
# DO NOT: Summarize, write, or evaluate search output content inside this file.
# DO NOT: Call raw LLM interfaces.

import logging
from tavily import TavilyClient
from app.core.config import settings

logger = logging.getLogger(__name__)

# ─── Tavily client singleton ──────────────────────────────────────────────────
_tavily_client: TavilyClient | None = None


def get_tavily_client() -> TavilyClient:
    """Return singleton Tavily client."""
    global _tavily_client
    if _tavily_client is None:
        _tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
    return _tavily_client


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    """
    Search the web using Tavily API.

    Args:
        query: Search query string.
        max_results: Maximum number of results to return.

    Returns:
        list[dict]: List of search results with title, url, and content.
    """
    logger.info(f"Web search query: {query}")
    client = get_tavily_client()
    response = client.search(query=query, max_results=max_results)
    return response.get("results", [])


async def search_competitors(startup_name: str, industry: str) -> list[dict]:
    """Search for competitors of a given startup."""
    query = f"{startup_name} competitors {industry} startups 2026"
    return await search_web(query)


async def search_market_size(industry: str) -> list[dict]:
    """Search for market size and TAM/SAM/SOM data."""
    query = f"{industry} market size TAM SAM SOM 2026 report"
    return await search_web(query)


async def search_funding(startup_name: str) -> list[dict]:
    """Search for funding rounds and investor information."""
    query = f"{startup_name} funding rounds investors crunchbase 2026"
    return await search_web(query)


async def search_tech_stack(use_case: str) -> list[dict]:
    """Search for recommended tech stacks for a given use case."""
    query = f"best tech stack for {use_case} startup 2026"
    return await search_web(query)
