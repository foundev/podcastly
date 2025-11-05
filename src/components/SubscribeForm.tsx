import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import RssFeedIcon from '@mui/icons-material/RssFeed';

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
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          Subscribe to a podcast
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              id="feed-url"
              name="feed-url"
              type="url"
              label="RSS Feed URL"
              placeholder="https://example.com/feed.xml"
              required
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              variant="outlined"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<RssFeedIcon />}
              sx={{ minWidth: 130, height: 56 }}
            >
              Subscribe
            </Button>
          </Box>
          {statusMessage && (
            <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>
              {statusMessage}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default SubscribeForm;
