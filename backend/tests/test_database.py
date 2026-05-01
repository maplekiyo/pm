import sqlite3

from app.database import get_board, init_database, update_board


def test_init_database_creates_schema_and_seed_data(tmp_path):
    db_path = tmp_path / "pm.sqlite3"

    init_database(db_path)

    assert db_path.exists()
    with sqlite3.connect(db_path) as connection:
        user_count = connection.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        board_count = connection.execute("SELECT COUNT(*) FROM boards").fetchone()[0]

    assert user_count == 1
    assert board_count == 1
    assert get_board(db_path=db_path).columns[0].title == "Backlog"


def test_update_board_persists_changes(tmp_path):
    db_path = tmp_path / "pm.sqlite3"
    board = get_board(db_path=db_path)
    board.columns[0].title = "Ideas"

    update_board(board, db_path=db_path)

    assert get_board(db_path=db_path).columns[0].title == "Ideas"
