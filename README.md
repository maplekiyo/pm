# Project Management MVP

The Docker app builds the Next.js frontend as a static site and serves it from the FastAPI backend.

AI features require `OPENROUTER_API_KEY` in `.env` or the environment.

## Run

Windows PowerShell:

```powershell
.\scripts\start.ps1
```

Mac or Linux:

```bash
sh scripts/start.sh
```

Then open `http://localhost:8000`.

## Stop

Windows PowerShell:

```powershell
.\scripts\stop.ps1
```

Mac or Linux:

```bash
sh scripts/stop.sh
```

## Check

- Static HTML: `http://localhost:8000/`
- API health: `http://localhost:8000/api/health`
