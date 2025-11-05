/**
 * Tests for rss-parser.ts
 */

import { subscribeToFeed, FeedError } from "../src/rss-parser";

// Mock fetch globally
global.fetch = jest.fn() as jest.Mock;

describe("RSS Parser Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("subscribeToFeed", () => {
    test("should fetch and parse feed", async () => {
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
        text: jest.fn().mockResolvedValue(xmlResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await subscribeToFeed("http://example.com/feed");

      expect(result.title).toBe("Test Podcast");
      expect(result.feed_url).toBe("http://example.com/feed");
      expect(result.episodes).toHaveLength(1);
      expect(result.updated_at).toBeDefined();
    });

    test("should propagate fetch errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(subscribeToFeed("http://example.com/feed")).rejects.toThrow(
        FeedError
      );
    });

    test("should propagate parse errors", async () => {
      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue("invalid xml"),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(subscribeToFeed("http://example.com/feed")).rejects.toThrow(
        FeedError
      );
    });

    test("should throw FeedError on HTTP error", async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(subscribeToFeed("http://example.com/feed")).rejects.toThrow(
        FeedError
      );
      await expect(subscribeToFeed("http://example.com/feed")).rejects.toThrow(
        "Échec de la récupération du flux (404)"
      );
    });

    test("should handle feed with no episodes", async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <description>Test Description</description>
          </channel>
        </rss>
      `;

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await subscribeToFeed("http://example.com/feed");

      expect(result.episodes).toHaveLength(0);
    });

    test("should handle episodes with all fields", async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
        <rss version="2.0">
          <channel>
            <title>Test Podcast</title>
            <item>
              <guid>episode-123</guid>
              <title>Test Episode</title>
              <description>Test Description</description>
              <link>http://example.com/episode</link>
              <pubDate>2024-01-15T10:30:00Z</pubDate>
              <enclosure url="http://example.com/audio.mp3" />
            </item>
          </channel>
        </rss>
      `;

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await subscribeToFeed("http://example.com/feed");

      expect(result.episodes).toHaveLength(1);
      expect(result.episodes[0].guid).toBe("episode-123");
      expect(result.episodes[0].title).toBe("Test Episode");
      expect(result.episodes[0].description).toBe("Test Description");
      expect(result.episodes[0].link).toBe("http://example.com/episode");
      expect(result.episodes[0].audio_url).toBe("http://example.com/audio.mp3");
    });

    test("should throw error when channel is missing", async () => {
      const xmlResponse = '<?xml version="1.0"?><rss version="2.0"></rss>';

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(subscribeToFeed("http://example.com/feed")).rejects.toThrow(
        "Le flux est manquant d'informations de canal"
      );
    });

    test("should throw error when title is missing", async () => {
      const xmlResponse =
        '<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>';

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(subscribeToFeed("http://example.com/feed")).rejects.toThrow(
        "Le canal du flux est manquant d'un titre"
      );
    });

    test("should include episodes without title elements as Untitled Episode", async () => {
      const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
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

      const mockResponse = {
        ok: true,
        text: jest.fn().mockResolvedValue(xmlResponse),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await subscribeToFeed("http://example.com/feed");

      expect(result.episodes).toHaveLength(2);
      expect(result.episodes[0].title).toBe("Valid Episode");
      expect(result.episodes[1].title).toBe("Untitled Episode");
    });
  });
});
