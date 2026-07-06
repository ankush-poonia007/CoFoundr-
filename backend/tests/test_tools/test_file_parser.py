# test_file_parser.py
# Purpose: Unit tests for document parser.
# Responsibilities:
#   - Test plain text file parsing decoding
#   - Test invalid format exception raising
# DO NOT: Load very large files in tests.

import pytest
from app.tools.file_parser_tool import parse_file
from app.core.exceptions import FileParsingException


def test_parse_text_file():
    """Verify parsing a plain text file bytes works successfully."""
    content = b"Hello, this is CoFoundr pitch deck context!"
    result = parse_file(content, "pitch.txt")
    assert result == "Hello, this is CoFoundr pitch deck context!"


def test_parse_invalid_extension():
    """Verify parser raises FileParsingException for unsupported files."""
    with pytest.raises(FileParsingException):
        parse_file(b"dummy bytes", "document.exe")
