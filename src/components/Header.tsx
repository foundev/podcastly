import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import PodcastsIcon from "@mui/icons-material/Podcasts";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { useCallback, type MouseEvent } from "react";
import { useI18n, type Language } from "../i18n";

function Header() {
  const { t, language, setLanguage } = useI18n();

  const handleLanguageChange = useCallback(
    (_event: MouseEvent<HTMLElement>, value: Language | null) => {
      if (value) {
        setLanguage(value);
      }
    },
    [setLanguage],
  );

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        backgroundColor: "rgba(5, 8, 22, 0.78)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: { xs: 1, md: 1.5 } }}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, md: 2 },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(127, 90, 240, 0.95), rgba(34, 211, 238, 0.65))",
                boxShadow: "0 16px 30px -18px rgba(34, 211, 238, 0.55)",
              }}
            >
              <PodcastsIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  background:
                    "linear-gradient(135deg, #f8fafc 10%, #cbd5f5 90%)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Podcastly
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {t.header.tagline}
                </Typography>
                <Chip
                  label={t.header.beta}
                  color="secondary"
                  size="small"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    bgcolor: "rgba(34, 211, 238, 0.18)",
                  }}
                />
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Tooltip title={t.header.languageLabel} arrow placement="bottom">
              <ToggleButtonGroup
                value={language}
                exclusive
                onChange={handleLanguageChange}
                size="small"
                sx={{
                  bgcolor: "rgba(15, 23, 42, 0.6)",
                  borderRadius: 999,
                  border: "1px solid rgba(148, 163, 184, 0.16)",
                  "& .MuiToggleButton-root": {
                    px: 1.75,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "text.secondary",
                    border: "none",
                    "&.Mui-selected": {
                      color: "primary.contrastText",
                      bgcolor: "rgba(127, 90, 240, 0.45)",
                      "&:hover": {
                        bgcolor: "rgba(127, 90, 240, 0.6)",
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="en">EN</ToggleButton>
                <ToggleButton value="fr">FR</ToggleButton>
              </ToggleButtonGroup>
            </Tooltip>
            <Button
              href="#subscribe"
              variant="outlined"
              color="secondary"
              sx={{
                borderRadius: 999,
                px: 3,
                borderColor: "rgba(34, 211, 238, 0.65)",
                "&:hover": {
                  borderColor: "secondary.main",
                  backgroundColor: "rgba(34, 211, 238, 0.12)",
                },
              }}
            >
              {t.header.addFeed}
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Header;
