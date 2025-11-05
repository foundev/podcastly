/** Gestion du stockage local pour Podcastly. */

export interface Podcast {
  id: number;
  title: string;
  description: string | null;
  link: string | null;
  feed_url: string;
  image_url: string | null;
  updated_at: string;
}

export interface Episode {
  guid: string;
  title: string;
  description: string | null;
  audio_url: string | null;
  link: string | null;
  published_at: string | null;
  duration: string | null;
}

type EpisodesMap = Record<number, Episode[]>;

const STORAGE_KEY_PODCASTS = "podcastly_podcasts";
const STORAGE_KEY_EPISODES = "podcastly_episodes";
const STORAGE_KEY_NEXT_ID = "podcastly_next_id";

let nextId = parseInt(localStorage.getItem(STORAGE_KEY_NEXT_ID) || "1", 10);

function getNextId(): number {
  const id = nextId;
  nextId += 1;
  localStorage.setItem(STORAGE_KEY_NEXT_ID, String(nextId));
  return id;
}

export function loadPodcasts(): Podcast[] {
  const stored = localStorage.getItem(STORAGE_KEY_PODCASTS);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored) as Podcast[];
  } catch (error) {
    console.error("Erreur lors du chargement des podcasts:", error);
    return [];
  }
}

function savePodcasts(podcasts: Podcast[]): void {
  localStorage.setItem(STORAGE_KEY_PODCASTS, JSON.stringify(podcasts));
}

function loadEpisodes(): EpisodesMap {
  const stored = localStorage.getItem(STORAGE_KEY_EPISODES);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored) as EpisodesMap;
  } catch (error) {
    console.error("Erreur lors du chargement des épisodes:", error);
    return {};
  }
}

function saveEpisodes(episodesMap: EpisodesMap): void {
  localStorage.setItem(STORAGE_KEY_EPISODES, JSON.stringify(episodesMap));
}

export function addPodcast(podcastData: {
  title: string;
  description?: string | null;
  link?: string | null;
  feed_url: string;
  image_url?: string | null;
  updated_at?: string;
}): Podcast {
  const podcasts = loadPodcasts();
  const existingIndex = podcasts.findIndex((p) => p.feed_url === podcastData.feed_url);

  const podcast: Podcast = {
    id: existingIndex >= 0 ? podcasts[existingIndex].id : getNextId(),
    title: podcastData.title,
    description: podcastData.description || null,
    link: podcastData.link || null,
    feed_url: podcastData.feed_url,
    image_url: podcastData.image_url || null,
    updated_at: podcastData.updated_at || new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    podcasts[existingIndex] = podcast;
  } else {
    podcasts.push(podcast);
  }

  savePodcasts(podcasts);
  return podcast;
}

export function getPodcast(podcastId: number): Podcast | null {
  const podcasts = loadPodcasts();
  return podcasts.find((p) => p.id === podcastId) || null;
}

export function getEpisodesForPodcast(podcastId: number): Episode[] {
  const episodesMap = loadEpisodes();
  const episodes = episodesMap[podcastId] || [];
  return episodes.sort((a, b) => {
    const dateA = a.published_at || "1970-01-01";
    const dateB = b.published_at || "1970-01-01";
    return dateB.localeCompare(dateA);
  });
}

export function saveEpisodesForPodcast(podcastId: number, episodes: Episode[]): void {
  const episodesMap = loadEpisodes();
  episodesMap[podcastId] = episodes;
  saveEpisodes(episodesMap);
}

export function addEpisodesToPodcast(podcastId: number, newEpisodes: Episode[]): void {
  const episodesMap = loadEpisodes();
  const existingEpisodes = episodesMap[podcastId] || [];
  const episodeMap = new Map<string, Episode>();

  existingEpisodes.forEach((ep) => {
    const key = ep.guid || ep.audio_url || ep.link || ep.title;
    if (key) {
      episodeMap.set(key, ep);
    }
  });

  newEpisodes.forEach((ep) => {
    const key = ep.guid || ep.audio_url || ep.link || ep.title;
    if (key) {
      episodeMap.set(key, ep);
    }
  });

  episodesMap[podcastId] = Array.from(episodeMap.values());
  saveEpisodes(episodesMap);
}

export function deletePodcast(podcastId: number): void {
  const podcasts = loadPodcasts();
  const filtered = podcasts.filter((p) => p.id !== podcastId);
  savePodcasts(filtered);

  const episodesMap = loadEpisodes();
  delete episodesMap[podcastId];
  saveEpisodes(episodesMap);
}
