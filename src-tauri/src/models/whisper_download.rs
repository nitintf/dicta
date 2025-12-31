use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{command, AppHandle, Emitter, Manager};
use tokio::io::AsyncWriteExt;

use super::models_registry::WHISPER_MODELS;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: u64,
    pub percentage: f64,
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub name: String,
    pub size: String,
    pub downloaded: bool,
    pub path: Option<String>,
}

fn get_models_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let models_dir = app_data_dir.join("whisper_models");

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&models_dir)
        .map_err(|e| format!("Failed to create models directory: {}", e))?;

    Ok(models_dir)
}

#[command]
pub async fn list_available_models(app: AppHandle) -> Result<Vec<ModelInfo>, String> {
    let models_dir = get_models_dir(&app)?;

    let mut models = Vec::new();

    for (name, _url, size) in WHISPER_MODELS {
        let model_path = models_dir.join(format!("ggml-{}.bin", name));
        let downloaded = model_path.exists();

        models.push(ModelInfo {
            name: name.to_string(),
            size: size.to_string(),
            downloaded,
            path: if downloaded {
                Some(model_path.to_string_lossy().to_string())
            } else {
                None
            },
        });
    }

    Ok(models)
}

#[command]
pub async fn download_whisper_model(app: AppHandle, model_name: String) -> Result<String, String> {
    // Find the model URL
    let model_info = WHISPER_MODELS
        .iter()
        .find(|(name, _, _)| *name == model_name)
        .ok_or_else(|| format!("Model '{}' not found", model_name))?;

    let (_name, url, _size) = model_info;
    let models_dir = get_models_dir(&app)?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model_name));

    // Check if already downloaded
    if model_path.exists() {
        return Ok(model_path.to_string_lossy().to_string());
    }

    // Download the model with progress tracking
    let client = reqwest::Client::new();
    let response = client
        .get(*url)
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
                model: model_name.clone(),
            };

            let _ = app.emit("whisper-download-progress", progress);
        }
    }

    // Emit final progress
    let progress = DownloadProgress {
        downloaded,
        total: total_size,
        percentage: 100.0,
        model: model_name.clone(),
    };
    let _ = app.emit("whisper-download-progress", progress);

    file.flush()
        .await
        .map_err(|e| format!("Error flushing file: {}", e))?;

    Ok(model_path.to_string_lossy().to_string())
}

#[command]
pub async fn delete_whisper_model(app: AppHandle, model_name: String) -> Result<(), String> {
    let models_dir = get_models_dir(&app)?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model_name));

    if model_path.exists() {
        std::fs::remove_file(&model_path).map_err(|e| format!("Failed to delete model: {}", e))?;
    }

    Ok(())
}

#[command]
pub async fn get_model_path(app: AppHandle, model_name: String) -> Result<Option<String>, String> {
    let models_dir = get_models_dir(&app)?;
    let model_path = models_dir.join(format!("ggml-{}.bin", model_name));

    if model_path.exists() {
        Ok(Some(model_path.to_string_lossy().to_string()))
    } else {
        Ok(None)
    }
}
