"""HTTP server bridging the Podcastly backend with the vanilla JS frontend."""

from __future__ import annotations

import json
import logging
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Callable
from urllib.parse import urlparse

from .. import DEFAULT_DB_PATH
from .. import db
from ..feeds import rss_reader
from ..services import subscriptions

LOGGER = logging.getLogger(__name__)

STATIC_ROOT = Path("web")


def run_server(
    host: str = "127.0.0.1",
    port: int = 8000,
    db_path: Path | str = DEFAULT_DB_PATH,
    static_root: Path | str = STATIC_ROOT,
) -> None:
    """Start the HTTP server."""
    db.ensure_database(db_path).close()
    handler_cls = _build_handler(Path(db_path), Path(static_root))
    server = ThreadingHTTPServer((host, port), handler_cls)

    LOGGER.info("Starting Podcastly server on http://%s:%s", host, port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:  # pragma: no cover - manual shutdown path
        LOGGER.info("Shutting down server")
    finally:
        server.server_close()


def _build_handler(db_path: Path, static_root: Path) -> Callable[..., BaseHTTPRequestHandler]:
    """Create a request handler bound to the database and static directories."""

    db_path_resolved = db_path
    static_root_resolved = static_root

    class PodcastlyRequestHandler(BaseHTTPRequestHandler):
        server_version = "PodcastlyHTTP/0.1"
        db_path = db_path_resolved
        static_root = static_root_resolved

        def do_GET(self) -> None:
            parsed = urlparse(self.path)
            if parsed.path == "/api/podcasts":
                return self._handle_list_podcasts()
            if parsed.path.startswith("/api/podcasts/"):
                return self._handle_podcast_detail(parsed.path)
            if parsed.path == "/api/health":
                return self._json_response(HTTPStatus.OK, {"status": "ok"})
            return self._serve_static(parsed.path)

        def do_POST(self) -> None:
            parsed = urlparse(self.path)
            if parsed.path == "/api/podcasts":
                return self._handle_subscribe()
            self._json_response(
                HTTPStatus.NOT_FOUND, {"error": f"Unknown endpoint {parsed.path}"}
            )

        def do_OPTIONS(self) -> None:
            self.send_response(HTTPStatus.NO_CONTENT)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def log_message(self, format: str, *args) -> None:  # pragma: no cover
            LOGGER.info("%s - %s", self.address_string(), format % args)

        # Handlers -----------------------------------------------------------------

        def _handle_list_podcasts(self) -> None:
            conn = db.get_connection(self.db_path)
            try:
                podcasts = subscriptions.list_podcasts(conn)
                payload = {"podcasts": [self._serialize_podcast(p) for p in podcasts]}
                self._json_response(HTTPStatus.OK, payload)
            finally:
                conn.close()

        def _handle_podcast_detail(self, path: str) -> None:
            parts = path.split("/")
            if len(parts) < 4:
                return self._json_response(
                    HTTPStatus.BAD_REQUEST, {"error": "Podcast ID missing"}
                )
            try:
                podcast_id = int(parts[3])
            except ValueError:
                return self._json_response(
                    HTTPStatus.BAD_REQUEST, {"error": "Podcast ID must be numeric"}
                )

            conn = db.get_connection(self.db_path)
            try:
                podcast = subscriptions.get_podcast(conn, podcast_id)
                if not podcast:
                    return self._json_response(
                        HTTPStatus.NOT_FOUND, {"error": "Podcast not found"}
                    )
                episodes = subscriptions.list_episodes(conn, podcast_id)
                payload = {
                    "podcast": self._serialize_podcast(podcast),
                    "episodes": [self._serialize_episode(ep) for ep in episodes],
                }
                self._json_response(HTTPStatus.OK, payload)
            finally:
                conn.close()

        def _handle_subscribe(self) -> None:
            data = self._read_json_body()
            if not data or "feed_url" not in data:
                return self._json_response(
                    HTTPStatus.BAD_REQUEST, {"error": "feed_url is required"}
                )

            conn = db.get_connection(self.db_path)
            try:
                try:
                    podcast = subscriptions.subscribe(conn, data["feed_url"])
                except subscriptions.SubscriptionError as exc:
                    return self._json_response(
                        HTTPStatus.BAD_REQUEST, {"error": str(exc)}
                    )
                except rss_reader.FeedError as exc:
                    return self._json_response(
                        HTTPStatus.BAD_REQUEST, {"error": str(exc)}
                    )
                payload = {"podcast": self._serialize_podcast(podcast)}
                self._json_response(HTTPStatus.CREATED, payload)
            finally:
                conn.close()

        # Helpers ------------------------------------------------------------------

        def _serve_static(self, path: str) -> None:
            if path == "/" or not path:
                path = "/index.html"

            requested = (self.static_root / path.lstrip("/")).resolve()
            try:
                static_root_resolved = self.static_root.resolve()
            except FileNotFoundError:
                static_root_resolved = self.static_root

            if not str(requested).startswith(str(static_root_resolved)):
                return self._json_response(
                    HTTPStatus.NOT_FOUND, {"error": "File not found"}
                )

            if requested.is_dir():
                requested = requested / "index.html"

            if not requested.exists():
                return self._json_response(
                    HTTPStatus.NOT_FOUND, {"error": "File not found"}
                )

            content = requested.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", _guess_content_type(requested))
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)

        def _read_json_body(self) -> Optional[dict]:
            length_header = self.headers.get("Content-Length")
            if not length_header:
                return None
            try:
                length = int(length_header)
            except ValueError:
                return None

            raw = self.rfile.read(length)
            if not raw:
                return None
            try:
                return json.loads(raw.decode("utf-8"))
            except json.JSONDecodeError:
                return None

        def _json_response(self, status: HTTPStatus, payload: dict) -> None:
            body = json.dumps(payload).encode("utf-8")
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)

        @staticmethod
        def _serialize_podcast(podcast: subscriptions.Podcast) -> dict:
            return {
                "id": podcast.id,
                "title": podcast.title,
                "description": podcast.description,
                "link": podcast.link,
                "feed_url": podcast.feed_url,
                "image_url": podcast.image_url,
                "updated_at": podcast.updated_at,
            }

        @staticmethod
        def _serialize_episode(episode: subscriptions.EpisodeRecord) -> dict:
            return {
                "id": episode.id,
                "podcast_id": episode.podcast_id,
                "guid": episode.guid,
                "title": episode.title,
                "description": episode.description,
                "audio_url": episode.audio_url,
                "link": episode.link,
                "published_at": episode.published_at,
                "duration": episode.duration,
            }

    return PodcastlyRequestHandler


def _guess_content_type(path: Path) -> str:
    extension = path.suffix.lower()
    return {
        ".html": "text/html; charset=utf-8",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".json": "application/json; charset=utf-8",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".svg": "image/svg+xml",
    }.get(extension, "application/octet-stream")
