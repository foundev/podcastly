import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "en" | "fr";

interface Translation {
  header: {
    beta: string;
    tagline: string;
    addFeed: string;
    languageLabel: string;
  };
  hero: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  subscribeForm: {
    sectionLabel: string;
    title: string;
    description: string;
    fieldLabel: string;
    button: string;
  };
  library: {
    sectionLabel: string;
    heading: string;
    empty: string;
    updatedOn: (date: string) => string;
  };
  episodes: {
    sectionLabel: string;
    heading: (podcastTitle?: string | null) => string;
    empty: string;
    duration: (value: string) => string;
    play: string;
    notes: string;
  };
  status: {
    subscriptionInProgress: string;
    subscriptionSuccess: (title: string) => string;
    subscriptionError: string;
    podcastNotFound: string;
    genericError: string;
  };
}

const translations: Record<Language, Translation> = {
  en: {
    header: {
      beta: "Beta",
      tagline: "Your PWA companion for podcasts",
      addFeed: "Add feed",
      languageLabel: "Language",
    },
    hero: {
      kicker: "A new way to listen",
      title: "Rediscover your favourite podcasts",
      subtitle:
        "Follow your shows, explore the latest episodes, and manage your listening queue in a refreshed, dynamic, and immersive interface.",
    },
    subscribeForm: {
      sectionLabel: "Subscriptions",
      title: "Add an RSS feed in seconds",
      description:
        "Paste the RSS feed URL to sync new episodes automatically and keep them ready inside your library.",
      fieldLabel: "RSS feed URL",
      button: "Subscribe",
    },
    library: {
      sectionLabel: "Library",
      heading: "Podcasts",
      empty: "No podcasts yet. Add your first feed!",
      updatedOn: (date) => `Updated on ${date}`,
    },
    episodes: {
      sectionLabel: "Details",
      heading: (podcastTitle) =>
        podcastTitle ? `${podcastTitle} — Episodes` : "Episodes",
      empty: "No episodes available yet.",
      duration: (value) => `Duration: ${value}`,
      play: "Play",
      notes: "Episode notes",
    },
    status: {
      subscriptionInProgress: "Subscribing…",
      subscriptionSuccess: (title) => `Subscribed to ${title}`,
      subscriptionError: "Subscription failed",
      podcastNotFound: "Podcast not found",
      genericError: "Something went wrong",
    },
  },
  fr: {
    header: {
      beta: "Beta",
      tagline: "Votre compagnon PWA pour les podcasts",
      addFeed: "Ajouter un flux",
      languageLabel: "Langue",
    },
    hero: {
      kicker: "Une nouvelle manière d'écouter",
      title: "Redécouvrez vos podcasts favoris",
      subtitle:
        "Suivez vos émissions, explorez les derniers épisodes et gérez votre file d'écoute dans une interface repensée, dynamique et immersive.",
    },
    subscribeForm: {
      sectionLabel: "Abonnements",
      title: "Ajoutez un flux RSS en quelques secondes",
      description:
        "Collez l'URL du flux RSS pour synchroniser automatiquement les nouveaux épisodes et les retrouver dans votre bibliothèque.",
      fieldLabel: "URL du flux RSS",
      button: "S'abonner",
    },
    library: {
      sectionLabel: "Bibliothèque",
      heading: "Podcasts",
      empty: "Aucun podcast pour l'instant. Ajoutez votre premier flux !",
      updatedOn: (date) => `Mis à jour le ${date}`,
    },
    episodes: {
      sectionLabel: "Détails",
      heading: (podcastTitle) =>
        podcastTitle ? `${podcastTitle} — Épisodes` : "Épisodes",
      empty: "Aucun épisode disponible pour le moment.",
      duration: (value) => `Durée : ${value}`,
      play: "Écouter",
      notes: "Notes de l'épisode",
    },
    status: {
      subscriptionInProgress: "Abonnement en cours…",
      subscriptionSuccess: (title) => `Abonné à ${title}`,
      subscriptionError: "Échec de l'abonnement",
      podcastNotFound: "Podcast non trouvé",
      genericError: "Un problème est survenu",
    },
  },
};

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translation;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = "podcastly_language";

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === "en" || stored === "fr") {
      return stored;
    }
    const browser = window.navigator.language.slice(0, 2).toLowerCase();
    if (browser === "fr") {
      return "fr";
    }
  }
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export const supportedLanguages: Language[] = ["en", "fr"];
