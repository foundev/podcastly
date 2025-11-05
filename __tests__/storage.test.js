/**
 * Tests for storage.js
 */

const path = require('path');
const { loadModule } = require('./test-helper');

describe('Storage Module', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('podcastly_next_id', '1');

    // Load storage.js in global scope
    const storagePath = path.join(__dirname, '../web/js/storage.js');
    loadModule(storagePath);

    // Reset nextId
    global.nextId = 1;
  });

  describe('getNextId', () => {
    test('should return 1 for first call', () => {
      const id = getNextId();
      expect(id).toBe(1);
    });

    test('should increment ID on each call', () => {
      const id1 = getNextId();
      const id2 = getNextId();
      const id3 = getNextId();

      expect(id1).toBe(1);
      expect(id2).toBe(2);
      expect(id3).toBe(3);
    });

    test('should persist next ID in localStorage', () => {
      getNextId();
      getNextId();

      const storedId = localStorage.getItem('podcastly_next_id');
      expect(storedId).toBe('3');
    });
  });

  describe('loadPodcasts', () => {
    test('should return empty array when no podcasts stored', () => {
      const podcasts = loadPodcasts();
      expect(podcasts).toEqual([]);
    });

    test('should return stored podcasts', () => {
      const testPodcasts = [
        { id: 1, title: 'Test Podcast', feed_url: 'http://example.com/feed' }
      ];
      localStorage.setItem('podcastly_podcasts', JSON.stringify(testPodcasts));

      const podcasts = loadPodcasts();
      expect(podcasts).toEqual(testPodcasts);
    });

    test('should return empty array on invalid JSON', () => {
      localStorage.setItem('podcastly_podcasts', 'invalid json');

      const podcasts = loadPodcasts();
      expect(podcasts).toEqual([]);
    });
  });

  describe('savePodcasts', () => {
    test('should save podcasts to localStorage', () => {
      const testPodcasts = [
        { id: 1, title: 'Test Podcast', feed_url: 'http://example.com/feed' }
      ];

      savePodcasts(testPodcasts);

      const stored = JSON.parse(localStorage.getItem('podcastly_podcasts'));
      expect(stored).toEqual(testPodcasts);
    });
  });

  describe('addPodcast', () => {
    test('should add new podcast with generated ID', () => {
      const podcastData = {
        title: 'Test Podcast',
        description: 'Test Description',
        feed_url: 'http://example.com/feed',
        link: 'http://example.com'
      };

      const podcast = addPodcast(podcastData);

      expect(podcast.id).toBe(1);
      expect(podcast.title).toBe('Test Podcast');
      expect(podcast.feed_url).toBe('http://example.com/feed');
    });

    test('should update existing podcast with same feed URL', () => {
      const podcastData = {
        title: 'Test Podcast',
        feed_url: 'http://example.com/feed'
      };

      const podcast1 = addPodcast(podcastData);
      const updatedData = {
        title: 'Updated Podcast',
        feed_url: 'http://example.com/feed'
      };
      const podcast2 = addPodcast(updatedData);

      expect(podcast2.id).toBe(podcast1.id);
      expect(podcast2.title).toBe('Updated Podcast');

      const allPodcasts = loadPodcasts();
      expect(allPodcasts.length).toBe(1);
    });

    test('should add timestamp if not provided', () => {
      const podcastData = {
        title: 'Test Podcast',
        feed_url: 'http://example.com/feed'
      };

      const podcast = addPodcast(podcastData);

      expect(podcast.updated_at).toBeDefined();
    });
  });

  describe('getPodcast', () => {
    test('should return podcast by ID', () => {
      const podcastData = {
        title: 'Test Podcast',
        feed_url: 'http://example.com/feed'
      };
      const added = addPodcast(podcastData);

      const podcast = getPodcast(added.id);

      expect(podcast).toEqual(added);
    });

    test('should return null for non-existent podcast', () => {
      const podcast = getPodcast(999);
      expect(podcast).toBeNull();
    });
  });

  describe('loadEpisodes', () => {
    test('should return empty object when no episodes stored', () => {
      const episodes = loadEpisodes();
      expect(episodes).toEqual({});
    });

    test('should return stored episodes', () => {
      const testEpisodes = { '1': [{ title: 'Episode 1' }] };
      localStorage.setItem('podcastly_episodes', JSON.stringify(testEpisodes));

      const episodes = loadEpisodes();
      expect(episodes).toEqual(testEpisodes);
    });

    test('should return empty object on invalid JSON', () => {
      localStorage.setItem('podcastly_episodes', 'invalid json');

      const episodes = loadEpisodes();
      expect(episodes).toEqual({});
    });
  });

  describe('getEpisodesForPodcast', () => {
    test('should return empty array for podcast with no episodes', () => {
      const episodes = getEpisodesForPodcast(1);
      expect(episodes).toEqual([]);
    });

    test('should return episodes sorted by date descending', () => {
      const testEpisodes = {
        '1': [
          { title: 'Episode 1', published_at: '2024-01-01' },
          { title: 'Episode 3', published_at: '2024-03-01' },
          { title: 'Episode 2', published_at: '2024-02-01' }
        ]
      };
      localStorage.setItem('podcastly_episodes', JSON.stringify(testEpisodes));

      const episodes = getEpisodesForPodcast(1);

      expect(episodes[0].title).toBe('Episode 3');
      expect(episodes[1].title).toBe('Episode 2');
      expect(episodes[2].title).toBe('Episode 1');
    });
  });

  describe('addEpisodesToPodcast', () => {
    test('should add episodes to new podcast', () => {
      const episodes = [
        { title: 'Episode 1', guid: 'ep1' },
        { title: 'Episode 2', guid: 'ep2' }
      ];

      addEpisodesToPodcast(1, episodes);

      const stored = getEpisodesForPodcast(1);
      expect(stored.length).toBe(2);
    });

    test('should not duplicate episodes with same guid', () => {
      const episodes1 = [
        { title: 'Episode 1', guid: 'ep1' }
      ];
      const episodes2 = [
        { title: 'Episode 1 Updated', guid: 'ep1' },
        { title: 'Episode 2', guid: 'ep2' }
      ];

      addEpisodesToPodcast(1, episodes1);
      addEpisodesToPodcast(1, episodes2);

      const stored = getEpisodesForPodcast(1);
      expect(stored.length).toBe(2);

      // Should have the updated version
      const ep1 = stored.find(ep => ep.guid === 'ep1');
      expect(ep1.title).toBe('Episode 1 Updated');
    });

    test('should use fallback keys when guid is not available', () => {
      const episodes1 = [
        { title: 'Episode 1', audio_url: 'http://example.com/ep1.mp3' }
      ];
      const episodes2 = [
        { title: 'Episode 1', audio_url: 'http://example.com/ep1.mp3' }
      ];

      addEpisodesToPodcast(1, episodes1);
      addEpisodesToPodcast(1, episodes2);

      const stored = getEpisodesForPodcast(1);
      expect(stored.length).toBe(1);
    });
  });

  describe('deletePodcast', () => {
    test('should remove podcast and its episodes', () => {
      const podcastData = {
        title: 'Test Podcast',
        feed_url: 'http://example.com/feed'
      };
      const podcast = addPodcast(podcastData);

      addEpisodesToPodcast(podcast.id, [
        { title: 'Episode 1', guid: 'ep1' }
      ]);

      deletePodcast(podcast.id);

      const podcasts = loadPodcasts();
      expect(podcasts.length).toBe(0);

      const episodes = getEpisodesForPodcast(podcast.id);
      expect(episodes.length).toBe(0);
    });
  });
});
