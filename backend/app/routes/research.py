from fastapi import APIRouter, HTTPException, Query
from app.services.research import wikipedia_search

router = APIRouter(prefix="/research", tags=["Research"])

@router.get("/search")
def search(q: str = Query(min_length=1, max_length=300)):
    try:
        return {"query": q, "results": wikipedia_search(q)}
    except Exception:
        raise HTTPException(502, "Research service is unavailable")
