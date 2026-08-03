from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr


class SalaryRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    employee_name: str
    email: EmailStr
    department: str
    position: str
    salary: float | None
    hire_date: date
    currency: str = "USD"
