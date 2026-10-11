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

def init_db():
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    with SessionLocal() as db:
        seed_database(db)

# Ensure database is initialized
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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for asset uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Mount API routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(creators.router, prefix=api_prefix)
app.include_router(briefs.router, prefix=api_prefix)
app.include_router(organizations.router, prefix=api_prefix)
app.include_router(matches.router, prefix=api_prefix)
app.include_router(shortlist.router, prefix=api_prefix)
app.include_router(engagements.router, prefix=api_prefix)
app.include_router(messages.router, prefix=api_prefix)
app.include_router(reviews.router, prefix=api_prefix)
app.include_router(uploads.router, prefix=api_prefix)

from fastapi import Depends
from app.core.database import get_db
from app.schemas.schemas import SubmissionFeedbackUpdate, SubmissionResponse
from app.api.engagements import provide_submission_feedback

@app.post(f"{api_prefix}/submissions/{{submission_id}}/feedback", response_model=SubmissionResponse, tags=["Engagements & Delivery"])
def feedback_alias(submission_id: str, data: SubmissionFeedbackUpdate, db = Depends(get_db)):
    return provide_submission_feedback(submission_id, data, db)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "UNFRAME AI Engine",
        "version": "1.0.0",
        "mode": "Active"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to UNFRAME API",
        "docs_url": "/docs",
        "api_v1": api_prefix
    }
