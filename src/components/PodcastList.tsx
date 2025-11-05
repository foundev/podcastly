import { Podcast } from '../storage';

interface PodcastListProps {
  podcasts: Podcast[];
  selectedPodcastId: number | null;
  onSelectPodcast: (podcastId: number) => void;
}

function PodcastList({ podcasts, selectedPodcastId, onSelectPodcast }: PodcastListProps) {
  return (
    <section className="card">
      <h2>Podcasts</h2>
      <ul id="podcast-list" className="podcast-list">
        {podcasts.length === 0 ? (
          <li>No podcasts yet. Add your favourite feed!</li>
        ) : (
          podcasts.map((podcast) => (
            <li key={podcast.id}>
              <button
                className={`podcast-button ${podcast.id === selectedPodcastId ? 'is-selected' : ''}`}
                data-podcast-id={podcast.id}
                onClick={() => onSelectPodcast(podcast.id)}
              >
                <span className="podcast-title">{podcast.title}</span>
                <span className="podcast-description">
                  {podcast.description || podcast.link || ''}
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

export default PodcastList;
