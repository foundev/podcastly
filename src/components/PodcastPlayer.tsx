import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type SyntheticEvent,
} from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DescriptionIcon from "@mui/icons-material/Description";
import { Podcast, Episode } from "../storage";
import { useI18n } from "../i18n";

interface PodcastPlayerProps {
  podcast: Podcast;
  episode: Episode;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
}

const formatTime = (value: number): string => {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }
  const totalSeconds = Math.floor(value);
  const seconds = totalSeconds % 60;
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

function PodcastPlayer({
  podcast,
  episode,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
  onClose,
}: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return undefined;
    }

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handleTimeUpdate = () => {
      setCurrentTime(
        Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      );
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (hasNext) {
        onNext();
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [hasNext, onNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !episode.audio_url) {
      return;
    }

    setCurrentTime(0);
    setDuration(0);

    const play = async () => {
      try {
        await audio.play();
      } catch (error) {
        setIsPlaying(false);
      }
    };

    if (audio.readyState >= 1) {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    }

    play();
  }, [episode.audio_url]);

  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  const handleProgressChange = useCallback(
    (_event: Event, value: number | number[]) => {
      if (typeof value === "number" && duration > 0) {
        setCurrentTime((value / 100) * duration);
      }
    },
    [duration],
  );

  const handleProgressCommit = useCallback(
    (_event: Event | SyntheticEvent, value: number | number[]) => {
      const audio = audioRef.current;
      if (!audio || typeof value !== "number" || duration <= 0) {
        return;
      }
      const newTime = (value / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration],
  );

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const podcastInitial = useMemo(() => {
    const firstChar = podcast.title?.trim().charAt(0) ?? "";
    return firstChar ? firstChar.toUpperCase() : "P";
  }, [podcast.title]);

  return (
    <Paper
      elevation={10}
      sx={{
        position: "fixed",
        left: { xs: 16, md: 32 },
        right: { xs: 16, md: 32 },
        bottom: { xs: 16, md: 32 },
        zIndex: 1400,
        borderRadius: 4,
        p: { xs: 2.5, md: 3 },
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.78))",
        border: "1px solid rgba(148, 163, 184, 0.28)",
        boxShadow: "0 30px 55px -28px rgba(59, 130, 246, 0.55)",
        backdropFilter: "blur(18px)",
      }}
    >
      <Stack spacing={{ xs: 2.5, md: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={podcast.image_url ?? undefined}
            alt={podcast.title ?? "Podcast"}
            sx={{
              width: 56,
              height: 56,
              bgcolor: "rgba(127, 90, 240, 0.25)",
              border: "1px solid rgba(127, 90, 240, 0.4)",
              color: "primary.contrastText",
              fontWeight: 600,
              fontSize: 20,
            }}
          >
            {podcastInitial}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="overline"
              sx={{ letterSpacing: 2.5, color: "secondary.light" }}
            >
              {t.player.nowPlaying}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, lineHeight: 1.3, overflow: "hidden" }}
              noWrap
            >
              {episode.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ opacity: 0.85 }}
            >
              {podcast.title}
            </Typography>
          </Box>
          <Tooltip title={t.player.close}>
            <IconButton
              onClick={onClose}
              color="inherit"
              aria-label={t.player.close}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        <Box>
          <Slider
            value={progress}
            onChange={handleProgressChange}
            onChangeCommitted={handleProgressCommit}
            aria-label={t.player.progressLabel}
            min={0}
            max={100}
            sx={{
              color: "primary.main",
              "& .MuiSlider-thumb": {
                boxShadow: "0 0 0 6px rgba(127, 90, 240, 0.25)",
              },
            }}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ mt: 0.5 }}
          >
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Box>

        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={{ xs: 2, md: 2.5 }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Tooltip title={t.player.previous}>
              <span>
                <IconButton
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  color="inherit"
                  aria-label={t.player.previous}
                  size="large"
                >
                  <SkipPreviousIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isPlaying ? t.player.pause : t.player.play}>
              <IconButton
                onClick={handleTogglePlay}
                color="primary"
                size="large"
                aria-label={isPlaying ? t.player.pause : t.player.play}
                sx={{
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.light",
                  },
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
            </Tooltip>
            <Tooltip title={t.player.next}>
              <span>
                <IconButton
                  onClick={onNext}
                  disabled={!hasNext}
                  color="inherit"
                  aria-label={t.player.next}
                  size="large"
                >
                  <SkipNextIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={1.5} alignItems="center">
            {episode.link && (
              <Button
                component="a"
                href={episode.link}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="small"
                startIcon={<DescriptionIcon />}
              >
                {t.player.showNotes}
              </Button>
            )}
            {episode.audio_url && (
              <Tooltip title={t.player.openExternal}>
                <IconButton
                  component="a"
                  href={episode.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t.player.openExternal}
                  color="inherit"
                  size="large"
                >
                  <OpenInNewIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Stack>
      </Stack>
      <audio
        key={episode.audio_url ?? ""}
        ref={audioRef}
        src={episode.audio_url ?? undefined}
        preload="metadata"
      />
    </Paper>
  );
}

export default PodcastPlayer;
