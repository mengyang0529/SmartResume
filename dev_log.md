Development Plan for Enhanced Resume Editor:

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
