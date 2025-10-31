const state = {
  podcasts: [],
  selectedPodcastId: null,
};

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscribe-form");
  form.addEventListener("submit", handleSubscribe);

  loadPodcasts();
});

async function loadPodcasts() {
  try {
    const response = await fetch("/api/podcasts");
    if (!response.ok) {
      throw new Error(`Failed to load podcasts (${response.status})`);
    }
    const data = await response.json();
    state.podcasts = data.podcasts || [];
    renderPodcasts();
    if (state.selectedPodcastId) {
      await loadEpisodes(state.selectedPodcastId);
    }
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function loadEpisodes(podcastId) {
  try {
    const response = await fetch(`/api/podcasts/${podcastId}/episodes`);
    if (!response.ok) {
      throw new Error(`Failed to load episodes (${response.status})`);
    }
    const data = await response.json();
    renderEpisodes(data);
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

  setStatus("Subscribing…");
  try {
    const response = await fetch("/api/podcasts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ feed_url: feedUrl }),
    });
    if (!response.ok) {
      const data = await safeJson(response);
      throw new Error(data?.error || "Subscription failed");
    }
    const data = await response.json();
    setStatus(`Subscribed to ${data.podcast.title}`, false);
    input.value = "";
    state.selectedPodcastId = data.podcast.id;
    await loadPodcasts();
    await loadEpisodes(state.selectedPodcastId);
  } catch (error) {
    setStatus(error.message, true);
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

async function safeJson(response) {
  try {
    return await response.json();
  } catch (error) {
    return null;
  }
}
