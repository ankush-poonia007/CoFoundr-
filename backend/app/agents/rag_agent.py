# rag_agent.py
# Purpose: Retrieval-augmented generation agent node.
# Responsibilities:
#   - Fetch vector similarity matches from ChromaDB collections
#   - Compile document chunks into system prompt context
#   - Generate context-grounded advisory answers
# DO NOT: Parse files directly inside the agent node (use file_parser_tool.py).
# DO NOT: Run generic web searches (delegate to web_search_agent.py).

import logging
import uuid
from app.providers.provider_factory import ProviderFactory
from app.tools.hybrid_search_tool import search_documents
from app.agents.main_agent import AgentState

logger = logging.getLogger(__name__)


class RAGAgent:
    """Agent node responsible for analyzing uploaded pitch decks and business documents."""

    async def run(self, state: AgentState) -> AgentState:
        logger.info("RAGAgent: Initiating document analysis...")
        last_message = state["messages"][-1]["content"] if state.get("messages") else ""
        startup_id_str = state.get("startup_id")

        if not startup_id_str:
            state["response"] = (
                "To analyze files, please register a startup profile and upload documents "
                "(such as a Pitch Deck, Business Plan, or Tech Spec)."
            )
            return state

        try:
            startup_id = uuid.UUID(startup_id_str)
            # Query vector similarity database
            matches = await search_documents(startup_id=startup_id, query=last_message, limit=4)

            if not matches:
                state["response"] = (
                    "I searched your startup folder, but couldn't find any relevant text. "
                    "Please upload a Pitch Deck, PDF, or text file to provide context."
                )
                return state

            # Compile matches as grounded context
            context = "\n\n".join([
                f"Document Source: {m['metadata'].get('filename', 'Unknown')}\nSnippet:\n{m['content']}"
                for m in matches
            ])

            rag_prompt = (
                f"You are the RAG Co-Founder at CoFoundr. Analyze the uploaded startup documentation snippets below to answer: '{last_message}'\n\n"
                f"Context from Uploaded Files:\n{context}\n\n"
                "Provide a precise, detailed reply solely grounded on the context facts. "
                "If the context doesn't have enough details, explain what is missing. Mention the source file names when answering."
            )

            provider = ProviderFactory.get_reasoning_provider()
            response = await provider.generate(
                prompt=rag_prompt,
                system_prompt="You are a professional advisory co-founder. Base your answers strictly on the user's uploaded business files."
            )

            state["response"] = response.content
            state["metadata"]["rag_matches_count"] = len(matches)
            state["metadata"]["rag_sources"] = list(set([m['metadata'].get('filename') for m in matches if m['metadata'].get('filename')]))

        except Exception as e:
            logger.error(f"RAGAgent: Execution failed: {e}")
            state["response"] = "I encountered an issue querying your startup documents."

        return state
