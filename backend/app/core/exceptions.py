# exceptions.py
# Purpose: Define all custom exception classes for the application.
# Responsibilities:
#   - Define domain-specific exceptions for CoFoundr app
#   - Provide consistent error messages and HTTP status integration
# DO NOT: Catch exceptions here. Only define them.
# DO NOT: Import from services or agents (circular imports).

from fastapi import HTTPException, status


class StartupAgentException(Exception):
    """Base exception for all CoFoundr errors."""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)


class NotFoundException(HTTPException):
    """Raised when a resource is not found."""
    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with id '{resource_id}' not found.",
        )


class UnauthorizedException(HTTPException):
    """Raised when user is not authenticated."""
    def __init__(self, message: str = "Not authenticated."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(HTTPException):
    """Raised when user lacks permission."""
    def __init__(self, message: str = "Permission denied."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
        )


class ValidationException(HTTPException):
    """Raised when input validation fails."""
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message,
        )


class AgentException(StartupAgentException):
    """Raised when an agent fails to execute."""
    pass


class ProviderException(StartupAgentException):
    """Raised when an LLM provider fails."""
    pass


class FileParsingException(StartupAgentException):
    """Raised when file parsing fails."""
    pass
