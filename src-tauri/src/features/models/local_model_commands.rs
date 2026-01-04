use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{command, AppHandle, Emitter, State};
use tokio::sync::Mutex;

use super::engines::{ModelConfig, ModelStatus};
use super::local_model_manager::LocalModelManager;

/// Shared state type for local model manager
pub type LocalModelState = Arc<Mutex<LocalModelManager>>;

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
/// * `model_id` - The model identifier (e.g., "whisper-tiny", "llama-3-8b")
/// * `model_name` - The model name (e.g., "tiny", "base", "llama-3-8b")
/// * `model_path` - The full path to the model file
/// * `engine_type` - The engine to use (e.g., "whisper", "llama")
/// * `state` - Shared local model manager state
/// * `app` - Tauri app handle for emitting events
#[command]
pub async fn start_local_model(
    model_id: String,
    model_name: String,
    model_path: String,
    engine_type: String,
    state: State<'_, LocalModelState>,
    app: AppHandle,
) -> Result<(), String> {
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

    // Create model configuration
    let config = ModelConfig {
        model_path,
        model_name: model_name.clone(),
        language: None,
    };

    // Load the model using the specified engine
    let result = manager.load_model(&engine_type, config);

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
            Err(e)
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

    let model_info = manager.get_loaded_model_info();

    // If a specific model_id is requested, check if it matches the loaded model
    if let Some(requested_id) = model_id {
        // Check if we have a loaded model and it matches
        if let Some(info) = model_info {
            // For now, we compare by model name since we don't store the full ID
            // This works for whisper models like "whisper-tiny" -> name is "tiny"
            // Future: Consider storing the full model_id in ModelInfo
            let matches = requested_id.contains(&info.name);

            if matches {
                return Ok(LocalModelStatusInfo {
                    status: manager.get_status(),
                    model_name: Some(info.name),
                    model_id: Some(requested_id),
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
    Ok(LocalModelStatusInfo {
        status: manager.get_status(),
        model_name: model_info.as_ref().map(|i| i.name.clone()),
        model_id: None, // We don't have the full model ID without the request parameter
    })
}
