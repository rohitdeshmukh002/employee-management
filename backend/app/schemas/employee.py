from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    phone: str | None = None
    department: str
    position: str
    salary: float | None
    hire_date: date
    created_at: datetime


class EmployeeCreate(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=30)
    department: str = Field(min_length=1, max_length=100)
    position: str = Field(min_length=1, max_length=100)
    salary: float | None = None
    hire_date: date
    password: str = Field(min_length=6, max_length=128)


class EmployeeUpdate(BaseModel):
    """Employee self-service profile update. Email is intentionally omitted."""

    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)


class EmployeeCreateResponse(BaseModel):
    employee: EmployeeRead
    login_email: EmailStr
    temporary_password: str
    message: str
