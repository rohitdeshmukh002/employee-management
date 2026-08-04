from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


LeaveType = Literal["annual", "sick", "personal", "unpaid"]
LeaveStatus = Literal["pending", "approved", "rejected"]


class LeaveRequestCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str = Field(default="", max_length=1000)


class LeaveStatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]
    admin_note: str = Field(default="", max_length=1000)

    @model_validator(mode="after")
    def require_note_on_reject(self):
        if self.status == "rejected" and not self.admin_note.strip():
            raise ValueError("A reason is required when rejecting leave")
        return self


class LeaveRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str | None = None
    leave_type: str
    start_date: date
    end_date: date
    reason: str
    admin_note: str = ""
    status: str
    created_at: datetime
