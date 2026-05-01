# Backend guide

This directory contains the FastAPI backend for the Project Management MVP.

## Current scope

- `app/main.py` defines the FastAPI application.
- `/` serves the built static frontend.
- `/api/health` returns a simple health response.
- `/api/board` reads and updates the hardcoded MVP user's board.
- `/api/ai/test` checks OpenRouter connectivity when `OPENROUTER_API_KEY` is configured.
- `/api/chat` handles structured AI chat responses and persists valid board updates.
- `app/database.py` initializes SQLite, seeds the default user and board, and persists board JSON.
- `app/schemas.py` defines the board API shape.
- `app/ai.py` contains OpenRouter configuration, request handling, and structured output parsing.
- `pyproject.toml` defines backend dependencies for `uv`.

AI endpoints fail clearly with `503` when `OPENROUTER_API_KEY` is missing.
