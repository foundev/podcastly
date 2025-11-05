import { Podcast } from '../storage';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';

interface PodcastListProps {
  podcasts: Podcast[];
  selectedPodcastId: number | null;
  onSelectPodcast: (podcastId: number) => void;
}

function PodcastList({ podcasts, selectedPodcastId, onSelectPodcast }: PodcastListProps) {
  return (
    <Card elevation={2} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
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
            gap: 1
          }}>
            <LibraryMusicIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2">
              No podcasts yet. Add your favourite feed!
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 1 }}>
            {podcasts.map((podcast) => (
              <ListItem key={podcast.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={podcast.id === selectedPodcastId}
                  onClick={() => onSelectPodcast(podcast.id)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    },
                  }}
                >
                  <ListItemText
                    primary={podcast.title}
                    secondary={podcast.description || podcast.link || ''}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      sx: { color: podcast.id === selectedPodcastId ? 'inherit' : 'text.primary' }
                    }}
                    secondaryTypographyProps={{
                      sx: {
                        color: podcast.id === selectedPodcastId ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }
                    }}
                  />
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
