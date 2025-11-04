# Podcastly

Application de podcast open source écrite en JavaScript vanilla. Abonnez-vous à vos émissions préférées via RSS. Toutes les données sont stockées localement dans le navigateur (localStorage).

## Démarrage rapide

### Option 1 : Serveur HTTP Python (si Python est installé)

```bash
python -m http.server 8000 --directory web
```

### Option 2 : Serveur HTTP Node.js (si Node.js est installé)

```bash
npx http-server web -p 8000
```

### Option 3 : Serveur HTTP PHP (si PHP est installé)

```bash
php -S 127.0.0.1:8000 -t web
```

### Option 4 : Utiliser le script serve.sh

```bash
./serve.sh
```

Puis visitez [http://127.0.0.1:8000](http://127.0.0.1:8000) pour utiliser le lecteur web.

## Installation en tant que PWA

Ouvrez l'application dans Chrome, Edge ou un autre navigateur compatible PWA et utilisez l'option "Installer" / "Ajouter à l'écran d'accueil". Le manifest et le service worker permettent à Podcastly de fonctionner hors ligne pour les flux et assets précédemment chargés.

## Architecture

- **Frontend uniquement** : Toute l'application fonctionne dans le navigateur
- **Stockage local** : Les données (podcasts, épisodes) sont stockées dans localStorage
- **Parsing RSS côté client** : Les flux RSS sont parsés directement dans le navigateur
- **Aucune dépendance backend** : Pas de base de données, pas de serveur API

## Structure du projet

```
podcastly/
├── web/              # Fichiers frontend
│   ├── index.html    # Page principale
│   ├── js/           # JavaScript
│   │   ├── app.js       # Application principale
│   │   ├── storage.js   # Gestion localStorage
│   │   └── rss-parser.js # Parser RSS
│   ├── css/          # Styles
│   └── icons/        # Icônes PWA
└── assets/           # Assets de test
```

## Licence

GPL v3
