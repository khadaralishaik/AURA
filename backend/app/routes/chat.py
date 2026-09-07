from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.llm import ask_ai

router = APIRouter(prefix="/chat", tags=["Chat"])


class Message(BaseModel):
    sender: str
    text: str
    timestamp: str


class ChatRequest(BaseModel):
    message: str
    history: List[Message] = Field(default_factory=list)


@router.post("/")
async def chat(request: ChatRequest):
    reply = ask_ai(request.message, request.history)
    return {"reply": reply}
