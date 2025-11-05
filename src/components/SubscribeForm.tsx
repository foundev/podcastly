import { useState } from 'react';

interface SubscribeFormProps {
  onSubscribe: (feedUrl: string) => Promise<void>;
  statusMessage: string;
  isError: boolean;
}

function SubscribeForm({ onSubscribe, statusMessage, isError }: SubscribeFormProps) {
  const [feedUrl, setFeedUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = feedUrl.trim();
    if (!trimmedUrl) {
      return;
    }
    await onSubscribe(trimmedUrl);
    setFeedUrl('');
  };

  return (
    <section className="card">
      <h2>Subscribe to a podcast</h2>
      <form id="subscribe-form" onSubmit={handleSubmit} className="subscribe-form">
        <label htmlFor="feed-url">RSS Feed URL:</label>
        <input
          id="feed-url"
          name="feed-url"
          type="url"
          placeholder="https://example.com/feed.xml"
          required
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
        />
        <button type="submit">Subscribe</button>
      </form>
      <p id="status-message" className={isError ? 'is-error' : ''}>
        {statusMessage}
      </p>
    </section>
  );
}

export default SubscribeForm;
