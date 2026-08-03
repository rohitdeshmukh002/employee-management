from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.employees import require_linked_employee
from app.core.config import is_within_office
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCheckInResponse,
    AttendanceLocationPayload,
    AttendanceRead,
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _employee_name(employee: Employee | None) -> str | None:
    if employee is None:
        return None
    return f"{employee.first_name} {employee.last_name}"


def _to_read(record: Attendance, employee: Employee | None = None) -> AttendanceRead:
    emp = employee or record.employee
    return AttendanceRead(
        id=record.id,
        employee_id=record.employee_id,
        employee_name=_employee_name(emp),
        date=record.date,
        check_in=record.check_in,
        check_out=record.check_out,
        status=record.status,
        check_in_lat=record.check_in_lat,
        check_in_lng=record.check_in_lng,
        check_in_accuracy=record.check_in_accuracy,
        is_office=record.is_office,
        check_out_lat=record.check_out_lat,
        check_out_lng=record.check_out_lng,
        check_out_accuracy=record.check_out_accuracy,
        created_at=record.created_at,
    )


@router.get("", response_model=list[AttendanceRead])
def list_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Attendance).join(Employee)
    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        query = query.filter(Attendance.employee_id == employee_id)
    records = query.order_by(Attendance.date.desc(), Attendance.id.desc()).limit(100).all()
    return [_to_read(r) for r in records]


@router.post("/check-in", response_model=AttendanceCheckInResponse)
def check_in(
    payload: AttendanceLocationPayload | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Check-in is allowed from anywhere. Geo is stored for admin clarity."""
    payload = payload or AttendanceLocationPayload()
    employee_id = require_linked_employee(current_user)
    today = date.today()
    now = datetime.now().time().replace(microsecond=0)
    office = is_within_office(payload.latitude, payload.longitude)

    record = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id, Attendance.date == today)
        .first()
    )
    if record and record.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked in today",
        )

    if record is None:
        status_label = "late" if now >= time(10, 0) else "present"
        record = Attendance(
            employee_id=employee_id,
            date=today,
            check_in=now,
            status=status_label,
            check_in_lat=payload.latitude,
            check_in_lng=payload.longitude,
            check_in_accuracy=payload.accuracy,
            is_office=office,
        )
        db.add(record)
    else:
        record.check_in = now
        record.status = "late" if now >= time(10, 0) else "present"
        record.check_in_lat = payload.latitude
        record.check_in_lng = payload.longitude
        record.check_in_accuracy = payload.accuracy
        record.is_office = office

    db.commit()
    db.refresh(record)

    location_note = (
        " (office location)"
        if office is True
        else " (remote / outside preferred office)"
        if office is False
        else " (location unavailable)"
    )
    return AttendanceCheckInResponse(
        record=_to_read(record),
        message=f"Checked in successfully{location_note}",
    )


@router.post("/check-out", response_model=AttendanceCheckInResponse)
def check_out(
    payload: AttendanceLocationPayload | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payload = payload or AttendanceLocationPayload()
    employee_id = require_linked_employee(current_user)
    today = date.today()
    now = datetime.now().time().replace(microsecond=0)

    record = (
        db.query(Attendance)
        .filter(Attendance.employee_id == employee_id, Attendance.date == today)
        .first()
    )
    if record is None or record.check_in is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check in before checking out",
        )
    if record.check_out is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already checked out today",
        )

    record.check_out = now
    record.check_out_lat = payload.latitude
    record.check_out_lng = payload.longitude
    record.check_out_accuracy = payload.accuracy
    db.commit()
    db.refresh(record)
    return AttendanceCheckInResponse(
        record=_to_read(record),
        message="Checked out successfully",
    )
