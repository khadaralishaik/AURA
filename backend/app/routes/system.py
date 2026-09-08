from fastapi import APIRouter

router = APIRouter(prefix="/system", tags=["System"])

@router.get("/health")
def health():
    return {"status": "ok", "assistant": "AURA", "version": "2.0"}
