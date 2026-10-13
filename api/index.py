import os
import sys
import traceback

# Ensure backend directory is in sys.path for module resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

try:
    from app.main import app
except Exception as e:
    err_trace = traceback.format_exc()
    print(f"[CRITICAL VERCEL BOOT ERROR]\n{err_trace}")
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse

    app = FastAPI(title="UNFRAME Boot Error Handler")

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    async def boot_error_handler(path: str):
        return JSONResponse(
            status_code=500,
            content={
                "status": "startup_failed",
                "error": str(e),
                "traceback": err_trace
            },
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*"
            }
        )
