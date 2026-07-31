from datetime import date, datetime, time

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.employees import require_linked_employee
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import AttendanceCheckInResponse, AttendanceRead

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
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee_id = require_linked_employee(current_user)
    today = date.today()
    now = datetime.now().time().replace(microsecond=0)

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
        )
        db.add(record)
    else:
        record.check_in = now
        record.status = "late" if now >= time(10, 0) else "present"

    db.commit()
    db.refresh(record)
    return AttendanceCheckInResponse(
        record=_to_read(record),
        message="Checked in successfully",
    )


@router.post("/check-out", response_model=AttendanceCheckInResponse)
def check_out(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    db.commit()
    db.refresh(record)
    return AttendanceCheckInResponse(
        record=_to_read(record),
        message="Checked out successfully",
    )
