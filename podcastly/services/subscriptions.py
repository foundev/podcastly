"""Subscription and catalog services for Podcastly."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import datetime
from typing import Iterable, List, Optional

from ..db import transaction
from ..feeds import rss_reader


@dataclass
class Podcast:
    id: int
    title: str
    description: Optional[str]
    link: Optional[str]
    feed_url: str
    image_url: Optional[str]
    updated_at: Optional[str]


@dataclass
class EpisodeRecord:
    id: int
    podcast_id: int
    guid: Optional[str]
    title: str
    description: Optional[str]
    audio_url: Optional[str]
    link: Optional[str]
    published_at: Optional[str]
    duration: Optional[str]


class SubscriptionError(RuntimeError):
    """Raised when a subscription cannot be created or updated."""


def subscribe(conn: sqlite3.Connection, feed_url: str) -> Podcast:
    """Subscribe to a podcast feed and persist its episodes."""
    feed_url = feed_url.strip()
    if not feed_url:
        raise SubscriptionError("Feed URL cannot be empty")

    raw_feed = rss_reader.fetch_feed(feed_url)
    feed_data = rss_reader.parse_feed(raw_feed)

    now = datetime.utcnow().isoformat(sep=" ", timespec="seconds")
    with transaction(conn) as cur:
        cur.execute(
            """
            INSERT INTO podcasts (title, description, link, feed_url, image_url, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(feed_url) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                link = excluded.link,
                image_url = excluded.image_url,
                updated_at = excluded.updated_at
            """,
            (
                feed_data.title,
                feed_data.description,
                feed_data.link,
                feed_url,
                feed_data.image_url,
                now,
            ),
        )

        if cur.lastrowid:
            podcast_id = cur.lastrowid
        else:
            podcast_id = cur.execute(
                "SELECT id FROM podcasts WHERE feed_url = ?", (feed_url,)
            ).fetchone()[0]

        _upsert_episodes(cur, podcast_id, feed_data.episodes)

        row = cur.execute(
            """
            SELECT id, title, description, link, feed_url, image_url, updated_at
            FROM podcasts
            WHERE id = ?
            """,
            (podcast_id,),
        ).fetchone()

    return Podcast(**dict(row))


def list_podcasts(conn: sqlite3.Connection) -> List[Podcast]:
    """Return all podcasts ordered by update time."""
    rows = conn.execute(
        """
        SELECT id, title, description, link, feed_url, image_url, updated_at
        FROM podcasts
        ORDER BY COALESCE(updated_at, '1970-01-01 00:00:00') DESC, id DESC
        """
    ).fetchall()
    return [Podcast(**dict(row)) for row in rows]


def list_episodes(conn: sqlite3.Connection, podcast_id: int) -> List[EpisodeRecord]:
    """Return all episodes for a podcast, newest first."""
    rows = conn.execute(
        """
        SELECT id, podcast_id, guid, title, description, audio_url, link, published_at, duration
        FROM episodes
        WHERE podcast_id = ?
        ORDER BY COALESCE(published_at, '1970-01-01 00:00:00') DESC, id DESC
        """,
        (podcast_id,),
    ).fetchall()
    return [EpisodeRecord(**dict(row)) for row in rows]


def get_podcast(conn: sqlite3.Connection, podcast_id: int) -> Optional[Podcast]:
    """Return a single podcast by ID."""
    row = conn.execute(
        """
        SELECT id, title, description, link, feed_url, image_url, updated_at
        FROM podcasts
        WHERE id = ?
        """,
        (podcast_id,),
    ).fetchone()
    return Podcast(**dict(row)) if row else None


def _upsert_episodes(
    cur: sqlite3.Cursor, podcast_id: int, episodes: Iterable[rss_reader.Episode]
) -> None:
    for episode in episodes:
        cur.execute(
            """
            INSERT INTO episodes (
                podcast_id, guid, title, description, audio_url, link, published_at, duration
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(podcast_id, guid) DO UPDATE SET
                title = excluded.title,
                description = excluded.description,
                audio_url = excluded.audio_url,
                link = excluded.link,
                published_at = excluded.published_at,
                duration = excluded.duration
            """,
            (
                podcast_id,
                episode.guid,
                episode.title,
                episode.description,
                episode.audio_url,
                episode.link,
                episode.published_at,
                episode.duration,
            ),
        )
