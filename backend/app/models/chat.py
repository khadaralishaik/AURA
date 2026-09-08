from pydantic import BaseModel, Field
from typing import Any


class Message(BaseModel):
    id: int | None = None
    sender: str
    text: str
    timestamp: str | None = None


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)
    history: list[dict[str, Any]] = Field(default_factory=list)
    conversation_id: int | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: int
    used_tool: str | None = None
