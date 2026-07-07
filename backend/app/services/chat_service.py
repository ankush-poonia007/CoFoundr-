# chat_service.py
# Purpose: Service layer orchestrating database transactions and agent graph sessions.
# Responsibilities:
#   - Manage ChatSession creation and fetch threads per user ID
#   - Build state, trigger LangGraph compiled runnable, and persist chat outputs
# DO NOT: Run raw HTTP routing requests inside service methods.
# DO NOT: Write SQL query strings directly (use repository classes).

import logging
import uuid
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.agents.graph import agent_graph
from app.models.enums import MessageRole, ReportType
from app.repositories.chat_repository import ChatRepository
from app.repositories.startup_repository import StartupRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.chat import (
    ChatSessionCreate,
    ChatSessionResponse,
    ChatSessionDetailResponse,
    ChatMessageCreate,
    ChatMessageResponse,
)

logger = logging.getLogger(__name__)


class ChatService:
    """Service class executing database transactions and agent graph workflows for chat endpoints."""

    def __init__(self, db: AsyncSession):
        self.chat_repo = ChatRepository(db)
        self.startup_repo = StartupRepository(db)
        self.db = db

    async def list_sessions(self, user_id: uuid.UUID) -> List[ChatSessionResponse]:
        """Fetch all chat sessions owned by the user."""
        sessions = await self.chat_repo.get_by_user_id(user_id)
        return [ChatSessionResponse.model_validate(s) for s in sessions]

    async def get_session(self, session_id: uuid.UUID, user_id: uuid.UUID) -> ChatSessionDetailResponse:
        """Retrieve details of a chat session, validating ownership."""
        session = await self.chat_repo.get_with_messages(session_id)
        if not session or session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found."
            )
        return ChatSessionDetailResponse.model_validate(session)

    async def create_session(self, user_id: uuid.UUID, payload: ChatSessionCreate) -> ChatSessionResponse:
        """Provision a new chat session, checking startup ownership if startup_id is provided."""
        if payload.startup_id:
            startup = await self.startup_repo.get(payload.startup_id)
            if not startup or startup.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Startup profile not found."
                )

        session = await self.chat_repo.create({
            "user_id": user_id,
            "title": payload.title or "New Advisor Thread",
            "startup_id": payload.startup_id,
        })
        return ChatSessionResponse.model_validate(session)

    async def send_message(
        self,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        payload: ChatMessageCreate
    ) -> ChatMessageResponse:
        """
        Accepts a user message, logs it, runs the LangGraph multi-agent network,
        persists the assistant's reply, and returns the response payload.
        """
        # 1. Load session and verify ownership
        session = await self.chat_repo.get_with_messages(session_id)
        if not session or session.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Chat session not found."
            )

        # 2. Append the user message to database logs
        user_msg = await self.chat_repo.create_message(
            chat_session_id=session_id,
            role=MessageRole.USER,
            content=payload.content,
            metadata_json=payload.metadata_json
        )

        # 3. Build history state context for the agent graph
        history_limit = 10
        recent_messages = session.messages[-history_limit:] if session.messages else []
        state_messages = []
        for msg in recent_messages:
            state_messages.append({"role": msg.role.value, "content": msg.content})

        # Append latest message if not already captured
        if not any(m["content"] == payload.content for m in state_messages):
            state_messages.append({"role": "user", "content": payload.content})

        # 4. Construct LangGraph AgentState with startup profile context
        startup_data = None
        if session.startup_id:
            startup = await self.startup_repo.get(session.startup_id)
            if startup:
                startup_data = {
                    "id": str(startup.id),
                    "name": startup.name,
                    "tagline": startup.tagline,
                    "problem_statement": startup.problem_statement,
                    "solution_description": startup.solution_description,
                    "target_market": startup.target_market,
                    "unique_value_proposition": startup.unique_value_proposition,
                    "founder_name": startup.founder_name,
                    "team_size": startup.team_size,
                    "domain_expertise": startup.domain_expertise,
                    "stage": startup.stage.value if hasattr(startup.stage, "value") else startup.stage,
                    "business_model": startup.business_model,
                    "revenue_model": startup.revenue_model,
                    "has_revenue": startup.has_revenue,
                    "competitors_known": startup.competitors_known,
                    "competitive_advantage": startup.competitive_advantage,
                    "health_score": startup.health_score,
                }

        initial_state = {
            "messages": state_messages,
            "startup_id": str(session.startup_id) if session.startup_id else None,
            "next_agent": None,
            "response": None,
            "metadata": {
                "startup_data": startup_data
            }
        }

        try:
            # 5. Invoke LangGraph multi-agent system
            result = await agent_graph.ainvoke(initial_state)

            agent_response = result.get("response")
            if not agent_response:
                agent_response = (
                    "I analyzed your request but did not receive a direct output from my advisory agents. "
                    "How else can I support your startup?"
                )

            # Retrieve token metrics if present
            tokens = result.get("metadata", {}).get("tokens_used")

            # 6. Save assistant's reply message
            assistant_msg = await self.chat_repo.create_message(
                chat_session_id=session_id,
                role=MessageRole.ASSISTANT,
                content=agent_response,
                tokens_used=tokens,
                metadata_json=result.get("metadata")
            )

            # Auto-save report if health_score was computed in metadata by recommendation agent
            health_score = result.get("metadata", {}).get("health_score")
            if session.startup_id and health_score is not None:
                # Update startup's health_score field permanently
                startup = await self.startup_repo.get(session.startup_id)
                if startup:
                    await self.startup_repo.update(startup, {"health_score": health_score})

                report_repo = ReportRepository(self.db)
                await report_repo.create({
                    "startup_id": session.startup_id,
                    "report_type": ReportType.INVESTOR_READINESS,
                    "content": agent_response,
                    "score": health_score,
                    "metadata_json": result.get("metadata")
                })

            # Ensure session is committed
            await self.db.commit()

            return ChatMessageResponse.model_validate(assistant_msg)

        except Exception as e:
            logger.error(f"ChatService: Agent workflow execution failed: {e}")
            await self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve AI advisor response."
            )
