import { Podcast, Episode } from "../storage";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import DescriptionIcon from "@mui/icons-material/Description";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import { useI18n } from "../i18n";

interface EpisodeListProps {
  podcast: Podcast | null;
  episodes: Episode[];
  onPlayEpisode: (episode: Episode, index: number) => void;
  activeEpisodeKey?: string | null;
}

function truncate(text: string, maxLength: number = 280): string {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

function getEpisodeKey(episode: Episode): string | null {
  return (
    episode.guid || episode.audio_url || episode.link || episode.title || null
  );
}

function EpisodeList({
  podcast,
  episodes,
  onPlayEpisode,
  activeEpisodeKey,
}: EpisodeListProps) {
  const { t } = useI18n();

  const heading = t.episodes.heading(podcast?.title);

  const formatPublishedAt = (input?: string | null) => {
    if (!input) {
      return null;
    }
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Card elevation={0} sx={{ height: "fit-content", overflow: "hidden" }}>
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "secondary.light", letterSpacing: 4 }}
        >
          {t.episodes.sectionLabel}
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 600, mt: 1 }}
        >
          {heading}
        </Typography>
        {episodes.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
              color: "text.secondary",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <QueueMusicIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2">{t.episodes.empty}</Typography>
          </Box>
        ) : (
          <List
            sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {episodes.map((episode, index) => {
              const episodeKey =
                getEpisodeKey(episode) ??
                `${episode.title ?? "episode"}-${index}`;
              const isActive =
                activeEpisodeKey !== undefined && activeEpisodeKey !== null
                  ? getEpisodeKey(episode) === activeEpisodeKey
                  : false;

              const meta: string[] = [];
              if (episode.published_at) {
                const formatted = formatPublishedAt(episode.published_at);
                if (formatted) {
                  meta.push(formatted);
                }
              }
              if (episode.duration) {
                meta.push(t.episodes.duration(episode.duration));
              }

              return (
                <ListItem
                  key={episodeKey}
                  alignItems="flex-start"
                  sx={{
                    flexDirection: "column",
                    gap: 1.25,
                    p: { xs: 2.25, md: 2.75 },
                    borderRadius: 3,
                    bgcolor: isActive
                      ? "rgba(124, 58, 237, 0.24)"
                      : "rgba(15, 23, 42, 0.58)",
                    border: isActive
                      ? "1px solid rgba(127, 90, 240, 0.65)"
                      : "1px solid rgba(148, 163, 184, 0.16)",
                    boxShadow: isActive
                      ? "0 30px 45px -32px rgba(124, 58, 237, 0.65)"
                      : "0 22px 35px -28px rgba(14, 165, 233, 0.55)",
                    transition:
                      "background-color 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, lineHeight: 1.25 }}
                  >
                    {episode.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {truncate(episode.description || "")}
                  </Typography>
                  {meta.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {meta.map((item) => (
                        <Chip
                          key={item}
                          label={item}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: "rgba(148, 163, 184, 0.35)",
                            color: "text.secondary",
                            bgcolor: "rgba(148, 163, 184, 0.08)",
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {episode.audio_url && (
                      <Button
                        onClick={() => onPlayEpisode(episode, index)}
                        variant="contained"
                        color="primary"
                        startIcon={
                          isActive ? <GraphicEqIcon /> : <PlayArrowIcon />
                        }
                        sx={{ borderRadius: 999 }}
                        aria-pressed={isActive}
                      >
                        {isActive ? t.player.nowPlaying : t.episodes.play}
                      </Button>
                    )}
                    {episode.link && (
                      <Button
                        component="a"
                        href={episode.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        color="secondary"
                        startIcon={<DescriptionIcon />}
                        sx={{ borderRadius: 999 }}
                      >
                        {t.episodes.notes}
                      </Button>
                    )}
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default EpisodeList;
