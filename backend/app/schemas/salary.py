from datetime import date
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SalaryPaymentCreate(BaseModel):
    employee_id: int
    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)
    amount: Decimal = Field(..., gt=0)
    deposited_on: date


class SalaryPaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    employee_id: int
    employee_name: str | None = None
    email: str | None = None
    year: int
    month: int
    amount: Decimal
    deposited_on: date
    payslip_filename: str | None = None
    has_payslip: bool = False


class SalaryRead(BaseModel):
    """Legacy employee base salary row (compensation on employee record)."""

    employee_id: int
    employee_name: str
    email: str
    department: str
    position: str
    salary: float | None
    hire_date: date
    currency: str = "USD"
