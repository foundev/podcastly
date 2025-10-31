#!/usr/bin/env python3
"""Podcastly application entry point."""

from __future__ import annotations

import argparse
import logging
from pathlib import Path

from podcastly import DEFAULT_DB_PATH
from podcastly import db
from podcastly.services import subscriptions
from podcastly.ui import server as ui_server


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run the Podcastly web application.")
    parser.add_argument("--host", default="127.0.0.1", help="HTTP host to bind")
    parser.add_argument(
        "--port", type=int, default=8000, help="HTTP port to listen on (default: 8000)"
    )
    parser.add_argument(
        "--db-path",
        type=Path,
        default=DEFAULT_DB_PATH,
        help="Path to the SQLite database file",
    )
    parser.add_argument(
        "--static-root",
        type=Path,
        default=Path("web"),
        help="Directory containing static frontend assets",
    )
    parser.add_argument(
        "--rss-url",
        action="append",
        default=[],
        help="RSS feed URL to subscribe to on startup (may be provided multiple times)",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        help="Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    logging.basicConfig(
        level=getattr(logging, args.log_level.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )
    logger = logging.getLogger("podcastly")

    conn = db.ensure_database(args.db_path)
    try:
        for feed_url in args.rss_url:
            try:
                podcast = subscriptions.subscribe(conn, feed_url)
                logger.info("Subscribed to %s", podcast.title)
            except Exception as exc:  # pragma: no cover - CLI convenience
                logger.error("Failed to subscribe to %s: %s", feed_url, exc)
    finally:
        conn.close()

    ui_server.run_server(
        host=args.host,
        port=args.port,
        db_path=args.db_path,
        static_root=args.static_root,
    )


if __name__ == "__main__":
    main()
