/**
 * Tests for rss-parser.js
 */

const path = require('path');
const { loadModule } = require('./test-helper');

// Load the rss-parser module
const parserPath = path.join(__dirname, '../web/js/rss-parser.js');
loadModule(parserPath);

// Mock fetch globally
global.fetch = jest.fn();

describe('RSS Parser Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cleanText', () => {
    test('should return null for empty string', () => {
      expect(cleanText('')).toBeNull();
      expect(cleanText('   ')).toBeNull();
    });

    test('should trim whitespace', () => {
      expect(cleanText('  test  ')).toBe('test');
    });

    test('should return null for null/undefined', () => {
      expect(cleanText(null)).toBeNull();
      expect(cleanText(undefined)).toBeNull();
    });
  });

  describe('parsePubDate', () => {
    test('should return null when no pubDate element', () => {
      const doc = new DOMParser().parseFromString('<item></item>', 'text/xml');
      const item = doc.querySelector('item');

      const result = parsePubDate(item);
      expect(result).toBeNull();
    });

    test('should parse valid date', () => {
      const doc = new DOMParser().parseFromString(
        '<item><pubDate>2024-01-15T10:30:00Z</pubDate></item>',
        'text/xml'
      );
      const item = doc.querySelector('item');

      const result = parsePubDate(item);
      expect(result).toBeDefined();
      expect(result).toContain('2024-01-15');
    });

    test('should handle invalid date format', () => {
      const doc = new DOMParser().parseFromString(
        '<item><pubDate>invalid date</pubDate></item>',
        'text/xml'
      );
      const item = doc.querySelector('item');

      const result = parsePubDate(item);
      expect(result).toBe('invalid date');
    });
  });

  describe('parseEpisode', () => {
    test('should parse episode with all fields', () => {
      const xml = `
        <item>
          <guid>episode-123</guid>
          <title>Test Episode</title>
          <description>Test Description</description>
          <link>http://example.com/episode</link>
          <pubDate>2024-01-15T10:30:00Z</pubDate>
          <enclosure url="http://example.com/audio.mp3" />
        </item>
      `;
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const item = doc.querySelector('item');

      const episode = parseEpisode(item);

      expect(episode).toBeDefined();
      expect(episode.guid).toBe('episode-123');
      expect(episode.title).toBe('Test Episode');
      expect(episode.description).toBe('Test Description');
      expect(episode.link).toBe('http://example.com/episode');
      expect(episode.audio_url).toBe('http://example.com/audio.mp3');
    });

    test('should use title as guid fallback', () => {
      const xml = `
        <item>
          <title>Test Episode</title>
        </item>
      `;
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const item = doc.querySelector('item');

      const episode = parseEpisode(item);

      expect(episode.guid).toBe('Test Episode');
    });

    test('should use "Untitled Episode" for item without title', () => {
      const xml = '<item></item>';
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const item = doc.querySelector('item');

      const episode = parseEpisode(item);

      expect(episode).toBeDefined();
      expect(episode.title).toBe('Untitled Episode');
    });
  });

  describe('parseFeed', () => {
    test('should parse valid RSS feed', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
            <link>http://example.com</link>
            <item>
              <title>Episode 1</title>
              <guid>ep1</guid>
            </item>
            <item>
              <title>Episode 2</title>
              <guid>ep2</guid>
            </item>
          </channel>
        </rss>
      `;

      const feedData = parseFeed(xml);

      expect(feedData.title).toBe('Test Podcast');
      expect(feedData.description).toBe('Test Description');
      expect(feedData.link).toBe('http://example.com');
      expect(feedData.episodes).toHaveLength(2);
      expect(feedData.episodes[0].title).toBe('Episode 1');
    });

    test('should throw error for invalid XML', () => {
      const xml = 'invalid xml';

      expect(() => parseFeed(xml)).toThrow(FeedError);
    });

    test('should throw error when channel is missing', () => {
      const xml = '<?xml version="1.0"?><rss version="2.0"></rss>';

      expect(() => parseFeed(xml)).toThrow('Le flux est manquant d\'informations de canal');
    });

    test('should throw error when title is missing', () => {
      const xml = '<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>';

      expect(() => parseFeed(xml)).toThrow('Le canal du flux est manquant d\'un titre');
    });

    test('should handle feed with no episodes', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
          </channel>
        </rss>
      `;

      const feedData = parseFeed(xml);

      expect(feedData.episodes).toHaveLength(0);
    });

    test('should include episodes without title elements as "Untitled Episode"', () => {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <item>
              <title>Valid Episode</title>
            </item>
            <item>
              <description>No title</description>
            </item>
          </channel>
        </rss>
      `;

      const feedData = parseFeed(xml);

      expect(feedData.episodes).toHaveLength(2);
      expect(feedData.episodes[0].title).toBe('Valid Episode');
      expect(feedData.episodes[1].title).toBe('Untitled Episode');
    });
  });

  describe('fetchFeed', () => {
    test('should fetch feed successfully', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('<rss><channel></channel></rss>')
      };
      global.fetch.mockResolvedValue(mockResponse);

      const result = await fetchFeed('http://example.com/feed');

      expect(result).toBe('<rss><channel></channel></rss>');
      expect(global.fetch).toHaveBeenCalledWith(
        'http://example.com/feed',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Podcastly')
          })
        })
      );
    });

    test('should throw FeedError on HTTP error', async () => {
      const mockResponse = {
        ok: false,
        status: 404
      };
      global.fetch.mockResolvedValue(mockResponse);

      await expect(fetchFeed('http://example.com/feed')).rejects.toThrow(FeedError);
      await expect(fetchFeed('http://example.com/feed')).rejects.toThrow('Échec de la récupération du flux (404)');
    });

    test('should throw FeedError on network error', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(fetchFeed('http://example.com/feed')).rejects.toThrow(FeedError);
      await expect(fetchFeed('http://example.com/feed')).rejects.toThrow('Échec de la récupération du flux');
    });
  });

  describe('subscribeToFeed', () => {
    test('should fetch and parse feed', async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
            <link>http://example.com</link>
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

      const result = await subscribeToFeed('http://example.com/feed');

      expect(result.title).toBe('Test Podcast');
      expect(result.feed_url).toBe('http://example.com/feed');
      expect(result.episodes).toHaveLength(1);
      expect(result.updated_at).toBeDefined();
    });

    test('should propagate fetch errors', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(subscribeToFeed('http://example.com/feed')).rejects.toThrow();
    });

    test('should propagate parse errors', async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue('invalid xml')
      };
      global.fetch.mockResolvedValue(mockResponse);

      await expect(subscribeToFeed('http://example.com/feed')).rejects.toThrow();
    });
  });

  describe('findImageUrl', () => {
    test('should find image from RSS image element', () => {
      const xml = `
        <channel>
          <title>Test</title>
          <image>
            <url>http://example.com/image.jpg</url>
          </image>
        </channel>
      `;
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const channel = doc.querySelector('channel');

      const imageUrl = findImageUrl(channel);

      expect(imageUrl).toBe('http://example.com/image.jpg');
    });

    test('should return null when no image found', () => {
      const xml = '<channel><title>Test</title></channel>';
      const doc = new DOMParser().parseFromString(xml, 'text/xml');
      const channel = doc.querySelector('channel');

      const imageUrl = findImageUrl(channel);

      expect(imageUrl).toBeNull();
    });
  });
});
