"""Utilities for fetching and parsing RSS podcast feeds."""

from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from email.utils import parsedate_to_datetime
from typing import Iterable, List, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

LOGGER = logging.getLogger(__name__)

USER_AGENT = "Podcastly/0.1 (+https://github.com/your-org/podcastly)"


@dataclass
class Episode:
    guid: Optional[str]
    title: str
    description: Optional[str]
    audio_url: Optional[str]
    link: Optional[str]
    published_at: Optional[str]
    duration: Optional[str]


@dataclass
class FeedData:
    title: str
    description: Optional[str]
    link: Optional[str]
    image_url: Optional[str]
    episodes: List[Episode]


class FeedError(RuntimeError):
    """Raised when an RSS feed cannot be fetched or parsed."""


def fetch_feed(feed_url: str, timeout: float = 10.0) -> bytes:
    """Download an RSS feed and return its raw contents."""
    request = Request(feed_url, headers={"User-Agent": USER_AGENT})
    try:
        with urlopen(request, timeout=timeout) as response:
            return response.read()
    except URLError as exc:  # pragma: no cover - network error path
        raise FeedError(f"Failed to fetch feed {feed_url}") from exc


def parse_feed(xml_data: bytes) -> FeedData:
    """Parse RSS feed XML into a FeedData structure."""
    try:
        root = ET.fromstring(xml_data)
    except ET.ParseError as exc:
        raise FeedError("Feed XML is not well-formed") from exc

    channel = root.find("channel")
    if channel is None:
        raise FeedError("Feed is missing channel information")

    title = _clean_text(channel.findtext("title"))
    if not title:
        raise FeedError("Feed channel is missing a title")

    description = _clean_text(
        channel.findtext("description") or channel.findtext("subtitle")
    )
    link = _clean_text(channel.findtext("link"))
    image_url = _find_image(channel)

    episodes: List[Episode] = []
    for item in channel.findall("item"):
        episodes.append(_parse_episode(item))

    return FeedData(
        title=title,
        description=description,
        link=link,
        image_url=image_url,
        episodes=[ep for ep in episodes if ep.title],
    )


def _parse_episode(item: ET.Element) -> Episode:
    guid = _clean_text(item.findtext("guid") or item.findtext("id"))
    title = _clean_text(item.findtext("title")) or "Untitled Episode"
    description = _clean_text(
        item.findtext("description")
        or item.findtext("content:encoded")
        or item.findtext("summary")
    )
    link = _clean_text(item.findtext("link"))
    duration = _clean_text(
        item.findtext("itunes:duration") or item.findtext("{*}duration")
    )

    audio_url = None
    enclosure = item.find("enclosure")
    if enclosure is not None:
        audio_url = _clean_text(enclosure.attrib.get("url"))
    if not audio_url:
        audio_url = _clean_text(item.findtext("media:content"))

    published_at = _parse_pub_date(item)

    return Episode(
        guid=guid or audio_url or link,
        title=title,
        description=description,
        audio_url=audio_url,
        link=link,
        published_at=published_at,
        duration=duration,
    )


def _parse_pub_date(item: ET.Element) -> Optional[str]:
    raw_date = _clean_text(item.findtext("pubDate") or item.findtext("published"))
    if not raw_date:
        return None
    try:
        dt = parsedate_to_datetime(raw_date)
        if dt.tzinfo:
            dt = dt.astimezone().replace(tzinfo=None)
        return dt.isoformat(sep=" ", timespec="seconds")
    except (TypeError, ValueError):
        LOGGER.debug("Could not parse pubDate %s", raw_date)
        return raw_date


def _find_image(channel: ET.Element) -> Optional[str]:
    image = channel.find("image")
    if image is not None:
        url = image.findtext("url")
        if url:
            return _clean_text(url)

    # Look for common namespace-based image tags
    for candidate in _namespaced_tags("itunes", "image"):
        found = channel.find(candidate)
        if found is not None:
            href = found.attrib.get("href") or found.attrib.get("url")
            if href:
                return _clean_text(href)

    for candidate in _namespaced_tags("media", "thumbnail"):
        found = channel.find(candidate)
        if found is not None:
            href = found.attrib.get("href") or found.attrib.get("url")
            if href:
                return _clean_text(href)
    return None


def _namespaced_tags(prefix: str, tag: str) -> Iterable[str]:
    """Generate possible namespace-prefixed tag names."""
    namespace_map = {
        "itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
        "media": "http://search.yahoo.com/mrss/",
    }
    namespace = namespace_map.get(prefix)
    if namespace:
        yield f"{{{namespace}}}{tag}"
    yield f"{prefix}:{tag}"
    yield tag


def _clean_text(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None
    value = value.strip()
    return value or None
