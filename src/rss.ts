import type { Episode, RSSFeedData } from "./types";

export class RSSParser {
  private static readonly CORS_PROXY = "https://api.allorigins.win/raw?url=";

  static async fetchAndParse(feedUrl: string): Promise<RSSFeedData> {
    const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(feedUrl)}`;

    try {
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const xmlText = await response.text();
      return this.parse(xmlText, feedUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Cannot fetch feed: ${message}`);
    }
  }

  static parse(xmlText: string, feedUrl: string): RSSFeedData {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");

    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid RSS feed format");
    }

    const channel = xmlDoc.querySelector("channel");
    if (!channel) {
      throw new Error("Not a valid RSS feed (missing channel element)");
    }

    const title = this.getElementText(channel, "title") || "Untitled Podcast";
    const description =
      this.getElementText(channel, "description") ||
      this.getElementText(channel, "itunes:subtitle") ||
      "";
    const link = this.getElementText(channel, "link") || "";
    const imageUrl = this.extractImageUrl(channel);

    const items = Array.from(xmlDoc.querySelectorAll("item"));
    const episodes = items
      .map((item, index) => this.parseEpisode(item, index))
      .filter((ep) => ep.title);

    return {
      title,
      description,
      link,
      feedUrl,
      imageUrl,
      episodes,
      updatedAt: new Date().toISOString(),
    };
  }

  private static parseEpisode(item: Element, index: number): Episode {
    const guid =
      this.getElementText(item, "guid") ||
      this.getElementText(item, "id") ||
      `episode-${index}`;

    const title = this.getElementText(item, "title") || "Untitled Episode";
    const description =
      this.getElementText(item, "description") ||
      this.getElementText(item, "content:encoded") ||
      this.getElementText(item, "summary") ||
      "";

    const link = this.getElementText(item, "link") || "";

    let audioUrl = "";
    const enclosure = item.querySelector("enclosure");
    if (enclosure) {
      audioUrl = enclosure.getAttribute("url") || "";
    }
    if (!audioUrl) {
      audioUrl = this.getElementText(item, "media:content") || "";
    }

    const pubDateText =
      this.getElementText(item, "pubDate") ||
      this.getElementText(item, "published") ||
      "";
    const publishedAt = this.parsePubDate(pubDateText);

    const duration =
      this.getElementText(item, "itunes:duration") ||
      this.getElementText(item, "duration") ||
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

  private static getElementText(parent: Element, tagName: string): string {
    const element =
      parent.querySelector(tagName) ||
      parent.querySelector(tagName.replace(":", "\\:"));
    return element?.textContent?.trim() || "";
  }

  private static extractImageUrl(channel: Element): string {
    let imageEl = channel.querySelector("image url");
    if (imageEl) {
      return imageEl.textContent?.trim() || "";
    }

    imageEl =
      channel.querySelector("itunes\\:image") ||
      channel.querySelector("itunes:image");
    if (imageEl) {
      return (
        imageEl.getAttribute("href") || imageEl.getAttribute("url") || ""
      ).trim();
    }

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

  private static parsePubDate(dateString: string): string {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toISOString();
    } catch {
      return dateString;
    }
  }
}
