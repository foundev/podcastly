# Guide de Build - Fichier HTML Unique

## Commandes de Build

```bash
# Build standard
npm run build

# Build avec statistiques de taille
npm run build:stats
```

## Résultat du Build

Après l'exécution de `npm run build`, vous obtiendrez :

```
dist/
└── index.html    # ⭐ Votre application complète en UN SEUL fichier
```

## Structure du Fichier Final

Le fichier `dist/index.html` contient :

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Podcastly</title>
  
  <!-- Tout le CSS inline -->
  <style>
    /* ~3-5 KB de CSS compilé */
    .app-header { ... }
    .card { ... }
    /* ... tous les styles ... */
  </style>
</head>
<body>
  <!-- HTML de l'application -->
  <header class="app-header">...</header>
  <main class="app-content">...</main>
  <template>...</template>
  
  <!-- Tout le JavaScript inline -->
  <script type="module">
    /* ~40-60 KB de JavaScript compilé depuis TypeScript */
    // Tous les modules bundlés et minifiés
    // storage.ts, rss.ts, ui.ts, main.ts
  </script>
</body>
</html>
```

## Taille du Fichier

- **Non compressé** : ~50-80 KB
- **Gzip compressé** : ~15-25 KB (si servi par un serveur web)

## Utilisation du Fichier

### Option 1 : Ouverture Directe
```bash
# Ouvrir directement dans le navigateur par défaut
open dist/index.html        # macOS
xdg-open dist/index.html    # Linux
start dist/index.html       # Windows
```

### Option 2 : Serveur Local
```bash
# Avec Python
python -m http.server 8080 --directory dist

# Avec Node.js
npx serve dist

# Avec PHP
php -S localhost:8080 -t dist
```

### Option 3 : Déploiement

**GitHub Pages** :
```bash
cp dist/index.html docs/index.html
git add docs/index.html
git commit -m "Deploy app"
git push
# Activez Pages dans les settings du repo
```

**Netlify Drop** :
1. Ouvrez [netlify.com/drop](https://app.netlify.com/drop)
2. Glissez-déposez `dist/index.html`
3. C'est en ligne !

**N'importe quel hébergement** :
- Uploadez simplement `dist/index.html` via FTP/SFTP
- Aucune configuration serveur nécessaire
- Fonctionne même sur des hébergements très basiques

## Vérification du Build

Après le build, vous pouvez vérifier que tout est inline :

```bash
# Vérifier qu'il n'y a pas de liens externes
grep -E 'href="|src="(?!data:)' dist/index.html

# Devrait seulement montrer des liens de type <a href> pour la navigation
# Aucun <link> ou <script src> ne devrait exister
```

## Optimisations Automatiques

Vite applique automatiquement :

- ✅ **Minification** du JavaScript (Terser)
- ✅ **Minification** du CSS
- ✅ **Tree-shaking** pour supprimer le code non utilisé
- ✅ **Bundling** de tous les modules en un seul
- ✅ **Inlining** de tout le code dans le HTML

## Limitations

### Ce qui fonctionne :
- ✅ Ouverture du fichier en local (file://)
- ✅ Hébergement sur n'importe quel serveur web
- ✅ localStorage pour sauvegarder les données
- ✅ Récupération de flux RSS via proxy CORS

### Ce qui ne fonctionne pas :
- ❌ Les icônes SVG du dossier `public/` ne sont pas incluses (trop volumineuses)
- ❌ Service Worker PWA (désactivé pour le single-file)
- ❌ Images externes non inline (mais les flux RSS peuvent les référencer)

## Dépannage

### Le fichier est trop volumineux ?

Modifiez `vite.config.ts` :
```typescript
build: {
  cssCodeSplit: false,
  assetsInlineLimit: 10000, // Réduire à 10KB au lieu de 100MB
}
```

### Besoin de plusieurs fichiers ?

Retirez le plugin `vite-plugin-singlefile` de `vite.config.ts` pour revenir à un build standard avec plusieurs fichiers.

### Problèmes CORS ?

Le proxy CORS (`allorigins.win`) est public et peut être lent. Considérez :
- Utiliser votre propre proxy CORS
- Héberger l'app sur un domaine HTTPS
- Utiliser une extension navigateur pour désactiver CORS en développement

## Performance

Le fichier unique est optimisé pour :
- ⚡ **Chargement rapide** : Un seul round-trip HTTP
- 💾 **Cache navigateur** : Le fichier entier est mis en cache
- 📦 **Compression** : Gzip/Brotli réduisent la taille de ~70%
- 🚀 **Parsing** : Pas d'attente de ressources externes

Temps de chargement typique : **< 100ms** sur une connexion moyenne.
