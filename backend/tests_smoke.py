from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/system/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_calculator_and_persistence():
    response = client.post("/chat/", json={"message": "/calc (12+3)*4", "history": []})
    assert response.status_code == 200
    payload = response.json()
    assert payload["reply"] == "60"
    assert payload["used_tool"] == "calculator"
    assert payload["conversation_id"].isdigit()

    conversations = client.get("/chat/conversations")
    assert conversations.status_code == 200
    assert any(row["id"] == payload["conversation_id"] for row in conversations.json())

    history = client.get(f"/chat/conversations/{payload['conversation_id']}")
    assert history.status_code == 200
    assert [row["sender"] for row in history.json()] == ["user", "assistant"]

    continued = client.post("/chat/", json={"message": "/calc 2+2", "history": [], "conversation_id": payload["conversation_id"]})
    assert continued.status_code == 200
    assert continued.json()["conversation_id"] == payload["conversation_id"]


def test_invalid_conversation_id():
    response = client.post("/chat/", json={"message": "/calc 1+1", "history": [], "conversation_id": "not-an-id"})
    assert response.status_code == 400


def test_missing_conversation():
    response = client.get("/chat/conversations/999999999")
    assert response.status_code == 404


def test_memory_crud():
    content = "AURA smoke-test memory"
    created = client.post("/memory/", json={"content": content})
    assert created.status_code == 200
    memory_id = created.json()["id"]

    listed = client.get("/memory/")
    assert listed.status_code == 200
    assert any(item["id"] == memory_id for item in listed.json())

    deleted = client.delete(f"/memory/{memory_id}")
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] is True

    missing = client.delete(f"/memory/{memory_id}")
    assert missing.status_code == 404


def test_task_lifecycle():
    created = client.post("/automation/", json={"title": "AURA smoke-test task", "due_at": "2026-09-09T10:00:00+05:30"})
    assert created.status_code == 200
    task_id = created.json()["id"]
    assert created.json()["completed"] == 0
    assert created.json()["due_at"] == "2026-09-09T10:00:00+05:30"

    updated = client.put(
        f"/automation/{task_id}",
        json={"title": "AURA updated task", "due_at": "2026-09-10T11:30:00+05:30"},
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "AURA updated task"
    assert updated.json()["due_at"] == "2026-09-10T11:30:00+05:30"

    completed = client.post(f"/automation/{task_id}/complete")
    assert completed.status_code == 200

    listed = client.get("/automation/")
    task = next(item for item in listed.json() if item["id"] == task_id)
    assert task["completed"] == 1

    deleted = client.delete(f"/automation/{task_id}")
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] is True

    missing_update = client.put(f"/automation/{task_id}", json={"title": "missing"})
    assert missing_update.status_code == 404
    missing_delete = client.delete(f"/automation/{task_id}")
    assert missing_delete.status_code == 404
    missing_complete = client.post(f"/automation/{task_id}/complete")
    assert missing_complete.status_code == 404


def test_task_validation():
    response = client.post("/automation/", json={"title": "   "})
    assert response.status_code == 422
    response = client.post("/automation/", json={"title": "Task", "due_at": "not-a-date"})
    assert response.status_code == 422

    created = client.post("/automation/", json={"title": "Valid task"})
    assert created.status_code == 200
    task_id = created.json()["id"]
    blank_update = client.put(f"/automation/{task_id}", json={"title": "   "})
    assert blank_update.status_code == 422
    client.delete(f"/automation/{task_id}")


def test_research_validation():
    response = client.get("/research/search", params={"q": "FastAPI"})
    assert response.status_code in {200, 502}
    if response.status_code == 200:
        assert response.json()["query"] == "FastAPI"
        assert isinstance(response.json()["results"], list)
