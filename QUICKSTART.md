# 🚀 Guide de Démarrage Rapide - Podcastly

## En 3 étapes simples

### 1️⃣ Installer les dépendances

```bash
npm install
```

### 2️⃣ Développement

```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) 🎉

### 3️⃣ Build de Production

```bash
npm run build:stats
```

Résultat : **Un seul fichier HTML** dans `dist/index.html` ! 📦

---

## 🎯 Utilisation Rapide

### Essayer un flux RSS

Collez ceci dans le champ "RSS Feed URL" :

```
https://feeds.fireside.fm/bibleinayear/rss
```

Cliquez sur "Subscribe" et explorez les épisodes !

---

## 📤 Partager votre build

### Option 1 : Fichier Local
```bash
# Ouvrir le fichier build dans le navigateur
open dist/index.html
```

### Option 2 : Déploiement Instantané

**Netlify (le plus simple)** :
1. Allez sur [netlify.com/drop](https://app.netlify.com/drop)
2. Glissez-déposez `dist/index.html`
3. ✅ Votre app est en ligne !

**GitHub Pages** :
```bash
# Copier dans un dossier docs/
mkdir -p docs
cp dist/index.html docs/
git add docs/
git commit -m "Deploy Podcastly"
git push
```
Puis activez GitHub Pages dans les paramètres du repo (source : `/docs`)

---

## 💡 Tips

### Réinitialiser les données
Ouvrir la console navigateur (F12) et taper :
```javascript
localStorage.clear()
location.reload()
```

### Changer le proxy CORS
Créer `.env.local` avec :
```env
VITE_CORS_PROXY=https://votre-proxy.com/api?url=
```

### Voir les types TypeScript
```bash
npm run type-check
```

---

## 📚 Documentation Complète

- **[README.md](README.md)** - Documentation principale
- **[BUILD.md](BUILD.md)** - Guide détaillé du build et déploiement

---

## ⚡ Commandes Essentielles

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm run dev` | Serveur de développement avec HMR |
| `npm run build` | Build de production (fichier unique) |
| `npm run build:stats` | Build + affiche la taille du fichier |
| `npm run preview` | Prévisualiser le build localement |
| `npm run type-check` | Vérifier les types TypeScript |

---

## 🎨 Exemples de Flux RSS Populaires

```
# Tech
https://feeds.megaphone.fm/hubermanlab
https://feeds.simplecast.com/54nAGcIl

# Actualités
https://feeds.npr.org/500005/podcast.xml

# Culture
https://feeds.fireside.fm/bibleinayear/rss
```

---

**Bon podcast ! 🎧**
