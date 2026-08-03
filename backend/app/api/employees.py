from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user, hash_password, require_admin
from app.database.session import get_db
from app.models.employee import Employee
from app.models.user import User
from app.schemas.employee import (
    EmployeeCreate,
    EmployeeCreateResponse,
    EmployeeRead,
    EmployeeUpdate,
)

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


@router.post("", response_model=EmployeeCreateResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    payload: EmployeeCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    email = payload.email.lower()
    if db.query(Employee).filter(Employee.email == email).first():
        raise HTTPException(status_code=400, detail="Employee email already exists")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Login email already exists")

    employee = Employee(
        first_name=payload.first_name.strip(),
        last_name=payload.last_name.strip(),
        email=email,
        phone=payload.phone.strip() if payload.phone else None,
        department=payload.department.strip(),
        position=payload.position.strip(),
        salary=payload.salary,
        hire_date=payload.hire_date,
    )
    db.add(employee)
    db.flush()

    full_name = f"{employee.first_name} {employee.last_name}".strip()
    user = User(
        email=email,
        hashed_password=hash_password(payload.password),
        full_name=full_name,
        role="employee",
        employee_id=employee.id,
    )
    db.add(user)
    db.commit()
    db.refresh(employee)

    return EmployeeCreateResponse(
        employee=EmployeeRead.model_validate(employee),
        login_email=email,
        temporary_password=payload.password,
        message="Employee created. Share the login email and password with the employee.",
    )


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


@router.patch("/me", response_model=EmployeeRead)
def update_my_employee_profile(
    payload: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    employee_id = require_linked_employee(current_user)
    employee = db.get(Employee, employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    data = payload.model_dump(exclude_unset=True)
    if "first_name" in data and data["first_name"] is not None:
        employee.first_name = data["first_name"].strip()
    if "last_name" in data and data["last_name"] is not None:
        employee.last_name = data["last_name"].strip()
    if "phone" in data:
        phone = data["phone"]
        employee.phone = phone.strip() if phone else None

    current_user.full_name = f"{employee.first_name} {employee.last_name}".strip()
    db.commit()
    db.refresh(employee)
    return employee
