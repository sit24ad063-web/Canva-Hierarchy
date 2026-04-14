# SceneGraph OS Demo

A static frontend demo for hierarchical spatial intelligence:

- QuadTree spatial indexing
- Depth + z-index aware selection resolution
- Candidate ranking and explainable hierarchy paths
- Layer tree reverse selection
- Add mode for dynamic element insertion

## Run locally

Because this is a static site (`index.html`, `styles.css`, `app.js`), any static file server works.

### Option 1: Python

```bash
python3 -m http.server 4173
```

Then open: `http://localhost:4173`

### Option 2: Node (serve)

```bash
npx serve . -l 4173
```

Then open: `http://localhost:4173`

## Deploy

## 1) Vercel (quickest)

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Framework preset: **Other**.
4. Build command: leave empty.
5. Output directory: `.`
6. Deploy.

No environment variables are required.

## 2) Netlify

1. Push this repo to GitHub.
2. In Netlify, click **Add new site** → **Import from Git**.
3. Build command: leave empty.
4. Publish directory: `.`
5. Deploy site.

## 3) GitHub Pages

1. Push this repo to GitHub.
2. In repository settings, open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch (for example `main`) and folder `/ (root)`.
5. Save.

Your site will be available at:

`https://<your-org-or-user>.github.io/<repo-name>/`

## Production checklist

- Verify canvas interaction in a Chromium-based browser and Safari/Firefox.
- Confirm click-selection pipeline updates logs and candidate ranking.
- Confirm Add mode inserts nodes and mini-map updates.
- Keep this deployment as a static site (no backend required).
