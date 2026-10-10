from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.services.seed_data import seed_database
from app.api import creators, briefs, matches, shortlist, engagements

def init_db():
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)

# Ensure database is initialized
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="Cre8Match AI API",
    description="The right creative. The right proof. The right match. — Creative Fit Intelligence Engine for Kampus.VC",
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

# Mount API routers
api_prefix = settings.API_V1_STR
app.include_router(creators.router, prefix=api_prefix)
app.include_router(briefs.router, prefix=api_prefix)
app.include_router(matches.router, prefix=api_prefix)
app.include_router(shortlist.router, prefix=api_prefix)
app.include_router(engagements.router, prefix=api_prefix)

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
        "service": "Cre8Match AI Engine",
        "version": "1.0.0",
        "mode": "Active"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to Cre8Match AI API",
        "docs_url": "/docs",
        "api_v1": api_prefix
    }
