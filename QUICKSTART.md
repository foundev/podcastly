# 🚀 Quick Start Guide - Podcastly

## In 3 simple steps

### 1️⃣ Install dependencies

```bash
npm install
```

### 2️⃣ Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

### 3️⃣ Production Build

```bash
npm run build:stats
```

Result: **One single HTML file** in `dist/index.html`! 📦

---

## 🎯 Quick Usage

### Try an RSS feed

Paste this in the "RSS Feed URL" field:

```
https://feeds.fireside.fm/bibleinayear/rss
```

Click "Subscribe" and explore episodes!

---

## 📤 Share your build

### Option 1: Local File
```bash
# Open the built file in browser
open dist/index.html
```

### Option 2: Instant Deployment

**Netlify (easiest)** :
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop `dist/index.html`
3. ✅ Your app is live!

**GitHub Pages** :
```bash
# Copy to docs/ folder
mkdir -p docs
cp dist/index.html docs/
git add docs/
git commit -m "Deploy Podcastly"
git push
```
Then enable GitHub Pages in repo settings (source: `/docs`)

---

## 💡 Tips

### Reset data
Open browser console (F12) and type:
```javascript
localStorage.clear()
location.reload()
```

### Change CORS proxy
Create `.env.local` with:
```env
VITE_CORS_PROXY=https://your-proxy.com/api?url=
```

### Check TypeScript types
```bash
npm run type-check
```

---

## 📚 Complete Documentation

- **[README.md](README.md)** - Main documentation
- **[BUILD.md](BUILD.md)** - Detailed build and deployment guide

---

## ⚡ Essential Commands

| Command | Description |
|----------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build (single file) |
| `npm run build:stats` | Build + show file size |
| `npm run preview` | Preview build locally |
| `npm run type-check` | Check TypeScript types |

---

## 🎨 Popular RSS Feed Examples

```
# Tech
https://feeds.megaphone.fm/hubermanlab
https://feeds.simplecast.com/54nAGcIl

# News
https://feeds.npr.org/500005/podcast.xml

# Culture
https://feeds.fireside.fm/bibleinayear/rss
```

---

**Happy podcasting! 🎧**
