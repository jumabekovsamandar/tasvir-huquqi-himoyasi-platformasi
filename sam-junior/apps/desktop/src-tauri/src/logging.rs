use std::path::Path;

use tracing_appender::non_blocking::WorkerGuard;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::{fmt, EnvFilter};

/// Keeps the non-blocking file writer alive for the whole app lifetime.
/// Managed as Tauri state so it is dropped (and flushed) on exit.
pub struct LogGuard(#[allow(dead_code)] WorkerGuard);

/// Structured logging: human-readable stdout plus a daily-rotated file in
/// the app log directory. Log content must never include secrets; the
/// tool-execution layer (later phases) is responsible for redaction before
/// anything reaches `tracing`.
pub fn init(log_dir: &Path) -> Result<LogGuard, Box<dyn std::error::Error>> {
    let file_appender = tracing_appender::rolling::daily(log_dir, "sam-junior.log");
    let (file_writer, guard) = tracing_appender::non_blocking(file_appender);

    let filter = EnvFilter::try_from_env("SAM_LOG")
        .unwrap_or_else(|_| EnvFilter::new("info,sam_core=debug,sam_junior_desktop_lib=debug"));

    tracing_subscriber::registry()
        .with(filter)
        .with(fmt::layer().with_target(true))
        .with(fmt::layer().with_writer(file_writer).with_ansi(false))
        .try_init()?;

    Ok(LogGuard(guard))
}
