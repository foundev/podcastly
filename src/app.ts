import {
  loadPodcasts,
  getPodcast,
  getEpisodesForPodcast,
  addPodcast,
  addEpisodesToPodcast,
  type Podcast,
  type Episode,
} from "./storage.js";
import { subscribeToFeed } from "./rss-parser.js";

interface State {
  podcasts: Podcast[];
  selectedPodcastId: number | null;
}

const state: State = {
  podcasts: [],
  selectedPodcastId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscribe-form") as HTMLFormElement;
  form.addEventListener("submit", handleSubscribe);

  refreshPodcasts();
  registerServiceWorker();
});

function refreshPodcasts(): void {
  try {
    state.podcasts = loadPodcasts();
    state.podcasts.sort((a, b) => {
      const dateA = a.updated_at || "1970-01-01";
      const dateB = b.updated_at || "1970-01-01";
      return dateB.localeCompare(dateA);
    });
    renderPodcasts();
    if (state.selectedPodcastId) {
      loadEpisodes(state.selectedPodcastId);
    }
  } catch (error) {
    setStatus((error as Error).message, true);
  }
}

function loadEpisodes(podcastId: number): void {
  try {
    const podcast = getPodcast(podcastId);
    if (!podcast) {
      setStatus("Podcast non trouvé", true);
      return;
    }
    const episodes = getEpisodesForPodcast(podcastId);
    renderEpisodes({ podcast, episodes });
  } catch (error) {
    setStatus((error as Error).message, true);
  }
}

async function handleSubscribe(event: Event): Promise<void> {
  event.preventDefault();
  const input = document.getElementById("feed-url") as HTMLInputElement;
  const feedUrl = input.value.trim();
  if (!feedUrl) {
    return;
  }

  setStatus("Abonnement en cours…");
  try {
    const feedData = await subscribeToFeed(feedUrl);
    const podcast = addPodcast(feedData);
    addEpisodesToPodcast(podcast.id, feedData.episodes);

    setStatus(`Abonné à ${podcast.title}`, false);
    input.value = "";
    state.selectedPodcastId = podcast.id;
    refreshPodcasts();
    loadEpisodes(state.selectedPodcastId);
  } catch (error) {
    setStatus((error as Error).message || "Échec de l'abonnement", true);
  }
}

function renderPodcasts(): void {
  const list = document.getElementById("podcast-list") as HTMLUListElement;
  const template = document.getElementById("podcast-item-template") as HTMLTemplateElement;
  list.innerHTML = "";

  if (!state.podcasts.length) {
    list.innerHTML = "<li>No podcasts yet. Add your favourite feed!</li>";
    return;
  }

  state.podcasts.forEach((podcast) => {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const button = clone.querySelector(".podcast-button") as HTMLButtonElement;
    button.dataset.podcastId = String(podcast.id);
    button.addEventListener("click", () => {
      state.selectedPodcastId = podcast.id;
      highlightSelectedPodcast();
      loadEpisodes(podcast.id);
    });

    if (podcast.id === state.selectedPodcastId) {
      button.classList.add("is-selected");
    }

    const titleEl = clone.querySelector(".podcast-title") as HTMLSpanElement;
    titleEl.textContent = podcast.title;
    const description = clone.querySelector(".podcast-description") as HTMLSpanElement;
    description.textContent = podcast.description || podcast.link || "";

    list.appendChild(clone);
  });
}

function renderEpisodes(data: { podcast: Podcast; episodes: Episode[] }): void {
  const heading = document.getElementById("episodes-heading") as HTMLHeadingElement;
  const list = document.getElementById("episode-list") as HTMLUListElement;
  const template = document.getElementById("episode-item-template") as HTMLTemplateElement;
  list.innerHTML = "";

  if (!data.episodes?.length) {
    heading.textContent = data.podcast?.title
      ? `${data.podcast.title} — Episodes`
      : "Episodes";
    list.innerHTML = "<li>No episodes found.</li>";
    return;
  }

  heading.textContent = `${data.podcast.title} — Episodes`;

  data.episodes.forEach((episode) => {
    const clone = template.content.cloneNode(true) as DocumentFragment;
    const episodeTitle = clone.querySelector(".episode-title") as HTMLElement;
    episodeTitle.textContent = episode.title;
    const episodeDesc = clone.querySelector(".episode-description") as HTMLElement;
    episodeDesc.textContent = truncate(episode.description || "");

    const meta: string[] = [];
    if (episode.published_at) {
      meta.push(new Date(episode.published_at).toLocaleString());
    }
    if (episode.duration) {
      meta.push(`Duration: ${episode.duration}`);
    }
    const episodeMeta = clone.querySelector(".episode-meta") as HTMLElement;
    episodeMeta.textContent = meta.join(" • ");

    const audioLink = clone.querySelector(".episode-audio") as HTMLAnchorElement;
    if (episode.audio_url) {
      audioLink.href = episode.audio_url;
    } else {
      audioLink.remove();
    }

    const notesLink = clone.querySelector(".episode-link") as HTMLAnchorElement;
    if (episode.link) {
      notesLink.href = episode.link;
    } else {
      notesLink.remove();
    }

    list.appendChild(clone);
  });
}

function truncate(text: string, maxLength: number = 280): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function highlightSelectedPodcast(): void {
  document.querySelectorAll(".podcast-button").forEach((button) => {
    const htmlButton = button as HTMLButtonElement;
    htmlButton.classList.toggle(
      "is-selected",
      Number(htmlButton.dataset.podcastId) === state.selectedPodcastId,
    );
  });
}

function setStatus(message: string, isError: boolean = false): void {
  const node = document.getElementById("status-message") as HTMLElement;
  node.textContent = message;
  node.classList.toggle("is-error", Boolean(isError));
}

function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker
    .register("service-worker.js")
    .then(() => {
      // no-op; registration succeeded
    })
    .catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
}
