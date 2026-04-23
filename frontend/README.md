# Frontend README

## Overview

`frontend/` contains the React + TypeScript UI for the Web Resume Generator.

This app is designed as a dark, high-contrast dashboard with industrial/terminal styling and a focus on professional resume creation. The UI is built with:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router DOM
- React Hot Toast
- React Query

## UI Style

The frontend uses a cinematic, system-console theme:

- Dark background palette (`#050505`, `#0A0A0A`, `#111111`)
- Red accent color for buttons, highlights, and borders
- Monospaced/uppercase typography for labels and system text
- Glassy grid and border panels with subtle hover states
- Fixed top header and left sidebar for fast navigation
- Motion transitions for page entry, cards, and button interactions

## Pages

### Home Page (`/`)

The Home page is the first screen after route load.

Buttons:
- `Create Resume`
  - Navigates to `/editor`
  - Opens the editor page where the local JSON file import flow can be triggered
- `Browse Templates`
  - Navigates to `/gallery`

Content:
- Large headline and tagline
- System-style status badge
- Metrics section showing platform values like latency, output, system, and security

### Gallery Page (`/gallery`)

The Gallery page shows a card grid of template options.

Buttons:
- `Configure`
  - Navigates to `/editor/:templateId`
  - Intended to load a template-specific editor configuration
- `Preview`
  - Placeholder for preview behavior (renders a card-level preview button)

Controls:
- Filter pills for `All`, `Blueprint`, `Module`, and `System`
- Template cards with category, description, and action buttons

### Resume Editor Page (`/editor` and `/editor/:templateId`)

This is the main workspace for resume creation and editing.

Layout:
- Fixed left sidebar with section navigation
- Main form area on the right
- Floating save button appears when unsaved changes exist
- Hidden file input used for JSON import

Sidebar buttons and controls:
- `Identity`
  - Edit personal information fields such as first name, last name, position, email, mobile, address, and GitHub URL
- `Education`
  - Add and edit academic records
  - Each education entry supports institution, degree, honors, start date, end date, and description
- `Modules`
  - Dynamically generated resume sections from imported JSON
  - Each section can be renamed and contain multiple entries
- `Capabilities`
  - Manage skills and tool categories
- `+` (Add Section)
  - Adds a new dynamic section to the resume
- `Create Resume`
  - Opens the local file picker for importing a JSON resume file
- `Download PDF`
  - Sends the current resume data to the backend Typst pipeline and opens the generated PDF in a new tab

Editor page interactions:
- `openResumeJsonFile()` is triggered by the sidebar button or the top header button
- JSON import validates the file and normalizes IDs
- Editor fields update local state immediately
- `Save Changes` button stores the current resume state to `localStorage`

Important components on this page:
- `ResumeEditorPage.tsx` — main editor logic and state management
- `Layout.tsx` — global header and navigation

### Profile Page (`/profile`)

The Profile page is a **job application tracking dashboard**. It provides an overview of job applications, interview timelines, and application statistics.

**Statistics panel:**
- Total applications count
- Active applications count
- Interview count
- Offer/rejection rate summary

**Application list:**
- Displays all job applications with company, job title, status, and applied date
- Status badges: `applied`, `interview`, `offer`, `rejected`, etc.
- Supports filtering and quick actions

**Application timeline:**
- Visual timeline showing the progression of each application
- Interview rounds and outcomes

**Data flow:**
- Fetches applications from `GET /api/v1/applications`
- Creates new applications via `POST /api/v1/applications`
- Manages interview records via `/api/v1/applications/:id/interviews`

## Components

### `Layout`

Contains the global app frame:
- Top header
- Navigation links
- `Create Resume` global button
- Footer
- `Outlet` for route content

### `NavTab` and `ModuleWrapper`

Used inside the editor page for sidebar tabs and content sections.
They handle layout, active state, and form structure.

### `FoundryInput`

Custom input field component used across the editor and profile pages.
It supports plain and clean mode styling for the modular UI.

## Routing

Routes are defined in `App.tsx`:

- `/` → `HomePage`
- `/editor` → `ResumeEditorPage`
- `/editor/:templateId` → `ResumeEditorPage`
- `/gallery` → `GalleryPage`
- `/profile` → `ProfilePage`
- `/404` → `NotFoundPage`
- `*` → redirect to `/404`

## Data Flow and Integration

### Resume import

- Local JSON file selection is handled by a hidden `<input type="file" />`
- The imported JSON is parsed in `handleJsonFileUpload`
- Parsed data is validated and normalized
- The editor populates state from the imported resume structure

### PDF generation

- `handleDownloadPdf()` builds Typst source from `resumeData`
- It calls `pdfApi.generateFromTypst()` from `frontend/src/services/api.ts`
- On success, it opens the generated PDF download URL

## Development Notes

- The app uses a `Toaster` from `react-hot-toast` for success and error feedback
- `React Query` is configured with application-wide defaults in `App.tsx`
- The editor page currently uses `localStorage` for temporary save state
- The top navigation button on the global header triggers the same local JSON import flow as the editor sidebar button

## Run locally

From `frontend/`:

```bash
npm install
npm run dev
```

Then open the Vite dev server URL shown in the terminal.

## File structure highlights

- `src/main.tsx` — app bootstrap and router container
- `src/App.tsx` — route definitions and query provider
- `src/components/Layout/Layout.tsx` — persistent header/footer/navigation
- `src/pages/ResumeEditorPage.tsx` — editor page logic and resume form
- `src/pages/HomePage.tsx` — landing page
- `src/pages/GalleryPage.tsx` — template gallery
- `src/pages/ProfilePage.tsx` — profile/dashboard page
- `src/services/api.ts` — backend API client
- `src/utils/typstGenerator.ts` — Typst source generator for PDF compilation

## Notes

This README is focused on frontend-specific behavior and user-facing controls. Backend and Typst generation are handled separately in the `backend/` and `typst-service/` folders.