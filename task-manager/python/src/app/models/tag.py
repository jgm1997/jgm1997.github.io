from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class BaseTag(BaseModel):
    name: str = Field(..., min_length=1)
    description: str | None = None
    color: str = "#000000"

class CreateTag(BaseTag):
    pass

class UpdateTag(BaseModel):
    name: str | None = Field(None, min_length=1)
    description: str | None = None
    color: str | None = None

class ReadTag(BaseTag):
    pk: UUID
    user: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True