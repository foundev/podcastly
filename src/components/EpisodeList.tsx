import { Podcast, Episode } from '../storage';

interface EpisodeListProps {
  podcast: Podcast | null;
  episodes: Episode[];
}

function truncate(text: string, maxLength: number = 280): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function EpisodeList({ podcast, episodes }: EpisodeListProps) {
  const heading = podcast?.title
    ? `${podcast.title} — Episodes`
    : 'Episodes';

  return (
    <section className="card">
      <h2 id="episodes-heading">{heading}</h2>
      <ul id="episode-list" className="episode-list">
        {episodes.length === 0 ? (
          <li>No episodes found.</li>
        ) : (
          episodes.map((episode, index) => {
            const meta: string[] = [];
            if (episode.published_at) {
              meta.push(new Date(episode.published_at).toLocaleString());
            }
            if (episode.duration) {
              meta.push(`Duration: ${episode.duration}`);
            }

            return (
              <li key={episode.guid || index}>
                <div className="episode-title">{episode.title}</div>
                <div className="episode-description">
                  {truncate(episode.description || '')}
                </div>
                <div className="episode-meta">{meta.join(' • ')}</div>
                <div className="episode-actions">
                  {episode.audio_url && (
                    <a
                      href={episode.audio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="episode-audio"
                    >
                      Play
                    </a>
                  )}
                  {episode.link && (
                    <a
                      href={episode.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="episode-link"
                    >
                      Show Notes
                    </a>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}

export default EpisodeList;
