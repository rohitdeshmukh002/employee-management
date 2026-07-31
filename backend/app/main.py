from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.attendance import router as attendance_router
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.employees import router as employees_router
from app.api.leave import router as leave_router
from app.api.salary import router as salary_router
from app.core.config import CORS_ORIGINS
from app.database.seed import seed_if_empty
from app.database.session import Base, SessionLocal, engine
from app.models import attendance, employee, leave, user  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Employee Management API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(employees_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
app.include_router(leave_router, prefix="/api")
app.include_router(salary_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
