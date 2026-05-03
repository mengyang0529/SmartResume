# Frontend

## Overview

`frontend/` contains the React + TypeScript UI for the Web Resume Generator.

Built with:
- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Framer Motion
- React Router DOM
- TanStack React Query
- Typst WebAssembly (client-side PDF compilation)

## Pages

### Resume Editor (`/editor/:templateId`)

The main workspace for resume creation and editing.

Supports four templates:
- **Classic** — Minimal black-and-white elegant style
- **Modern** — Original Awesome CV style with colored accents
- **Art** — Dark-themed artistic style with vibrant accents
- **Rirekisho** — Traditional Japanese-style resume (履歴書)

Layout:
- Left: editable form with personal info, modules (rich text sections), and skills/expertise
- Right: live PDF preview panel, auto-compiles on every change with 400ms debounce
- Top toolbar: navigation, add section, import/export Markdown, download PDF

Editor features:
- Rich text editing with H1/H2/H3/bullet/paragraph blocks
- Photo upload for profile picture
- History panel for undo/restore snapshots
- Import from Markdown (`.md`) files
- Export to Markdown for backup
- Local persistence via `localforage` (IndexedDB)

### Home (`/`)

Landing page with create resume and browse templates actions.

### Templates (`/templates`)

Template gallery showing all available resume styles with preview images.

Preview images at `public/template-previews/*.webp` (900×1125) are generated from the actual Typst templates using sample data. To regenerate all previews:

```bash
# Requires: typst CLI (https://github.com/typst/typst) and ImageMagick
cd frontend
node scripts/generate-template-previews.mjs
```

### Profile (`/profile`)

Job application tracking dashboard with statistics, application list, and interview timeline.

## Routing

| Path | Component |
|---|---|
| `/` | HomePage |
| `/templates` | TemplatesPage |
| `/editor/:templateId` | ResumeEditorPage |
| `/profile` | ProfilePage |
| `*` | NotFoundPage (redirect to `/404`) |

## PDF Generation

PDFs are compiled entirely client-side via a Web Worker:

```
Editor → Typst source string → Web Worker → $typst.pdf() → PDF bytes → blob URL → iframe preview
```

The worker preloads fonts (Noto Sans CJK, Font Awesome) and Typst template files at startup. No backend service is required for PDF generation.

## Project Structure

```
src/
├── components/       # UI components
│   ├── Layout/       # Global header and navigation
│   ├── RichTextEditor/  # Rich text block editing
│   └── ...
├── hooks/            # React hooks (useResumeEditor, useTypstCompiler)
├── services/         # Data services (localforage-based API)
├── utils/            # Utility functions
│   ├── typstGenerators/  # Per-template Typst source generators
│   └── ...
├── compiler/         # Web Worker (Typst WebAssembly compilation)
├── types/            # TypeScript type definitions
├── data/             # Sample data and template configs
└── pages/            # Page-level components
```

## Development

```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run type-check` | TypeScript type checking only |
| `npm test` | Run tests with Vitest |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier formatting |

## Environment

- Node.js >= 18
- No backend required for local development — all data is stored in IndexedDB via localforage
- PDF generation is fully client-side via WebAssembly
