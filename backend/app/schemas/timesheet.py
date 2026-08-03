from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TimesheetEntryCreate(BaseModel):
    work_date: date
    hours: Decimal = Field(..., ge=8, le=24)
    description: str = Field(default="", max_length=1000)

    @field_validator("hours")
    @classmethod
    def require_min_eight(cls, value: Decimal) -> Decimal:
        if value < 8:
            raise ValueError("Timesheet entry must be at least 8 hours")
        return value


class TimesheetEntryUpdate(BaseModel):
    hours: Decimal | None = Field(default=None, ge=8, le=24)
    description: str | None = Field(default=None, max_length=1000)

    @field_validator("hours")
    @classmethod
    def require_min_eight(cls, value: Decimal | None) -> Decimal | None:
        if value is not None and value < 8:
            raise ValueError("Timesheet entry must be at least 8 hours")
        return value


class TimesheetEntryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str | None = None
    work_date: date
    hours: Decimal
    description: str
