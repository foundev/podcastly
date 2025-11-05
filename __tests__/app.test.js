/**
 * Tests for app.js
 */

const path = require('path');
const { loadModule } = require('./test-helper');

describe('App Module', () => {
  beforeEach(() => {
    // Setup DOM before loading modules
    document.body.innerHTML = `
      <form id="subscribe-form">
        <input id="feed-url" type="text" />
      </form>
      <div id="status-message"></div>
      <ul id="podcast-list"></ul>
      <h2 id="episodes-heading">Episodes</h2>
      <ul id="episode-list"></ul>
      <template id="podcast-item-template">
        <li>
          <button class="podcast-button">
            <span class="podcast-title"></span>
            <span class="podcast-description"></span>
          </button>
        </li>
      </template>
      <template id="episode-item-template">
        <li>
          <h3 class="episode-title"></h3>
          <p class="episode-description"></p>
          <div class="episode-meta"></div>
          <a class="episode-audio">Listen</a>
          <a class="episode-link">Notes</a>
        </li>
      </template>
    `;

    localStorage.clear();
    localStorage.setItem('podcastly_next_id', '1');

    // Load dependencies
    const storagePath = path.join(__dirname, '../web/js/storage.js');
    loadModule(storagePath);

    const parserPath = path.join(__dirname, '../web/js/rss-parser.js');
    loadModule(parserPath);

    // Load app.js
    const appPath = path.join(__dirname, '../web/js/app.js');
    loadModule(appPath);

    // Reset global state
    global.nextId = 1;
    global.state.podcasts = [];
    global.state.selectedPodcastId = null;

    document.getElementById('podcast-list').innerHTML = '';
    document.getElementById('episode-list').innerHTML = '';
    document.getElementById('status-message').textContent = '';
  });

  describe('truncate', () => {
    test('should return text unchanged if shorter than maxLength', () => {
      const text = 'Short text';
      expect(truncate(text)).toBe('Short text');
    });

    test('should truncate long text', () => {
      const text = 'a'.repeat(300);
      const result = truncate(text);

      expect(result.length).toBeLessThan(281);
      expect(result).toContain('…');
    });

    test('should respect custom maxLength', () => {
      const text = 'Hello World';
      const result = truncate(text, 5);

      expect(result.length).toBe(5);
      expect(result).toBe('Hell…');
    });
  });

  describe('setStatus', () => {
    test('should set status message', () => {
      setStatus('Test message');

      const statusNode = document.getElementById('status-message');
      expect(statusNode.textContent).toBe('Test message');
    });

    test('should add error class when isError is true', () => {
      setStatus('Error message', true);

      const statusNode = document.getElementById('status-message');
      expect(statusNode.classList.contains('is-error')).toBe(true);
    });

    test('should remove error class when isError is false', () => {
      const statusNode = document.getElementById('status-message');
      statusNode.classList.add('is-error');

      setStatus('Success message', false);

      expect(statusNode.classList.contains('is-error')).toBe(false);
    });
  });

  describe('renderPodcasts', () => {
    test('should show message when no podcasts', () => {
      global.state.podcasts = [];
      renderPodcasts();

      const list = document.getElementById('podcast-list');
      expect(list.innerHTML).toContain('No podcasts yet');
    });

    test('should render podcast list', () => {
      global.state.podcasts = [
        {
          id: 1,
          title: 'Test Podcast',
          description: 'Test Description'
        }
      ];

      renderPodcasts();

      const list = document.getElementById('podcast-list');
      const buttons = list.querySelectorAll('.podcast-button');

      expect(buttons.length).toBe(1);
      expect(list.textContent).toContain('Test Podcast');
      expect(list.textContent).toContain('Test Description');
    });

    test('should highlight selected podcast', () => {
      global.state.podcasts = [
        { id: 1, title: 'Podcast 1', description: 'Desc 1' },
        { id: 2, title: 'Podcast 2', description: 'Desc 2' }
      ];
      global.state.selectedPodcastId = 1;

      renderPodcasts();

      const buttons = document.querySelectorAll('.podcast-button');
      expect(buttons[0].classList.contains('is-selected')).toBe(true);
      expect(buttons[1].classList.contains('is-selected')).toBe(false);
    });
  });

  describe('renderEpisodes', () => {
    test('should show message when no episodes', () => {
      const data = {
        podcast: { title: 'Test Podcast' },
        episodes: []
      };

      renderEpisodes(data);

      const list = document.getElementById('episode-list');
      expect(list.innerHTML).toContain('No episodes found');
    });

    test('should render episode list', () => {
      const data = {
        podcast: { title: 'Test Podcast' },
        episodes: [
          {
            title: 'Episode 1',
            description: 'Description 1',
            audio_url: 'http://example.com/ep1.mp3',
            link: 'http://example.com/ep1',
            published_at: '2024-01-15',
            duration: '30:00'
          }
        ]
      };

      renderEpisodes(data);

      const list = document.getElementById('episode-list');
      expect(list.textContent).toContain('Episode 1');
      expect(list.textContent).toContain('Description 1');
      expect(list.textContent).toContain('Duration: 30:00');
    });

    test('should update heading with podcast title', () => {
      const data = {
        podcast: { title: 'My Podcast' },
        episodes: []
      };

      renderEpisodes(data);

      const heading = document.getElementById('episodes-heading');
      expect(heading.textContent).toContain('My Podcast');
    });

    test('should remove audio link if no audio_url', () => {
      const data = {
        podcast: { title: 'Test Podcast' },
        episodes: [
          {
            title: 'Episode 1',
            description: 'Description 1',
            audio_url: null
          }
        ]
      };

      renderEpisodes(data);

      const list = document.getElementById('episode-list');
      const audioLinks = list.querySelectorAll('.episode-audio');
      expect(audioLinks.length).toBe(0);
    });
  });

  describe('refreshPodcasts', () => {
    test('should load and render podcasts', () => {
      const testPodcasts = [
        { id: 1, title: 'Podcast 1', feed_url: 'http://example.com/1' }
      ];
      savePodcasts(testPodcasts);

      refreshPodcasts();

      expect(global.state.podcasts.length).toBe(1);
      const list = document.getElementById('podcast-list');
      expect(list.textContent).toContain('Podcast 1');
    });

    test('should sort podcasts by updated_at descending', () => {
      const testPodcasts = [
        { id: 1, title: 'Podcast 1', updated_at: '2024-01-01' },
        { id: 2, title: 'Podcast 3', updated_at: '2024-03-01' },
        { id: 3, title: 'Podcast 2', updated_at: '2024-02-01' }
      ];
      savePodcasts(testPodcasts);

      refreshPodcasts();

      expect(global.state.podcasts[0].title).toBe('Podcast 3');
      expect(global.state.podcasts[1].title).toBe('Podcast 2');
      expect(global.state.podcasts[2].title).toBe('Podcast 1');
    });
  });

  describe('loadEpisodes', () => {
    test('should load and render episodes for podcast', () => {
      const podcast = addPodcast({
        title: 'Test Podcast',
        feed_url: 'http://example.com/feed'
      });

      addEpisodesToPodcast(podcast.id, [
        { title: 'Episode 1', guid: 'ep1' }
      ]);

      loadEpisodes(podcast.id);

      const list = document.getElementById('episode-list');
      expect(list.textContent).toContain('Episode 1');
    });

    test('should show error for non-existent podcast', () => {
      loadEpisodes(999);

      const statusNode = document.getElementById('status-message');
      expect(statusNode.textContent).toContain('Podcast non trouvé');
      expect(statusNode.classList.contains('is-error')).toBe(true);
    });
  });

  describe('highlightSelectedPodcast', () => {
    test('should toggle is-selected class correctly', () => {
      global.state.podcasts = [
        { id: 1, title: 'Podcast 1' },
        { id: 2, title: 'Podcast 2' }
      ];
      global.state.selectedPodcastId = 2;

      renderPodcasts();
      highlightSelectedPodcast();

      const buttons = document.querySelectorAll('.podcast-button');
      expect(buttons[0].classList.contains('is-selected')).toBe(false);
      expect(buttons[1].classList.contains('is-selected')).toBe(true);
    });
  });

  describe('handleSubscribe', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    test('should not subscribe with empty URL', async () => {
      const event = { preventDefault: jest.fn() };
      const input = document.getElementById('feed-url');
      input.value = '';

      await handleSubscribe(event);

      expect(event.preventDefault).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('should subscribe to feed successfully', async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
            <item>
              <title>Episode 1</title>
              <guid>ep1</guid>
            </item>
          </channel>
        </rss>
      `;

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse)
      };
      global.fetch.mockResolvedValue(mockResponse);

      const event = { preventDefault: jest.fn() };
      const input = document.getElementById('feed-url');
      input.value = 'http://example.com/feed';

      await handleSubscribe(event);

      expect(global.state.podcasts.length).toBe(1);
      expect(global.state.podcasts[0].title).toBe('Test Podcast');

      const statusNode = document.getElementById('status-message');
      expect(statusNode.textContent).toContain('Abonné à Test Podcast');
      expect(statusNode.classList.contains('is-error')).toBe(false);
    });

    test('should handle subscription error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      const event = { preventDefault: jest.fn() };
      const input = document.getElementById('feed-url');
      input.value = 'http://example.com/feed';

      await handleSubscribe(event);

      const statusNode = document.getElementById('status-message');
      expect(statusNode.classList.contains('is-error')).toBe(true);
    });
  });
});
