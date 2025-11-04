import type { Podcast, Episode } from "./types";

export class UI {
  static renderPodcasts(
    podcasts: Podcast[],
    selectedId: number | null,
    onSelect: (id: number) => void,
    onDelete: (id: number) => void
  ): void {
    const list = document.getElementById("podcast-list") as HTMLUListElement;
    const template = document.getElementById(
      "podcast-item-template"
    ) as HTMLTemplateElement;

    list.innerHTML = "";

    if (!podcasts.length) {
      list.innerHTML =
        "<li>No podcasts yet. Add your favourite RSS feed above!</li>";
      return;
    }

    podcasts.forEach((podcast) => {
      const clone = template.content.cloneNode(true) as DocumentFragment;
      const button = clone.querySelector(".podcast-button") as HTMLButtonElement;
      button.dataset.podcastId = podcast.id.toString();
      button.addEventListener("click", () => onSelect(podcast.id));

      if (podcast.id === selectedId) {
        button.classList.add("is-selected");
      }

      const titleEl = clone.querySelector(".podcast-title") as HTMLSpanElement;
      titleEl.textContent = podcast.title;

      const descEl = clone.querySelector(
        ".podcast-description"
      ) as HTMLSpanElement;
      descEl.textContent = podcast.description || podcast.link || "";

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.className = "delete-button";
      deleteBtn.title = "Delete podcast";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Delete "${podcast.title}"?`)) {
          onDelete(podcast.id);
        }
      });
      button.appendChild(deleteBtn);

      list.appendChild(clone);
    });
  }

  static renderEpisodes(podcast: Podcast | null): void {
    const heading = document.getElementById(
      "episodes-heading"
    ) as HTMLHeadingElement;
    const list = document.getElementById("episode-list") as HTMLUListElement;
    const template = document.getElementById(
      "episode-item-template"
    ) as HTMLTemplateElement;

    list.innerHTML = "";

    if (!podcast || !podcast.episodes || !podcast.episodes.length) {
      heading.textContent = podcast ? `${podcast.title} — Episodes` : "Episodes";
      list.innerHTML = "<li>No episodes found.</li>";
      return;
    }

    heading.textContent = `${podcast.title} — Episodes`;

    podcast.episodes.forEach((episode) => {
      const clone = template.content.cloneNode(true) as DocumentFragment;

      const titleEl = clone.querySelector(".episode-title") as HTMLElement;
      titleEl.textContent = episode.title;

      const descEl = clone.querySelector(
        ".episode-description"
      ) as HTMLParagraphElement;
      descEl.textContent = this.truncate(this.stripHtml(episode.description));

      const meta: string[] = [];
      if (episode.publishedAt) {
        try {
          const date = new Date(episode.publishedAt);
          if (!isNaN(date.getTime())) {
            meta.push(date.toLocaleDateString());
          }
        } catch {
          // Ignore date parsing errors
        }
      }
      if (episode.duration) {
        meta.push(`Duration: ${this.formatDuration(episode.duration)}`);
      }

      const metaEl = clone.querySelector(".episode-meta") as HTMLSpanElement;
      metaEl.textContent = meta.join(" • ");

      const audioLink = clone.querySelector(
        ".episode-audio"
      ) as HTMLAnchorElement;
      if (episode.audioUrl) {
        audioLink.href = episode.audioUrl;
      } else {
        audioLink.remove();
      }

      const notesLink = clone.querySelector(
        ".episode-link"
      ) as HTMLAnchorElement;
      if (episode.link) {
        notesLink.href = episode.link;
      } else {
        notesLink.remove();
      }

      list.appendChild(clone);
    });
  }

  static clearEpisodes(): void {
    const heading = document.getElementById(
      "episodes-heading"
    ) as HTMLHeadingElement;
    const list = document.getElementById("episode-list") as HTMLUListElement;
    heading.textContent = "Episodes";
    list.innerHTML = "";
  }

  static highlightSelectedPodcast(selectedId: number | null): void {
    document.querySelectorAll(".podcast-button").forEach((button) => {
      const btn = button as HTMLButtonElement;
      btn.classList.toggle(
        "is-selected",
        Number(btn.dataset.podcastId) === selectedId
      );
    });
  }

  static setStatus(message: string, isError: boolean = false): void {
    const node = document.getElementById("status-message") as HTMLParagraphElement;
    node.textContent = message;
    node.classList.toggle("is-error", isError);
  }

  private static truncate(text: string, maxLength: number = 280): string {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1)}…`;
  }

  private static stripHtml(html: string): string {
    if (!html) return "";
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  }

  private static formatDuration(duration: string): string {
    if (!duration) return "";

    if (duration.includes(":")) {
      return duration;
    }

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
}
