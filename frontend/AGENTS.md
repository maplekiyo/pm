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
- `src/lib/api.ts` reads and saves the board through the backend API and sends AI chat messages.
- `src/components/` contains the Kanban UI components.
- `src/test/` contains Vitest setup.
- `tests/` contains Playwright end-to-end tests.

## Kanban data model

`src/lib/kanban.ts` defines:

- `Card`: a card with `id`, `title`, and `details`.
- `Column`: a fixed board column with `id`, `title`, and ordered `cardIds`.
- `BoardData`: the full board state with `columns` and a `cards` lookup.

The current `initialData` object is used as fallback/demo data. Signed-in board state is loaded from `/api/board` and saved back to the backend.

## Main components

- `KanbanBoard.tsx` owns the loaded board state, API persistence, drag and drop handlers, column rename behavior, card creation, card editing, and card deletion.
- `KanbanColumn.tsx` renders a droppable column, editable column title, sortable cards, empty state, and new card form.
- `KanbanCard.tsx` renders a draggable card and remove button.
- `ChatSidebar.tsx` renders AI chat history, submits messages, and applies AI board updates.
- `NewCardForm.tsx` handles local card creation input.
- `KanbanCardPreview.tsx` renders the drag overlay preview.

## Current behavior

- The board renders five columns.
- Column titles can be renamed.
- Cards can be added, edited, and removed.
- Cards can be dragged within and across columns.
- There is a local sign in gate and board changes persist through the backend API.
- The AI chat sidebar can apply validated backend board updates.

## Tests

Available scripts:

- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:all`

Current coverage includes board rendering, column rename, card creation and removal, movement logic, and core Playwright flows.

## Notes for future parts

- Preserve the existing `BoardData` shape unless the approved backend/database plan changes it.
- Keep frontend changes simple and aligned with the existing component boundaries.
- Keep `KanbanBoard` API-backed loading and saving aligned with the backend `BoardData` schema.
- When static export is added, ensure Next.js features remain compatible with serving the built app from FastAPI.
