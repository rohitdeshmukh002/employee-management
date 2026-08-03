from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.employees import require_linked_employee
from app.core.security import get_current_user, require_admin
from app.database.session import get_db
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.user import User
from app.schemas.leave import LeaveRequestCreate, LeaveRequestRead, LeaveStatusUpdate

router = APIRouter(prefix="/leave", tags=["leave"])


def _to_read(record: LeaveRequest) -> LeaveRequestRead:
    employee = record.employee
    name = (
        f"{employee.first_name} {employee.last_name}" if employee is not None else None
    )
    return LeaveRequestRead(
        id=record.id,
        employee_id=record.employee_id,
        employee_name=name,
        leave_type=record.leave_type,
        start_date=record.start_date,
        end_date=record.end_date,
        reason=record.reason,
        admin_note=record.admin_note or "",
        status=record.status,
        created_at=record.created_at,
    )


@router.get("", response_model=list[LeaveRequestRead])
def list_leave(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(LeaveRequest).join(Employee)
    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        query = query.filter(LeaveRequest.employee_id == employee_id)
    records = query.order_by(LeaveRequest.created_at.desc()).limit(100).all()
    return [_to_read(r) for r in records]


@router.post("", response_model=LeaveRequestRead, status_code=status.HTTP_201_CREATED)
def create_leave(
    payload: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.end_date < payload.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be on or after start date",
        )

    employee_id = require_linked_employee(current_user)
    record = LeaveRequest(
        employee_id=employee_id,
        leave_type=payload.leave_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason.strip(),
        status="pending",
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return _to_read(record)


@router.patch("/{leave_id}", response_model=LeaveRequestRead)
def update_leave_status(
    leave_id: int,
    payload: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    record = db.get(LeaveRequest, leave_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Leave request not found")
    if record.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only pending requests can be updated",
        )
    record.status = payload.status
    record.admin_note = payload.admin_note.strip()
    db.commit()
    db.refresh(record)
    return _to_read(record)
