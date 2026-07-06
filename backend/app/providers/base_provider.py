# base_provider.py
# Purpose: Abstract base class for all LLM providers.
# Responsibilities:
#   - Define standard generator and embedder interfaces for AI providers
#   - Define standard ProviderResponse response format
# DO NOT: Add API-specific configuration, client keys, or logic inside this base.
# DO NOT: Import Google or Groq SDK libraries directly in this file.

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ProviderResponse:
    """Normalized response from any LLM provider."""
    content: str
    model: str
    provider: str
    tokens_used: int | None = None


class BaseProvider(ABC):
    """
    Abstract base class for LLM providers.
    All providers (Gemini, Groq) must implement this interface.
    This ensures the rest of the app is provider-independent.
    """

    @abstractmethod
    async def generate(
        self,
        prompt: str,
        system_prompt: str | None = None,
    ) -> ProviderResponse:
        """
        Generate a text response for the given prompt.

        Args:
            prompt: The user prompt to send to the model.
            system_prompt: Optional system-level instructions.

        Returns:
            ProviderResponse: Normalized response object.
        """
        pass

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """
        Generate an embedding vector for the given text.

        Args:
            text: The text to embed.

        Returns:
            list[float]: Embedding vector.
        """
        pass
