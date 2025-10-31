from pathlib import Path

import pytest

from podcastly import db
from podcastly.services import subscriptions

SAMPLE_FEED = Path("assets/samples/sample_feed.xml").read_bytes()


@pytest.fixture()
def memory_db():
    conn = db.get_connection(":memory:")
    db.init_db(conn)
    try:
        yield conn
    finally:
        conn.close()


def test_subscribe_persists_podcast_and_episodes(memory_db, monkeypatch):
    monkeypatch.setattr(
        subscriptions.rss_reader, "fetch_feed", lambda url: SAMPLE_FEED
    )

    podcast = subscriptions.subscribe(memory_db, "https://example.com/feed.xml")

    assert podcast.title == "Sample Podcast"

    podcasts = subscriptions.list_podcasts(memory_db)
    assert len(podcasts) == 1

    episodes = subscriptions.list_episodes(memory_db, podcast.id)
    assert len(episodes) == 2
    assert episodes[0].title == "Episode Two"
    assert episodes[1].title == "Episode One"


def test_subscribe_rejects_blank_urls(memory_db):
    with pytest.raises(subscriptions.SubscriptionError):
        subscriptions.subscribe(memory_db, "  ")
