import csv
import io
from calendar import monthrange
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.employees import require_linked_employee
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.models.timesheet import TimesheetEntry
from app.models.user import User
from app.schemas.timesheet import (
    TimesheetEntryCreate,
    TimesheetEntryRead,
    TimesheetEntryUpdate,
)

router = APIRouter(prefix="/timesheets", tags=["timesheets"])


def _to_read(entry: TimesheetEntry) -> TimesheetEntryRead:
    emp = entry.employee
    name = f"{emp.first_name} {emp.last_name}" if emp else None
    return TimesheetEntryRead(
        id=entry.id,
        employee_id=entry.employee_id,
        employee_name=name,
        work_date=entry.work_date,
        hours=entry.hours,
        description=entry.description or "",
    )


@router.get("", response_model=list[TimesheetEntryRead])
def list_timesheets(
    year: int | None = Query(default=None),
    month: int | None = Query(default=None, ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(TimesheetEntry).join(Employee)
    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        query = query.filter(TimesheetEntry.employee_id == employee_id)

    if year is not None and month is not None:
        start = date(year, month, 1)
        end = date(year, month, monthrange(year, month)[1])
        query = query.filter(
            TimesheetEntry.work_date >= start,
            TimesheetEntry.work_date <= end,
        )
    elif year is not None:
        query = query.filter(
            TimesheetEntry.work_date >= date(year, 1, 1),
            TimesheetEntry.work_date <= date(year, 12, 31),
        )

    entries = query.order_by(TimesheetEntry.work_date.desc()).limit(200).all()
    return [_to_read(e) for e in entries]


@router.post("", response_model=TimesheetEntryRead, status_code=status.HTTP_201_CREATED)
def create_timesheet(
    payload: TimesheetEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee_id = require_linked_employee(current_user)
    existing = (
        db.query(TimesheetEntry)
        .filter(
            TimesheetEntry.employee_id == employee_id,
            TimesheetEntry.work_date == payload.work_date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A timesheet entry already exists for this date",
        )

    entry = TimesheetEntry(
        employee_id=employee_id,
        work_date=payload.work_date,
        hours=payload.hours,
        description=payload.description.strip(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return _to_read(entry)


@router.get("/export")
def export_timesheet_csv(
    year: int = Query(...),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(TimesheetEntry).join(Employee)
    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        query = query.filter(TimesheetEntry.employee_id == employee_id)

    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])
    entries = (
        query.filter(
            TimesheetEntry.work_date >= start,
            TimesheetEntry.work_date <= end,
        )
        .order_by(TimesheetEntry.work_date.asc())
        .all()
    )

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Date", "Employee", "Hours", "Description"])
    for entry in entries:
        emp = entry.employee
        name = f"{emp.first_name} {emp.last_name}" if emp else ""
        writer.writerow(
            [entry.work_date.isoformat(), name, str(entry.hours), entry.description or ""]
        )

    buffer.seek(0)
    filename = f"timesheet-{year}-{month:02d}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.patch("/{entry_id}", response_model=TimesheetEntryRead)
def update_timesheet(
    entry_id: int,
    payload: TimesheetEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.get(TimesheetEntry, entry_id)
    if entry is None:
        raise HTTPException(status_code=404, detail="Timesheet entry not found")

    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        if entry.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="Not allowed")

    data = payload.model_dump(exclude_unset=True)
    if "hours" in data and data["hours"] is not None:
        entry.hours = data["hours"]
    if "description" in data and data["description"] is not None:
        entry.description = data["description"].strip()

    db.commit()
    db.refresh(entry)
    return _to_read(entry)
