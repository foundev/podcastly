import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

function Header() {
  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        backgroundColor: 'rgba(5, 8, 22, 0.78)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: { xs: 1, md: 1.5 } }}>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1.5, md: 2 },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'linear-gradient(135deg, rgba(127, 90, 240, 0.95), rgba(34, 211, 238, 0.65))',
                boxShadow: '0 16px 30px -18px rgba(34, 211, 238, 0.55)',
              }}
            >
              <PodcastsIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  background: 'linear-gradient(135deg, #f8fafc 10%, #cbd5f5 90%)',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                Podcastly
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Votre compagnon PWA pour les podcasts
                </Typography>
                <Chip
                  label="Beta"
                  color="secondary"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    bgcolor: 'rgba(34, 211, 238, 0.18)',
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Button
            href="#subscribe"
            variant="outlined"
            color="secondary"
            sx={{
              borderRadius: 999,
              px: 3,
              borderColor: 'rgba(34, 211, 238, 0.65)',
              '&:hover': {
                borderColor: 'secondary.main',
                backgroundColor: 'rgba(34, 211, 238, 0.12)',
              },
            }}
          >
            Ajouter un flux
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
