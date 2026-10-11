from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# SQLite needs connect_args={"check_same_thread": False}
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
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

