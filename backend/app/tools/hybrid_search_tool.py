# hybrid_search_tool.py
# Purpose: ChromaDB client integration for vector document search.
# Responsibilities:
#   - Connect to ChromaDB (with automatic local Ephemeral fallback)
#   - Store and chunk text segments with metadata attributes
#   - Query matching fragments using vector cosine similarities
# DO NOT: Run file parsing or regex cleanings here (use file_parser_tool.py).
# DO NOT: Run LLM prompt formatting or responses here.

import logging
import uuid
import chromadb

from app.core.config import settings
from app.tools.embedder_tool import embed_text, embed_texts

logger = logging.getLogger(__name__)

# ChromaDB collection identifier
COLLECTION_NAME = "cofoundr_documents"

_chroma_client = None


def get_chroma_client():
    """Return singleton ChromaDB client, falling back to Ephemeral client on failure."""
    global _chroma_client
    if _chroma_client is None:
        try:
            logger.info(f"Connecting to ChromaDB at {settings.CHROMA_HOST}:{settings.CHROMA_PORT}...")
            _chroma_client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT
            )
            # Verify socket connectivity using heartbeat
            _chroma_client.heartbeat()
            logger.info("ChromaDB HttpClient connected successfully.")
        except Exception as e:
            logger.warning(f"Failed to connect to ChromaDB HttpClient: {e}. Falling back to EphemeralClient.")
            _chroma_client = chromadb.EphemeralClient()
    return _chroma_client


async def index_document(startup_id: uuid.UUID, filename: str, content: str) -> int:
    """
    Chunk and index a document in ChromaDB under a startup_id.

    Args:
        startup_id: The UUID of the startup.
        filename: Name of the source file.
        content: Clean text content extracted from file.

    Returns:
        int: Number of chunks indexed.
    """
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    # 1. Chunk document (sliding character window)
    chunks = _chunk_text(content, chunk_size=1000, chunk_overlap=200)
    if not chunks:
        return 0

    # 2. Embed chunks
    embeddings = await embed_texts(chunks)

    # 3. Insert into ChromaDB collection
    ids = [f"{startup_id}_{filename}_{i}" for i in range(len(chunks))]
    metadatas = [{"startup_id": str(startup_id), "filename": filename, "chunk": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas
    )
    logger.info(f"Successfully indexed {len(chunks)} chunks for startup: {startup_id} from {filename}")
    return len(chunks)


async def search_documents(startup_id: uuid.UUID, query: str, limit: int = 5) -> list[dict]:
    """
    Query database for chunks related to a startup matching vector similarity.

    Args:
        startup_id: The UUID of the startup.
        query: User text search query.
        limit: Number of matching chunks to return.

    Returns:
        list[dict]: List of document dictionaries.
    """
    client = get_chroma_client()
    collection = client.get_or_create_collection(name=COLLECTION_NAME)

    # Generate query embedding
    query_vector = await embed_text(query)

    # Query collection matching startup_id filter metadata
    results = collection.query(
        query_embeddings=[query_vector],
        n_results=limit,
        where={"startup_id": str(startup_id)}
    )

    # Format results
    formatted_results = []
    if results and results.get("documents"):
        documents = results["documents"][0]
        metadatas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(documents)
        distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)

        for i in range(len(documents)):
            formatted_results.append({
                "content": documents[i],
                "metadata": metadatas[i],
                "score": float(distances[i])
            })

    return formatted_results


def _chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> list[str]:
    """Splits a document text into overlapping chunks."""
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - chunk_overlap
    return chunks
