from typing import Literal

from pydantic import BaseModel, Field


class Message(BaseModel):
    id: int | None = None
    sender: Literal["user", "assistant"]
    text: str = Field(min_length=1, max_length=20000)
    timestamp: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=20000)
    history: list[Message] = Field(default_factory=list)
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    used_tool: str | None = None
