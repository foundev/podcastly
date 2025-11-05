import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import Box from '@mui/material/Box';

function Header() {
  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <PodcastsIcon sx={{ mr: 2, fontSize: 32 }} />
        <Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
            Podcastly
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Your lightweight podcast player
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
