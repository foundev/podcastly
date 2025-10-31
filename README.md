# Podcastly

Open source podcast app written in vanilla Python and JavaScript. Subscribe to your favorite shows via RSS, with adapters for popular podcast directories on the roadmap.

## Quick Start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py --host=127.0.0.1 --port=8000
```

Then visit [http://127.0.0.1:8000](http://127.0.0.1:8000) to use the web player. Optionally pre-load feeds on launch:

```bash
python main.py --rss-url=https://example.com/feed.xml --rss-url=https://example.org/show.rss
```

## Running Tests

```bash
pytest -vv
```

## License

GPL v3
