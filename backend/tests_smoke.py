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
    assert isinstance(payload["conversation_id"], str)

    conversations = client.get("/chat/conversations")
    assert conversations.status_code == 200
    assert any(row["id"] == payload["conversation_id"] for row in conversations.json())

    history = client.get(f"/chat/conversations/{payload['conversation_id']}")
    assert history.status_code == 200
    assert [row["sender"] for row in history.json()] == ["user", "assistant"]


def test_memory_crud():
    content = "AURA smoke-test memory"
    created = client.post("/memory/", json={"content": content})
    assert created.status_code == 200
    memory_id = created.json()["id"]

    listed = client.get("/memory/")
    assert any(item["id"] == memory_id for item in listed.json())

    deleted = client.delete(f"/memory/{memory_id}")
    assert deleted.status_code == 200
    assert deleted.json()["deleted"] is True


def test_task_lifecycle():
    created = client.post("/automation/", json={"title": "AURA smoke-test task"})
    assert created.status_code == 200
    task_id = created.json()["id"]
    assert created.json()["completed"] == 0

    completed = client.post(f"/automation/{task_id}/complete")
    assert completed.status_code == 200

    listed = client.get("/automation/")
    task = next(item for item in listed.json() if item["id"] == task_id)
    assert task["completed"] == 1
