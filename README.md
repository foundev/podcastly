# Podcastly

Application de podcast open source 100% client-side, écrite en JavaScript vanilla. Abonnez-vous à vos émissions favorites via RSS, toutes les données sont stockées localement dans votre navigateur avec localStorage.

## 🚀 Démarrage Rapide

Aucune installation requise ! Servez simplement les fichiers statiques :

```bash
# Avec Python 3
python -m http.server 8000 --directory web

# Ou avec Node.js
npx serve web

# Ou avec PHP
php -S localhost:8000 -t web
```

Puis visitez [http://localhost:8000](http://localhost:8000) pour utiliser l'application.

## ✨ Fonctionnalités

- ✅ **100% Client-Side** : Aucun backend nécessaire, tout fonctionne dans votre navigateur
- ✅ **Stockage Local** : Vos données restent privées et sont stockées dans localStorage
- ✅ **Parsing RSS** : Analyse les flux RSS de podcasts directement dans le navigateur
- ✅ **Support CORS** : Utilise un proxy pour récupérer n'importe quel flux RSS
- ✅ **Interface Moderne** : Design épuré et responsive
- ✅ **PWA Ready** : Installez l'application comme une app native
- ✅ **Hors Ligne** : Fonctionne hors ligne avec Service Worker

## 🎯 Utilisation

1. Collez l'URL d'un flux RSS de podcast dans le champ de saisie
2. Cliquez sur "Subscribe"
3. Parcourez les épisodes et écoutez-les directement
4. Vos abonnements sont sauvegardés automatiquement dans votre navigateur

### Exemples de flux RSS

Essayez ces flux populaires :

- `https://feeds.fireside.fm/bibleinayear/rss`
- `https://feeds.megaphone.fm/hubermanlab`
- `https://feeds.simplecast.com/54nAGcIl`

## 💾 Stockage des Données

Toutes les données sont stockées dans localStorage de votre navigateur :
- Liste des podcasts abonnés
- Métadonnées des épisodes
- Podcast sélectionné

Pour **réinitialiser** l'application, ouvrez la console du navigateur et tapez :
```javascript
localStorage.clear();
location.reload();
```

## 📱 Installation PWA

Ouvrez l'application dans Chrome, Edge, Safari ou un autre navigateur compatible PWA et utilisez l'option "Installer" / "Ajouter à l'écran d'accueil". L'application fonctionnera alors comme une application native !

## 🛠️ Architecture

```
web/
├── index.html          # Page principale
├── css/
│   └── styles.css      # Styles de l'application
├── js/
│   └── app.js          # Logique complète (parsing RSS, localStorage, UI)
├── icons/              # Icônes PWA
├── manifest.webmanifest # Manifest PWA
└── service-worker.js   # Service worker pour le mode hors ligne
```

## 🔒 Vie Privée et Sécurité

- **Aucune donnée n'est envoyée à un serveur** : tout reste dans votre navigateur
- **Pas de tracking, pas d'analytics** : votre vie privée est respectée
- **Pas de compte requis** : commencez à utiliser immédiatement
- Le proxy CORS (`allorigins.win`) est utilisé uniquement pour récupérer les flux RSS

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Soumettre des pull requests

## 📄 Licence

GPL v3

## 🎨 Crédits

Développé avec ❤️ en JavaScript vanilla - zéro framework, zéro dépendance backend !
