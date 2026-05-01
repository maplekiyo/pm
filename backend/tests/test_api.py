from fastapi.testclient import TestClient

from app import ai
from app.main import app
from app.schemas import ChatResponse


def test_read_board_creates_database_when_missing(tmp_path, monkeypatch):
    db_path = tmp_path / "missing" / "pm.sqlite3"
    monkeypatch.setenv("PM_DATABASE_PATH", str(db_path))

    response = TestClient(app).get("/api/board")

    assert response.status_code == 200
    assert db_path.exists()
    assert response.json()["columns"][0]["title"] == "Backlog"


def test_update_board_persists_through_api(tmp_path, monkeypatch):
    db_path = tmp_path / "pm.sqlite3"
    monkeypatch.setenv("PM_DATABASE_PATH", str(db_path))
    client = TestClient(app)

    board = client.get("/api/board").json()
    board["columns"][0]["title"] = "Ideas"

    update_response = client.put("/api/board", json=board)
    read_response = client.get("/api/board")

    assert update_response.status_code == 200
    assert update_response.json()["columns"][0]["title"] == "Ideas"
    assert read_response.json()["columns"][0]["title"] == "Ideas"


def test_update_board_rejects_invalid_card_reference(tmp_path, monkeypatch):
    db_path = tmp_path / "pm.sqlite3"
    monkeypatch.setenv("PM_DATABASE_PATH", str(db_path))
    client = TestClient(app)

    board = client.get("/api/board").json()
    board["columns"][0]["cardIds"].append("missing-card")

    response = client.put("/api/board", json=board)

    assert response.status_code == 422


def test_ai_test_route_reports_missing_key(monkeypatch):
    monkeypatch.setattr(ai, "run_ai_test", lambda _prompt: (_ for _ in ()).throw(ai.OpenRouterConfigError("missing key")))

    response = TestClient(app).get("/api/ai/test")

    assert response.status_code == 503


def test_chat_route_returns_message_without_board_update(tmp_path, monkeypatch):
    db_path = tmp_path / "pm.sqlite3"
    monkeypatch.setenv("PM_DATABASE_PATH", str(db_path))
    monkeypatch.setattr(
        ai,
        "run_chat",
        lambda _message, _history, _board: ChatResponse(message="No changes.", board=None),
    )

    response = TestClient(app).post(
        "/api/chat", json={"message": "Summarize", "history": []}
    )

    assert response.status_code == 200
    assert response.json() == {"message": "No changes.", "board": None}


def test_chat_route_applies_board_update(tmp_path, monkeypatch):
    db_path = tmp_path / "pm.sqlite3"
    monkeypatch.setenv("PM_DATABASE_PATH", str(db_path))
    client = TestClient(app)
    board = client.get("/api/board").json()
    board["columns"][0]["title"] = "Ideas"
    monkeypatch.setattr(
        ai,
        "run_chat",
        lambda _message, _history, _board: ChatResponse.model_validate(
            {"message": "Updated.", "board": board}
        ),
    )

    response = client.post("/api/chat", json={"message": "Rename", "history": []})

    assert response.status_code == 200
    assert client.get("/api/board").json()["columns"][0]["title"] == "Ideas"


def test_chat_route_rejects_invalid_ai_output(tmp_path, monkeypatch):
    db_path = tmp_path / "pm.sqlite3"
    monkeypatch.setenv("PM_DATABASE_PATH", str(db_path))
    monkeypatch.setattr(ai, "run_chat", lambda _message, _history, _board: (_ for _ in ()).throw(ai.AiOutputError("bad output")))

    response = TestClient(app).post(
        "/api/chat", json={"message": "Update", "history": []}
    )

    assert response.status_code == 502
