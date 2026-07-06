# chat.py
# Purpose: Chat interactions API endpoint router.
# Responsibilities:
#   - Route chat session creations and log retrieval queries to ChatService
#   - Route client user messages to LangGraph agent threads
# DO NOT: Write raw business processing or agent trigger scripts directly here.
# DO NOT: Query database transaction logs from API router controllers.

import logging
import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user_id
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatMessageCreate,
    ChatMessageResponse,
)
from app.services.chat_service import ChatService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chats")


@router.get("", response_model=List[ChatSessionResponse])
async def list_sessions(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all active chat sessions belonging to the authenticated user."""
    logger.info(f"Listing chat sessions for user: {user_id}")
    return await ChatService(db).list_sessions(user_id)


@router.post("", response_model=ChatSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: ChatSessionCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Start a new advisor chat thread session."""
    logger.info(f"Creating new chat session for user: {user_id}")
    return await ChatService(db).create_session(user_id, payload)


@router.get("/{id}", response_model=ChatSessionDetailResponse)
async def get_session(
    id: uuid.UUID,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a detailed chat session containing message history transcripts."""
    logger.info(f"Fetching chat session: {id} for user: {user_id}")
    return await ChatService(db).get_session(id, user_id)


@router.post("/{id}/messages", response_model=ChatMessageResponse)
async def send_message(
    id: uuid.UUID,
    payload: ChatMessageCreate,
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Post a message to a session, executing the multi-agent decision graph."""
    logger.info(f"Posting user message in session: {id} for user: {user_id}")
    return await ChatService(db).send_message(id, user_id, payload)
