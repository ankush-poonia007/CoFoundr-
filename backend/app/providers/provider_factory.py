# provider_factory.py
# Purpose: Factory for creating LLM provider instances.
# Responsibilities:
#   - Instantiate and return provider adapters dynamically based on name or task type
#   - Expose specific helper methods for reasoning and fast tool-calling tasks
# DO NOT: Use specific provider classes directly inside agents or services. Always use this factory.
# DO NOT: Instantiate new provider connections on every request (cache instances in _providers).

import logging
from app.providers.base_provider import BaseProvider
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider

logger = logging.getLogger(__name__)


class ProviderFactory:
    """
    Factory class for LLM providers.

    Usage:
        provider = ProviderFactory.get_provider("gemini")
        response = await provider.generate(prompt="Hello")
    """

    _providers: dict[str, BaseProvider] = {}

    @classmethod
    def get_provider(cls, provider_name: str) -> BaseProvider:
        """
        Get or create a provider instance by name.

        Args:
            provider_name: "gemini" or "groq"

        Returns:
            BaseProvider: The requested provider instance.

        Raises:
            ValueError: If provider name is not supported.
        """
        if provider_name not in cls._providers:
            logger.info(f"Initializing provider: {provider_name}")
            if provider_name == "gemini":
                cls._providers[provider_name] = GeminiProvider()
            elif provider_name == "groq":
                cls._providers[provider_name] = GroqProvider()
            else:
                raise ValueError(f"Unsupported provider: {provider_name}")

        return cls._providers[provider_name]

    @classmethod
    def get_reasoning_provider(cls) -> BaseProvider:
        """Returns Gemini Flash for complex reasoning tasks."""
        return cls.get_provider("gemini")

    @classmethod
    def get_fast_provider(cls) -> BaseProvider:
        """Returns Groq for fast tool-calling tasks."""
        return cls.get_provider("groq")
