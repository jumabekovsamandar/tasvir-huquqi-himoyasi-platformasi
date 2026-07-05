use std::path::Path;

use rusqlite::Connection;
use tracing::info;

use crate::error::{CoreError, CoreResult};
use crate::migrations;

/// Handle to the local SQLite database.
///
/// Phase 0 uses a single connection guarded by a mutex in the Tauri state.
/// If contention ever becomes a real problem a small pool can replace this
/// without changing callers.
pub struct Database {
    conn: Connection,
    schema_version: i64,
}

impl Database {
    /// Opens (creating if needed) the database at `path`, configures
    /// pragmas and applies pending migrations.
    pub fn open(path: &Path) -> CoreResult<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).map_err(|source| CoreError::Io {
                path: parent.display().to_string(),
                source,
            })?;
        }
        let mut conn = Connection::open(path)?;
        Self::configure(&conn)?;
        let schema_version = migrations::apply_all(&mut conn)?;
        info!(path = %path.display(), schema_version, "database ready");
        Ok(Self { conn, schema_version })
    }

    /// In-memory database for tests.
    pub fn open_in_memory() -> CoreResult<Self> {
        let mut conn = Connection::open_in_memory()?;
        Self::configure(&conn)?;
        let schema_version = migrations::apply_all(&mut conn)?;
        Ok(Self { conn, schema_version })
    }

    fn configure(conn: &Connection) -> CoreResult<()> {
        conn.pragma_update(None, "journal_mode", "WAL")?;
        conn.pragma_update(None, "foreign_keys", "ON")?;
        conn.pragma_update(None, "synchronous", "NORMAL")?;
        Ok(())
    }

    pub fn conn(&self) -> &Connection {
        &self.conn
    }

    pub fn schema_version(&self) -> i64 {
        self.schema_version
    }

    /// Cheap liveness check used by the health command.
    pub fn is_healthy(&self) -> bool {
        self.conn
            .query_row("SELECT 1", [], |row| row.get::<_, i64>(0))
            .is_ok()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn opens_and_migrates_fresh_database() {
        let dir = tempfile::tempdir().unwrap();
        let db_path = dir.path().join("data").join("sam.db");
        let db = Database::open(&db_path).unwrap();
        assert!(db.is_healthy());
        assert_eq!(db.schema_version(), 1);
        assert!(db_path.exists());
    }

    #[test]
    fn reopening_is_idempotent() {
        let dir = tempfile::tempdir().unwrap();
        let db_path = dir.path().join("sam.db");
        {
            let db = Database::open(&db_path).unwrap();
            assert_eq!(db.schema_version(), 1);
        }
        let db = Database::open(&db_path).unwrap();
        assert_eq!(db.schema_version(), 1);
        assert!(db.is_healthy());
    }
}
