import { Podcast } from '../storage';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

interface PodcastListProps {
  podcasts: Podcast[];
  selectedPodcastId: number | null;
  onSelectPodcast: (podcastId: number) => void;
}

function PodcastList({ podcasts, selectedPodcastId, onSelectPodcast }: PodcastListProps) {
  const formatUpdatedAt = (input?: string | null) => {
    if (!input) {
      return null;
    }
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card elevation={0} sx={{ height: 'fit-content', overflow: 'hidden' }}>
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Typography variant="overline" sx={{ color: 'secondary.light', letterSpacing: 4 }}>
          Bibliothèque
        </Typography>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mt: 1 }}>
          Podcasts
        </Typography>
        {podcasts.length === 0 ? (
          <Box sx={{
            py: 4,
            textAlign: 'center',
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}>
            <LibraryMusicIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2">
              Aucun podcast pour l'instant. Ajoutez votre premier flux !
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {podcasts.map((podcast) => (
              <ListItem key={podcast.id} disablePadding sx={{}}>
                <ListItemButton
                  selected={podcast.id === selectedPodcastId}
                  onClick={() => onSelectPodcast(podcast.id)}
                  sx={{
                    width: '100%',
                    borderRadius: 2,
                    p: { xs: 2, md: 2.5 },
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                    gap: 0.75,
                    bgcolor: 'rgba(15, 23, 42, 0.55)',
                    border: '1px solid rgba(148, 163, 184, 0.12)',
                    boxShadow: '0 18px 25px -22px rgba(15, 118, 255, 0.45)',
                    '&:hover': {
                      backgroundColor: 'rgba(124, 58, 237, 0.18)',
                      borderColor: 'rgba(127, 90, 240, 0.45)',
                    },
                    '&.Mui-selected': {
                      bgcolor: 'rgba(124, 58, 237, 0.22)',
                      borderColor: 'rgba(127, 90, 240, 0.6)',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'rgba(124, 58, 237, 0.28)',
                        borderColor: 'rgba(127, 90, 240, 0.75)',
                      },
                    },
                  }}
                >
                  <Stack spacing={1} sx={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: podcast.id === selectedPodcastId ? 'inherit' : 'text.primary',
                        }}
                      >
                        {podcast.title}
                      </Typography>
                      {formatUpdatedAt(podcast.updated_at) && (
                        <Chip
                          label={`Mis à jour le ${formatUpdatedAt(podcast.updated_at)}`}
                          color={podcast.id === selectedPodcastId ? 'secondary' : 'default'}
                          size="small"
                          variant={podcast.id === selectedPodcastId ? 'filled' : 'outlined'}
                          sx={{
                            borderColor: 'rgba(148, 163, 184, 0.35)',
                            color: podcast.id === selectedPodcastId ? 'primary.contrastText' : 'text.secondary',
                            bgcolor: podcast.id === selectedPodcastId ? 'rgba(34, 211, 238, 0.25)' : 'transparent',
                          }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: podcast.id === selectedPodcastId ? 'rgba(248, 250, 252, 0.75)' : 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {podcast.description || podcast.link || ''}
                    </Typography>
                  </Stack>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default PodcastList;
