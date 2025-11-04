const state = {
  podcasts: [],
  selectedPodcastId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscribe-form");
  form.addEventListener("submit", handleSubscribe);

  refreshPodcasts();
  registerServiceWorker();
});

function refreshPodcasts() {
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
    setStatus(error.message, true);
  }
}

function loadEpisodes(podcastId) {
  try {
    const podcast = getPodcast(podcastId);
    if (!podcast) {
      setStatus("Podcast non trouvé", true);
      return;
    }
    const episodes = getEpisodesForPodcast(podcastId);
    renderEpisodes({ podcast, episodes });
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function handleSubscribe(event) {
  event.preventDefault();
  const input = document.getElementById("feed-url");
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
    setStatus(error.message || "Échec de l'abonnement", true);
  }
}

function renderPodcasts() {
  const list = document.getElementById("podcast-list");
  const template = document.getElementById("podcast-item-template");
  list.innerHTML = "";

  if (!state.podcasts.length) {
    list.innerHTML = "<li>No podcasts yet. Add your favourite feed!</li>";
    return;
  }

  state.podcasts.forEach((podcast) => {
    const clone = template.content.cloneNode(true);
    const button = clone.querySelector(".podcast-button");
    button.dataset.podcastId = podcast.id;
    button.addEventListener("click", () => {
      state.selectedPodcastId = podcast.id;
      highlightSelectedPodcast();
      loadEpisodes(podcast.id);
    });

    if (podcast.id === state.selectedPodcastId) {
      button.classList.add("is-selected");
    }

    clone.querySelector(".podcast-title").textContent = podcast.title;
    const description = clone.querySelector(".podcast-description");
    description.textContent = podcast.description || podcast.link || "";

    list.appendChild(clone);
  });
}

function renderEpisodes(data) {
  const heading = document.getElementById("episodes-heading");
  const list = document.getElementById("episode-list");
  const template = document.getElementById("episode-item-template");
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
    const clone = template.content.cloneNode(true);
    clone.querySelector(".episode-title").textContent = episode.title;
    clone.querySelector(".episode-description").textContent =
      truncate(episode.description || "");

    const meta = [];
    if (episode.published_at) {
      meta.push(new Date(episode.published_at).toLocaleString());
    }
    if (episode.duration) {
      meta.push(`Duration: ${episode.duration}`);
    }
    clone.querySelector(".episode-meta").textContent = meta.join(" • ");

    const audioLink = clone.querySelector(".episode-audio");
    if (episode.audio_url) {
      audioLink.href = episode.audio_url;
    } else {
      audioLink.remove();
    }

    const notesLink = clone.querySelector(".episode-link");
    if (episode.link) {
      notesLink.href = episode.link;
    } else {
      notesLink.remove();
    }

    list.appendChild(clone);
  });
}

function truncate(text, maxLength = 280) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function highlightSelectedPodcast() {
  document.querySelectorAll(".podcast-button").forEach((button) => {
    button.classList.toggle(
      "is-selected",
      Number(button.dataset.podcastId) === state.selectedPodcastId,
    );
  });
}

function setStatus(message, isError = false) {
  const node = document.getElementById("status-message");
  node.textContent = message;
  node.classList.toggle("is-error", Boolean(isError));
}


function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => {
      // no-op; registration succeeded
    })
    .catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
}
