"""Service layer for subscriptions and catalog interactions."""

from .subscriptions import (
    EpisodeRecord,
    Podcast,
    SubscriptionError,
    get_podcast,
    list_episodes,
    list_podcasts,
    subscribe,
)

__all__ = [
    "EpisodeRecord",
    "Podcast",
    "SubscriptionError",
    "get_podcast",
    "list_episodes",
    "list_podcasts",
    "subscribe",
]
