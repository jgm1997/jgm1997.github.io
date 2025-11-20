from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel


class TaskStatus(StrEnum):
    ToDo = "todo"
    InProgress = "in_progress"
    Done = "done"


class BaseTask(BaseModel):
    title: str
    description: str | None = None
    status: TaskStatus = TaskStatus.ToDo
    due_date: datetime | None = None


class CreateTask(BaseTask):
    pass


class UpdateTask(BaseModel):
    title: str | None = None
    description: str | None = None
    status: TaskStatus | None = None
    due_date: datetime | None = None


class ReadTask(BaseTask):
    pk: UUID
    user: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True