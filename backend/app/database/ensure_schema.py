from sqlalchemy import text

from app.database.session import engine


def ensure_schema() -> None:
    """Add columns/tables for existing DBs (create_all does not alter tables)."""
    statements = [
        "ALTER TABLE employees ADD COLUMN IF NOT EXISTS phone VARCHAR(30)",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_lat DOUBLE PRECISION",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_lng DOUBLE PRECISION",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_accuracy DOUBLE PRECISION",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_office BOOLEAN",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_lat DOUBLE PRECISION",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_lng DOUBLE PRECISION",
        "ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_accuracy DOUBLE PRECISION",
        "ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS admin_note TEXT NOT NULL DEFAULT ''",
        """
        CREATE TABLE IF NOT EXISTS timesheet_entries (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id),
            work_date DATE NOT NULL,
            hours NUMERIC(4, 2) NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (employee_id, work_date)
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS salary_payments (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER NOT NULL REFERENCES employees(id),
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            amount NUMERIC(12, 2) NOT NULL,
            deposited_on DATE NOT NULL,
            payslip_filename VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (employee_id, year, month)
        )
        """,
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
