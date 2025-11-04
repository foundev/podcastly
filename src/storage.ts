import type { Podcast, AppState } from "./types";

const STORAGE_KEYS = {
  PODCASTS: "podcastly_podcasts",
  SELECTED_ID: "podcastly_selected_id",
} as const;

export class Storage {
  static savePodcasts(podcasts: Podcast[]): void {
    localStorage.setItem(STORAGE_KEYS.PODCASTS, JSON.stringify(podcasts));
  }

  static loadPodcasts(): Podcast[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PODCASTS);
      if (stored) {
        return JSON.parse(stored) as Podcast[];
      }
    } catch (error) {
      console.error("Failed to load podcasts from storage:", error);
    }
    return [];
  }

  static saveSelectedId(id: number | null): void {
    if (id !== null) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_ID, id.toString());
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_ID);
    }
  }

  static loadSelectedId(): number | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_ID);
      if (stored) {
        return parseInt(stored, 10);
      }
    } catch (error) {
      console.error("Failed to load selected ID from storage:", error);
    }
    return null;
  }

  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PODCASTS);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_ID);
  }
}
