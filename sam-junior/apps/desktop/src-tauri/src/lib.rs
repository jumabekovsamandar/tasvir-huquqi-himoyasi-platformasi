mod commands;
mod logging;

use std::path::PathBuf;
use std::sync::Mutex;

use sam_core::{settings, Database};
use tauri::Manager;
use tracing::{error, info};

/// Shared application state managed by Tauri.
pub struct AppState {
    pub db: Mutex<Database>,
    /// Launch number of this run (1 on first ever launch). Written to the
    /// database at startup, so it doubles as a persistence check.
    pub launch_count: i64,
    pub data_dir: PathBuf,
    pub log_dir: PathBuf,
}

pub fn run() {
    let app = tauri::Builder::default()
        .setup(|app| {
            let paths = app.path();
            let data_dir = paths.app_data_dir()?;
            let log_dir = paths.app_log_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            std::fs::create_dir_all(&log_dir)?;

            let log_guard = logging::init(&log_dir)?;
            app.manage(log_guard);
            info!(
                version = env!("CARGO_PKG_VERSION"),
                data_dir = %data_dir.display(),
                "SAM JUNIOR starting"
            );

            let db = Database::open(&data_dir.join("sam-junior.db")).map_err(|e| {
                error!(error = %e, "database initialization failed");
                e
            })?;
            let launch_count = settings::increment_launch_count(db.conn())?;
            info!(
                schema_version = db.schema_version(),
                launch_count, "database initialized"
            );

            app.manage(AppState {
                db: Mutex::new(db),
                launch_count,
                data_dir,
                log_dir,
            });
            info!("SAM JUNIOR ready");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::health_check,
            commands::get_setting,
            commands::set_setting,
            commands::list_settings,
        ])
        .build(tauri::generate_context!())
        .expect("failed to build SAM JUNIOR application");

    app.run(|_handle, event| {
        if let tauri::RunEvent::Exit = event {
            info!("SAM JUNIOR shut down cleanly");
        }
    });
}
