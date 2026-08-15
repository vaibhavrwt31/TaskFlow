from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional


class UserCreate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr


# =========================
# USER PROFILE UPDATE
# =========================

class UserUpdate(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr


class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=1)


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    owner_id: int


class TaskCreate(BaseModel):
    project_id: int
    title: str = Field(..., min_length=1)
    priority: str = "medium"
    due_date: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, value):
        allowed_priorities = {"low", "medium", "high"}

        if value not in allowed_priorities:
            raise ValueError(
                "Priority must be low, medium, or high"
            )

        return value


class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    priority: str
    due_date: Optional[str]
    status: str


class TaskStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        allowed_statuses = {
            "pending",
            "in_progress",
            "completed"
        }

        if value not in allowed_statuses:
            raise ValueError(
                "Status must be pending, in_progress, or completed"
            )

        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class QuickTaskCreate(BaseModel):
    description: str = Field(..., min_length=1)
    project_id: int