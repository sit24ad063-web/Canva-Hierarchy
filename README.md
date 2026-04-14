# IntelliLayer (Canva Hierarchy)

A polished, interactive **single-file frontend demo** for intelligent canvas selection and hierarchy inspection.

## What changed

- Replaced the previous React/Vite setup with a **zero-build static implementation** in `index.html`.
- Added a professional dark UI with:
  - tool sidebar,
  - interactive canvas,
  - scene graph panel,
  - detection result panel,
  - animated pipeline phases (Geo → Traverse → Score),
  - drag + resize element editing.
- Included visual effects for selected/candidate/debug states to make interactions presentation-ready.

## Features

- Add elements with tool buttons (Text, Card, Button, Shape).
- Drag elements on canvas.
- Resize selected elements with handle.
- Click canvas to run hit detection and ranked candidate scoring.
- Scene graph + element inspector updates in real time.
- Debug toggle and reset controls.

## Run locally

No build step is required.

```bash
python3 -m http.server 4173
```

Then open:

`http://localhost:4173`

## Deploy

This is static HTML, so deploy directly to:

- Vercel (Framework: Other, no build command)
- Netlify (Publish directory: `.`)
- GitHub Pages (root folder)
