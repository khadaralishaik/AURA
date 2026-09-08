from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.services.llm import ask_ai
from app.services.tools import calculate, current_time
from app.database.db import connection

router = APIRouter(prefix="/chat", tags=["Chat"])


def _save_conversation(conversation_id: int | None, request: ChatRequest, reply: str) -> int:
    now = datetime.now(timezone.utc).isoformat()
    with connection() as conn:
        if conversation_id is None:
            cur = conn.execute(
                "INSERT INTO conversations(title, created_at, updated_at) VALUES (?, ?, ?)",
                (request.message[:80].strip(), now, now),
            )
            conversation_id = int(cur.lastrowid)
        else:
            exists = conn.execute("SELECT id FROM conversations WHERE id = ?", (conversation_id,)).fetchone()
            if not exists:
                raise HTTPException(404, "Conversation not found")
            conn.execute("UPDATE conversations SET updated_at = ? WHERE id = ?", (now, conversation_id))

        conn.execute(
            "INSERT INTO messages(conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
            (conversation_id, "user", request.message, now),
        )
        conn.execute(
            "INSERT INTO messages(conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?)",
            (conversation_id, "assistant", reply, now),
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
        rows = conn.execute(
            "SELECT id, title, created_at, updated_at FROM conversations ORDER BY updated_at DESC"
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/conversations/{conversation_id}")
def conversation(conversation_id: int):
    with connection() as conn:
        rows = conn.execute(
            "SELECT sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY id",
            (conversation_id,),
        ).fetchall()
    return [dict(r) for r in rows]
