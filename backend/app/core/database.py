import os
import shutil
import tempfile
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def resolve_database_url() -> str:
    db_url = settings.DATABASE_URL
    if not db_url.startswith("sqlite"):
        if db_url.startswith("postgres://"):
            return db_url.replace("postgres://", "postgresql://", 1)
        return db_url

    # Check if running in a serverless read-only environment or if local file is not writable
    is_serverless = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))
    
    # Check directory writability
    writable = True
    try:
        test_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".write_test")
        with open(test_path, "w") as f:
            f.write("1")
        os.remove(test_path)
    except Exception:
        writable = False

    if is_serverless or not writable:
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

    return db_url

RESOLVED_DATABASE_URL = resolve_database_url()

# SQLite needs connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if RESOLVED_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    RESOLVED_DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

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

