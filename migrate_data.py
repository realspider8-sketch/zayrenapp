import sqlite3
import os

AUTH_DB_PATH = "zayren_db.db"
APP_DB_PATH = "backend/zayren_db.db"

def migrate_data():
    if not os.path.exists(AUTH_DB_PATH) or not os.path.exists(APP_DB_PATH):
        print("One of the databases is missing.")
        return

    print("Connecting to authoritative database...")
    conn_auth = sqlite3.connect(AUTH_DB_PATH)
    
    print("Connecting to app database...")
    conn_app = sqlite3.connect(APP_DB_PATH)
    
    auth_cursor = conn_auth.cursor()
    app_cursor = conn_app.cursor()
    
    # Get all tables in APP DB
    app_cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    tables = [row[0] for row in app_cursor.fetchall()]
    
    for table in tables:
        print(f"Migrating table: {table}")
        
        # Get columns in APP DB
        app_cursor.execute(f"PRAGMA table_info({table})")
        app_columns = [row[1] for row in app_cursor.fetchall()]
        
        # Get columns in AUTH DB
        auth_cursor.execute(f"PRAGMA table_info({table})")
        auth_columns = [row[1] for row in auth_cursor.fetchall()]
        
        if not auth_columns:
            print(f"Table {table} does not exist in authoritative DB. Skipping...")
            continue
            
        # Shared columns
        shared_columns = [col for col in app_columns if col in auth_columns]
        
        if not shared_columns:
            continue
            
        cols_str = ", ".join(shared_columns)
        placeholders = ", ".join(["?"] * len(shared_columns))
        
        # Read all rows from APP DB
        app_cursor.execute(f"SELECT {cols_str} FROM {table}")
        rows = app_cursor.fetchall()
        
        if not rows:
            print(f"  No rows to migrate for {table}")
            continue
            
        print(f"  Found {len(rows)} rows to migrate.")
        
        # Insert into AUTH DB
        insert_query = f"INSERT OR IGNORE INTO {table} ({cols_str}) VALUES ({placeholders})"
        try:
            auth_cursor.executemany(insert_query, rows)
            conn_auth.commit()
            print(f"  Successfully migrated rows for {table}")
        except Exception as e:
            print(f"  Error migrating {table}: {e}")

    conn_auth.close()
    conn_app.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate_data()
