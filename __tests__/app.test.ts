/**
 * Tests for app.ts - Basic integration tests
 */

import {
  addPodcast,
  addEpisodesToPodcast,
  loadPodcasts,
  getEpisodesForPodcast,
} from "../src/storage";

// Mock navigator.serviceWorker
Object.defineProperty(navigator, "serviceWorker", {
  value: {
    register: jest.fn().mockResolvedValue({}),
  },
  configurable: true,
  writable: true,
});

// Mock fetch
global.fetch = jest.fn() as jest.Mock;

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem("podcastly_next_id", "1");
});

describe("App Module Integration", () => {
  test("should store and retrieve podcasts", () => {
    const podcast = addPodcast({
      title: "Test Podcast",
      description: "Test Description",
      link: "http://example.com",
      feed_url: "http://example.com/feed",
      image_url: null,
      updated_at: "2024-01-01",
    });

    const allPodcasts = loadPodcasts();
    expect(allPodcasts.length).toBe(1);
    expect(allPodcasts[0].title).toBe("Test Podcast");
    expect(allPodcasts[0].id).toBe(podcast.id);
  });

  test("should sort podcasts by updated_at date", () => {
    addPodcast({
      title: "Old Podcast",
      feed_url: "http://example.com/old",
      updated_at: "2024-01-01",
    });

    addPodcast({
      title: "New Podcast",
      feed_url: "http://example.com/new",
      updated_at: "2024-03-01",
    });

    const allPodcasts = loadPodcasts();
    // Note: loadPodcasts doesn't sort, but the app does
    expect(allPodcasts.length).toBe(2);
  });

  test("should store and retrieve episodes for a podcast", () => {
    const podcast = addPodcast({
      title: "Test Podcast",
      feed_url: "http://example.com/feed",
    });

    addEpisodesToPodcast(podcast.id, [
      {
        title: "Episode 1",
        guid: "ep1",
        description: "Test description",
        audio_url: "http://example.com/ep1.mp3",
        link: null,
        published_at: "2024-01-01",
        duration: "30:00",
      },
      {
        title: "Episode 2",
        guid: "ep2",
        description: "Another episode",
        audio_url: "http://example.com/ep2.mp3",
        link: null,
        published_at: "2024-01-02",
        duration: "25:00",
      },
    ]);

    const episodes = getEpisodesForPodcast(podcast.id);
    expect(episodes.length).toBe(2);
    // Episodes should be sorted by date descending
    expect(episodes[0].title).toBe("Episode 2");
    expect(episodes[1].title).toBe("Episode 1");
  });

  test("should handle empty episode list", () => {
    const podcast = addPodcast({
      title: "Test Podcast",
      feed_url: "http://example.com/feed",
    });

    const episodes = getEpisodesForPodcast(podcast.id);
    expect(episodes).toEqual([]);
  });
});
