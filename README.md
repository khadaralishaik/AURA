# AURA

AURA is a local-first AI assistant with a React/Vite frontend and FastAPI backend.

## Structure

- `frontend/` — React + TypeScript UI
- `backend/` — FastAPI API
- `docker-compose.yml` — local service orchestration

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:8000`.

Set the required provider credentials in `backend/.env` using `backend/.env.example`. Never commit real API keys.
