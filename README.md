# Podcastly 🎧

> 📦 **Single-File Application** - Compile en un seul fichier HTML autonome !

Application de podcast moderne, 100% client-side, développée avec **TypeScript** et **Vite**. Abonnez-vous à vos émissions favorites via RSS, toutes les données sont stockées localement dans votre navigateur avec localStorage.

🚀 **[Guide de Démarrage Rapide →](QUICKSTART.md)**

## ✨ Fonctionnalités

- ✅ **Single-File Build** : Compile en un seul fichier HTML (~50-80 KB) avec tout inline
- ✅ **100% Client-Side** : Aucun backend nécessaire, tout fonctionne dans votre navigateur
- ✅ **TypeScript** : Code type-safe et maintenable
- ✅ **Vite** : Build ultra-rapide et Hot Module Replacement (HMR)
- ✅ **Stockage Local** : Vos données restent privées et sont stockées dans localStorage
- ✅ **Parsing RSS** : Analyse les flux RSS de podcasts directement dans le navigateur
- ✅ **Support CORS** : Utilise un proxy pour récupérer n'importe quel flux RSS
- ✅ **Interface Moderne** : Design épuré et responsive
- ✅ **Portabilité Maximale** : Un seul fichier à déployer, partager, ou archiver
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
# Génère un SEUL fichier HTML autonome dans dist/index.html
npm run build

# Prévisualiser le build de production
npm run preview
```

Le build génère un **fichier HTML unique et autonome** (`dist/index.html`) avec tout le CSS et JavaScript inline. Vous pouvez simplement ouvrir ce fichier dans un navigateur ou le déployer n'importe où !

📖 **Voir [BUILD.md](BUILD.md) pour un guide détaillé du processus de build et déploiement.**

### Vérification des Types

```bash
# Vérifier les types TypeScript sans compiler
npm run type-check
```

### Commandes Utiles

```bash
# Build avec statistiques de taille du fichier
npm run build:stats
```

## 📁 Structure du Projet

```
podcastly/
├── index.html              # Point d'entrée HTML
├── package.json            # Dépendances et scripts
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration Vite + Single File
├── public/                 # Assets statiques
│   └── icons/              # Icônes PWA
├── src/                    # Code source TypeScript
│   ├── main.ts             # Point d'entrée de l'application
│   ├── types.ts            # Définitions de types TypeScript
│   ├── storage.ts          # Gestion du localStorage
│   ├── rss.ts              # Parsing des flux RSS
│   ├── ui.ts               # Rendu de l'interface
│   └── style.css           # Styles de l'application
└── dist/                   # Build de production
    └── index.html          # ⭐ FICHIER UNIQUE AUTONOME
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

## 📦 Déploiement

Après avoir exécuté `npm run build`, vous obtenez un **seul fichier HTML autonome** dans `dist/index.html`. 

### Options de déploiement :

1. **Fichier local** : Ouvrez simplement `dist/index.html` dans votre navigateur
2. **GitHub Pages** : Déposez le fichier dans votre repo et activez Pages
3. **Netlify Drop** : Glissez-déposez le fichier sur [netlify.com/drop](https://app.netlify.com/drop)
4. **N'importe quel hébergement** : Uploadez le fichier - pas de configuration serveur nécessaire !

Le fichier contient :
- ✅ Tout le HTML
- ✅ Tout le CSS (inline dans `<style>`)
- ✅ Tout le JavaScript compilé (inline dans `<script>`)
- ✅ Aucune dépendance externe

### Taille du fichier

Le fichier final fait environ **~50-80 KB** (non compressé), ce qui est extrêmement léger pour une application complète !

## 🛠️ Technologies Utilisées

- **[TypeScript](https://www.typescriptlang.org/)** : Langage typé pour plus de sécurité
- **[Vite](https://vitejs.dev/)** : Build tool moderne et ultra-rapide
- **[vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile)** : Génère un seul fichier HTML avec tout inline
- **Vanilla CSS** : Pas de framework CSS, juste du bon vieux CSS
- **DOM API** : Pas de framework frontend, manipulation native du DOM

## 🔒 Vie Privée et Sécurité

- **Aucune donnée n'est envoyée à un serveur** : tout reste dans votre navigateur
- **Pas de tracking, pas d'analytics** : votre vie privée est respectée
- **Pas de compte requis** : commencez à utiliser immédiatement
- **Code Open Source** : vous pouvez auditer le code vous-même
- Le proxy CORS (`allorigins.win`) est utilisé uniquement pour récupérer les flux RSS

## 🧪 Architecture Technique

### Build Single-File

Le projet utilise `vite-plugin-singlefile` pour compiler tout en **un seul fichier HTML** :

**Pendant le développement** (`npm run dev`) :
- Vite sert les fichiers séparément avec HMR
- Hot reload instantané pour un développement rapide

**En production** (`npm run build`) :
- TypeScript est compilé en JavaScript
- Tous les modules sont bundlés ensemble
- Le CSS est extrait et inline dans une balise `<style>`
- Le JavaScript est inline dans une balise `<script>`
- Le résultat : **1 seul fichier HTML autonome** ✨

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

## ❓ FAQ

### Pourquoi un seul fichier HTML ?

- **Portabilité maximale** : Un seul fichier à partager, envoyer par email, ou mettre sur une clé USB
- **Déploiement ultra-simple** : Pas de configuration serveur, pas de problème de chemins relatifs
- **Archivage facile** : Sauvegardez l'application complète en un seul fichier
- **Hors ligne par défaut** : Ouvrez le fichier n'importe où, même sans internet (sauf pour récupérer les flux RSS)

### Comment ça marche avec les flux RSS externes ?

L'application utilise un proxy CORS public (`allorigins.win`) pour contourner les restrictions CORS des navigateurs. Le flux RSS est récupéré via le proxy, puis parsé localement dans votre navigateur.

### Où sont stockées mes données ?

Toutes vos données (podcasts, épisodes) sont stockées dans le `localStorage` de votre navigateur. Elles ne quittent **jamais** votre machine. Si vous videz le cache du navigateur, les données seront perdues.

---

**Note** : Cette application utilise un proxy CORS public (`allorigins.win`) pour récupérer les flux RSS. Pour une utilisation en production, considérez l'utilisation de votre propre proxy CORS.
