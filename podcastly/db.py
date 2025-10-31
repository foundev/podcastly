"""SQLite persistence helpers for Podcastly."""

from __future__ import annotations

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Optional

from . import DEFAULT_DB_PATH

SCHEMA_VERSION = 1


def get_connection(db_path: Path | str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Return a SQLite connection with sensible defaults."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    """Create database tables if they do not yet exist."""
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS podcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            link TEXT,
            feed_url TEXT NOT NULL UNIQUE,
            image_url TEXT,
            updated_at TEXT
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS episodes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            podcast_id INTEGER NOT NULL,
            guid TEXT,
            title TEXT NOT NULL,
            description TEXT,
            audio_url TEXT,
            link TEXT,
            published_at TEXT,
            duration TEXT,
            FOREIGN KEY(podcast_id) REFERENCES podcasts(id) ON DELETE CASCADE,
            UNIQUE(podcast_id, guid)
        )
        """
    )
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS meta (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
        """
    )
    conn.execute(
        """
        INSERT OR REPLACE INTO meta(key, value)
        VALUES ('schema_version', ?)
        """,
        (SCHEMA_VERSION,),
    )
    conn.commit()


@contextmanager
def transaction(conn: sqlite3.Connection) -> Iterator[sqlite3.Cursor]:
    """Context manager that commits on success and rolls back on error."""
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()


def get_schema_version(conn: sqlite3.Connection) -> Optional[int]:
    """Return the current schema version recorded in the database."""
    row = conn.execute(
        "SELECT value FROM meta WHERE key = 'schema_version'"
    ).fetchone()
    return int(row["value"]) if row else None


def ensure_database(db_path: Path | str = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Create a connection and initialize tables if necessary."""
    conn = get_connection(db_path)
    if not get_schema_version(conn):
        init_db(conn)
    return conn
