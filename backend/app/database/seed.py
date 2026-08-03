from datetime import date, time

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import LeaveRequest
from app.models.user import User


DEFAULT_PASSWORD = "Password123!"


def seed_if_empty(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    employees = db.query(Employee).order_by(Employee.id).all()
    if not employees:
        employees = [
            Employee(
                first_name="Alice",
                last_name="Johnson",
                email="alice.johnson@company.com",
                department="Engineering",
                position="Software Engineer",
                salary=85000,
                hire_date=date(2022, 3, 15),
            ),
            Employee(
                first_name="Bob",
                last_name="Smith",
                email="bob.smith@company.com",
                department="Human Resources",
                position="HR Manager",
                salary=72000,
                hire_date=date(2021, 7, 1),
            ),
            Employee(
                first_name="Carol",
                last_name="Williams",
                email="carol.williams@company.com",
                department="Finance",
                position="Accountant",
                salary=68000,
                hire_date=date(2023, 1, 10),
            ),
            Employee(
                first_name="David",
                last_name="Brown",
                email="david.brown@company.com",
                department="Engineering",
                position="DevOps Engineer",
                salary=90000,
                hire_date=date(2020, 11, 20),
            ),
            Employee(
                first_name="Eva",
                last_name="Davis",
                email="eva.davis@company.com",
                department="Marketing",
                position="Marketing Lead",
                salary=75000,
                hire_date=date(2022, 9, 5),
            ),
        ]
        db.add_all(employees)
        db.flush()

    password_hash = hash_password(DEFAULT_PASSWORD)

    admin = User(
        email="admin@company.com",
        hashed_password=password_hash,
        full_name="Portal Admin",
        role="admin",
        employee_id=None,
    )
    db.add(admin)

    for employee in employees:
        db.add(
            User(
                email=employee.email,
                hashed_password=password_hash,
                full_name=f"{employee.first_name} {employee.last_name}",
                role="employee",
                employee_id=employee.id,
            )
        )

    if db.query(Attendance).count() == 0 and employees:
        today = date.today()
        db.add_all(
            [
                Attendance(
                    employee_id=employees[0].id,
                    date=today,
                    check_in=time(9, 5),
                    check_out=None,
                    status="present",
                ),
                Attendance(
                    employee_id=employees[1].id,
                    date=today,
                    check_in=time(10, 15),
                    check_out=None,
                    status="late",
                ),
            ]
        )

    if db.query(LeaveRequest).count() == 0 and len(employees) >= 3:
        db.add(
            LeaveRequest(
                employee_id=employees[2].id,
                leave_type="annual",
                start_date=date.today(),
                end_date=date.today(),
                reason="Personal appointment",
                status="approved",
            )
        )

    db.commit()
