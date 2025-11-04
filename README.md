# Podcastly 🎧

> 📦 **Single-File Application** - Compiles to a single standalone HTML file!

A modern podcast application, 100% client-side, built with **TypeScript** and **Vite**. Subscribe to your favorite shows via RSS, all data is stored locally in your browser with localStorage.

🚀 **[Quick Start Guide →](QUICKSTART.md)**

## ✨ Features

- ✅ **Single-File Build** : Compiles to one HTML file (~50-80 KB) with everything inline
- ✅ **100% Client-Side** : No backend needed, everything runs in your browser
- ✅ **TypeScript** : Type-safe and maintainable code
- ✅ **Vite** : Ultra-fast build and Hot Module Replacement (HMR)
- ✅ **Local Storage** : Your data stays private and is stored in localStorage
- ✅ **RSS Parsing** : Parse podcast RSS feeds directly in the browser
- ✅ **CORS Support** : Uses a proxy to fetch any RSS feed
- ✅ **Modern Interface** : Clean and responsive design
- ✅ **Maximum Portability** : One file to deploy, share, or archive
- ✅ **Modular Architecture** : Code organized in TypeScript modules

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with HMR
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to use the application.

### Production Build

```bash
# Compile TypeScript and build for production
# Generates a SINGLE standalone HTML file in dist/index.html
npm run build

# Preview the production build
npm run preview
```

The build generates a **single standalone HTML file** (`dist/index.html`) with all CSS and JavaScript inline. You can simply open this file in a browser or deploy it anywhere!

📖 **See [BUILD.md](BUILD.md) for a detailed guide on building and deployment.**

### Type Checking

```bash
# Check TypeScript types without compiling
npm run type-check
```

### Useful Commands

```bash
# Build with file size statistics
npm run build:stats
```

## 📁 Project Structure

```
podcastly/
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite + Single File configuration
├── public/                 # Static assets
│   └── icons/              # PWA icons
├── src/                    # TypeScript source code
│   ├── main.ts             # Application entry point
│   ├── types.ts            # TypeScript type definitions
│   ├── storage.ts          # localStorage management
│   ├── rss.ts              # RSS feed parsing
│   ├── ui.ts               # UI rendering logic
│   └── style.css           # Application styles
└── dist/                   # Production build
    └── index.html          # ⭐ SINGLE STANDALONE FILE
```

## 🎯 Usage

1. Launch the application with `npm run dev`
2. Paste a podcast RSS feed URL into the input field
3. Click "Subscribe"
4. Browse episodes and listen directly
5. Your subscriptions are automatically saved in your browser

### Popular RSS Feed Examples

Try these feeds to get started:

```
https://feeds.fireside.fm/bibleinayear/rss
https://feeds.megaphone.fm/hubermanlab
https://feeds.simplecast.com/54nAGcIl
```

## 💾 Data Storage

All data is stored in your browser's `localStorage`:
- **`podcastly_podcasts`** : List of podcasts and their episodes
- **`podcastly_selected_id`** : ID of currently selected podcast

### Reset

To **reset** the application, open the browser console and type:

```javascript
localStorage.clear();
location.reload();
```

Or use the trash icon 🗑️ to delete a specific podcast.

## 📦 Deployment

After running `npm run build`, you get a **single standalone HTML file** in `dist/index.html`. 

### Deployment options:

1. **Local file** : Simply open `dist/index.html` in your browser
2. **GitHub Pages** : Drop the file in your repo and enable Pages
3. **Netlify Drop** : Drag and drop the file to [netlify.com/drop](https://app.netlify.com/drop)
4. **Any hosting** : Upload the file - no server configuration needed!

The file contains:
- ✅ All HTML
- ✅ All CSS (inline in `<style>`)
- ✅ All compiled JavaScript (inline in `<script>`)
- ✅ No external dependencies

### File size

The final file is approximately **~50-80 KB** (uncompressed), which is extremely lightweight for a complete application!

## 🛠️ Technologies Used

- **[TypeScript](https://www.typescriptlang.org/)** : Typed language for better safety
- **[Vite](https://vitejs.dev/)** : Modern and ultra-fast build tool
- **[vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile)** : Generates a single HTML file with everything inline
- **Vanilla CSS** : No CSS framework, just good old CSS
- **DOM API** : No frontend framework, native DOM manipulation

## 🔒 Privacy and Security

- **No data is sent to a server** : everything stays in your browser
- **No tracking, no analytics** : your privacy is respected
- **No account required** : start using immediately
- **Open Source code** : you can audit the code yourself
- The CORS proxy (`allorigins.win`) is only used to fetch RSS feeds

## 🧪 Technical Architecture

### Single-File Build

The project uses `vite-plugin-singlefile` to compile everything into **one HTML file**:

**During development** (`npm run dev`):
- Vite serves files separately with HMR
- Instant hot reload for fast development

**In production** (`npm run build`):
- TypeScript is compiled to JavaScript
- All modules are bundled together
- CSS is extracted and inlined in a `<style>` tag
- JavaScript is inlined in a `<script>` tag
- Result: **1 single standalone HTML file** ✨

### TypeScript Modules

The application is organized into separate modules:

- **`types.ts`** : TypeScript interface definitions for type safety
- **`storage.ts`** : localStorage abstraction with typed methods
- **`rss.ts`** : Robust RSS parser with iTunes/Media namespace support
- **`ui.ts`** : UI rendering logic
- **`main.ts`** : Application orchestration and state management

### State Management

State is managed simply with a `PodcastApp` class:
- Immutable state stored in an `AppState` object
- Automatic synchronization with localStorage
- Reactive UI rendering on changes

### RSS Parser

The parser supports:
- Standard RSS 2.0 feeds
- iTunes extensions (`itunes:*`)
- Media RSS extensions (`media:*`)
- Robust date and duration handling
- Image extraction from multiple sources

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs via GitHub issues
- 💡 Propose new features
- 📖 Improve documentation
- 🔧 Submit pull requests

### Development

```bash
# Clone the repo
git clone https://github.com/your-username/podcastly.git
cd podcastly

# Install dependencies
npm install

# Launch in dev mode
npm run dev

# Check types
npm run type-check

# Production build
npm run build
```

## 📄 License

GPL v3 - See the [LICENSE](LICENSE) file for details.

## 🎨 Credits

Built with ❤️ in TypeScript - zero frontend framework, zero backend!

---

## ❓ FAQ

### Why a single HTML file?

- **Maximum portability** : One file to share, send by email, or put on a USB drive
- **Ultra-simple deployment** : No server configuration, no relative path issues
- **Easy archiving** : Save the complete application in one file
- **Offline by default** : Open the file anywhere, even without internet (except for fetching RSS feeds)

### How does it work with external RSS feeds?

The application uses a public CORS proxy (`allorigins.win`) to bypass browser CORS restrictions. The RSS feed is fetched via the proxy, then parsed locally in your browser.

### Where is my data stored?

All your data (podcasts, episodes) is stored in your browser's `localStorage`. It **never** leaves your machine. If you clear the browser cache, the data will be lost.

---

**Note** : This application uses a public CORS proxy (`allorigins.win`) to fetch RSS feeds. For production use, consider using your own CORS proxy.
