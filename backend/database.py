import os
import logging
import sqlite3
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

# When running against SQLite for local development we need to render
# PostgreSQL UUID columns as a text/varchar type so SQLAlchemy can create tables.
SQLITE_DB_URL = "sqlite+aiosqlite:///./zayren_db.db"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Require DATABASE_URL from .env
DB_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./zayren_db.db")
    
engine = None
AsyncSessionLocal = None

def init_db(db_url: str):
    global engine, AsyncSessionLocal
    # Hide password in logs
    safe_url = db_url.split('@')[-1] if '@' in db_url else db_url
    logger.info(f"Initializing database engine with URL: {safe_url}")
    engine = create_async_engine(db_url, echo=False)
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def create_tables():
    pass

# Initialize with URL first
init_db(DB_URL)

Base = declarative_base()


def ensure_sqlite_schema():
    """Register compilation rules so PostgreSQL UUID types compile for SQLite."""
    try:
        @compiles(PG_UUID, "sqlite")
        def _compile_uuid_sqlite(type_, compiler, **kw):
            return "VARCHAR(36)"
    except Exception:
        pass


def run_sqlite_migrations():
    """Add any missing columns to existing SQLite tables (poor-man's migration).
    
    SQLAlchemy's create_all() only creates new tables; it never ALTERs existing
    ones.  We handle this with explicit ALTER TABLE statements that are safe to
    run repeatedly (the column-already-exists error is caught and ignored).
    """
    db_path = "zayren_db.db"
    if not os.path.exists(db_path):
        return

    new_columns = [
        # (table, column_name, column_def)
        # delivery_offices
        ("delivery_offices", "rating",           "REAL DEFAULT 4.5"),
        ("delivery_offices", "reviews_count",    "REAL DEFAULT 0"),
        ("delivery_offices", "distance_km",      "REAL DEFAULT 1.0"),
        ("delivery_offices", "estimated_time",   "TEXT DEFAULT '30-45 min'"),
        ("delivery_offices", "tag",              "TEXT"),
        ("delivery_offices", "owner_id",         "VARCHAR(36)"),
        ("delivery_offices", "whatsapp_number",  "TEXT"),
        ("delivery_offices", "address",          "TEXT"),
        ("delivery_offices", "latitude",         "REAL"),
        ("delivery_offices", "longitude",        "REAL"),
        ("delivery_offices", "is_verified",      "TEXT DEFAULT 'false'"),
        ("delivery_offices", "is_available",     "TEXT DEFAULT 'true'"),
        # delivery_requests
        ("delivery_requests", "state",             "TEXT"),
        ("delivery_requests", "lga",               "TEXT"),
        ("delivery_requests", "country",           "TEXT"),
        ("delivery_requests", "additional_details", "TEXT"),
        # delivery_partners
        ("delivery_partners", "office_id",         "VARCHAR(36)"),
        ("delivery_partners", "user_id",           "VARCHAR(36)"),
        # shops
        ("shops", "owner_id",                      "VARCHAR(36)"),
        # products
        ("products", "stock_quantity",             "REAL DEFAULT 0"),
        ("products", "category",                   "TEXT"),
        ("products", "status",                     "TEXT DEFAULT 'ACTIVE'"),
        # posts
        ("posts", "post_type",                     "TEXT DEFAULT 'post'"),
        ("posts", "audience",                      "TEXT DEFAULT 'public'"),
        # users admin fields
        ("users", "role",                          "TEXT DEFAULT 'user'"),
        ("users", "permissions",                   "TEXT"),
        ("users", "status",                        "TEXT DEFAULT 'Active'"),
        ("users", "admin_notes",                   "TEXT"),
        # shops admin fields
        ("shops", "status",                        "TEXT DEFAULT 'Pending'"),
        ("shops", "verification_documents",        "TEXT"),
        # delivery_offices admin fields
        ("delivery_offices", "status",             "TEXT DEFAULT 'Pending'"),
        ("delivery_offices", "verification_documents", "TEXT"),
    ]

    conn = sqlite3.connect(db_path)
    try:
        for table, col, col_def in new_columns:
            try:
                conn.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}")
                logger.info("Migration: added column %s.%s", table, col)
            except sqlite3.OperationalError as e:
                if "duplicate column name" in str(e).lower():
                    pass
                else:
                    logger.warning("Migration warning for %s.%s: %s", table, col, e)
        conn.commit()
    finally:
        conn.close()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
