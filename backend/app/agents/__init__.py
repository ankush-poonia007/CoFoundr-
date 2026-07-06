# __init__.py
# Purpose: Initialize the agents package.
# Responsibilities:
#   - Expose the compiled agent_graph and AgentState definitions
# DO NOT: Place state transitions or graph build logic directly in this initialization file.

from app.agents.main_agent import AgentState
from app.agents.graph import agent_graph
