use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{command, AppHandle, Emitter, State};
use tokio::sync::Mutex;

use crate::models::whisper_manager::{ModelStatus, WhisperManager};

/// Shared state type for WhisperManager
pub type WhisperState = Arc<Mutex<WhisperManager>>;

/// Information about the current model status
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelStatusInfo {
    pub status: ModelStatus,
    pub model_name: Option<String>,
}

/// Starts (loads) a local Whisper model into memory
///
/// This command will:
/// 1. Emit a "loading" status event
/// 2. Load the model into memory
/// 3. Emit a "ready" or "error" status event
///
/// # Arguments
/// * `model_name` - The name of the model (e.g., "tiny", "base")
/// * `model_path` - The full path to the model file
/// * `state` - Shared WhisperManager state
/// * `app` - Tauri app handle for emitting events
#[command]
pub async fn start_whisper_model(
    model_name: String,
    model_path: String,
    state: State<'_, WhisperState>,
    app: AppHandle,
) -> Result<(), String> {
    let mut manager = state.lock().await;

    // Emit loading event
    let _ = app.emit(
        "whisper-model-status",
        ModelStatusInfo {
            status: ModelStatus::Loading,
            model_name: Some(model_name.clone()),
        },
    );

    // Load the model
    let result = manager.load_model(model_name.clone(), model_path);

    // Emit result event
    match result {
        Ok(()) => {
            let _ = app.emit(
                "whisper-model-status",
                ModelStatusInfo {
                    status: ModelStatus::Ready,
                    model_name: Some(model_name),
                },
            );
            Ok(())
        }
        Err(e) => {
            let _ = app.emit(
                "whisper-model-status",
                ModelStatusInfo {
                    status: ModelStatus::Error,
                    model_name: Some(model_name),
                },
            );
            Err(e.to_string())
        }
    }
}

/// Stops (unloads) the current local Whisper model from memory
///
/// This command will:
/// 1. Unload the model from memory
/// 2. Emit a "stopped" status event
///
/// # Arguments
/// * `state` - Shared WhisperManager state
/// * `app` - Tauri app handle for emitting events
#[command]
pub async fn stop_whisper_model(
    state: State<'_, WhisperState>,
    app: AppHandle,
) -> Result<(), String> {
    let mut manager = state.lock().await;
    manager.unload_model();

    let _ = app.emit(
        "whisper-model-status",
        ModelStatusInfo {
            status: ModelStatus::Stopped,
            model_name: None,
        },
    );

    Ok(())
}

/// Gets the current Whisper model status
///
/// # Arguments
/// * `state` - Shared WhisperManager state
///
/// # Returns
/// Current status and loaded model name (if any)
#[command]
pub async fn get_whisper_model_status(
    state: State<'_, WhisperState>,
) -> Result<ModelStatusInfo, String> {
    let manager = state.lock().await;
    Ok(ModelStatusInfo {
        status: manager.get_status(),
        model_name: manager.get_loaded_model_name(),
    })
}
