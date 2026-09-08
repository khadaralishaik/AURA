from pydantic import BaseModel, Field


class MemoryCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class Memory(BaseModel):
    id: int
    content: str
    created_at: str
