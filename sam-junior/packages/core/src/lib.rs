//! SAM JUNIOR core library.
//!
//! Owns everything that must work without a UI: the local SQLite database,
//! schema migrations and the settings store. The Tauri shell
//! (`apps/desktop/src-tauri`) is a thin layer over this crate, which keeps
//! the critical path testable on any platform (including headless CI).

pub mod db;
pub mod error;
pub mod migrations;
pub mod settings;

pub use db::Database;
pub use error::CoreError;
