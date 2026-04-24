# Development Goal: Local-First Pure Frontend Architecture with Typst WASM

**Objective:** Refactor the `web-resume` application into a **Local-First, Pure Frontend Application**. We will eliminate all backend, database, and docker dependencies by running the Typst compiler directly in the browser using WebAssembly (WASM). All user data will be stored locally via IndexedDB. The final product will be deployed as a static site on Vercel, providing zero server costs, absolute user data privacy, and millisecond-level PDF rendering response times.

## Phase 0: Core Prototype Validation (Proof of Concept)
* [x] **Initialize Isolated Sandbox:** Integrated `@myriaddreamin/typst.ts` WASM library into the existing Vite + React project (no separate sandbox needed).
* [x] **Minimal Typst WASM Pipeline:** Installed `@myriaddreamin/typst.ts` v0.7.0-rc2. Created a Web Worker that initializes the Typst compiler, loads templates, and compiles Typst source to PDF blobs in the browser.
* [x] **WASM Asset Loading Check:** Vite configured with `worker: { format: 'es' }` to support ESM-based Web Workers. WASM assets are auto-fetched by the library from CDN (or can be self-hosted via `getModule`). Build passes without MIME type or bundler issues.

## Phase 1: Typesetting Engine Engineering (Web Worker & Memory)
* [x] **Asset Preloading & Static Serving:**
    - Moved `awesome-cv.typ` and `lang.toml` into `frontend/public/templates/awesome-cv/`.
    - Added `<link rel="prefetch">` in `index.html` for template files.
* [x] **Dedicated Web Worker (`compiler.worker.ts`):**
    - Created `frontend/src/compiler/compiler.worker.ts` that isolates Typst initialization and compilation.
    - Implemented template caching via `localforage` — templates are fetched once, cached in IndexedDB, and reused on subsequent Worker starts.
* [x] **Zero-Copy Communication (Transferable Objects):**
    - PDF output bytes transferred from the Web Worker to the main thread via `Transferable` objects (`pdfBytes.buffer`), avoiding structured clone overhead.
* [x] **Compilation Debounce:**
    - `useTypstCompiler` hook wraps compilation with a 400ms configurable debounce to prevent overwhelming the engine during rapid typing.

## Phase 2: Data Layer Rewrite & Local-First Features
* [x] **API Interception:**
    - Rewrote `frontend/src/services/api.ts`: all `axios` calls replaced with `localforage` CRUD operations. Function signatures preserved for backward compatibility.
* [x] **Auth Removal:**
    - Stripped out JWT, login interceptors, and backend auth logic. Transitioned to implicit local mode.
* [x] **"Time Machine" (History Snapshots):**
    - Created `historyService.ts` storing resume snapshots in `localforage` under `resume_history` key (keeps last 20).
    - Added `HistoryPanel` component — a sidebar/modal UI allowing users to browse, restore, and delete snapshots.
* [x] **Data Import/Export:**
    - Created `importExport.ts` service with full local database JSON serialization for download.
    - Editor UI updated with "Export JSON" button; existing "Import JSON" retained.

## Phase 3: Cleanup & Vercel Production Deployment
* [x] **Physical Teardown:**
    - Deleted `backend/` directory.
    - Deleted `typst-service/` directory.
    - Deleted `docker-compose.yml`.
* [x] **Vite Optimization:**
    - Removed backend proxy settings (`server.proxy`) from `vite.config.ts`.
    - Added `worker: { format: 'es' }` config so Web Worker bundles as ESM with proper code-splitting.
* [x] **Vercel Routing Fallback:**
    - Created `vercel.json` with rewrite rule (`/(.*)` -> `/index.html`) for SPA support.
* [ ] **Deployment:**
    - Push to GitHub and deploy on Vercel as a Vite static site.

---

# Previous Development Plans

