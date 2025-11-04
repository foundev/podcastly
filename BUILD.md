# Build Guide - Single HTML File

## Build Commands

```bash
# Standard build
npm run build

# Build with size statistics
npm run build:stats
```

## Build Output

After running `npm run build`, you'll get:

```
dist/
└── index.html    # ⭐ Your complete application in ONE file
```

## Final File Structure

The `dist/index.html` file contains:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Podcastly</title>
  
  <!-- All CSS inline -->
  <style>
    /* ~3-5 KB of compiled CSS */
    .app-header { ... }
    .card { ... }
    /* ... all styles ... */
  </style>
</head>
<body>
  <!-- Application HTML -->
  <header class="app-header">...</header>
  <main class="app-content">...</main>
  <template>...</template>
  
  <!-- All JavaScript inline -->
  <script type="module">
    /* ~40-60 KB of JavaScript compiled from TypeScript */
    // All modules bundled and minified
    // storage.ts, rss.ts, ui.ts, main.ts
  </script>
</body>
</html>
```

## File Size

- **Uncompressed** : ~50-80 KB
- **Gzip compressed** : ~15-25 KB (if served by a web server)

## Using the File

### Option 1: Direct Opening
```bash
# Open directly in default browser
open dist/index.html        # macOS
xdg-open dist/index.html    # Linux
start dist/index.html       # Windows
```

### Option 2: Local Server
```bash
# With Python
python -m http.server 8080 --directory dist

# With Node.js
npx serve dist

# With PHP
php -S localhost:8080 -t dist
```

### Option 3: Deployment

**GitHub Pages** :
```bash
cp dist/index.html docs/index.html
git add docs/index.html
git commit -m "Deploy app"
git push
# Enable Pages in repo settings
```

**Netlify Drop** :
1. Open [netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop `dist/index.html`
3. You're live!

**Any hosting** :
- Simply upload `dist/index.html` via FTP/SFTP
- No server configuration needed
- Works even on very basic hosting

## Build Verification

After building, you can verify everything is inline:

```bash
# Check for external links
grep -E 'href="|src="(?!data:)' dist/index.html

# Should only show <a href> links for navigation
# No <link> or <script src> should exist
```

## Automatic Optimizations

Vite automatically applies:

- ✅ **JavaScript minification** (Terser)
- ✅ **CSS minification**
- ✅ **Tree-shaking** to remove unused code
- ✅ **Bundling** of all modules into one
- ✅ **Inlining** of all code in HTML

## Limitations

### What works:
- ✅ Opening the file locally (file://)
- ✅ Hosting on any web server
- ✅ localStorage to save data
- ✅ Fetching RSS feeds via CORS proxy

### What doesn't work:
- ❌ SVG icons from `public/` folder are not included (too large)
- ❌ PWA Service Worker (disabled for single-file)
- ❌ External images not inlined (but RSS feeds can reference them)

## Troubleshooting

### File is too large?

Modify `vite.config.ts`:
```typescript
build: {
  cssCodeSplit: false,
  assetsInlineLimit: 10000, // Reduce to 10KB instead of 100MB
}
```

### Need multiple files?

Remove the `vite-plugin-singlefile` plugin from `vite.config.ts` to return to a standard build with multiple files.

### CORS issues?

The CORS proxy (`allorigins.win`) is public and can be slow. Consider:
- Using your own CORS proxy
- Hosting the app on an HTTPS domain
- Using a browser extension to disable CORS in development

## Performance

The single file is optimized for:
- ⚡ **Fast loading** : Only one HTTP round-trip
- 💾 **Browser cache** : Entire file is cached
- 📦 **Compression** : Gzip/Brotli reduce size by ~70%
- 🚀 **Parsing** : No waiting for external resources

Typical loading time: **< 100ms** on average connection.
