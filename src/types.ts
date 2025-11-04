export interface Episode {
  guid: string;
  title: string;
  description: string;
  audioUrl: string;
  link: string;
  publishedAt: string;
  duration: string;
}

export interface Podcast {
  id: number;
  title: string;
  description: string;
  link: string;
  feedUrl: string;
  imageUrl: string;
  updatedAt: string;
  episodes: Episode[];
}

export interface AppState {
  podcasts: Podcast[];
  selectedPodcastId: number | null;
}

export interface RSSFeedData {
  title: string;
  description: string;
  link: string;
  feedUrl: string;
  imageUrl: string;
  episodes: Episode[];
  updatedAt: string;
}
