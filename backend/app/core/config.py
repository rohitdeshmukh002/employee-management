import math
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

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/app/uploads")

# Preferred office location for attendance clarity (check-in still allowed anywhere).
OFFICE_LAT = float(os.getenv("OFFICE_LAT", "18.5204"))  # Pune default (demo)
OFFICE_LNG = float(os.getenv("OFFICE_LNG", "73.8567"))
OFFICE_RADIUS_M = float(os.getenv("OFFICE_RADIUS_M", "300"))


def distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine distance in meters."""
    r = 6371000.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def is_within_office(lat: float | None, lng: float | None) -> bool | None:
    if lat is None or lng is None:
        return None
    return distance_meters(lat, lng, OFFICE_LAT, OFFICE_LNG) <= OFFICE_RADIUS_M
