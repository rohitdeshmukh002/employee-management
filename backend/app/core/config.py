import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://employee:employee@localhost:5433/employee_management",
)

SECRET_KEY = os.getenv(
    "SECRET_KEY",
    "dev-secret-change-me-employee-management-portal",
)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]
