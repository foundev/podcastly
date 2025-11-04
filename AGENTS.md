# Repository Guidelines

## Project Structure & Module Organization
- Toute l'application fonctionne dans le navigateur (JavaScript vanilla)
- Les fichiers frontend sont dans `web/` avec la structure suivante :
  - `web/js/` - JavaScript (app.js, storage.js, rss-parser.js)
  - `web/css/` - Styles CSS
  - `web/icons/` - Icônes pour la PWA
- Les échantillons de flux RSS sont dans `assets/samples/`

## Build, Test, and Development Commands
- Utilisez un serveur HTTP statique pour servir les fichiers dans `web/`
- Options disponibles :
  - `python -m http.server 8000 --directory web` (si Python est installé)
  - `npx http-server web -p 8000` (si Node.js est installé)
  - `php -S 127.0.0.1:8000 -t web` (si PHP est installé)
  - `./serve.sh` (script automatique qui détecte un serveur disponible)

## Code Style
- JavaScript vanilla uniquement : pas de frameworks, pas de build tools
- Utilisez `camelCase` pour les fonctions JavaScript
- Indentation de 2 espaces pour JavaScript
- Formatage avec `npx prettier --write` pour les fichiers frontend

## Testing Guidelines
- Testez manuellement en ouvrant l'application dans un navigateur
- Vérifiez que localStorage fonctionne correctement
- Testez avec différents flux RSS pour valider le parser

## Commit & Pull Request Guidelines
- Écrivez des messages de commit impératifs (~50 caractères) avec le contexte dans le corps
- Référencez les issues en utilisant `Fixes #123` lors de la fermeture de tickets
- Les descriptions de PR doivent décrire la nouvelle fonctionnalité et inclure des captures d'écran si l'interface change

## Feature Scope & Roadmap
- MVP : parser les flux RSS, stocker les métadonnées d'épisodes dans localStorage, exposer une simple queue au lecteur JavaScript
- À court terme : ajouter des adaptateurs pour les répertoires populaires (Apple, Spotify, Pocket Casts)
- À long terme : suivre les préférences utilisateur et l'historique de lecture dans localStorage

## Security & Configuration Tips
- Validez les URLs de flux et sanitisez les réponses réseau pour éviter SSRF et l'injection de markup
- Toutes les données sont stockées localement dans le navigateur - aucune donnée n'est envoyée à un serveur
- Soyez conscient des limites de localStorage (généralement ~5-10MB par domaine)
