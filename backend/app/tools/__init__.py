# __init__.py
# Purpose: Initialize the tools package.
# Responsibilities:
#   - Expose the Tavily search client, file parser, and ChromaDB hybrid search tools
# DO NOT: Put search, vector DB logic, or parser functions directly inside this file.

from app.tools.web_search_tool import (
    search_web,
    search_competitors,
    search_market_size,
    search_funding,
    search_tech_stack,
)
from app.tools.file_parser_tool import parse_file
from app.tools.embedder_tool import embed_text, embed_texts
from app.tools.hybrid_search_tool import index_document, search_documents
