# AI integration

The backend uses OpenRouter for AI chat.

## Configuration

Set `OPENROUTER_API_KEY` in the project root `.env` file or as an environment variable.

The start scripts pass `.env` into Docker when the file exists.

## Model

Use `openai/gpt-oss-120b`.

## Endpoints

- `GET /api/ai/test?prompt=2%2B2` sends a simple prompt to OpenRouter.
- `POST /api/chat` sends the current board, user message, and chat history to OpenRouter.

## Structured output

The chat endpoint expects the AI to return JSON:

```json
{
  "message": "User-facing response",
  "board": null
}
```

For board changes, `board` must contain the full `BoardData` shape. The backend validates the board before saving it. Invalid AI output returns an error and does not update the saved board.

## Missing configuration

If `OPENROUTER_API_KEY` is missing, AI endpoints return a clear `503` error.
