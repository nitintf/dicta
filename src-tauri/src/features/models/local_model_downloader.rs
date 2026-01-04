use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{command, AppHandle, Emitter, Manager};
use tokio::io::AsyncWriteExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
    pub percentage: f64,
    pub model_id: String,
}

/// Get the base directory for storing local models
fn get_models_base_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let models_dir = app_data_dir.join("local_models");

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&models_dir)
        .map_err(|e| format!("Failed to create models directory: {}", e))?;

    Ok(models_dir)
}

/// Get the directory for a specific engine type
fn get_engine_dir(app: &AppHandle, engine_type: &str) -> Result<PathBuf, String> {
    let base_dir = get_models_base_dir(app)?;
    let engine_dir = base_dir.join(engine_type);

    std::fs::create_dir_all(&engine_dir)
        .map_err(|e| format!("Failed to create engine directory: {}", e))?;

    Ok(engine_dir)
}

/// Download a local model from a URL
///
/// # Arguments
/// * `model_id` - The model identifier (e.g., "whisper-tiny", "llama-3-8b")
/// * `download_url` - The URL to download the model from
/// * `filename` - The filename to save the model as
/// * `engine_type` - The engine type (e.g., "whisper", "llama")
#[command]
pub async fn download_local_model(
    app: AppHandle,
    model_id: String,
    download_url: String,
    filename: String,
    engine_type: String,
) -> Result<String, String> {
    let engine_dir = get_engine_dir(&app, &engine_type)?;
    let model_path = engine_dir.join(&filename);

    // Check if already downloaded
    if model_path.exists() {
        return Ok(model_path.to_string_lossy().to_string());
    }

    // Download the model with progress tracking
    let client = reqwest::Client::new();
    let response = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

    let total_size = response.content_length().unwrap_or(0);

    // Create the file
    let mut file = tokio::fs::File::create(&model_path)
        .await
        .map_err(|e| format!("Failed to create file: {}", e))?;

    let mut downloaded: u64 = 0;

    // Read the response in chunks
    use bytes::Buf;
    use futures_util::StreamExt;

    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Error downloading chunk: {}", e))?;

        file.write_all(chunk.chunk())
            .await
            .map_err(|e| format!("Error writing to file: {}", e))?;

        downloaded += chunk.len() as u64;

        // Emit progress event every 100KB to avoid too many events
        if downloaded % 102400 == 0 || downloaded >= total_size {
            let percentage = if total_size > 0 {
                (downloaded as f64 / total_size as f64) * 100.0
            } else {
                0.0
            };

            let progress = DownloadProgress {
                downloaded,
                total: total_size,
                percentage,
                model_id: model_id.clone(),
            };

            let _ = app.emit("local-model-download-progress", progress);
        }
    }

    // Emit final progress
    let progress = DownloadProgress {
        downloaded,
        total: total_size,
        percentage: 100.0,
        model_id: model_id.clone(),
    };
    let _ = app.emit("local-model-download-progress", progress);

    file.flush()
        .await
        .map_err(|e| format!("Error flushing file: {}", e))?;

    Ok(model_path.to_string_lossy().to_string())
}

/// Delete a local model file
///
/// # Arguments
/// * `model_path` - The full path to the model file to delete
#[command]
pub async fn delete_local_model(model_path: String) -> Result<(), String> {
    let path = PathBuf::from(&model_path);

    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| format!("Failed to delete model: {}", e))?;
    }

    Ok(())
}
