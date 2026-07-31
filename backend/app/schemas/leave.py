from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


LeaveType = Literal["annual", "sick", "personal", "unpaid"]
LeaveStatus = Literal["pending", "approved", "rejected"]


class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str = Field(default="", max_length=1000)


class LeaveStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]


class LeaveRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str | None = None
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    status: str
    created_at: datetime
