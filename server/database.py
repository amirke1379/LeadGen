import sqlite3
from config import DB_PATH


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS leads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            category TEXT,
            rating REAL,
            review_count INTEGER,
            phone TEXT,
            address TEXT,
            lat REAL,
            lng REAL,
            distance REAL,
            google_url TEXT,
            status TEXT DEFAULT 'new',
            contacted_at TEXT,
            contact_method TEXT,
            found_at TEXT DEFAULT (datetime('now'))
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS outreach_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lead_id INTEGER NOT NULL,
            method TEXT NOT NULL,
            message_sent TEXT,
            response_received TEXT,
            sent_at TEXT DEFAULT (datetime('now')),
            responded_at TEXT,
            FOREIGN KEY (lead_id) REFERENCES leads(id)
        )
    """)

    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_PATH}")
