# Nazeeh Pullat — portfolio

Static site (Vite + vanilla JS + GSAP + Lenis). Deploys to `https://nazeeh-pullat.github.io`.

## Run

```powershell
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/
npm run preview    # serve dist/ locally
```

## Pages

| File | What |
|---|---|
| `index.html` + `src/js/home.js` | Home: hero fly-through, services, best work rail, **games** (hover icon = gameplay reel), GitHub repos, zoom grid, morph, depth, timeline, spotlight, rows, stats, contact footer |
| `works.html` + `src/js/works.js` | Archive of every project, filter by company / type / search |
| `project.html?id=…` + `src/js/project.js` | One project (gallery, client, next/previous) |

## Content (edit these)

- `src/data/site.js` — email, social links, **`formEndpoint`** (paste a Formspree/Basin URL to enable the contact form; empty = opens the visitor's mail app), `featured` (project ids for Best Work)
- `src/data/games.js` — games, status, links, number of hover frames
- `src/data/works.json` — generated, see below
- `src/data/repos.json` — generated: `npm run repos`

## Regenerating assets (needs your drives)

```powershell
npm run assets   # game icons + hover frames from C:\Users\nazee\Desktop\Unity -> public/games/
npm run works    # scans G:\My Drive\Bin Nahar\Works -> public/works/ + src/data/works.json
npm run repos    # snapshots your public GitHub repos
```

To use a real gameplay clip for a game: put `gameplay.mp4` (short, muted, <3 MB) in `public/games/<id>/` and set `video: 'games/<id>/gameplay.mp4'` in `games.js`.

## Deploy

Push to `main` of a repo named `nazeeh-pullat.github.io`; in repo Settings → Pages choose **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes.
Never commit the `Info.txt` files that hold passwords.

