from ..database.db import connection


def list_memories() -> list[dict]:
    with connection() as conn:
        rows = conn.execute("SELECT id, content, created_at FROM memories ORDER BY id DESC").fetchall()
    return [dict(row) for row in rows]


def add_memory(content: str) -> dict:
    with connection() as conn:
        cur = conn.execute("INSERT INTO memories(content) VALUES (?)", (content.strip(),))
        row = conn.execute("SELECT id, content, created_at FROM memories WHERE id = ?", (cur.lastrowid,)).fetchone()
        conn.commit()
    return dict(row)


def delete_memory(memory_id: int) -> bool:
    with connection() as conn:
        cur = conn.execute("DELETE FROM memories WHERE id = ?", (memory_id,))
        conn.commit()
    return cur.rowcount > 0


def memory_context(limit: int = 20) -> str:
    memories = list_memories()[:limit]
    if not memories:
        return "No saved memories."
    return "\n".join(f"- {item['content']}" for item in memories)
