from pydantic import BaseModel


class DashboardStats(BaseModel):
    team_members: int
    present_today: int
    on_leave: int
    pending_leave: int
