from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database.db import connection
from app.models.chat import ChatRequest, ChatResponse
from app.services.llm import ask_ai
from app.services.tools import calculate, current_time

router = APIRouter(prefix="/chat", tags=["Chat"])


def _save_conversation(conversation_id: str | None, request: ChatRequest, reply: str) -> str:
    now = datetime.now(timezone.utc).isoformat()
    with connection() as conn:
        if conversation_id is None:
            cur = conn.execute(
                "INSERT INTO conversations(title, created_at, updated_at) VALUES (?, ?, ?)",
                (request.message[:80].strip(), now, now),
            )
            conversation_id = str(cur.lastrowid)
        else:
            try:
                conversation_key = int(conversation_id)
            except (TypeError, ValueError) as exc:
                raise HTTPException(400, "Invalid conversation id") from exc
            exists = conn.execute("SELECT id FROM conversations WHERE id = ?", (conversation_key,)).fetchone()
            if not exists:
                raise HTTPException(404, "Conversation not found")
            conversation_id = str(conversation_key)
            conn.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_key))

        conversation_key = int(conversation_id)
        conn.execute(
            "INSERT INTO messages(conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
            (conversation_key, "user", request.message, now),
        )
        conn.execute(
            "INSERT INTO messages(conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
            (conversation_key, "assistant", reply, now),
        )
        conn.commit()
    return conversation_id


@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    value = request.message.strip()
    if not value:
        raise HTTPException(400, "Message cannot be empty")

    lower = value.lower()
    used_tool = None
    if lower.startswith("/calc "):
        try:
            reply = calculate(value[6:].strip())
            used_tool = "calculator"
        except Exception as exc:
            reply = f"Calculator error: {exc}"
    elif lower in {"/time", "what time is it", "what's the time", "current time"}:
        reply = current_time()
        used_tool = "clock"
    else:
        reply = ask_ai(value, request.history)

    conversation_id = _save_conversation(request.conversation_id, request, reply)
    return ChatResponse(reply=reply, conversation_id=conversation_id, used_tool=used_tool)


@router.get("/conversations")
def conversations():
    with connection() as conn:
        rows = conn.execute("SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC").fetchall()
    return [{**dict(row), "id": str(row["id"])} for row in rows]


@router.get("/conversations/{conversation_id}")
def conversation(conversation_id: str):
    try:
        conversation_key = int(conversation_id)
    except ValueError as exc:
        raise HTTPException(400, "Invalid conversation id") from exc
    with connection() as conn:
        exists = conn.execute("SELECT 1 FROM conversations WHERE id = ?", (conversation_key,)).fetchone()
        if not exists:
            raise HTTPException(404, "Conversation not found")
        rows = conn.execute(
            "SELECT sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY id",
            (conversation_key,),
        ).fetchall()
    return [dict(row) for row in rows]
