use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{command, AppHandle, Emitter, State};
use tokio::sync::Mutex;

use super::whisper_manager::{ModelStatus, WhisperManager};

/// Shared state type for local model manager
pub type LocalModelState = Arc<Mutex<WhisperManager>>;

/// Information about the current local model status
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalModelStatusInfo {
    pub status: ModelStatus,
    pub model_name: Option<String>,
    pub model_id: Option<String>,
}

/// Start (load) a local model into memory
///
/// # Arguments
/// * `model_id` - The model identifier (e.g., "whisper-tiny")
/// * `model_name` - The model name (e.g., "tiny", "base")
/// * `model_path` - The full path to the model file
/// * `state` - Shared local model manager state
/// * `app` - Tauri app handle for emitting events
#[command]
pub async fn start_local_model(
    model_id: String,
    model_name: String,
    model_path: String,
    state: State<'_, LocalModelState>,
    app: AppHandle,
) -> Result<(), String> {
    if !model_id.starts_with("whisper-") {
        return Err(format!("Unsupported model type: {}", model_id));
    }

    let mut manager = state.lock().await;

    // Emit loading event
    let _ = app.emit(
        "local-model-status",
        LocalModelStatusInfo {
            status: ModelStatus::Loading,
            model_name: Some(model_name.clone()),
            model_id: Some(model_id.clone()),
        },
    );

    // Load the model
    let result = manager.load_model(model_name.clone(), model_path);

    // Emit result event
    match result {
        Ok(()) => {
            let _ = app.emit(
                "local-model-status",
                LocalModelStatusInfo {
                    status: ModelStatus::Ready,
                    model_name: Some(model_name),
                    model_id: Some(model_id),
                },
            );
            Ok(())
        }
        Err(e) => {
            let _ = app.emit(
                "local-model-status",
                LocalModelStatusInfo {
                    status: ModelStatus::Error,
                    model_name: Some(model_name),
                    model_id: Some(model_id),
                },
            );
            Err(e.to_string())
        }
    }
}

/// Stop (unload) the current local model from memory
///
/// # Arguments
/// * `state` - Shared local model manager state
/// * `app` - Tauri app handle for emitting events
#[command]
pub async fn stop_local_model(
    state: State<'_, LocalModelState>,
    app: AppHandle,
) -> Result<(), String> {
    let mut manager = state.lock().await;
    manager.unload_model();

    let _ = app.emit(
        "local-model-status",
        LocalModelStatusInfo {
            status: ModelStatus::Stopped,
            model_name: None,
            model_id: None,
        },
    );

    Ok(())
}

/// Get the current local model status
///
/// # Arguments
/// * `model_id` - The model identifier to check status for (optional)
/// * `state` - Shared local model manager state
///
/// # Returns
/// Current status, loaded model name, and model ID (if any)
#[command]
pub async fn get_local_model_status(
    model_id: Option<String>,
    state: State<'_, LocalModelState>,
) -> Result<LocalModelStatusInfo, String> {
    let manager = state.lock().await;

    // If a specific model_id is requested, check if it matches the loaded model
    if let Some(requested_id) = model_id {
        if let Some(loaded_name) = manager.get_loaded_model_name() {
            // Check if the loaded model matches the requested ID
            let loaded_id = format!("whisper-{}", loaded_name);
            if loaded_id == requested_id {
                return Ok(LocalModelStatusInfo {
                    status: manager.get_status(),
                    model_name: Some(loaded_name),
                    model_id: Some(loaded_id),
                });
            }
        }

        // If no model is loaded or it doesn't match, return stopped status
        return Ok(LocalModelStatusInfo {
            status: ModelStatus::Stopped,
            model_name: None,
            model_id: Some(requested_id),
        });
    }

    // Return current loaded model status
    let loaded_name = manager.get_loaded_model_name();
    let loaded_id = loaded_name.as_ref().map(|name| format!("whisper-{}", name));

    Ok(LocalModelStatusInfo {
        status: manager.get_status(),
        model_name: loaded_name,
        model_id: loaded_id,
    })
}
