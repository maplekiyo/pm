import json

import pytest

from app import ai
from app.default_board import DEFAULT_BOARD


def test_missing_openrouter_key_fails_clearly(monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.setenv("PM_IGNORE_DOTENV", "1")

    with pytest.raises(ai.OpenRouterConfigError):
        ai.get_openrouter_api_key()


def test_run_chat_parses_message_without_board_update(monkeypatch):
    monkeypatch.setattr(
        ai,
        "call_openrouter",
        lambda _messages: json.dumps({"message": "No board change needed.", "board": None}),
    )

    response = ai.run_chat("Summarize the board", [], DEFAULT_BOARD)

    assert response.message == "No board change needed."
    assert response.board is None


def test_run_chat_parses_board_update(monkeypatch):
    next_board = DEFAULT_BOARD.model_copy(deep=True)
    next_board.columns[0].title = "Ideas"
    monkeypatch.setattr(
        ai,
        "call_openrouter",
        lambda _messages: json.dumps(
            {"message": "Updated the board.", "board": next_board.model_dump()}
        ),
    )

    response = ai.run_chat("Rename Backlog to Ideas", [], DEFAULT_BOARD)

    assert response.message == "Updated the board."
    assert response.board is not None
    assert response.board.columns[0].title == "Ideas"


def test_run_chat_rejects_invalid_output(monkeypatch):
    monkeypatch.setattr(ai, "call_openrouter", lambda _messages: "not json")

    with pytest.raises(ai.AiOutputError):
        ai.run_chat("Update the board", [], DEFAULT_BOARD)
