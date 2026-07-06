# test_providers.py
# Purpose: Unit tests for LLM providers and factory.
# Responsibilities:
#   - Validate ProviderFactory outputs the correct LLM adapter class instances
# DO NOT: Execute live API generation calls during basic unit tests.

import pytest
from app.providers.provider_factory import ProviderFactory
from app.providers.gemini_provider import GeminiProvider
from app.providers.groq_provider import GroqProvider


def test_provider_factory():
    """Verify factory returns appropriate provider singletons."""
    gemini = ProviderFactory.get_provider("gemini")
    groq = ProviderFactory.get_provider("groq")

    assert isinstance(gemini, GeminiProvider)
    assert isinstance(groq, GroqProvider)

    # Assert singletons are cached
    assert ProviderFactory.get_provider("gemini") is gemini
    assert ProviderFactory.get_provider("groq") is groq

    with pytest.raises(ValueError):
        ProviderFactory.get_provider("unsupported_provider_name")
