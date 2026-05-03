# Code Rules

## File Size

- **No file** in `src/` may exceed **300 lines**.

## TypeScript

- `strict: true` in tsconfig.
- No unused locals or parameters (`noUnusedLocals`, `noUnusedParameters`).
- No switch fallthrough without `// falls through` comment.
- Prefer explicit types over `any`. Using `any` triggers a lint warning.
- Use `_` prefix for intentionally unused parameters/variables.
- Path aliases: `@/` → `src/`, `@components/`, `@services/`, `@utils/`, `@hooks/`, `@types/`, `@test/`.

## ESLint

- No `console.log` — use `console.warn` / `console.error` for debugging.
- React Hooks must follow the Rules of Hooks (`react-hooks/rules-of-hooks: error`).
- `react-hooks/exhaustive-deps` is warn — keep dependencies accurate.
- Components exported from their module file must use `react-refresh/only-export-components`.

## Prettier

| Rule | Value |
|---|---|
| Semicolons | Required |
| Trailing commas | ES5-compatible |
| Quotes | Single |
| Print width | 100 |
| Tab width | 2, spaces |
| Arrow parens | Omit when single param |
| End of line | LF |

## Naming

- **React components**: PascalCase (`ResumeEditorPage`)
- **Hooks**: `useXxx` (`useResumeEditor`)
- **Files**: camelCase with semantic suffix (`markdownImporter.ts`, `resumeTransforms.ts`)
- **Web Workers**: `*.worker.ts`
- **Tests**: `*.test.ts`, colocated with source
- **Types**: aggregated in `src/types/`

## Imports

- Path aliases preferred over relative imports for cross-directory references.
- Group imports: 3rd-party first, then internal modules, with a blank line between.

## Project Structure

```
src/
├── components/     # UI components
├── hooks/          # React hooks
├── services/       # Data services / API
├── utils/          # Pure utility functions
├── types/          # TypeScript type definitions
├── data/           # Sample data, template configs
├── compiler/       # Web Workers
└── pages/          # Page-level components
```

## Technology Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS (inline classes only, no separate CSS files)
- **Build**: Vite
- **Testing**: Vitest + jsdom
- **PDF Generation**: Typst (via WebAssembly in Web Worker)
- **State**: React hooks + TanStack Query
- **Storage**: localforage (IndexedDB wrapper)
- **Formatting / Linting**: Prettier + ESLint
