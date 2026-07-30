from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    department: str
    position: str
    salary: float | None
    hire_date: date
    created_at: datetime
