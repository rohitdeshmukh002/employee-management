from datetime import date, datetime

from sqlalchemy import Date, DateTime, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Employee(Base):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    department: Mapped[str] = mapped_column(String(100))
    position: Mapped[str] = mapped_column(String(100))
    salary: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    hire_date: Mapped[date] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now()
    )
