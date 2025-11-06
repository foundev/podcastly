import { useState, useEffect, useMemo, useCallback } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  loadPodcasts,
  getPodcast,
  getEpisodesForPodcast,
  addPodcast,
  addEpisodesToPodcast,
  type Podcast,
  type Episode,
} from "./storage";
import { subscribeToFeed } from "./rss-parser";
import Header from "./components/Header";
import SubscribeForm from "./components/SubscribeForm";
import PodcastList from "./components/PodcastList";
import EpisodeList from "./components/EpisodeList";
import PodcastPlayer from "./components/PodcastPlayer";
import { useI18n } from "./i18n";

type StatusKey =
  | "subscriptionInProgress"
  | "subscriptionSuccess"
  | "subscriptionError"
  | "podcastNotFound"
  | "genericError";

type StatusState =
  | { type: "none" }
  | { type: "translated"; key: StatusKey; title?: string; isError: boolean }
  | { type: "custom"; message: string; isError: boolean };

type PlayerState = {
  podcast: Podcast;
  queue: Episode[];
  currentIndex: number;
};

// Thème modernisé avec ambiance néon sombre
const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7f5af0",
      contrastText: "#f8fafc",
    },
    secondary: {
      main: "#22d3ee",
    },
    background: {
      default: "#050816",
      paper: "rgba(15, 23, 42, 0.82)",
    },
    text: {
      primary: "#e2e8f0",
      secondary: "rgba(226, 232, 240, 0.72)",
    },
  },
  typography: {
    fontFamily:
      '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      letterSpacing: "0.02em",
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          backgroundColor: "#050816",
          color: "#e2e8f0",
          minHeight: "100vh",
        },
        "*::-webkit-scrollbar": {
          width: 8,
          height: 8,
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(148, 163, 184, 0.45)",
          borderRadius: 999,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.72))",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 25px 45px -20px rgba(15, 118, 255, 0.35)",
          backdropFilter: "blur(22px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 18px 35px -18px rgba(127, 90, 240, 0.7)",
          },
          "&.MuiButton-containedPrimary": {
            backgroundImage:
              "linear-gradient(135deg, #7f5af0 0%, #22d3ee 100%)",
            boxShadow: "0 20px 40px -22px rgba(34, 211, 238, 0.55)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
      },
      styleOverrides: {
        root: {
          "& .MuiFilledInput-root": {
            borderRadius: 14,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            transition: "background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "rgba(30, 41, 59, 0.7)",
            },
            "&.Mui-focused": {
              backgroundColor: "rgba(30, 41, 59, 0.85)",
            },
          },
          "& .MuiInputBase-input": {
            paddingTop: "18px",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: "0.75rem 1rem",
          transition: "transform 0.2s ease, background 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            backgroundColor: "rgba(124, 58, 237, 0.16)",
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backdropFilter: "blur(18px)",
        },
      },
    },
  },
});

