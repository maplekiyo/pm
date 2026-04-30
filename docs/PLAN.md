# Project execution plan

This document is the working checklist for building the Project Management MVP. Each part should be completed, tested, and reviewed before moving to the next part.

## Part 1: Plan

Goal: turn the high-level roadmap into actionable project documentation.

Checklist:
- [x] Expand `docs/PLAN.md` with detailed steps for Parts 1 through 10.
- [x] Add tests and success criteria for every part.
- [x] Add explicit user approval points where sign-off is required.
- [x] Create `frontend/AGENTS.md` describing the existing frontend demo.
- [x] Confirm the user has reviewed and approved this plan before starting Part 2.

Tests:
- [x] Manual review only. No automated tests are required for documentation-only changes.

Success criteria:
- [x] `docs/PLAN.md` covers every project part with checklist items, tests, and success criteria.
- [x] `frontend/AGENTS.md` accurately describes the current frontend structure and limitations.
- [x] Documentation is concise, clear, and follows the root `AGENTS.md` instructions.

User approval:
- [x] Required before starting Part 2.

## Part 2: Scaffolding

Goal: create the local container, backend skeleton, and scripts needed to run a basic FastAPI app.

Checklist:
- [x] Add backend project files in `backend/` using FastAPI and `uv`.
- [x] Add a minimal FastAPI app with a health API route.
- [x] Serve simple static HTML at `/` from the FastAPI app.
- [x] Add Docker files to build and run the backend locally.
- [x] Add start and stop scripts for Mac, PC, and Linux in `scripts/`.
- [x] Document the minimal local run flow in the README or relevant docs.

Tests:
- [ ] Run the backend locally through Docker.
- [x] Confirm `/` returns the example static HTML.
- [x] Confirm the health API route returns a successful response.
- [ ] Confirm start and stop scripts work on the current development platform.

Success criteria:
- [ ] A local Docker container starts the FastAPI app.
- [x] The app serves static HTML at `/`.
- [x] The app responds to at least one API call.
- [x] Scripts provide a simple local start and stop path.

## Part 3: Add in Frontend

Goal: build the existing Next.js frontend as a static site and serve it from FastAPI.

Checklist:
- [ ] Configure the frontend for static export.
- [ ] Update Docker build steps to build the frontend.
- [ ] Copy the static frontend build into the backend image.
- [ ] Serve the built Kanban app at `/` through FastAPI.
- [ ] Keep the demo Kanban behavior working in the browser.
- [ ] Update documentation for the combined frontend/backend run flow.

Tests:
- [ ] Run frontend unit tests with `npm run test:unit`.
- [ ] Run frontend end-to-end tests with `npm run test:e2e`.
- [ ] Run the Docker container and manually verify `/` displays the Kanban board.
- [ ] Confirm API routes still work after static file serving is added.

Success criteria:
- [ ] The Dockerized app serves the current Kanban UI at `/`.
- [ ] Existing Kanban interactions still work.
- [ ] Unit and integration tests pass.

## Part 4: Add in a fake user sign in experience

Goal: require a simple local sign in before showing the Kanban board.

Checklist:
- [ ] Add a login screen at `/` when no user is signed in.
- [ ] Accept only username `user` and password `password`.
- [ ] Show the Kanban board after successful sign in.
- [ ] Add a logout control that returns the user to the login screen.
- [ ] Keep the implementation local and simple for the MVP.

Tests:
- [ ] Add or update frontend unit tests for login, failed login, successful login, and logout.
- [ ] Add or update end-to-end tests for the full login-to-board flow.
- [ ] Confirm the Kanban board is not visible before login.

Success criteria:
- [ ] The user must sign in before seeing the board.
- [ ] Correct dummy credentials work.
- [ ] Incorrect credentials do not sign in.
- [ ] Logout works.

## Part 5: Database modeling

Goal: propose and document the SQLite persistence approach before implementation.

Checklist:
- [ ] Propose a SQLite schema that supports multiple users.
- [ ] Model one board per user for the MVP.
- [ ] Store Kanban board data as JSON.
- [ ] Document initial database creation behavior.
- [ ] Document how the schema can support future multi-user expansion.
- [ ] Save the database approach in `docs/`.
- [ ] Get user sign-off before implementing the database.

Tests:
- [ ] Documentation review only for this part.
- [ ] Confirm the proposed schema can represent the current `BoardData` shape.

Success criteria:
- [ ] Database design is documented clearly.
- [ ] The design matches MVP constraints.
- [ ] The user approves the database approach before Part 6.

