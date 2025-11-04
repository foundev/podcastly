# Podcastly 🎧

Application de podcast moderne, 100% client-side, développée avec **TypeScript** et **Vite**. Abonnez-vous à vos émissions favorites via RSS, toutes les données sont stockées localement dans votre navigateur avec localStorage.

## ✨ Fonctionnalités

- ✅ **100% Client-Side** : Aucun backend nécessaire, tout fonctionne dans votre navigateur
- ✅ **TypeScript** : Code type-safe et maintenable
- ✅ **Vite** : Build ultra-rapide et Hot Module Replacement (HMR)
- ✅ **Stockage Local** : Vos données restent privées et sont stockées dans localStorage
- ✅ **Parsing RSS** : Analyse les flux RSS de podcasts directement dans le navigateur
- ✅ **Support CORS** : Utilise un proxy pour récupérer n'importe quel flux RSS
- ✅ **Interface Moderne** : Design épuré et responsive
- ✅ **PWA Ready** : Installez l'application comme une app native avec service worker
- ✅ **Architecture Modulaire** : Code organisé en modules TypeScript

## 🚀 Démarrage Rapide

### Installation

```bash
# Installer les dépendances
npm install
```

### Développement

```bash
# Lancer le serveur de développement avec HMR
npm run dev
```

Visitez [http://localhost:5173](http://localhost:5173) pour utiliser l'application.

### Build de Production

```bash
# Compiler TypeScript et construire pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

### Vérification des Types

```bash
# Vérifier les types TypeScript sans compiler
npm run type-check
```

## 📁 Structure du Projet

```
podcastly/
├── index.html              # Point d'entrée HTML
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite + PWA
├── public/                 # Assets statiques
│   └── icons/              # Icônes PWA
└── src/                    # Code source TypeScript
    ├── main.ts             # Point d'entrée de l'application
    ├── types.ts            # Définitions de types TypeScript
    ├── storage.ts          # Gestion du localStorage
    ├── rss.ts              # Parsing des flux RSS
    ├── ui.ts               # Rendu de l'interface
    └── style.css           # Styles de l'application
```

## 🎯 Utilisation

1. Lancez l'application avec `npm run dev`
2. Collez l'URL d'un flux RSS de podcast dans le champ de saisie
3. Cliquez sur "Subscribe"
4. Parcourez les épisodes et écoutez-les directement
5. Vos abonnements sont sauvegardés automatiquement dans votre navigateur

### Exemples de Flux RSS Populaires

Essayez ces flux pour commencer :

```
https://feeds.fireside.fm/bibleinayear/rss
https://feeds.megaphone.fm/hubermanlab
https://feeds.simplecast.com/54nAGcIl
```

## 💾 Stockage des Données

Toutes les données sont stockées dans `localStorage` de votre navigateur :
- **`podcastly_podcasts`** : Liste des podcasts et leurs épisodes
- **`podcastly_selected_id`** : ID du podcast actuellement sélectionné

### Réinitialisation

Pour **réinitialiser** l'application, ouvrez la console du navigateur et tapez :

```javascript
localStorage.clear();
location.reload();
```

Ou utilisez l'icône de corbeille 🗑️ pour supprimer un podcast spécifique.

## 📱 Installation PWA

L'application peut être installée comme Progressive Web App :

1. Ouvrez l'application dans Chrome, Edge, ou Safari
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. Ou utilisez "Ajouter à l'écran d'accueil" sur mobile
4. L'application fonctionnera alors comme une app native !

Le plugin `vite-plugin-pwa` génère automatiquement le service worker et le manifest lors du build.

## 🛠️ Technologies Utilisées

- **[TypeScript](https://www.typescriptlang.org/)** : Langage typé pour plus de sécurité
- **[Vite](https://vitejs.dev/)** : Build tool moderne et ultra-rapide
- **[vite-plugin-pwa](https://vite-pwa-org.netlify.app/)** : Plugin PWA avec génération automatique du service worker
- **Vanilla CSS** : Pas de framework CSS, juste du bon vieux CSS
- **DOM API** : Pas de framework frontend, manipulation native du DOM

## 🔒 Vie Privée et Sécurité

- **Aucune donnée n'est envoyée à un serveur** : tout reste dans votre navigateur
- **Pas de tracking, pas d'analytics** : votre vie privée est respectée
- **Pas de compte requis** : commencez à utiliser immédiatement
- **Code Open Source** : vous pouvez auditer le code vous-même
- Le proxy CORS (`allorigins.win`) est utilisé uniquement pour récupérer les flux RSS

## 🧪 Architecture Technique

### Modules TypeScript

L'application est organisée en modules distincts :

- **`types.ts`** : Définitions d'interfaces TypeScript pour type safety
- **`storage.ts`** : Abstraction du localStorage avec méthodes typées
- **`rss.ts`** : Parser RSS robuste avec support des namespaces iTunes/Media
- **`ui.ts`** : Logique de rendu de l'interface utilisateur
- **`main.ts`** : Orchestration et gestion de l'état de l'application

### Gestion de l'État

L'état est géré de manière simple avec une classe `PodcastApp` :
- État immutable stocké dans un objet `AppState`
- Synchronisation automatique avec localStorage
- Rendu réactif de l'interface lors des changements

### Parser RSS

Le parser supporte :
- Flux RSS 2.0 standard
- Extensions iTunes (`itunes:*`)
- Extensions Media RSS (`media:*`)
- Gestion robuste des dates et durées
- Extraction d'images depuis plusieurs sources

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- 🐛 Signaler des bugs via les issues GitHub
- 💡 Proposer de nouvelles fonctionnalités
- 📖 Améliorer la documentation
- 🔧 Soumettre des pull requests

### Développement

```bash
# Cloner le repo
git clone https://github.com/your-username/podcastly.git
cd podcastly

# Installer les dépendances
npm install

# Lancer en mode dev
npm run dev

# Vérifier les types
npm run type-check

# Build de production
npm run build
```

## 📄 Licence

GPL v3 - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🎨 Crédits

Développé avec ❤️ en TypeScript - zéro framework frontend, zéro backend !

---

**Note** : Cette application utilise un proxy CORS public (`allorigins.win`) pour récupérer les flux RSS. Pour une utilisation en production, considérez l'utilisation de votre propre proxy CORS ou d'une extension navigateur qui désactive CORS localement.
