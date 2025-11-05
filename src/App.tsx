import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import {
  loadPodcasts,
  getPodcast,
  getEpisodesForPodcast,
  addPodcast,
  addEpisodesToPodcast,
  type Podcast,
  type Episode,
} from './storage';
import { subscribeToFeed } from './rss-parser';
import Header from './components/Header';
import SubscribeForm from './components/SubscribeForm';
import PodcastList from './components/PodcastList';
import EpisodeList from './components/EpisodeList';

// Create Material Design theme with custom colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Indigo
    },
    secondary: {
      main: '#2196f3', // Blue
    },
    background: {
      default: '#f4f6fb',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcastId, setSelectedPodcastId] = useState<number | null>(null);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Load podcasts on mount
  useEffect(() => {
    refreshPodcasts();
  }, []);

  // Load episodes when selected podcast changes
  useEffect(() => {
    if (selectedPodcastId) {
      loadEpisodes(selectedPodcastId);
    }
  }, [selectedPodcastId]);

  const refreshPodcasts = () => {
    try {
      const loadedPodcasts = loadPodcasts();
      loadedPodcasts.sort((a, b) => {
        const dateA = a.updated_at || '1970-01-01';
        const dateB = b.updated_at || '1970-01-01';
        return dateB.localeCompare(dateA);
      });
      setPodcasts(loadedPodcasts);
    } catch (error) {
      showStatus((error as Error).message, true);
    }
  };

  const loadEpisodes = (podcastId: number) => {
    try {
      const podcast = getPodcast(podcastId);
      if (!podcast) {
        showStatus('Podcast non trouvé', true);
        return;
      }
      const loadedEpisodes = getEpisodesForPodcast(podcastId);
      setSelectedPodcast(podcast);
      setEpisodes(loadedEpisodes);
    } catch (error) {
      showStatus((error as Error).message, true);
    }
  };

  const handleSubscribe = async (feedUrl: string) => {
    showStatus('Abonnement en cours…');
    try {
      const feedData = await subscribeToFeed(feedUrl);
      const podcast = addPodcast(feedData);
      addEpisodesToPodcast(podcast.id, feedData.episodes);

      showStatus(`Abonné à ${podcast.title}`, false);
      setSelectedPodcastId(podcast.id);
      refreshPodcasts();
    } catch (error) {
      showStatus((error as Error).message || 'Échec de l\'abonnement', true);
    }
  };

  const handleSelectPodcast = (podcastId: number) => {
    setSelectedPodcastId(podcastId);
  };

  const showStatus = (message: string, error: boolean = false) => {
    setStatusMessage(message);
    setIsError(error);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <Header />
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <SubscribeForm
              onSubscribe={handleSubscribe}
              statusMessage={statusMessage}
              isError={isError}
            />
            <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <PodcastList
                podcasts={podcasts}
                selectedPodcastId={selectedPodcastId}
                onSelectPodcast={handleSelectPodcast}
              />
              <EpisodeList
                podcast={selectedPodcast}
                episodes={episodes}
              />
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
