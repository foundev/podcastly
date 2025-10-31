# Repository Guidelines

## Project Structure & Module Organization
- Keep `main.py` minimal; implement RSS parsing, catalog adapters, and playback control inside `podcastly/`.
- Group modules into `podcastly/feeds/`, `podcastly/services/`, and `podcastly/ui/`, and mirror that layout inside `tests/`.
- Place sample feeds and mocked catalog payloads in `assets/samples/`; keep vanilla JS/CSS assets under `web/js/` and `web/css/`.

## Build, Test, and Development Commands
- `python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt` – bootstrap dependencies.
- `python main.py --rss-url=https://example.com/feed.xml` – run the local prototype against a feed; add flags instead of editing source.
- `python -m http.server 8000 --directory web` – host the static JS frontend during manual testing.
- `pytest -vv` – execute the backend test suite with verbose output when debugging failures.

- Stick to vanilla Python and browser JavaScript: 4-space indentation, `snake_case` functions, `PascalCase` classes, and modules like `rss_reader.py`.
- Run `black` (88 cols) and `ruff` before committing Python changes; format frontend files with `npx prettier --write`.
- Favor f-strings for logging and keep modules side-effect free so CLI and browser layers can reuse them.

## Testing Guidelines
- Place tests under `tests/feeds/` and `tests/services/`; follow the `test_<module>.py` naming pattern.
- Cover new RSS parsing logic with both happy-path and malformed-feed cases; mock remote catalog calls using fixtures in `assets/samples/`.
- Target ≥85% statement coverage; note gaps in the PR if coverage dips temporarily.

## Commit & Pull Request Guidelines
- Write imperative commit subjects (~50 chars) with context in the body; reference issues using `Fixes #123` when closing tickets.
- Squash WIP commits before opening a PR, and ensure `pytest` plus manual feed checks succeed.
- PR descriptions should outline the new capability (e.g., catalog adapter), list test evidence, and include UI screenshots if the vanilla JS layer changes.

## Feature Scope & Roadmap
- MVP: ingest RSS feeds, cache episode metadata, and expose a simple queue to the vanilla JS player.
- Near term: add adapters in `podcastly/services/` for common directories (Apple, Spotify, Pocket Casts).
- Long term: track user preferences and playback history while keeping the Python backend framework-free.

## Security & Configuration Tips
- Do not commit API keys or catalog tokens; load them from `.env` files ignored by git and document required variables in `.env.example`.
- Validate feed URLs and sanitize network responses to avoid SSRF and markup injection.
