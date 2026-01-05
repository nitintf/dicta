use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

use super::engines::ModelConfig;
use super::LocalModelManager;

/// Auto-start selected local models if they're downloaded
pub async fn auto_start_selected_models(
    app: &AppHandle,
    model_manager: Arc<Mutex<LocalModelManager>>,
) -> Result<(), String> {
    let settings_store = app
        .store("settings")
        .map_err(|e| format!("Failed to get settings store: {}", e))?;

    let settings = settings_store
        .get("settings")
        .ok_or("No settings found in store")?;

    let speech_to_text_id = settings
        .get("transcription")
        .and_then(|t| t.get("speechToTextModelId"))
        .and_then(|v| v.as_str());

    let post_processing_id = settings
        .get("aiProcessing")
        .and_then(|a| a.get("postProcessingModelId"))
        .and_then(|v| v.as_str());

    let models_store = app
        .store("models.json")
        .map_err(|e| format!("Failed to get models store: {}", e))?;

    let models = models_store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No models found in store")?;

    let mut models_to_download = Vec::new();

    if let Some(stt_id) = speech_to_text_id {
        if let Some(model_data) = models.iter().find(|m| {
            m.get("id")
                .and_then(|v| v.as_str())
                .map(|id| id == stt_id)
                .unwrap_or(false)
        }) {
            let obj = model_data.as_object().ok_or("Model is not an object")?;

            let model_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");

            if model_type == "local" {
                let is_downloaded = obj
                    .get("isDownloaded")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);

                let model_name = obj.get("name").and_then(|v| v.as_str()).unwrap_or(stt_id);

                if is_downloaded {
                    if let Err(e) =
                        start_local_model_internal(app, model_manager.clone(), obj, stt_id).await
                    {
                        eprintln!("Failed to start speech-to-text model: {}", e);
                    } else {
                        println!("✅ Auto-started speech-to-text model: {}", model_name);
                    }
                } else {
                    models_to_download.push(model_name.to_string());
                }
            }
        }
    }

    if let Some(pp_id) = post_processing_id {
        if let Some(model_data) = models.iter().find(|m| {
            m.get("id")
                .and_then(|v| v.as_str())
                .map(|id| id == pp_id)
                .unwrap_or(false)
        }) {
            let obj = model_data.as_object().ok_or("Model is not an object")?;

            let model_type = obj.get("type").and_then(|v| v.as_str()).unwrap_or("");

            if model_type == "local" {
                let is_downloaded = obj
                    .get("isDownloaded")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);

                let model_name = obj.get("name").and_then(|v| v.as_str()).unwrap_or(pp_id);

                if is_downloaded {
                    // Start the model (note: for now we only support one local model at a time)
                    println!("ℹ️  Post-processing model {} is local and downloaded, but multiple local models not yet supported", model_name);
                } else {
                    models_to_download.push(model_name.to_string());
                }
            }
        }
    }

    if !models_to_download.is_empty() {
        let model_names = models_to_download.join(", ");
        let message = if models_to_download.len() == 1 {
            format!("{} needs to be downloaded", model_names)
        } else {
            format!("{} need to be downloaded", model_names)
        };

        // Show notification about models needing download
        let _ = app
            .notification()
            .builder()
            .title("Models Not Downloaded")
            .body(&format!("{}\n\nOpen Dicta > Models to download", message))
            .show();
    }

    Ok(())
}

/// Helper function to start a local model
async fn start_local_model_internal(
    app: &AppHandle,
    model_manager: Arc<Mutex<LocalModelManager>>,
    model_obj: &serde_json::Map<String, serde_json::Value>,
    model_id: &str,
) -> Result<(), String> {
    let model_path = model_obj
        .get("path")
        .and_then(|v| v.as_str())
        .ok_or("Model path not found")?;

    let engine_type = model_obj
        .get("engine")
        .and_then(|v| v.as_str())
        .ok_or("Engine type not found for local model")?;

    let model_name = model_obj
        .get("name")
        .and_then(|v| v.as_str())
        .unwrap_or(model_id);

    println!(
        "Auto-starting local model: {} (engine: {}) at {}",
        model_name, engine_type, model_path
    );

    let mut manager = model_manager.lock().await;

    let config = ModelConfig {
        model_path: model_path.to_string(),
        model_name: model_name.to_string(),
        language: None,
    };

    manager
        .load_model(engine_type, config)
        .map_err(|e| format!("Failed to load model: {}", e))?;

    app.emit(
        "local-model-status",
        serde_json::json!({
            "status": "ready",
            "modelName": model_name,
            "modelId": model_id,
        }),
    )
    .map_err(|e| format!("Failed to emit status: {}", e))?;

    Ok(())
}
