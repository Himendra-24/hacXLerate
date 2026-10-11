import os
import sys
import shutil

# Ensure backend directory is in sys.path for module resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# In serverless environments (e.g. Vercel Lambda), copy sqlite db to writable /tmp
tmp_db = "/tmp/cre8match.db"
src_db = os.path.join(BASE_DIR, "cre8match.db")
if not os.path.exists(tmp_db) and os.path.exists(src_db):
    try:
        shutil.copy2(src_db, tmp_db)
        os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db}"
    except Exception as e:
        print(f"[Vercel DB Init] Notice: {e}")
elif os.path.exists(tmp_db):
    os.environ["DATABASE_URL"] = f"sqlite:///{tmp_db}"

from app.main import app
