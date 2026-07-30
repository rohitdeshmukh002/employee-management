from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.employee import EmployeeRead

router = APIRouter(prefix="/employees", tags=["employees"])


@router.get("", response_model=list[EmployeeRead])
def list_employees(db: Session = Depends(get_db)):
    return db.query(Employee).order_by(Employee.id).all()
