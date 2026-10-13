import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

def get_cors_origins() -> list[str]:
    default_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "https://hac-x-lerate-ywm3.vercel.app",
        "https://hac-x-lerate-murex.vercel.app",
    ]
    env_origins = os.getenv("CORS_ORIGINS")
    if env_origins:
        parsed = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
        for origin in parsed:
            if origin not in default_origins:
                default_origins.append(origin)
    return default_origins

class Settings(BaseModel):
    PROJECT_NAME: str = "UNFRAME"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cre8match.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORS_ORIGINS: list[str] = get_cors_origins()

settings = Settings()
