from fastapi import APIRouter, HTTPException
from app.models.memory import MemoryCreate
from app.services.memory import add_memory, delete_memory, list_memories

router = APIRouter(prefix="/memory", tags=["Memory"])

@router.get("/")
def get_memories():
    return list_memories()

@router.post("/")
def create_memory(request: MemoryCreate):
    return add_memory(request.content)

@router.delete("/{memory_id}")
def remove_memory(memory_id: int):
    if not delete_memory(memory_id):
        raise HTTPException(404, "Memory not found")
    return {"deleted": True}
