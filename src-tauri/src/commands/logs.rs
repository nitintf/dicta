use chrono::{DateTime, Duration, Local};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Clear log files older than the specified number of days
#[tauri::command]
pub async fn clear_old_logs(app: AppHandle, retention_days: i64) -> Result<usize, String> {
    let log_dir = app
        .path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get log directory: {}", e))?;

    if !log_dir.exists() {
        return Ok(0);
    }

    let cutoff_date = Local::now() - Duration::days(retention_days);
    let mut deleted_count = 0;

    let entries =
        fs::read_dir(&log_dir).map_err(|e| format!("Failed to read log directory: {}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let path = entry.path();

        // Only process log files
        if !path.is_file() {
            continue;
        }

        if let Some(extension) = path.extension() {
            if extension != "log" {
                continue;
            }
        } else {
            continue;
        }

        // Get file metadata
        let metadata =
            fs::metadata(&path).map_err(|e| format!("Failed to get file metadata: {}", e))?;

        // Get modified time
        let modified_time = metadata
            .modified()
            .map_err(|e| format!("Failed to get modified time: {}", e))?;

        // Convert to DateTime
        let modified_datetime: DateTime<Local> = modified_time.into();

        // Delete if older than cutoff date
        if modified_datetime < cutoff_date {
            if let Err(e) = fs::remove_file(&path) {
                log::warn!("Failed to delete old log file {:?}: {}", path, e);
            } else {
                deleted_count += 1;
                log::debug!("Deleted old log file: {:?}", path);
            }
        }
    }

    Ok(deleted_count)
}

/// Get the path to the log directory
#[tauri::command]
pub fn get_log_dir_path(app: AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_log_dir()
        .map_err(|e| format!("Failed to get log directory: {}", e))
}
