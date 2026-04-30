# Frontend guide

This directory contains the current frontend-only Kanban demo for the Project Management MVP.

## Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- `@dnd-kit` for drag and drop
- Vitest and Testing Library for unit tests
- Playwright for end-to-end tests

## App structure

- `src/app/page.tsx` renders the Kanban board at `/`.
- `src/app/layout.tsx` defines the root layout and fonts.
- `src/app/globals.css` defines Tailwind setup, global styles, and project color variables.
- `src/lib/kanban.ts` defines the board data types, demo board data, ID creation, and card movement logic.
- `src/components/` contains the Kanban UI components.
- `src/test/` contains Vitest setup.
- `tests/` contains Playwright end-to-end tests.

## Kanban data model

`src/lib/kanban.ts` defines:

- `Card`: a card with `id`, `title`, and `details`.
- `Column`: a fixed board column with `id`, `title`, and ordered `cardIds`.
- `BoardData`: the full board state with `columns` and a `cards` lookup.

The current `initialData` object is demo data only. Board state is kept in React state and is lost on refresh.

## Main components

- `KanbanBoard.tsx` owns the in-memory board state, drag and drop handlers, column rename behavior, card creation, and card deletion.
- `KanbanColumn.tsx` renders a droppable column, editable column title, sortable cards, empty state, and new card form.
- `KanbanCard.tsx` renders a draggable card and remove button.
- `NewCardForm.tsx` handles local card creation input.
- `KanbanCardPreview.tsx` renders the drag overlay preview.

## Current behavior

- The board renders five columns.
- Column titles can be renamed.
- Cards can be added and removed.
- Cards can be dragged within and across columns.
- There is no sign in, backend API, persistence, database, or AI chat integration yet.

## Tests

Available scripts:

- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:all`

Current coverage includes board rendering, column rename, card creation and removal, movement logic, and core Playwright flows.

## Notes for future parts

- Preserve the existing `BoardData` shape unless the approved backend/database plan changes it.
- Keep frontend changes simple and aligned with the existing component boundaries.
- When backend persistence is added, replace `KanbanBoard`'s local state initialization with API-backed loading and saving.
- When static export is added, ensure Next.js features remain compatible with serving the built app from FastAPI.
