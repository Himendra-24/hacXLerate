import os
import shutil
import tempfile
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

import re
import urllib.parse

def clean_database_url(url: str) -> str:
    m = re.match(r'^(postgres(?:ql)?(?:\+[a-zA-Z0-9_]+)?://)([^:]+):(.*)@([^@]+)$', url)
    if m:
        scheme, user, password, host_part = m.groups()
        if password.startswith('[') and password.endswith(']'):
            password = password[1:-1]
        unquoted = urllib.parse.unquote(password)
        encoded_pass = urllib.parse.quote(unquoted, safe='')
        return f"postgresql://{user}:{encoded_pass}@{host_part}"
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url

def build_sqlite_fallback_url() -> str:
    # Resolve writable location in /tmp
    tmp_base = "/tmp" if os.name != "nt" else tempfile.gettempdir()
    tmp_db_path = os.path.join(tmp_base, "cre8match.db")
    
    # If /tmp/cre8match.db does not exist, copy the packaged seeded database into /tmp
    if not os.path.exists(tmp_db_path):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        candidates = [
            os.path.join(base_dir, "cre8match.db"),
            os.path.join(os.path.dirname(base_dir), "cre8match.db"),
            os.path.abspath("cre8match.db"),
            "/var/task/backend/cre8match.db",
            "/var/task/cre8match.db",
        ]
        copied = False
        for src in candidates:
            if os.path.exists(src):
                try:
                    shutil.copy2(src, tmp_db_path)
                    print(f"[Database] Successfully copied seeded database from {src} to writable {tmp_db_path}")
                    copied = True
                    break
                except Exception as e:
                    print(f"[Database] Notice copying from {src}: {e}")
        if not copied:
            print(f"[Database] Warning: Seed database source not found; creating new at {tmp_db_path}")

    clean_path = tmp_db_path.replace("\\", "/")
    if not clean_path.startswith("/") and not (len(clean_path) > 1 and clean_path[1] == ":"):
        clean_path = "/" + clean_path
    return f"sqlite:///{clean_path}"

def create_database_engine():
    db_url = settings.DATABASE_URL
    is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

    if not db_url.startswith("sqlite"):
        cleaned_url = clean_database_url(db_url)
        # Try connecting to external database with short timeout
        try:
            connect_args = {"connect_timeout": 3}
            test_engine = create_engine(cleaned_url, connect_args=connect_args, echo=False)
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"[Database] Successfully connected to external database: {cleaned_url.split('@')[-1]}")
            return test_engine, cleaned_url
        except Exception as e:
            print(f"[Database] External database connection notice ({e}). Falling back to writable SQLite.")

    # SQLite resolution
    writable = True
    try:
        test_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".write_test")
        with open(test_path, "w") as f:
            f.write("1")
        os.remove(test_path)
    except Exception:
        writable = False

    if is_serverless or not writable:
        fallback_url = build_sqlite_fallback_url()
    else:
        fallback_url = db_url

    engine = create_engine(fallback_url, connect_args={"check_same_thread": False}, echo=False)
    return engine, fallback_url

engine, RESOLVED_DATABASE_URL = create_database_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations(target_engine):
    """
    Non-destructive schema migration for SQLite.
    Checks existing columns and safely adds missing columns.
    """
    inspector = inspect(target_engine)
    tables = inspector.get_table_names()

    # Column additions map: {table_name: [(column_name, column_type, default_clause)]}
    required_columns = {
        "users": [
            ("password_hash", "TEXT", "NULL"),
            ("is_active", "BOOLEAN", "1"),
            ("onboarding_completed", "BOOLEAN", "0"),
        ],
        "briefs": [
            ("organization_id", "TEXT", "NULL"),
            ("status", "TEXT", "'open'"),
            ("visibility", "TEXT", "'public'"),
        ],
        "brands": [
            ("owner_user_id", "TEXT", "NULL"),
            ("company_name", "TEXT", "'Default Studio'"),
            ("type", "TEXT", "'brand'"),
            ("industry", "TEXT", "NULL"),
            ("website", "TEXT", "NULL"),
            ("logo_url", "TEXT", "NULL"),
            ("description", "TEXT", "NULL"),
            ("verified", "BOOLEAN", "0"),
            ("created_at", "DATETIME", "CURRENT_TIMESTAMP"),
            ("updated_at", "DATETIME", "CURRENT_TIMESTAMP"),
        ],
        "asset_uploads": [
            ("uploader_user_id", "TEXT", "NULL"),
        ],
        "creator_profiles": [
            ("trust_level", "TEXT", "'Pending'"),
            ("verification_status", "TEXT", "'Pending'"),
            ("email_verified", "BOOLEAN", "0"),
            ("email_otp", "TEXT", "NULL"),
            ("ownership_code", "TEXT", "NULL"),
            ("verified_profiles", "TEXT", "'[]'"),
            ("verified_tools", "TEXT", "'[]'"),
        ],
    }

    with target_engine.connect() as conn:
        for table_name, cols in required_columns.items():
            if table_name in tables:
                existing_cols = {c["name"] for c in inspector.get_columns(table_name)}
                for col_name, col_type, default_val in cols:
                    if col_name not in existing_cols:
                        alter_query = f"ALTER TABLE {table_name} ADD COLUMN {col_name} {col_type} DEFAULT {default_val}"
                        try:
                            conn.execute(text(alter_query))
                            conn.commit()
                        except Exception as e:
                            print(f"[Migration] Notice on {table_name}.{col_name}: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

