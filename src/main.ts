import "./style.css";
import type { AppState, Podcast } from "./types";
import { Storage } from "./storage";
import { RSSParser } from "./rss";
import { UI } from "./ui";

class PodcastApp {
  private state: AppState;

  constructor() {
    this.state = {
      podcasts: Storage.loadPodcasts(),
      selectedPodcastId: Storage.loadSelectedId(),
    };
  }

  init(): void {
    const form = document.getElementById("subscribe-form") as HTMLFormElement;
    form.addEventListener("submit", (e) => this.handleSubscribe(e));

    this.render();
  }

  private render(): void {
    UI.renderPodcasts(
      this.state.podcasts,
      this.state.selectedPodcastId,
      (id) => this.selectPodcast(id),
      (id) => this.deletePodcast(id)
    );

    if (this.state.selectedPodcastId) {
      const podcast = this.getPodcastById(this.state.selectedPodcastId);
      if (podcast) {
        UI.renderEpisodes(podcast);
      }
    }
  }

  private async handleSubscribe(event: Event): Promise<void> {
    event.preventDefault();
    const input = document.getElementById("feed-url") as HTMLInputElement;
    const feedUrl = input.value.trim();

    if (!feedUrl) {
      return;
    }

    try {
      const podcast = await this.subscribeToPodcast(feedUrl);
      UI.setStatus(`✓ Subscribed to ${podcast.title}`, false);
      input.value = "";

      this.state.selectedPodcastId = podcast.id;
      Storage.saveSelectedId(podcast.id);

      this.render();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      UI.setStatus(`✗ ${message}`, true);
    }
  }

  private async subscribeToPodcast(feedUrl: string): Promise<Podcast> {
    const existingIndex = this.state.podcasts.findIndex(
      (p) => p.feedUrl === feedUrl
    );

    UI.setStatus("Fetching RSS feed…");
    const feedData = await RSSParser.fetchAndParse(feedUrl);

    const podcast: Podcast = {
      id: existingIndex >= 0 ? this.state.podcasts[existingIndex].id : Date.now(),
      title: feedData.title,
      description: feedData.description,
      link: feedData.link,
      feedUrl: feedData.feedUrl,
      imageUrl: feedData.imageUrl,
      updatedAt: feedData.updatedAt,
      episodes: feedData.episodes,
    };

    if (existingIndex >= 0) {
      this.state.podcasts[existingIndex] = podcast;
    } else {
      this.state.podcasts.unshift(podcast);
    }

    Storage.savePodcasts(this.state.podcasts);
    return podcast;
  }

  private selectPodcast(id: number): void {
    this.state.selectedPodcastId = id;
    Storage.saveSelectedId(id);
    UI.highlightSelectedPodcast(id);
    const podcast = this.getPodcastById(id);
    if (podcast) {
      UI.renderEpisodes(podcast);
    }
  }

  private deletePodcast(id: number): void {
    this.state.podcasts = this.state.podcasts.filter((p) => p.id !== id);
    Storage.savePodcasts(this.state.podcasts);

    if (this.state.selectedPodcastId === id) {
      this.state.selectedPodcastId = null;
      Storage.saveSelectedId(null);
    }

    this.render();
    if (this.state.selectedPodcastId === id) {
      UI.clearEpisodes();
    }
  }

  private getPodcastById(id: number): Podcast | undefined {
    return this.state.podcasts.find((p) => p.id === id);
  }
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const app = new PodcastApp();
  app.init();
});
