/// Setup logging with rotation and filtering
#[cfg(not(debug_assertions))]
pub fn setup_logging() -> tauri_plugin_log::Builder {
    use tauri_plugin_log::{Target, TargetKind};

    tauri_plugin_log::Builder::new()
        .target(
            Target::new(TargetKind::LogDir {
                file_name: Some("logs".to_string()),
            })
            .filter(|metadata| {
                // Filter out noisy logs from external libraries
                let target = metadata.target();
                !target.contains("whisper_rs")
                    && !target.contains("audio::level_meter")
                    && !target.contains("cpal")
                    && !target.contains("rubato")
                    && !target.contains("hound")
            }),
        )
        .level(if cfg!(debug_assertions) {
            log::LevelFilter::Debug
        } else {
            log::LevelFilter::Info
        })
}

// ============================================================================
// SIMPLE LOGGING API
// ============================================================================

/// Simple info log
pub fn info(msg: &str) {
    log::info!("{}", msg);
}

/// Simple error log
pub fn error(msg: &str) {
    log::error!("{}", msg);
}

/// Simple warn log
pub fn warn(msg: &str) {
    log::warn!("{}", msg);
}

/// Simple debug log
pub fn debug(msg: &str) {
    log::debug!("{}", msg);
}

/// Info log with context
pub fn info_with(msg: &str, context: &[(&str, &str)]) {
    if context.is_empty() {
        log::info!("{}", msg);
    } else {
        let ctx_str: Vec<String> = context
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();
        log::info!("{} | {}", msg, ctx_str.join(", "));
    }
}

/// Error log with context
pub fn error_with(msg: &str, context: &[(&str, &str)]) {
    if context.is_empty() {
        log::error!("{}", msg);
    } else {
        let ctx_str: Vec<String> = context
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();
        log::error!("{} | {}", msg, ctx_str.join(", "));
    }
}

/// Warn log with context
pub fn warn_with(msg: &str, context: &[(&str, &str)]) {
    if context.is_empty() {
        log::warn!("{}", msg);
    } else {
        let ctx_str: Vec<String> = context
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();
        log::warn!("{} | {}", msg, ctx_str.join(", "));
    }
}

/// Debug log with context
pub fn debug_with(msg: &str, context: &[(&str, &str)]) {
    if context.is_empty() {
        log::debug!("{}", msg);
    } else {
        let ctx_str: Vec<String> = context
            .iter()
            .map(|(k, v)| format!("{}={}", k, v))
            .collect();
        log::debug!("{} | {}", msg, ctx_str.join(", "));
    }
}
