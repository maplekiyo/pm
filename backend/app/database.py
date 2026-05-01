import hashlib
import json
import os
import sqlite3
from pathlib import Path

from app.default_board import DEFAULT_BOARD
from app.schemas import BoardData

DEFAULT_USERNAME = "user"
DEFAULT_PASSWORD = "password"


def get_database_path() -> Path:
    return Path(os.getenv("PM_DATABASE_PATH", "data/pm.sqlite3"))


def hash_password(password: str) -> str:
    return hashlib.sha256(f"pm-mvp:{password}".encode()).hexdigest()


def connect(db_path: Path | None = None) -> sqlite3.Connection:
    path = db_path or get_database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def board_to_json(board: BoardData) -> str:
    return json.dumps(board.model_dump(), separators=(",", ":"))


def create_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS boards (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL UNIQUE,
          board_json TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
        """
    )


def ensure_user_and_board(
    connection: sqlite3.Connection,
    username: str = DEFAULT_USERNAME,
    board: BoardData = DEFAULT_BOARD,
) -> int:
    connection.execute(
        "INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)",
        (username, hash_password(DEFAULT_PASSWORD)),
    )
    user_id = connection.execute(
        "SELECT id FROM users WHERE username = ?", (username,)
    ).fetchone()["id"]
    connection.execute(
        "INSERT OR IGNORE INTO boards (user_id, board_json) VALUES (?, ?)",
        (user_id, board_to_json(board)),
    )
    return int(user_id)


def init_database(db_path: Path | None = None) -> None:
    with connect(db_path) as connection:
        create_schema(connection)
        ensure_user_and_board(connection)


def get_board(username: str = DEFAULT_USERNAME, db_path: Path | None = None) -> BoardData:
    init_database(db_path)
    with connect(db_path) as connection:
        row = connection.execute(
            """
            SELECT boards.board_json
            FROM boards
            JOIN users ON users.id = boards.user_id
            WHERE users.username = ?
            """,
            (username,),
        ).fetchone()
    return BoardData.model_validate(json.loads(row["board_json"]))


def update_board(
    board: BoardData,
    username: str = DEFAULT_USERNAME,
    db_path: Path | None = None,
) -> BoardData:
    init_database(db_path)
    with connect(db_path) as connection:
        user_id = ensure_user_and_board(connection, username)
        connection.execute(
            """
            UPDATE boards
            SET board_json = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
            """,
            (board_to_json(board), user_id),
        )
    return board
