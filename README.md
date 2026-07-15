# dante-el-gamer.github.io

Personal website and portfolio of **Dante el Gamer** — programmer, content creator, and artist.

**Live site:** [https://danteelgamer.github.io](https://danteelgamer.github.io)

## Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero, projects, and contact links |
| About | `/about/` | Bio and skills |
| Projects | `/projects/` | Optimized Engine V1 & V2, ClassDeck |
| Games | `/games/` | Game releases and demos |
| Colabs | `/colabs/` | Collaborations |
| Merch | `/merch/` | Merchandise store |

## Tech Stack

- **HTML / CSS / Vanilla JS** — no frameworks
- **PWA** — installable, offline-ready
- **Bilingual (ES/EN)** — i18n system with language toggle
- **Google AdSense** — monetization
- **GitHub Pages** — hosting

## Structure

```
index.html          # Landing page
style.css           # Global styles
script.js           # Main interactions
nav.js              # Shared navigation
settings.js         # Settings panel
i18n.js             # Internationalization
about/              # About page
projects/           # Projects showcase
games/              # Games page
colabs/             # Collaborations
merch/              # Merch store
assets/             # Images, logos, animations
PWA/                # Service worker, manifest, icons
```

## Local Development

This is a static site — no build step required.

```bash
# Clone the repo
git clone https://github.com/dante-el-gamer/dante-el-gamer.github.io.git
cd dante-el-gamer.github.io

# Open in browser
open index.html
```

Or use a local server:

```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## License

© Dante el Gamer. All rights reserved.
