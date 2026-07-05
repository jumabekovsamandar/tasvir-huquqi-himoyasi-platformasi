use thiserror::Error;

/// Structured error type for the core layer.
///
/// Every variant carries enough context to explain the failure to the user
/// honestly ("I could not open the database because...") instead of a vague
/// "something went wrong".
#[derive(Debug, Error)]
pub enum CoreError {
    #[error("database error: {0}")]
    Db(#[from] rusqlite::Error),

    #[error("migration {version} ({name}) failed: {source}")]
    Migration {
        version: i64,
        name: String,
        #[source]
        source: rusqlite::Error,
    },

    #[error("invalid setting value for '{key}': {source}")]
    SettingSerialization {
        key: String,
        #[source]
        source: serde_json::Error,
    },

    #[error("io error at {path}: {source}")]
    Io {
        path: String,
        #[source]
        source: std::io::Error,
    },
}

pub type CoreResult<T> = Result<T, CoreError>;
