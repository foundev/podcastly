import { Podcast, Episode } from '../storage';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import Divider from '@mui/material/Divider';

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
    <Card elevation={2} sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          {heading}
        </Typography>
        {episodes.length === 0 ? (
          <Box sx={{
            py: 4,
            textAlign: 'center',
            color: 'text.secondary',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1
          }}>
            <QueueMusicIcon sx={{ fontSize: 48, opacity: 0.3 }} />
            <Typography variant="body2">
              No episodes found.
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 1 }}>
            {episodes.map((episode, index) => {
              const meta: string[] = [];
              if (episode.published_at) {
                meta.push(new Date(episode.published_at).toLocaleString());
              }
              if (episode.duration) {
                meta.push(`Duration: ${episode.duration}`);
              }

              return (
                <Box key={episode.guid || index}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{ flexDirection: 'column', gap: 1, py: 2 }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                      {episode.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      {truncate(episode.description || '')}
                    </Typography>
                    {meta.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {meta.join(' • ')}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      {episode.audio_url && (
                        <Link
                          href={episode.audio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <IconButton size="small" color="primary">
                            <PlayArrowIcon />
                          </IconButton>
                          <Typography variant="body2">Play</Typography>
                        </Link>
                      )}
                      {episode.link && (
                        <Link
                          href={episode.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                        >
                          <IconButton size="small" color="primary">
                            <DescriptionIcon />
                          </IconButton>
                          <Typography variant="body2">Show Notes</Typography>
                        </Link>
                      )}
                    </Box>
                  </ListItem>
                  {index < episodes.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

export default EpisodeList;
