import json
import os
from pathlib import Path
from typing import Any

import httpx

from app.schemas import BoardData, ChatMessage, ChatResponse

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-oss-120b"


class OpenRouterConfigError(RuntimeError):
    pass


class AiOutputError(RuntimeError):
    pass


def _read_env_file_value(key: str) -> str | None:
    if os.getenv("PM_IGNORE_DOTENV") == "1":
        return None

    for directory in [Path.cwd(), *Path.cwd().parents, *Path(__file__).resolve().parents]:
        env_path = directory / ".env"
        if not env_path.is_file():
            continue
        for line in env_path.read_text().splitlines():
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def get_openrouter_api_key() -> str:
    api_key = os.getenv("OPENROUTER_API_KEY") or _read_env_file_value("OPENROUTER_API_KEY")
    if not api_key:
        raise OpenRouterConfigError("OPENROUTER_API_KEY is not configured")
    return api_key


def call_openrouter(messages: list[dict[str, str]]) -> str:
    response = httpx.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {get_openrouter_api_key()}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Project Management MVP",
        },
        json={"model": OPENROUTER_MODEL, "messages": messages},
        verify=os.getenv("SSL_CERT_FILE") or True,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]


def run_ai_test(prompt: str = "2+2") -> str:
    return call_openrouter(
        [
            {"role": "system", "content": "Answer briefly."},
            {"role": "user", "content": prompt},
        ]
    )


def _extract_json(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        text = text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError as exc:
        raise AiOutputError("AI response was not valid JSON") from exc
    if not isinstance(parsed, dict):
        raise AiOutputError("AI response must be a JSON object")
    return parsed


def run_chat(message: str, history: list[ChatMessage], board: BoardData) -> ChatResponse:
    history_text = "\n".join(f"{item.role}: {item.content}" for item in history[-10:])
    content = call_openrouter(
        [
            {
                "role": "system",
                "content": (
                    "You update a Kanban board. Return only JSON with shape "
                    "{\"message\": string, \"board\": object|null}. "
                    "If the user asks for a board change, return the full updated board using the exact BoardData shape. "
                    "If no change is needed, set board to null."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "currentBoard": board.model_dump(),
                        "history": history_text,
                        "request": message,
                    }
                ),
            },
        ]
    )
    parsed = _extract_json(content)
    response_message = parsed.get("message")
    if not isinstance(response_message, str):
        raise AiOutputError("AI response must include a message")
    next_board = parsed.get("board")
    return ChatResponse(
        message=response_message,
        board=BoardData.model_validate(next_board) if next_board is not None else None,
    )
