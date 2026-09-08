from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.automation import add_task, complete_task, delete_task, list_tasks, update_task

router = APIRouter(prefix="/automation", tags=["Tasks"])

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    due_at: datetime | None = None

class TaskUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    due_at: datetime | None = None

@router.get("/")
def get_tasks():
    return list_tasks()

@router.post("/")
def create_task(request: TaskCreate):
    return add_task(request.title, request.due_at.isoformat() if request.due_at else None)

@router.put("/{task_id}")
def edit_task(task_id: int, request: TaskUpdate):
    task = update_task(task_id, request.title, request.due_at.isoformat() if request.due_at else None)
    if task is None:
        raise HTTPException(404, "Task not found")
    return task

@router.post("/{task_id}/complete")
def finish_task(task_id: int):
    if not complete_task(task_id):
        raise HTTPException(404, "Task not found")
    return {"completed": True}

@router.delete("/{task_id}")
def remove_task(task_id: int):
    if not delete_task(task_id):
        raise HTTPException(404, "Task not found")
    return {"deleted": True}