User approval:
- [ ] Required before starting Part 6.

## Part 6: Backend

Goal: add backend API routes that read and update the persisted Kanban board.

Checklist:
- [ ] Implement SQLite database initialization when the database file does not exist.
- [ ] Add backend models or schemas for user and board data.
- [ ] Add API routes to read the signed-in user's Kanban board.
- [ ] Add API routes to update the signed-in user's Kanban board.
- [ ] Seed the default board for the hardcoded MVP user when needed.
- [ ] Keep API behavior simple and aligned with the approved database design.

Tests:
- [ ] Add backend unit tests for database initialization.
- [ ] Add backend API tests for reading a board.
- [ ] Add backend API tests for updating a board.
- [ ] Add tests proving a new database is created when missing.

Success criteria:
- [ ] Backend can create, read, and update a user's board.
- [ ] The default user gets a usable initial board.
- [ ] Backend tests pass.

## Part 7: Frontend + Backend

Goal: replace in-memory Kanban state with persistent backend API state.

Checklist:
- [ ] Add frontend API client code for reading and saving the board.
- [ ] Load the board from the backend after sign in.
- [ ] Save column renames, card moves, card edits, and card creation through the backend.
- [ ] Show simple loading and error states where needed.
- [ ] Keep the UI behavior consistent with the existing demo.

Tests:
- [ ] Add or update frontend unit tests for API-backed board loading and updates.
- [ ] Add integration tests covering frontend/backend persistence.
- [ ] Add end-to-end tests confirming changes survive page refresh.

Success criteria:
- [ ] Kanban changes persist through the backend.
- [ ] Refreshing the page keeps saved board state.
- [ ] Frontend and backend tests pass.

## Part 8: AI connectivity

Goal: prove the backend can call OpenRouter with the selected model.

Checklist:
- [ ] Add backend configuration for `OPENROUTER_API_KEY`.
- [ ] Add a minimal backend service for OpenRouter calls.
- [ ] Use model `openai/gpt-oss-120b`.
- [ ] Add a simple test route or test helper for a basic AI prompt.
- [ ] Confirm a "2+2" prompt returns a valid AI response.

Tests:
- [ ] Add backend tests for missing API key handling.
- [ ] Add a manual or opt-in integration test for the real OpenRouter call.
- [ ] Confirm the connectivity test does not run accidentally without configuration.

Success criteria:
- [ ] Backend can call OpenRouter successfully when `OPENROUTER_API_KEY` is present.
- [ ] Missing configuration fails clearly.
- [ ] The basic AI connectivity path is documented.

## Part 9: AI Kanban structured output

Goal: have the backend send board JSON and chat context to the AI, then handle structured responses.

Checklist:
- [ ] Define the structured output shape for AI responses.
- [ ] Include current Kanban JSON, user question, and conversation history in AI requests.
- [ ] Allow AI responses to include a user-facing message.
- [ ] Allow AI responses to optionally include a full or partial Kanban update.
- [ ] Validate AI output before applying board changes.
- [ ] Persist valid board updates through the existing backend persistence path.

Tests:
- [ ] Add backend tests for structured output parsing.
- [ ] Add backend tests for AI responses with no board update.
- [ ] Add backend tests for AI responses with board updates.
- [ ] Add backend tests for invalid or incomplete AI output.

Success criteria:
- [ ] AI chat requests include the current board and conversation context.
- [ ] Valid AI board updates are applied and persisted.
- [ ] Invalid AI output does not corrupt the saved board.

## Part 10: AI chat sidebar

Goal: add a polished sidebar chat UI that lets the user ask the AI to inspect or update the Kanban board.

Checklist:
- [ ] Add an AI chat sidebar to the Kanban UI.
- [ ] Display conversation history in the sidebar.
- [ ] Send user messages to the backend AI endpoint.
- [ ] Show assistant responses from the backend.
- [ ] Refresh the Kanban board automatically after AI-applied updates.
- [ ] Style the sidebar using the approved color scheme and existing frontend conventions.

Tests:
- [ ] Add frontend unit tests for chat message submission and rendering.
- [ ] Add integration tests for chat responses that do and do not update the board.
- [ ] Add end-to-end tests covering an AI-assisted card change.
- [ ] Run full frontend and backend test suites.

Success criteria:
- [ ] The sidebar supports a complete AI chat flow.
- [ ] AI responses can update the Kanban board.
- [ ] The board refreshes after AI updates.
- [ ] The app remains simple, local, and consistent with the MVP scope.
