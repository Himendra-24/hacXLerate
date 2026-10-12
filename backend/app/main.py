from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal, run_migrations
from app.services.seed_data import seed_database
import os
from fastapi.staticfiles import StaticFiles
from app.api import (
    creators, briefs, matches, shortlist, engagements, messages, reviews, uploads, organizations, auth
)

# Ensure uploads directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

from sqlalchemy import inspect

_db_initialized = False

def init_db():
    """
    Initializes database schema and idempotent seed data once.
    Safely handles read-only SQLite deployments without crashing.
    """
    global _db_initialized
    if _db_initialized:
        return

    try:
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        if not existing_tables:
            Base.metadata.create_all(bind=engine)
            run_migrations(engine)
            with SessionLocal() as db:
                seed_database(db)
        else:
            run_migrations(engine)
            with SessionLocal() as db:
                seed_database(db)
    except Exception as e:
        print(f"[Database Init] Safe startup notice: {e}")
    finally:
        _db_initialized = True

# Ensure database is initialized once
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="UNFRAME API",
    description="Find the talent behind the vision. — Creative Fit Intelligence Engine for Kampus.VC",
    version="1.0.0",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for asset uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Mount API routers (supports both /api/v1 and /v1 for resilient serverless proxy routing)
api_prefix = settings.API_V1_STR
for prefix in [api_prefix, "/v1"]:
    app.include_router(auth.router, prefix=prefix)
    app.include_router(creators.router, prefix=prefix)
    app.include_router(briefs.router, prefix=prefix)
    app.include_router(organizations.router, prefix=prefix)
    app.include_router(matches.router, prefix=prefix)
    app.include_router(shortlist.router, prefix=prefix)
    app.include_router(engagements.router, prefix=prefix)
    app.include_router(messages.router, prefix=prefix)
    app.include_router(reviews.router, prefix=prefix)
    app.include_router(uploads.router, prefix=prefix)

from fastapi import Depends
from app.core.database import get_db
from app.schemas.schemas import SubmissionFeedbackUpdate, SubmissionResponse
from app.api.engagements import provide_submission_feedback

@app.post(f"{api_prefix}/submissions/{{submission_id}}/feedback", response_model=SubmissionResponse, tags=["Engagements & Delivery"])
def feedback_alias(submission_id: str, data: SubmissionFeedbackUpdate, db = Depends(get_db)):
    return provide_submission_feedback(submission_id, data, db)

@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "UNFRAME AI Engine",
        "version": "1.0.0",
        "mode": "Active"
    }

@app.get("/", tags=["Root"])
@app.get("/api", tags=["Root"])
@app.get("/api/index", include_in_schema=False)
@app.get("/api/index.py", include_in_schema=False)
def root():
    return {
        "message": "Welcome to UNFRAME API",
        "docs_url": "/docs",
        "api_v1": api_prefix
    }

