use std::collections::BTreeMap;

use rusqlite::{Connection, OptionalExtension};
use serde_json::Value;

use crate::error::{CoreError, CoreResult};

/// Well-known setting keys. Free-form keys are allowed too; these constants
/// exist so the shell and frontend agree on names.
pub mod keys {
    /// UI + assistant language: "uz" | "en".
    pub const LANGUAGE: &str = "language";
    /// UI theme. Only "dark" ships in V1.
    pub const THEME: &str = "theme";
    /// How the assistant addresses the user. Editable, never hardcoded in logic.
    pub const USER_DISPLAY_NAME: &str = "user_display_name";
    /// Incremented on every launch; proves persistence across restarts.
    pub const LAUNCH_COUNT: &str = "launch_count";
}

/// Default values applied when a key has never been written.
/// The user's preferred name defaults to "Sam" but is a plain editable
/// setting, not a constant baked into behavior.
pub fn defaults() -> BTreeMap<&'static str, Value> {
    BTreeMap::from([
        (keys::LANGUAGE, Value::from("uz")),
        (keys::THEME, Value::from("dark")),
        (keys::USER_DISPLAY_NAME, Value::from("Sam")),
    ])
}

/// Reads one setting, falling back to the built-in default if present.
pub fn get(conn: &Connection, key: &str) -> CoreResult<Option<Value>> {
    let raw: Option<String> = conn
        .query_row("SELECT value FROM settings WHERE key = ?1", [key], |row| {
            row.get(0)
        })
        .optional()?;
    match raw {
        Some(text) => {
            let value =
                serde_json::from_str(&text).map_err(|source| CoreError::SettingSerialization {
                    key: key.to_string(),
                    source,
                })?;
            Ok(Some(value))
        }
        None => Ok(defaults().get(key).cloned()),
    }
}

/// Writes one setting (upsert). Values are stored as JSON text.
pub fn set(conn: &Connection, key: &str, value: &Value) -> CoreResult<()> {
    let text = serde_json::to_string(value).map_err(|source| CoreError::SettingSerialization {
        key: key.to_string(),
        source,
    })?;
    conn.execute(
        "INSERT INTO settings (key, value, updated_at)
         VALUES (?1, ?2, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
         ON CONFLICT(key) DO UPDATE SET
             value = excluded.value,
             updated_at = excluded.updated_at",
        (key, text),
    )?;
    Ok(())
}

/// Returns defaults overlaid with everything stored in the database.
pub fn all(conn: &Connection) -> CoreResult<BTreeMap<String, Value>> {
    let mut result: BTreeMap<String, Value> = defaults()
        .into_iter()
        .map(|(k, v)| (k.to_string(), v))
        .collect();

    let mut stmt = conn.prepare("SELECT key, value FROM settings ORDER BY key")?;
    let rows = stmt.query_map([], |row| {
        Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
    })?;
    for row in rows {
        let (key, text) = row?;
        let value =
            serde_json::from_str(&text).map_err(|source| CoreError::SettingSerialization {
                key: key.clone(),
                source,
            })?;
        result.insert(key, value);
    }
    Ok(result)
}

/// Increments and returns the launch counter. Used by the Phase 0 health
/// check to demonstrate real persistence across restarts.
pub fn increment_launch_count(conn: &Connection) -> CoreResult<i64> {
    let current = get(conn, keys::LAUNCH_COUNT)?
        .and_then(|v| v.as_i64())
        .unwrap_or(0);
    let next = current + 1;
    set(conn, keys::LAUNCH_COUNT, &Value::from(next))?;
    Ok(next)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;

    #[test]
    fn unknown_key_returns_none_known_key_returns_default() {
        let db = Database::open_in_memory().unwrap();
        assert_eq!(get(db.conn(), "does_not_exist").unwrap(), None);
        assert_eq!(
            get(db.conn(), keys::LANGUAGE).unwrap(),
            Some(Value::from("uz"))
        );
    }

    #[test]
    fn set_then_get_roundtrips() {
        let db = Database::open_in_memory().unwrap();
        set(db.conn(), keys::LANGUAGE, &Value::from("en")).unwrap();
        assert_eq!(
            get(db.conn(), keys::LANGUAGE).unwrap(),
            Some(Value::from("en"))
        );
    }

    #[test]
    fn settings_persist_across_reopen() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("sam.db");
        {
            let db = Database::open(&path).unwrap();
            set(db.conn(), keys::USER_DISPLAY_NAME, &Value::from("Sam")).unwrap();
            set(db.conn(), keys::LANGUAGE, &Value::from("en")).unwrap();
        }
        let db = Database::open(&path).unwrap();
        assert_eq!(
            get(db.conn(), keys::USER_DISPLAY_NAME).unwrap(),
            Some(Value::from("Sam"))
        );
        assert_eq!(
            get(db.conn(), keys::LANGUAGE).unwrap(),
            Some(Value::from("en"))
        );
    }

    #[test]
    fn launch_count_increments_across_reopen() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("sam.db");
        {
            let db = Database::open(&path).unwrap();
            assert_eq!(increment_launch_count(db.conn()).unwrap(), 1);
        }
        let db = Database::open(&path).unwrap();
        assert_eq!(increment_launch_count(db.conn()).unwrap(), 2);
    }

    #[test]
    fn all_overlays_stored_values_on_defaults() {
        let db = Database::open_in_memory().unwrap();
        set(db.conn(), keys::THEME, &Value::from("dark")).unwrap();
        set(db.conn(), "custom_key", &Value::from(42)).unwrap();
        let map = all(db.conn()).unwrap();
        assert_eq!(map.get(keys::LANGUAGE), Some(&Value::from("uz")));
        assert_eq!(map.get("custom_key"), Some(&Value::from(42)));
    }
}
