from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base


class TimesheetEntry(Base):
    __tablename__ = "timesheet_entries"
    __table_args__ = (
        UniqueConstraint("employee_id", "work_date", name="uq_timesheet_employee_date"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(ForeignKey("employees.id"))
    work_date: Mapped[date] = mapped_column(Date)
    hours: Mapped[Decimal] = mapped_column(Numeric(4, 2))
    description: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    employee = relationship("Employee", back_populates="timesheet_entries")
