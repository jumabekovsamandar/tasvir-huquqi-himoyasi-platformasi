use rusqlite::Connection;
use tracing::info;

use crate::error::{CoreError, CoreResult};

/// A single versioned schema migration. Migrations are append-only:
/// never edit an already-shipped migration, add a new one instead.
pub struct Migration {
    pub version: i64,
    pub name: &'static str,
    pub sql: &'static str,
}

/// All known migrations, ordered by version.
pub const MIGRATIONS: &[Migration] = &[Migration {
    version: 1,
    name: "settings",
    sql: r#"
        CREATE TABLE settings (
            key        TEXT PRIMARY KEY,
            value      TEXT NOT NULL, -- JSON-encoded
            updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
    "#,
}];

/// Applies every migration newer than the current schema version.
/// Each migration runs inside its own transaction, so a failure leaves
/// the database at the last fully-applied version.
pub fn apply_all(conn: &mut Connection) -> CoreResult<i64> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_migrations (
            version    INTEGER PRIMARY KEY,
            name       TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );",
    )?;

    let current: i64 = conn.query_row(
        "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
        [],
        |row| row.get(0),
    )?;

    let mut latest = current;
    for migration in MIGRATIONS.iter().filter(|m| m.version > current) {
        let tx = conn.transaction()?;
        let apply = || -> Result<(), rusqlite::Error> {
            tx.execute_batch(migration.sql)?;
            tx.execute(
                "INSERT INTO schema_migrations (version, name) VALUES (?1, ?2)",
                (migration.version, migration.name),
            )?;
            Ok(())
        };
        apply().map_err(|source| CoreError::Migration {
            version: migration.version,
            name: migration.name.to_string(),
            source,
        })?;
        tx.commit()?;
        info!(version = migration.version, name = migration.name, "applied migration");
        latest = migration.version;
    }

    Ok(latest)
}

/// Returns the currently applied schema version (0 if none).
pub fn current_version(conn: &Connection) -> CoreResult<i64> {
    let version = conn.query_row(
        "SELECT COALESCE(MAX(version), 0) FROM schema_migrations",
        [],
        |row| row.get(0),
    )?;
    Ok(version)
}
