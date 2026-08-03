from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field


class AttendanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str | None = None
    date: date
    check_in: time | None
    check_out: time | None
    status: str
    check_in_lat: float | None = None
    check_in_lng: float | None = None
    check_in_accuracy: float | None = None
    is_office: bool | None = None
    check_out_lat: float | None = None
    check_out_lng: float | None = None
    check_out_accuracy: float | None = None
    created_at: datetime


class AttendanceLocationPayload(BaseModel):
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    accuracy: float | None = Field(default=None, ge=0)


class AttendanceCheckInResponse(BaseModel):
    record: AttendanceRead
    message: str
