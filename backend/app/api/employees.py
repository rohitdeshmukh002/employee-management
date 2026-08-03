from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_admin
from app.database.session import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import EmployeeRead

router = APIRouter(prefix="/employees", tags=["employees"])


def require_linked_employee(user: User) -> int:
    if user.employee_id is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your account is not linked to an employee record",
        )
    return user.employee_id


@router.get("", response_model=list[EmployeeRead])
def list_employees(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    return db.query(Employee).order_by(Employee.id).all()


@router.get("/me", response_model=EmployeeRead)
def my_employee_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee_id = require_linked_employee(current_user)
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee
