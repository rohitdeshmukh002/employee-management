from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict


class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str | None = None
    date: date
    check_in: time | None
    check_out: time | None
    status: str
    created_at: datetime


class AttendanceCheckInResponse(BaseModel):
    record: AttendanceRead
    message: str
