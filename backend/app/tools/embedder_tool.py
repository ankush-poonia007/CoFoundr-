# embedder_tool.py
# Purpose: Generate vector embeddings using LLM provider factory.
# Responsibilities:
#   - Expose interfaces for embedding single words or list of document fragments
#   - Call LLM Provider layer to retrieve vector arrays
# DO NOT: Instantiate API clients directly (use ProviderFactory).
# DO NOT: Store vectors or manage DB operations here.

import logging
from app.providers.provider_factory import ProviderFactory

logger = logging.getLogger(__name__)


async def embed_text(text: str) -> list[float]:
    """
    Generate an embedding vector for a single text fragment.

    Args:
        text: Input string.

    Returns:
        list[float]: Embedding vector.
    """
    provider = ProviderFactory.get_reasoning_provider()  # Returns GeminiProvider
    return await provider.embed(text)


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate embedding vectors for multiple text fragments.

    Args:
        texts: List of strings.

    Returns:
        list[list[float]]: List of embedding vectors.
    """
    provider = ProviderFactory.get_reasoning_provider()
    embeddings = []
    for text in texts:
        vector = await provider.embed(text)
        embeddings.append(vector)
    return embeddings
