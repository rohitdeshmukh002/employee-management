from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.user import User
from app.schemas.dashboard import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def dashboard_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    today = date.today()
    team_members = db.query(Employee).count()
    present_today = (
        db.query(Attendance)
        .filter(
            Attendance.date == today,
            Attendance.check_in.isnot(None),
            Attendance.status.in_(["present", "late", "half_day"]),
        )
        .count()
    )
    on_leave = (
        db.query(LeaveRequest)
        .filter(
            LeaveRequest.status == "approved",
            LeaveRequest.start_date <= today,
            LeaveRequest.end_date >= today,
        )
        .count()
    )
    pending_leave = (
        db.query(LeaveRequest).filter(LeaveRequest.status == "pending").count()
    )
    return DashboardStats(
        team_members=team_members,
        present_today=present_today,
        on_leave=on_leave,
        pending_leave=pending_leave,
    )
