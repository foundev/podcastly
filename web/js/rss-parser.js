/** Parser RSS pour Podcastly. */
export class FeedError extends Error {
    constructor(message) {
        super(message);
        this.name = "FeedError";
    }
}
function cleanText(value) {
    if (!value) {
        return null;
    }
    const cleaned = value.trim();
    return cleaned || null;
}
function parsePubDate(item) {
    const pubDate = item.querySelector("pubDate, published");
    if (!pubDate || !pubDate.textContent) {
        return null;
    }
    try {
        const date = new Date(pubDate.textContent.trim());
        if (isNaN(date.getTime())) {
            return pubDate.textContent.trim();
        }
        return date.toISOString().replace("T", " ").substring(0, 19);
    }
    catch (error) {
        return pubDate.textContent.trim();
    }
}
function findImageUrl(channel) {
    const image = channel.querySelector("image");
    if (image) {
        const url = image.querySelector("url");
        if (url && url.textContent) {
            return cleanText(url.textContent);
        }
    }
    const itunesNS = "http://www.itunes.com/dtds/podcast-1.0.dtd";
    const itunesImages = channel.getElementsByTagNameNS(itunesNS, "image");
    if (itunesImages.length > 0) {
        const href = itunesImages[0].getAttribute("href") || itunesImages[0].getAttribute("url");
        if (href) {
            return cleanText(href);
        }
    }
    const itunesImageLegacy = channel.querySelector("itunes\\:image");
    if (itunesImageLegacy) {
        const href = itunesImageLegacy.getAttribute("href") || itunesImageLegacy.getAttribute("url");
        if (href) {
            return cleanText(href);
        }
    }
    const mediaNS = "http://search.yahoo.com/mrss/";
    const mediaThumbnails = channel.getElementsByTagNameNS(mediaNS, "thumbnail");
    if (mediaThumbnails.length > 0) {
        const href = mediaThumbnails[0].getAttribute("url") || mediaThumbnails[0].getAttribute("href");
        if (href) {
            return cleanText(href);
        }
    }
    return null;
}
function parseEpisode(item) {
    const guidEl = item.querySelector("guid, id");
    const guid = guidEl ? cleanText(guidEl.textContent) : null;
    const titleEl = item.querySelector("title");
    const title = titleEl ? cleanText(titleEl.textContent) : "Untitled Episode";
    if (!title) {
        return null;
    }
    const descEl = item.querySelector("description") ||
        item.querySelector("content\\:encoded") ||
        item.querySelector("summary");
    const description = descEl ? cleanText(descEl.textContent) : null;
    const linkEl = item.querySelector("link");
    const link = linkEl ? cleanText(linkEl.textContent) : null;
    let duration = null;
    const itunesNS = "http://www.itunes.com/dtds/podcast-1.0.dtd";
    const itunesDuration = item.getElementsByTagNameNS(itunesNS, "duration");
    if (itunesDuration.length > 0) {
        duration = cleanText(itunesDuration[0].textContent);
    }
    if (!duration) {
        const durationEl = item.querySelector("itunes\\:duration, duration");
        duration = durationEl ? cleanText(durationEl.textContent) : null;
    }
    let audioUrl = null;
    const enclosure = item.querySelector("enclosure");
    if (enclosure) {
        audioUrl = cleanText(enclosure.getAttribute("url"));
    }
    if (!audioUrl) {
        const mediaNS = "http://search.yahoo.com/mrss/";
        const mediaContent = item.getElementsByTagNameNS(mediaNS, "content");
        if (mediaContent.length > 0) {
            audioUrl = cleanText(mediaContent[0].getAttribute("url") || mediaContent[0].textContent);
        }
    }
    if (!audioUrl) {
        const mediaContent = item.querySelector("media\\:content");
        if (mediaContent) {
            audioUrl = cleanText(mediaContent.textContent || mediaContent.getAttribute("url"));
        }
    }
    const publishedAt = parsePubDate(item);
    return {
        guid: guid || audioUrl || link || title,
        title: title,
        description: description,
        audio_url: audioUrl,
        link: link,
        published_at: publishedAt,
        duration: duration,
    };
}
async function fetchFeed(feedUrl) {
    try {
        const response = await fetch(feedUrl, {
            headers: {
                "User-Agent": "Podcastly/0.1 (+https://github.com/your-org/podcastly)",
            },
        });
        if (!response.ok) {
            throw new FeedError(`Échec de la récupération du flux (${response.status})`);
        }
        const text = await response.text();
        return text;
    }
    catch (error) {
        if (error instanceof FeedError) {
            throw error;
        }
        throw new FeedError(`Échec de la récupération du flux: ${error.message}`);
    }
}
function parseFeed(xmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
        throw new FeedError("Le XML du flux n'est pas bien formé");
    }
    const channel = doc.querySelector("channel");
    if (!channel) {
        throw new FeedError("Le flux est manquant d'informations de canal");
    }
    const titleEl = channel.querySelector("title");
    const title = titleEl ? cleanText(titleEl.textContent) : null;
    if (!title) {
        throw new FeedError("Le canal du flux est manquant d'un titre");
    }
    const descEl = channel.querySelector("description, subtitle");
    const description = descEl ? cleanText(descEl.textContent) : null;
    const linkEl = channel.querySelector("link");
    const link = linkEl ? cleanText(linkEl.textContent) : null;
    const imageUrl = findImageUrl(channel);
    const items = channel.querySelectorAll("item");
    const episodes = [];
    items.forEach((item) => {
        const episode = parseEpisode(item);
        if (episode && episode.title) {
            episodes.push(episode);
        }
    });
    return {
        title: title,
        description: description,
        link: link,
        image_url: imageUrl,
        episodes: episodes,
    };
}
export async function subscribeToFeed(feedUrl) {
    const rawFeed = await fetchFeed(feedUrl);
    const feedData = parseFeed(rawFeed);
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    return {
        title: feedData.title,
        description: feedData.description,
        link: feedData.link,
        feed_url: feedUrl,
        image_url: feedData.image_url,
        updated_at: now,
        episodes: feedData.episodes,
    };
}
//# sourceMappingURL=rss-parser.js.map