# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Project Management MVP: a Kanban board app with an AI chat sidebar. The Next.js frontend is built as a static site and served directly from the FastAPI backend. Everything runs in a single Docker container.

MVP constraints: one hardcoded user (`user` / `password`), one board per user, local Docker only. The database schema already supports multiple users for future expansion.

## Running the app

Build and start (from project root):

```sh
sh scripts/start.sh      # Mac/Linux
.\scripts\start.ps1      # Windows PowerShell
```

Then open `http://localhost:8000`. Stop with `sh scripts/stop.sh` or `.\scripts\stop.ps1`.

The start scripts automatically pass `.env` into Docker when the file exists. AI features require `OPENROUTER_API_KEY` in `.env`.

## Backend development

The backend lives in `backend/`. Dependencies are managed with `uv`.

```sh
cd backend
uv sync                          # install deps
uv run pytest                    # run all backend tests
uv run pytest tests/test_api.py  # run a single test file
```

The backend does not have a local dev server mode outside Docker. Test using pytest against the FastAPI `TestClient`.

## Frontend development

The frontend lives in `frontend/`.

```sh
cd frontend
npm install
npm run dev          # local Next.js dev server (not connected to real backend)
npm run build        # static export to frontend/out/
npm run lint         # ESLint
npm run test:unit    # Vitest unit tests
npm run test:e2e     # Playwright end-to-end tests
npm run test:all     # unit + e2e
```

Run a single Vitest test file:

```sh
npx vitest run src/lib/kanban.test.ts
```

## Architecture

```
Docker container
└── FastAPI (port 8000)
    ├── /api/*         — backend API routes
    └── /*             — serves Next.js static export from app/static/
```

**Backend** (`backend/app/`):
- `main.py` — FastAPI app, all route definitions
- `database.py` — SQLite init, seed, `get_board()` / `update_board()`
- `schemas.py` — Pydantic models: `BoardData`, `ChatRequest`, `ChatResponse`, `AiTestResponse`
- `ai.py` — OpenRouter client, `run_ai_test()`, `run_chat()`, structured output parsing; raises `OpenRouterConfigError` (503) and `AiOutputError` (502)
- `default_board.py` — default `BoardData` JSON used to seed new databases

**Frontend** (`frontend/src/`):
- `lib/kanban.ts` — `BoardData` / `Column` / `Card` types, ID generation, card movement logic
- `lib/api.ts` — `fetchBoard()`, `saveBoard()`, `sendChat()` — all backend API calls
- `components/AuthGate.tsx` — login gate; accepts `user`/`password`, keeps auth state in memory
- `components/KanbanBoard.tsx` — owns board state, API load/save, drag-and-drop, all mutations
- `components/ChatSidebar.tsx` — AI chat UI; calls `sendChat()` and merges AI-returned board updates

**Data model** — `BoardData`:
```ts
{ columns: Column[], cards: Record<string, Card> }
Column: { id, title, cardIds: string[] }
Card:   { id, title, details }
```
This exact shape is stored as JSON in SQLite (`boards.board_json`) and is the contract between frontend, backend API, and AI structured output.

**Database** — SQLite at `data/pm.sqlite3` inside the container. Auto-created on first run with `users` and `boards` tables. The MVP board is seeded for the `user` account.

**AI** — OpenRouter, model `openai/gpt-oss-120b`. Chat endpoint sends current board JSON + conversation history; expects structured JSON back (`message` + optional `board`). Invalid AI board output is rejected without corrupting saved state.

## Coding standards

- No over-engineering. Keep it simple. No unnecessary defensive programming.
- No emojis anywhere.
- When hitting issues: identify root cause with evidence before fixing.
- Latest library versions and idiomatic approaches.
