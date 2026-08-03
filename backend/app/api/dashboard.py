from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.user import User
from app.schemas.dashboard import DashboardPerson, DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    if current_user.role != "admin":
        # Employee self dashboard: lightweight personal stats
        present_today = 0
        on_leave = 0
        pending_leave = 0
        if current_user.employee_id:
            present_today = (
                db.query(Attendance)
                .filter(
                    Attendance.employee_id == current_user.employee_id,
                    Attendance.date == today,
                    Attendance.check_in.isnot(None),
                )
                .count()
            )
            on_leave = (
                db.query(LeaveRequest)
                .filter(
                    LeaveRequest.employee_id == current_user.employee_id,
                    LeaveRequest.status == "approved",
                    LeaveRequest.start_date <= today,
                    LeaveRequest.end_date >= today,
                )
                .count()
            )
            pending_leave = (
                db.query(LeaveRequest)
                .filter(
                    LeaveRequest.employee_id == current_user.employee_id,
                    LeaveRequest.status == "pending",
                )
                .count()
            )
        return DashboardStats(
            team_members=1,
            present_today=present_today,
            on_leave=on_leave,
            pending_leave=pending_leave,
            present_employees=[],
            on_leave_employees=[],
        )

    team_members = db.query(Employee).count()
    present_rows = (
        db.query(Attendance, Employee)
        .join(Employee, Employee.id == Attendance.employee_id)
        .filter(
            Attendance.date == today,
            Attendance.check_in.isnot(None),
            Attendance.status.in_(["present", "late", "half_day"]),
        )
        .all()
    )
    leave_rows = (
        db.query(LeaveRequest, Employee)
        .join(Employee, Employee.id == LeaveRequest.employee_id)
        .filter(
            LeaveRequest.status == "approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
        )
        .all()
    )
    pending_leave = (
        db.query(LeaveRequest).filter(LeaveRequest.status == "pending").count()
    )

    present_employees = [
        DashboardPerson(
            employee_id=emp.id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            department=emp.department,
            detail=(
                f"In at {att.check_in}"
                + (" · Office" if att.is_office is True else " · Remote" if att.is_office is False else "")
            ),
        )
        for att, emp in present_rows
    ]
    on_leave_employees = [
        DashboardPerson(
            employee_id=emp.id,
            employee_name=f"{emp.first_name} {emp.last_name}",
            department=emp.department,
            detail=f"{leave.leave_type} ({leave.start_date} → {leave.end_date})",
        )
        for leave, emp in leave_rows
    ]

    return DashboardStats(
        team_members=team_members,
        present_today=len(present_employees),
        on_leave=len(on_leave_employees),
        pending_leave=pending_leave,
        present_employees=present_employees,
        on_leave_employees=on_leave_employees,
    )
