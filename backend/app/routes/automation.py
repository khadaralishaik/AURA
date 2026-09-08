from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.automation import add_task, complete_task, list_tasks

router = APIRouter(prefix="/automation", tags=["Tasks"])

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    due_at: str | None = None

@router.get("/")
def get_tasks():
    return list_tasks()

@router.post("/")
def create_task(request: TaskCreate):
    return add_task(request.title, request.due_at)

@router.post("/{task_id}/complete")
def finish_task(task_id: int):
    if not complete_task(task_id):
        raise HTTPException(404, "Task not found")
    return {"completed": True}
