from pydantic import BaseModel


class DashboardPerson(BaseModel):
    employee_id: int
    employee_name: str
    department: str | None = None
    detail: str | None = None


class DashboardStats(BaseModel):
    team_members: int
    present_today: int
    on_leave: int
    pending_leave: int
    present_employees: list[DashboardPerson] = []
    on_leave_employees: list[DashboardPerson] = []
