from pathlib import Path

import pytest

from podcastly.feeds import rss_reader

SAMPLE_FEED = Path("assets/samples/sample_feed.xml")


def test_parse_feed_returns_episodes():
    feed_data = rss_reader.parse_feed(SAMPLE_FEED.read_bytes())

    assert feed_data.title == "Sample Podcast"
    assert feed_data.image_url == "https://example.com/podcasts/sample.jpg"
    assert len(feed_data.episodes) == 2

    first = feed_data.episodes[0]
    assert first.title == "Episode One"
    assert first.audio_url == "https://cdn.example.com/sample-1.mp3"
    assert first.duration == "10:05"


def test_parse_feed_requires_channel_title():
    invalid_xml = b"<rss><channel></channel></rss>"
    with pytest.raises(rss_reader.FeedError):
        rss_reader.parse_feed(invalid_xml)
