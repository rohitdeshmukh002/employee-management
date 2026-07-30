import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://employee:employee@localhost:5432/employee_management",
)
