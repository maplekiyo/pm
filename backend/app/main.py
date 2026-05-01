from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse

from app import ai
from app.database import get_board, update_board
from app.schemas import AiTestResponse, BoardData, ChatRequest, ChatResponse

APP_DIR = Path(__file__).resolve().parent
STATIC_DIR = APP_DIR / "static"

app = FastAPI(title="Project Management MVP")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/board", response_model=BoardData)
def read_board() -> BoardData:
    return get_board()


@app.put("/api/board", response_model=BoardData)
def save_board(board: BoardData) -> BoardData:
    return update_board(board)


@app.get("/api/ai/test", response_model=AiTestResponse)
def test_ai(prompt: str = "2+2") -> AiTestResponse:
    try:
        return AiTestResponse(response=ai.run_ai_test(prompt))
    except ai.OpenRouterConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI request failed") from exc


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        current_board = get_board()
        response = ai.run_chat(request.message, request.history, current_board)
        if response.board is not None:
            update_board(response.board)
        return response
    except ai.OpenRouterConfigError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except ai.AiOutputError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI request failed") from exc


@app.get("/", response_class=FileResponse)
def index() -> FileResponse:
    return FileResponse(STATIC_DIR / "index.html")


@app.get("/{asset_path:path}", response_class=FileResponse)
def static_asset(asset_path: str) -> FileResponse:
    asset = (STATIC_DIR / asset_path).resolve()
    if not asset.is_file() or not asset.is_relative_to(STATIC_DIR):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(asset)


def main() -> None:
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
