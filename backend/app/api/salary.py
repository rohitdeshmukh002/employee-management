import re
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.employees import require_linked_employee
from app.core.config import UPLOAD_DIR
from app.core.security import get_current_user, require_admin
from app.database.session import get_db
from app.models.employee import Employee
from app.models.salary_payment import SalaryPayment
from app.models.user import User
from app.schemas.salary import SalaryPaymentCreate, SalaryPaymentRead, SalaryRead

router = APIRouter(prefix="/salary", tags=["salary"])

PAYSLIP_DIR = Path(UPLOAD_DIR) / "payslips"
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


def _safe_name(original: str) -> str:
    base = Path(original).name
    stem = re.sub(r"[^a-zA-Z0-9._-]", "_", Path(base).stem)[:80] or "payslip"
    ext = Path(base).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Payslip must be PDF or image")
    return f"{uuid.uuid4().hex}_{stem}{ext}"


def _to_payment_read(payment: SalaryPayment) -> SalaryPaymentRead:
    emp = payment.employee
    return SalaryPaymentRead(
        id=payment.id,
        employee_id=payment.employee_id,
        employee_name=f"{emp.first_name} {emp.last_name}" if emp else None,
        email=emp.email if emp else None,
        year=payment.year,
        month=payment.month,
        amount=payment.amount,
        deposited_on=payment.deposited_on,
        payslip_filename=payment.payslip_filename,
        has_payslip=bool(payment.payslip_filename),
    )


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


@router.get("/base", response_model=list[SalaryRead])
def list_base_salaries(
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


@router.get("/payments", response_model=list[SalaryPaymentRead])
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(SalaryPayment).join(Employee)
    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        query = query.filter(SalaryPayment.employee_id == employee_id)
    payments = query.order_by(
        SalaryPayment.year.desc(), SalaryPayment.month.desc()
    ).all()
    return [_to_payment_read(p) for p in payments]


@router.post(
    "/payments",
    response_model=SalaryPaymentRead,
    status_code=status.HTTP_201_CREATED,
)
def create_payment(
    payload: SalaryPaymentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    employee = db.get(Employee, payload.employee_id)
    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = (
        db.query(SalaryPayment)
        .filter(
            SalaryPayment.employee_id == payload.employee_id,
            SalaryPayment.year == payload.year,
            SalaryPayment.month == payload.month,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Payment for this employee/month already exists",
        )

    payment = SalaryPayment(
        employee_id=payload.employee_id,
        year=payload.year,
        month=payload.month,
        amount=payload.amount,
        deposited_on=payload.deposited_on,
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return _to_payment_read(payment)


@router.post("/payments/{payment_id}/payslip", response_model=SalaryPaymentRead)
async def upload_payslip(
    payment_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    payment = db.get(SalaryPayment, payment_id)
    if payment is None:
        raise HTTPException(status_code=404, detail="Payment not found")

    PAYSLIP_DIR.mkdir(parents=True, exist_ok=True)
    filename = _safe_name(file.filename or "payslip.pdf")
    dest = PAYSLIP_DIR / filename
    content = await file.read()
    if len(content) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")
    dest.write_bytes(content)

    if payment.payslip_filename:
        old = PAYSLIP_DIR / payment.payslip_filename
        if old.exists():
            old.unlink()

    payment.payslip_filename = filename
    db.commit()
    db.refresh(payment)
    return _to_payment_read(payment)


@router.get("/payments/{payment_id}/payslip")
def download_payslip(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.get(SalaryPayment, payment_id)
    if payment is None or not payment.payslip_filename:
        raise HTTPException(status_code=404, detail="Payslip not found")

    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        if payment.employee_id != employee_id:
            raise HTTPException(status_code=403, detail="Not allowed")

    path = PAYSLIP_DIR / payment.payslip_filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Payslip file missing")

    return FileResponse(
        path,
        filename=payment.payslip_filename,
        media_type="application/octet-stream",
    )


@router.get("", response_model=list[SalaryPaymentRead])
def list_salary_default(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Alias of /payments for the salary page default load."""
    query = db.query(SalaryPayment).join(Employee)
    if current_user.role != "admin":
        employee_id = require_linked_employee(current_user)
        query = query.filter(SalaryPayment.employee_id == employee_id)
    payments = query.order_by(
        SalaryPayment.year.desc(), SalaryPayment.month.desc()
    ).all()
    return [_to_payment_read(p) for p in payments]
