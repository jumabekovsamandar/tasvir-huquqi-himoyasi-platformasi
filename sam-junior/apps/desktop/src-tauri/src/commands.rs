use std::collections::BTreeMap;

use sam_core::{settings, CoreError};
use serde::Serialize;
use serde_json::Value;
use tauri::State;
use tracing::warn;

use crate::AppState;

/// Error shape every command returns to the frontend: a stable machine code
/// plus a human-readable message. Never a bare string, never a stack trace.
#[derive(Debug, Serialize)]
pub struct CommandError {
    pub code: &'static str,
    pub message: String,
}

impl From<CoreError> for CommandError {
    fn from(err: CoreError) -> Self {
        let code = match &err {
            CoreError::Db(_) | CoreError::Migration { .. } => "database_error",
            CoreError::SettingSerialization { .. } => "invalid_setting",
            CoreError::Io { .. } => "io_error",
        };
        CommandError {
            code,
            message: err.to_string(),
        }
    }
}

impl CommandError {
    fn state_poisoned() -> Self {
        CommandError {
            code: "internal_error",
            message: "application state is unavailable (lock poisoned)".into(),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HealthReport {
    pub app_version: &'static str,
    pub db_healthy: bool,
    pub schema_version: i64,
    pub launch_count: i64,
    pub data_dir: String,
    pub log_dir: String,
}

/// Phase 0 acceptance probe: proves the database is alive, migrated and
/// persisting across restarts (launch_count). The UI renders this honestly —
/// if the database is down, the user sees it.
#[tauri::command]
pub fn health_check(state: State<'_, AppState>) -> Result<HealthReport, CommandError> {
    let db = state.db.lock().map_err(|_| CommandError::state_poisoned())?;
    Ok(HealthReport {
        app_version: env!("CARGO_PKG_VERSION"),
        db_healthy: db.is_healthy(),
        schema_version: db.schema_version(),
        launch_count: state.launch_count,
        data_dir: state.data_dir.display().to_string(),
        log_dir: state.log_dir.display().to_string(),
    })
}

#[tauri::command]
pub fn get_setting(state: State<'_, AppState>, key: String) -> Result<Option<Value>, CommandError> {
    let db = state.db.lock().map_err(|_| CommandError::state_poisoned())?;
    Ok(settings::get(db.conn(), &key)?)
}

#[tauri::command]
pub fn set_setting(
    state: State<'_, AppState>,
    key: String,
    value: Value,
) -> Result<(), CommandError> {
    if key.is_empty() || key.len() > 128 {
        return Err(CommandError {
            code: "invalid_setting",
            message: "setting key must be between 1 and 128 characters".into(),
        });
    }
    let db = state.db.lock().map_err(|_| CommandError::state_poisoned())?;
    settings::set(db.conn(), &key, &value).map_err(|e| {
        warn!(key, error = %e, "failed to persist setting");
        CommandError::from(e)
    })
}

#[tauri::command]
pub fn list_settings(state: State<'_, AppState>) -> Result<BTreeMap<String, Value>, CommandError> {
    let db = state.db.lock().map_err(|_| CommandError::state_poisoned())?;
    Ok(settings::all(db.conn())?)
}
