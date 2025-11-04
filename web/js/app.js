// Podcastly - Client-side RSS Podcast Reader with localStorage
// All data is stored locally in your browser

const STORAGE_KEYS = {
  PODCASTS: "podcastly_podcasts",
  SELECTED_ID: "podcastly_selected_id",
};

const state = {
  podcasts: [],
  selectedPodcastId: null,
};

// ===========================
// LocalStorage Management
// ===========================

function savePodcasts() {
  localStorage.setItem(STORAGE_KEYS.PODCASTS, JSON.stringify(state.podcasts));
}

function loadPodcastsFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PODCASTS);
    if (stored) {
      state.podcasts = JSON.parse(stored);
    }
  } catch (error) {
    console.error("Failed to load podcasts from storage:", error);
    state.podcasts = [];
  }
}

function loadSelectedIdFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_ID);
    if (stored) {
      state.selectedPodcastId = parseInt(stored, 10);
    }
  } catch (error) {
    state.selectedPodcastId = null;
  }
}

function saveSelectedId() {
  if (state.selectedPodcastId !== null) {
    localStorage.setItem(
      STORAGE_KEYS.SELECTED_ID,
      state.selectedPodcastId.toString()
    );
  }
}

// ===========================
// RSS Feed Parsing
// ===========================

async function fetchRSSFeed(feedUrl) {
  // Use a CORS proxy to fetch RSS feeds from any source
  // Alternative: allorigins.win, cors-anywhere, or your own proxy
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`;

  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const xmlText = await response.text();
    return parseRSSFeed(xmlText, feedUrl);
  } catch (error) {
    console.error("Failed to fetch RSS feed:", error);
    throw new Error(`Cannot fetch feed: ${error.message}`);
  }
}

function parseRSSFeed(xmlText, feedUrl) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid RSS feed format");
  }

  const channel = xmlDoc.querySelector("channel");
  if (!channel) {
    throw new Error("Not a valid RSS feed (missing channel element)");
  }

  // Extract podcast metadata
  const title = getElementText(channel, "title") || "Untitled Podcast";
  const description =
    getElementText(channel, "description") ||
    getElementText(channel, "itunes\\:subtitle") ||
    "";
  const link = getElementText(channel, "link") || "";
  const imageUrl = extractImageUrl(channel);

  // Parse episodes
  const items = Array.from(xmlDoc.querySelectorAll("item"));
  const episodes = items.map((item, index) => parseEpisode(item, index));

  return {
    title,
    description,
    link,
    feedUrl,
    imageUrl,
    episodes: episodes.filter((ep) => ep.title),
    updatedAt: new Date().toISOString(),
  };
}

function parseEpisode(item, index) {
  const guid =
    getElementText(item, "guid") ||
    getElementText(item, "id") ||
    `episode-${index}`;

  const title = getElementText(item, "title") || "Untitled Episode";
  const description =
    getElementText(item, "description") ||
    getElementText(item, "content\\:encoded") ||
    getElementText(item, "summary") ||
    "";

  const link = getElementText(item, "link") || "";

  // Extract audio URL from enclosure
  let audioUrl = "";
  const enclosure = item.querySelector("enclosure");
  if (enclosure) {
    audioUrl = enclosure.getAttribute("url") || "";
  }
  if (!audioUrl) {
    audioUrl = getElementText(item, "media\\:content") || "";
  }

  // Parse publication date
  const pubDateText =
    getElementText(item, "pubDate") || getElementText(item, "published") || "";
  const publishedAt = parsePubDate(pubDateText);

  // Extract duration
  const duration =
    getElementText(item, "itunes\\:duration") ||
    getElementText(item, "duration") ||
    "";

  return {
    guid,
    title,
    description,
    audioUrl,
    link,
    publishedAt,
    duration,
  };
}

function getElementText(parent, tagName) {
  // Handle both standard tags and namespaced tags
  const element =
    parent.querySelector(tagName) ||
    parent.querySelector(tagName.replace("\\:", ":"));
  return element ? element.textContent.trim() : "";
}

function extractImageUrl(channel) {
  // Try standard RSS image
  let imageEl = channel.querySelector("image url");
  if (imageEl) {
    return imageEl.textContent.trim();
  }

  // Try iTunes image
  imageEl =
    channel.querySelector("itunes\\:image") ||
    channel.querySelector("itunes:image");
  if (imageEl) {
    return (
      imageEl.getAttribute("href") || imageEl.getAttribute("url") || ""
    ).trim();
  }

  // Try media thumbnail
  imageEl =
    channel.querySelector("media\\:thumbnail") ||
    channel.querySelector("media:thumbnail");
  if (imageEl) {
    return (
      imageEl.getAttribute("url") || imageEl.getAttribute("href") || ""
    ).trim();
  }

  return "";
}

function parsePubDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return raw string if parsing fails
    }
    return date.toISOString();
  } catch (error) {
    return dateString;
  }
}

// ===========================
// Podcast Management
// ===========================

async function subscribeToPodcast(feedUrl) {
  feedUrl = feedUrl.trim();
  if (!feedUrl) {
    throw new Error("Feed URL cannot be empty");
  }

  // Check if already subscribed
  const existingIndex = state.podcasts.findIndex(
    (p) => p.feedUrl === feedUrl
  );

  setStatus("Fetching RSS feed…");
  const feedData = await fetchRSSFeed(feedUrl);

  const podcast = {
    id: existingIndex >= 0 ? state.podcasts[existingIndex].id : Date.now(),
    title: feedData.title,
    description: feedData.description,
    link: feedData.link,
    feedUrl: feedData.feedUrl,
    imageUrl: feedData.imageUrl,
    updatedAt: feedData.updatedAt,
    episodes: feedData.episodes,
  };

  if (existingIndex >= 0) {
    // Update existing podcast
    state.podcasts[existingIndex] = podcast;
  } else {
    // Add new podcast
    state.podcasts.unshift(podcast);
  }

  savePodcasts();
  return podcast;
}

function getPodcastById(id) {
  return state.podcasts.find((p) => p.id === id);
}

function deletePodcast(id) {
  state.podcasts = state.podcasts.filter((p) => p.id !== id);
  savePodcasts();
  if (state.selectedPodcastId === id) {
    state.selectedPodcastId = null;
    saveSelectedId();
  }
}

// ===========================
// UI Event Handlers
// ===========================

document.addEventListener("DOMContentLoaded", () => {
  loadPodcastsFromStorage();
  loadSelectedIdFromStorage();

  const form = document.getElementById("subscribe-form");
  form.addEventListener("submit", handleSubscribe);

  renderPodcasts();
  if (state.selectedPodcastId) {
    const podcast = getPodcastById(state.selectedPodcastId);
    if (podcast) {
      renderEpisodes(podcast);
    }
  }

  registerServiceWorker();
});

async function handleSubscribe(event) {
  event.preventDefault();
  const input = document.getElementById("feed-url");
  const feedUrl = input.value.trim();
  if (!feedUrl) {
    return;
  }

  try {
    const podcast = await subscribeToPodcast(feedUrl);
    setStatus(`✓ Subscribed to ${podcast.title}`, false);
    input.value = "";

    state.selectedPodcastId = podcast.id;
    saveSelectedId();

    renderPodcasts();
    renderEpisodes(podcast);
  } catch (error) {
    setStatus(`✗ ${error.message}`, true);
  }
}

function renderPodcasts() {
  const list = document.getElementById("podcast-list");
  const template = document.getElementById("podcast-item-template");
  list.innerHTML = "";

  if (!state.podcasts.length) {
    list.innerHTML =
      "<li>No podcasts yet. Add your favourite RSS feed above!</li>";
    return;
  }

  state.podcasts.forEach((podcast) => {
    const clone = template.content.cloneNode(true);
    const button = clone.querySelector(".podcast-button");
    button.dataset.podcastId = podcast.id;
    button.addEventListener("click", () => {
      state.selectedPodcastId = podcast.id;
      saveSelectedId();
      highlightSelectedPodcast();
      renderEpisodes(podcast);
    });

    if (podcast.id === state.selectedPodcastId) {
      button.classList.add("is-selected");
    }

    clone.querySelector(".podcast-title").textContent = podcast.title;
    const description = clone.querySelector(".podcast-description");
    description.textContent = podcast.description || podcast.link || "";

    // Add delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.className = "delete-button";
    deleteBtn.title = "Delete podcast";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${podcast.title}"?`)) {
        deletePodcast(podcast.id);
        renderPodcasts();
        if (state.selectedPodcastId === podcast.id) {
          clearEpisodes();
        }
      }
    });
    button.appendChild(deleteBtn);

    list.appendChild(clone);
  });
}