## Development Plan for Enhanced Resume Editor:

 1. Research & Analysis:
     * [x] Analyze frontend/src/pages/ResumeEditorPage.tsx to understand current data flow and component structure.
     * [x] Review frontend/src/types/resume.ts to understand the current resume data JSON structure and plan for potential adaptations.
     * [x] Research suitable React-compatible rich text editor libraries.
         - Decision: Self-built lightweight block editor using native contentEditable (no external library).
         - Rationale: Requirements are well-defined (headings, bullets, right-content, bold, color). External libs (Slate, TipTap, etc.) add significant bundle size and complexity. Custom implementation gives full control over the dark aesthetic and behavior.

 2. Core Editor Implementation:
     * [x] Library Selection: Self-built custom block editor.
     * [x] New Component Creation:
         - `frontend/src/components/RichTextEditor/RichTextEditor.tsx` — Main container with toolbar.
         - `frontend/src/components/RichTextEditor/EditableBlock.tsx` — Individual contentEditable block.
         - `frontend/src/components/RichTextEditor/RichTextToolbar.tsx` — Toolbar with block type, bold, color controls.
     * [x] Custom Blocks Implemented:
         - Level 1 Heading (section title)
         - Level 2 Heading (main entity: company, school)
         - Level 3 Heading (subtitle: role, degree)
         - Bullet points
         - Right-aligned supplementary content (dates, locations)
     * [x] Text Formatting: Bold toggle + color palette (Default, Red, Sky, Emerald, Orange, White).
     * [x] Block Operations: Add, delete, move up/down, keyboard navigation (Enter, Backspace, Tab, Arrow keys).

 3. Data Integration:
     * [x] JSON to Editor Content:
         - `frontend/src/utils/resumeTransforms.ts` created.
         - `educationToBlocks()` — Converts `Education[]` → `RichTextBlock[]`.
         - `sectionToBlocks()` — Converts `ResumeSection` → `RichTextBlock[]`.
         - **Update**: Improved to prefer existing `blocks` and preserve `bold`/`color` formatting.
     * [x] Editor Content to JSON:
         - `blocksToEducation()` — Parses `RichTextBlock[]` → `Education[]`.
         - `blocksToSection()` — Parses `RichTextBlock[]` → `ResumeSection`.
         - **Update**: Now persists the full `RichTextBlock[]` array back into the data objects to ensure formatting isn't lost on save/refresh.

 4. Integration with ResumeEditorPage.tsx:
     * [x] Education tab replaced with `RichTextEditor`.
     * [x] All dynamic sections (Work Experience, Projects, etc.) replaced with `RichTextEditor`.
     * [x] Personal info and Skills tabs left unchanged per requirements.
     * [x] `editorBlocks` state added to cache block data per tab.
     * [x] JSON import (`handleJsonFileUpload`) resets `editorBlocks` so new data is loaded fresh.
     * [x] `addSection()` now initializes default editor blocks and auto-focuses the new tab.
     * [x] **Update**: `normalizeResumeData` now supports importing `blocks` from JSON.

 5. Styling & UI:
     * [x] Tailwind CSS applied with dark theme matching existing aesthetic.
     * [x] Color indicator dots per block type.
     * [x] Sticky toolbar at top of editor.
     * [x] Hover/active states with red accent colors.
     * [x] **Update**: Updated `typstGenerator.ts` to support rendering `bold` and `color` formatting in the generated PDF.

 6. Testing:
     * [x] Add unit tests for the RichTextResumeEditor component, focusing on data transformation (JSON <-> Editor Content) and formatting preservation.
         - Added `frontend/src/utils/resumeTransforms.test.ts` (PASS).
         - Added `frontend/src/test/setup.ts` to support testing environment.
     * [ ] Add integration tests for ResumeEditorPage.tsx to ensure the editor correctly loads, edits, and saves resume data.
     * [x] Manually test the new editor in the browser for usability and correct rendering.

 7. Documentation Update:
     * [ ] Update frontend/README.md (if applicable) with instructions on using the new editor.
     * [x] Update dev_log.md with progress on this plan.

---

Build Status:
- Frontend type-check: PASS (`tsc --noEmit`)
- Frontend build: PASS (`vite build`)
- Frontend tests: PASS (`vitest run`)
- Architecture: Local-first pure frontend (no backend, no Docker, no database)