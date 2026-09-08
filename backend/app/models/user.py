from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    name: str = Field(default="", max_length=120)
    email: str = Field(default="", max_length=320)
    timezone: str = Field(default="UTC", max_length=80)