function renderEpisodes(podcast) {
  const heading = document.getElementById("episodes-heading");
  const list = document.getElementById("episode-list");
  const template = document.getElementById("episode-item-template");
  list.innerHTML = "";

  if (!podcast || !podcast.episodes || !podcast.episodes.length) {
    heading.textContent = podcast ? `${podcast.title} — Episodes` : "Episodes";
    list.innerHTML = "<li>No episodes found.</li>";
    return;
  }

  heading.textContent = `${podcast.title} — Episodes`;

  podcast.episodes.forEach((episode) => {
    const clone = template.content.cloneNode(true);
    clone.querySelector(".episode-title").textContent = episode.title;
    clone.querySelector(".episode-description").textContent = truncate(
      stripHtml(episode.description) || ""
    );

    const meta = [];
    if (episode.publishedAt) {
      try {
        const date = new Date(episode.publishedAt);
        if (!isNaN(date.getTime())) {
          meta.push(date.toLocaleDateString());
        }
      } catch (error) {
        // Ignore date parsing errors
      }
    }
    if (episode.duration) {
      meta.push(`Duration: ${formatDuration(episode.duration)}`);
    }
    clone.querySelector(".episode-meta").textContent = meta.join(" • ");

    const audioLink = clone.querySelector(".episode-audio");
    if (episode.audioUrl) {
      audioLink.href = episode.audioUrl;
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

function clearEpisodes() {
  const heading = document.getElementById("episodes-heading");
  const list = document.getElementById("episode-list");
  heading.textContent = "Episodes";
  list.innerHTML = "";
}

function highlightSelectedPodcast() {
  document.querySelectorAll(".podcast-button").forEach((button) => {
    button.classList.toggle(
      "is-selected",
      Number(button.dataset.podcastId) === state.selectedPodcastId
    );
  });
}

function setStatus(message, isError = false) {
  const node = document.getElementById("status-message");
  node.textContent = message;
  node.classList.toggle("is-error", Boolean(isError));
}

// ===========================
// Utility Functions
// ===========================

function truncate(text, maxLength = 280) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function stripHtml(html) {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
}

function formatDuration(duration) {
  // Duration can be in format HH:MM:SS, MM:SS, or just seconds
  if (!duration) return "";

  // If it's already formatted, return as-is
  if (duration.includes(":")) {
    return duration;
  }

  // If it's seconds, format it
  const seconds = parseInt(duration, 10);
  if (isNaN(seconds)) {
    return duration;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker
    .register("/service-worker.js")
    .then(() => {
      // Service worker registered successfully
    })
    .catch((error) => {
      console.warn("Service worker registration failed:", error);
    });
}
