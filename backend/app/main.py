import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.db import init_db
from app.routes.chat import router as chat_router
from app.routes.memory import router as memory_router
from app.routes.automation import router as automation_router
from app.routes.system import router as system_router
from app.routes.research import router as research_router

app = FastAPI(title="AURA AI Assistant", version="2.0")

origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(chat_router)
app.include_router(memory_router)
app.include_router(automation_router)
app.include_router(system_router)
app.include_router(research_router)

@app.on_event("startup")
def startup():
    init_db()

@app.get("/")
def home():
    return {"status": "running", "assistant": "AURA", "version": "2.0"}
