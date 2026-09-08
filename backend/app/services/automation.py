from ..database.db import connection


def _task_row(conn, task_id: int):
    return conn.execute(
        "SELECT id, title, due_at, completed, created_at FROM tasks WHERE id = ?",
        (task_id,),
    ).fetchone()


def list_tasks() -> list[dict]:
    with connection() as conn:
        rows = conn.execute(
            "SELECT id, title, due_at, completed, created_at FROM tasks ORDER BY completed, id DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def add_task(title: str, due_at: str | None = None) -> dict:
    with connection() as conn:
        cur = conn.execute("INSERT INTO tasks(title, due_at) VALUES (?, ?)", (title.strip(), due_at))
        row = _task_row(conn, cur.lastrowid)
        conn.commit()
    return dict(row)


def update_task(task_id: int, title: str, due_at: str | None = None) -> dict | None:
    with connection() as conn:
        cur = conn.execute(
            "UPDATE tasks SET title = ?, due_at = ? WHERE id = ?",
            (title.strip(), due_at, task_id),
        )
        if cur.rowcount == 0:
            return None
        row = _task_row(conn, task_id)
        conn.commit()
    return dict(row)


def complete_task(task_id: int) -> bool:
    with connection() as conn:
        cur = conn.execute("UPDATE tasks SET completed = 1 WHERE id = ?", (task_id,))
        conn.commit()
    return cur.rowcount > 0


def delete_task(task_id: int) -> bool:
    with connection() as conn:
        cur = conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
    return cur.rowcount > 0
