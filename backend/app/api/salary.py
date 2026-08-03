from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.employees import require_linked_employee
from app.core.security import get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.salary import SalaryRead

router = APIRouter(prefix="/salary", tags=["salary"])


def _to_salary(employee: Employee) -> SalaryRead:
    return SalaryRead(
        employee_id=employee.id,
        employee_name=f"{employee.first_name} {employee.last_name}",
        email=employee.email,
        department=employee.department,
        position=employee.position,
        salary=float(employee.salary) if employee.salary is not None else None,
        hire_date=employee.hire_date,
    )


@router.get("", response_model=list[SalaryRead])
def list_salaries(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "admin":
        employees = db.query(Employee).order_by(Employee.id).all()
        return [_to_salary(e) for e in employees]

    employee_id = require_linked_employee(current_user)
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return [_to_salary(employee)]
