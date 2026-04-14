# Canva Hierarchy → IntelliLayer Studio

A next-generation Canva-like intelligent design system built with **React + Tailwind + Framer Motion**.

## What this now includes

- **AI Design Hierarchy Engine**
  - Prompt → structured blocks (Title, Subtitle, Body, CTA).
  - `Auto-fix` to normalize spacing and hierarchy.
- **Visual Design Score System (0–100)**
  - Typography, Spacing, Alignment, Contrast, Overall.
  - Debug suggestions for weak areas.
- **Advanced Drag & Drop Editor**
  - Drag elements with grid snapping.
  - Resize selected elements.
  - Layer ordering via `z` field.
- **Theme & Brand Kit Generator**
  - Random startup brand palette + font pair.
  - Applies theme consistency across the canvas.
- **Template Library**
  - Poster, Landing Hero, Resume Header starters.
- **AI Content Generator Surface**
  - Prompt-based layout generation from user text.
- **Design Debugger Mode**
  - Rule-driven linter-like checks + actionable fixes.
- **Export System**
  - Export PNG.
  - Export HTML/CSS layout.

## Architecture

```txt
src/
  components/
    CanvasBoard.jsx      # Interactive canvas, drag/resize handles
    Sidebar.jsx          # AI tools, templates, export controls
    ScorePanel.jsx       # Design score system + debugger output
  data/
    templates.js         # Template library + brand palettes + font pairs
  utils/
    designEngine.js      # Hierarchy generation + scoring + auto-fix logic
  App.jsx                # Product orchestration and state management
  main.jsx               # React entrypoint
  index.css              # Tailwind and design tokens
```

## Core scoring logic

`scoreDesign()` computes:

- `typography`: hierarchy ratio between title and body.
- `spacing`: consistency of vertical rhythm.
- `alignment`: shared grid anchors.
- `contrast`: theme-based readability heuristic.
- `overall`: weighted average.

`generateDesignFeedback()` returns actionable suggestions for each score area.

## Prompt strategy used for structuring

The content-structuring flow uses a deterministic prompt policy:

1. Normalize user prompt to a strong title phrase.
2. Create hierarchy blocks in order: H1 → H2 → Body → CTA.
3. Apply type system defaults and spacing rhythm.
4. Return editable positioned elements.

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Hackathon pitch positioning

This demo now feels like:

**Canva + Figma + AI Design Assistant + Design Teacher**

with real-time evaluation, explainable hierarchy decisions, and auto-improvement workflows.
