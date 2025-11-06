import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import InputAdornment from "@mui/material/InputAdornment";
import Fade from "@mui/material/Fade";
import RssFeedIcon from "@mui/icons-material/RssFeed";
import { useI18n } from "../i18n";

interface SubscribeFormProps {
  onSubscribe: (feedUrl: string) => Promise<void>;
  statusMessage: string;
  isError: boolean;
}

function SubscribeForm({
  onSubscribe,
  statusMessage,
  isError,
}: SubscribeFormProps) {
  const [feedUrl, setFeedUrl] = useState("");
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = feedUrl.trim();
    if (!trimmedUrl) {
      return;
    }
    await onSubscribe(trimmedUrl);
    setFeedUrl("");
  };

  return (
    <Card
      id="subscribe"
      elevation={0}
      sx={{
        overflow: "hidden",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background:
          "linear-gradient(140deg, rgba(24, 35, 61, 0.9), rgba(33, 25, 81, 0.72))",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "auto -30% -60% auto",
          width: 420,
          height: 420,
          background:
            "radial-gradient(circle at center, rgba(127, 90, 240, 0.35) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      <CardContent sx={{ position: "relative", zIndex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "secondary.light", letterSpacing: 4 }}
        >
          {t.subscribeForm.sectionLabel}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mt: 1 }}>
          {t.subscribeForm.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 1.5, color: "text.secondary", maxWidth: 520 }}
        >
          {t.subscribeForm.description}
        </Typography>
        <Stack
          component="form"
          onSubmit={handleSubmit}
          spacing={2}
          sx={{
            mt: 3,
            flexDirection: { xs: "column", md: "row" },
            alignItems: { md: "center" },
          }}
        >
          <TextField
            fullWidth
            id="feed-url"
            name="feed-url"
            type="url"
            label={t.subscribeForm.fieldLabel}
            placeholder="https://example.com/feed.xml"
            required
            value={feedUrl}
            onChange={(e) => setFeedUrl(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <RssFeedIcon color="secondary" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<RssFeedIcon />}
            sx={{
              whiteSpace: "nowrap",
              height: 56,
            }}
          >
            {t.subscribeForm.button}
          </Button>
        </Stack>
        <Fade in={Boolean(statusMessage)}>
          <Box>
            {statusMessage && (
              <Alert
                severity={isError ? "error" : "success"}
                variant="outlined"
                sx={{ mt: 3 }}
              >
                {statusMessage}
              </Alert>
            )}
          </Box>
        </Fade>
      </CardContent>
    </Card>
  );
}

export default SubscribeForm;