function App() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [selectedPodcastId, setSelectedPodcastId] = useState<number | null>(
    null,
  );
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [status, setStatus] = useState<StatusState>({ type: "none" });
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const { t } = useI18n();

  const getEpisodeIdentity = useCallback((episode: Episode) => {
    return (
      episode.guid || episode.audio_url || episode.link || episode.title || null
    );
  }, []);

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
        const dateA = a.updated_at || "1970-01-01";
        const dateB = b.updated_at || "1970-01-01";
        return dateB.localeCompare(dateA);
      });
      setPodcasts(loadedPodcasts);
    } catch (error) {
      const message = (error as Error).message;
      setStatus(
        message
          ? { type: "custom", message, isError: true }
          : { type: "translated", key: "genericError", isError: true },
      );
    }
  };

  const loadEpisodes = (podcastId: number) => {
    try {
      const podcast = getPodcast(podcastId);
      if (!podcast) {
        setStatus({
          type: "translated",
          key: "podcastNotFound",
          isError: true,
        });
        return;
      }
      const loadedEpisodes = getEpisodesForPodcast(podcastId);
      setSelectedPodcast(podcast);
      setEpisodes(loadedEpisodes);
    } catch (error) {
      const message = (error as Error).message;
      setStatus(
        message
          ? { type: "custom", message, isError: true }
          : { type: "translated", key: "genericError", isError: true },
      );
    }
  };

  const handleSubscribe = async (feedUrl: string) => {
    setStatus({
      type: "translated",
      key: "subscriptionInProgress",
      isError: false,
    });
    try {
      const feedData = await subscribeToFeed(feedUrl);
      const podcast = addPodcast(feedData);
      addEpisodesToPodcast(podcast.id, feedData.episodes);

      setStatus({
        type: "translated",
        key: "subscriptionSuccess",
        title: podcast.title,
        isError: false,
      });
      setSelectedPodcastId(podcast.id);
      refreshPodcasts();
    } catch (error) {
      const message = (error as Error).message;
      setStatus(
        message
          ? { type: "custom", message, isError: true }
          : { type: "translated", key: "subscriptionError", isError: true },
      );
    }
  };

  const handleSelectPodcast = (podcastId: number) => {
    setSelectedPodcastId(podcastId);
  };

  const statusSnapshot = useMemo(() => {
    if (status.type === "translated") {
      let message: string;
      switch (status.key) {
        case "subscriptionInProgress":
          message = t.status.subscriptionInProgress;
          break;
        case "subscriptionSuccess":
          message = t.status.subscriptionSuccess(status.title ?? "");
          break;
        case "subscriptionError":
          message = t.status.subscriptionError;
          break;
        case "podcastNotFound":
          message = t.status.podcastNotFound;
          break;
        case "genericError":
          message = t.status.genericError;
          break;
        default:
          message = "";
      }
      return { message, isError: status.isError };
    }

    if (status.type === "custom") {
      return { message: status.message, isError: status.isError };
    }

    return { message: "", isError: false };
  }, [status, t]);

  const handlePlayEpisode = useCallback(
    (episode: Episode, index: number) => {
      if (!selectedPodcast || !episode.audio_url) {
        return;
      }

      setPlayerState({
        podcast: selectedPodcast,
        queue: episodes,
        currentIndex: index,
      });
    },
    [episodes, selectedPodcast],
  );

  const handleNextEpisode = useCallback(() => {
    setPlayerState((prev) => {
      if (!prev) {
        return prev;
      }
      const nextIndex = prev.currentIndex + 1;
      if (nextIndex >= prev.queue.length) {
        return prev;
      }
      return {
        ...prev,
        currentIndex: nextIndex,
      };
    });
  }, []);

  const handlePreviousEpisode = useCallback(() => {
    setPlayerState((prev) => {
      if (!prev) {
        return prev;
      }
      const previousIndex = prev.currentIndex - 1;
      if (previousIndex < 0) {
        return prev;
      }
      return {
        ...prev,
        currentIndex: previousIndex,
      };
    });
  }, []);

  const handleClosePlayer = useCallback(() => {
    setPlayerState(null);
  }, []);

  useEffect(() => {
    if (!selectedPodcast) {
      return;
    }
    setPlayerState((prev) => {
      if (!prev) {
        return prev;
      }
      if (prev.podcast.id !== selectedPodcast.id) {
        return prev;
      }
      if (episodes.length === 0) {
        return null;
      }
      const currentEpisode = prev.queue[prev.currentIndex];
      const currentKey = currentEpisode
        ? getEpisodeIdentity(currentEpisode)
        : null;
      const updatedIndex =
        currentKey !== null
          ? episodes.findIndex(
              (candidate) => getEpisodeIdentity(candidate) === currentKey,
            )
          : prev.currentIndex;

      return {
        podcast: prev.podcast,
        queue: episodes,
        currentIndex:
          updatedIndex >= 0
            ? updatedIndex
            : Math.min(prev.currentIndex, Math.max(episodes.length - 1, 0)),
      };
    });
  }, [episodes, selectedPodcast, getEpisodeIdentity]);

  const activeEpisode =
    playerState && playerState.queue[playerState.currentIndex]
      ? playerState.queue[playerState.currentIndex]
      : null;

  const activeEpisodeKey = activeEpisode
    ? getEpisodeIdentity(activeEpisode)
    : null;

  const hasPrevious = !!playerState && playerState.currentIndex > 0;
  const hasNext =
    !!playerState && playerState.currentIndex < playerState.queue.length - 1;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          bgcolor: "background.default",
          backgroundImage: `radial-gradient(circle at 20% 20%, rgba(127, 90, 240, 0.28), transparent 55%),
            radial-gradient(circle at 85% 0%, rgba(34, 211, 238, 0.25), transparent 45%),
            linear-gradient(160deg, rgba(4, 7, 18, 0.6), rgba(8, 11, 26, 0.95))`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            mixBlendMode: "screen",
            background:
              "radial-gradient(120% 120% at 110% 10%, rgba(56, 189, 248, 0.14), transparent 50%)",
          }}
        />
        <Header />
        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1, pb: { xs: 10, md: 14 } }}
        >
          <Box
            sx={{
              pt: { xs: 8, md: 10 },
              pb: { xs: 6, md: 8 },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <Typography
              variant="overline"
              color="secondary"
              sx={{ letterSpacing: 6, textTransform: "uppercase" }}
            >
              {t.hero.kicker}
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              sx={{ mt: 2, fontWeight: 700, lineHeight: 1.05 }}
            >
              {t.hero.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 2,
                maxWidth: 640,
                mx: { xs: "auto", md: 0 },
                color: "text.secondary",
              }}
            >
              {t.hero.subtitle}
            </Typography>
          </Box>
          <SubscribeForm
            onSubscribe={handleSubscribe}
            statusMessage={statusSnapshot.message}
            isError={statusSnapshot.isError}
          />
          <Box
            sx={{
              mt: 4,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "420px 1fr" },
              gap: { xs: 3, md: 4 },
            }}
          >
            <PodcastList
              podcasts={podcasts}
              selectedPodcastId={selectedPodcastId}
              onSelectPodcast={handleSelectPodcast}
            />
            <EpisodeList
              podcast={selectedPodcast}
              episodes={episodes}
              onPlayEpisode={handlePlayEpisode}
              activeEpisodeKey={activeEpisodeKey}
            />
          </Box>
        </Container>
        {playerState && activeEpisode && activeEpisode.audio_url && (
          <PodcastPlayer
            podcast={playerState.podcast}
            episode={activeEpisode}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
            onPrevious={handlePreviousEpisode}
            onNext={handleNextEpisode}
            onClose={handleClosePlayer}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
