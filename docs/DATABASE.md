# Database design

Part 5 proposes the SQLite persistence model for the MVP.

## Goals

- Support multiple users in the schema.
- Use one board per user for the MVP.
- Store the Kanban board as JSON so it matches the current frontend `BoardData` shape.
- Create and seed the local database automatically when it does not exist.

## Database file

Use a local SQLite file at `data/pm.sqlite3` from the project root inside the container.

The backend will create the `data/` directory and database file during startup or first database access if they are missing.

## Schema

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  board_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
```

## MVP seed data

When the database is empty, create one user:

- `username`: `user`
- `password_hash`: a stored hash of `password`

Then create one board row for that user using the current demo `BoardData` JSON.

The MVP frontend login still remains local until Part 7. The backend schema uses a password hash now so the database is ready for future server-side authentication.

## Board JSON shape

Store `BoardData` as a JSON string in `boards.board_json`:

```json
{
  "columns": [
    { "id": "col-backlog", "title": "Backlog", "cardIds": ["card-1"] }
  ],
  "cards": {
    "card-1": {
      "id": "card-1",
      "title": "Align roadmap themes",
      "details": "Draft quarterly themes with impact statements and metrics."
    }
  }
}
```

This directly supports:

- Fixed columns that can be renamed.
- Ordered cards through each column's `cardIds` array.
- Card creation, editing, deletion, and movement.
- Future AI updates by replacing or validating the same JSON shape.

## API behavior for Part 6

Use the hardcoded MVP user `user` for board routes.

- Read board: find `users.username = 'user'`, then return that user's `boards.board_json`.
- Update board: validate the submitted `BoardData`, serialize it to JSON, and update that user's board row.
- Missing database: create schema, seed the default user, and seed the default board.
- Missing board for an existing user: create it from the default board JSON.

## Future expansion

The `users` table supports multiple users through `username` uniqueness.

The `boards.user_id UNIQUE` constraint enforces the MVP rule of one board per user. If future requirements need multiple boards per user, replace this constraint with a normal index on `user_id` and add a board name column.

Keeping the full board in JSON avoids premature normalization. If future reporting or filtering requires SQL queries over cards, add normalized `columns` and `cards` tables later while keeping the API response shape unchanged.
