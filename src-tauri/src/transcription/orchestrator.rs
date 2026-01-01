use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{command, AppHandle, Emitter, State};
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;
use uuid::Uuid;

use crate::clipboard_utils;
use crate::models::whisper_manager::WhisperManager;
use crate::secure_storage;

use super::{
    apple_speech, elevenlabs_transcription, google_transcription, local_whisper,
    openai_transcription,
};

// Global state for debouncing paste operations
static LAST_PASTE_TIME: std::sync::Mutex<Option<Instant>> = std::sync::Mutex::new(None);

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionRecord {
    pub id: String,
    pub text: String,
    pub timestamp: i64,
    pub duration: Option<f64>,
    pub word_count: usize,
    pub model_id: String,
    pub provider: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TranscribeRequest {
    pub audio_data: Vec<u8>,
    pub timestamp: i64,
    pub duration: Option<f64>,
    pub language: Option<String>, // ISO 639-1 language code (e.g., "en", "es", "fr")
}

/// Unified transcription command that handles the entire flow:
/// 1. Get selected model from store
/// 2. Transcribe using appropriate provider
/// 3. Save transcription to store
/// 4. Copy and paste text
/// 5. Emit events for UI updates
#[command]
pub async fn transcribe_and_process(
    request: TranscribeRequest,
    app: AppHandle,
    whisper_state: State<'_, Arc<Mutex<WhisperManager>>>,
) -> Result<TranscriptionRecord, String> {
    // Step 1: Get selected model from store
    let selected_model = get_selected_model(&app)?;

    // Step 2: Transcribe using appropriate provider
    let transcription_text = transcribe_with_provider(
        &app,
        request.audio_data,
        &selected_model,
        request.language,
        whisper_state,
    )
    .await?;

    // Step 3: Create transcription record
    let word_count = transcription_text.split_whitespace().count();
    let record = TranscriptionRecord {
        id: Uuid::new_v4().to_string(),
        text: transcription_text.clone(),
        timestamp: request.timestamp,
        duration: request.duration,
        word_count,
        model_id: selected_model.id,
        provider: selected_model.provider,
    };

    // Step 4: Save transcription to store
    save_transcription(&app, &record)?;

    // Step 5: Copy and paste text
    if let Err(e) = clipboard_utils::copy_and_paste(record.text.clone()).await {
        eprintln!("Failed to copy and paste: {}", e);
        // Don't fail the whole operation if copy/paste fails
    }

    // Step 6: Emit events for UI updates
    app.emit("transcriptions-changed", ())
        .map_err(|e| format!("Failed to emit sync event: {}", e))?;

    Ok(record)
}

/// Get the selected model from the models store
fn get_selected_model(app: &AppHandle) -> Result<SelectedModel, String> {
    let store = app
        .store("models.json")
        .map_err(|e| format!("Failed to get models store: {}", e))?;

    let models_value = store.get("models").ok_or("No models found in store")?;
    let models = models_value.as_array().ok_or("Models is not an array")?;

    // Find the selected model
    for model_value in models {
        let model = model_value.as_object().ok_or("Model is not an object")?;

        let is_selected = model
            .get("isSelected")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if is_selected {
            let id = model
                .get("id")
                .and_then(|v| v.as_str())
                .ok_or("Model ID not found")?
                .to_string();

            let provider = model
                .get("provider")
                .and_then(|v| v.as_str())
                .ok_or("Model provider not found")?
                .to_string();

            let path = model.get("path").and_then(|v| v.as_str()).map(String::from);

            return Ok(SelectedModel { id, provider, path });
        }
    }

    Err("No model is selected".to_string())
}

/// Save transcription to the transcriptions store
fn save_transcription(app: &AppHandle, record: &TranscriptionRecord) -> Result<(), String> {
    let store = app
        .store("transcriptions.json")
        .map_err(|e| format!("Failed to get transcriptions store: {}", e))?;

    // Get existing transcriptions or create empty array
    let mut transcriptions = store
        .get("transcriptions")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    // Add new transcription at the beginning (newest first)
    transcriptions.insert(
        0,
        serde_json::to_value(record).map_err(|e| format!("Failed to serialize: {}", e))?,
    );

    // Save back to store
    store.set("transcriptions", Value::Array(transcriptions));

    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}

/// Get the last (most recent) transcript from the store
#[command]
pub async fn get_last_transcript(app: AppHandle) -> Result<String, String> {
    let store = app
        .store("transcriptions.json")
        .map_err(|e| format!("Failed to get transcriptions store: {}", e))?;

    // Get transcriptions array and clone it to avoid lifetime issues
    let transcriptions = store
        .get("transcriptions")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No transcriptions found")?;

    // Get the first item (most recent)
    let last_transcript = transcriptions
        .first()
        .ok_or("No transcriptions available")?;

    // Extract the text field
    let text = last_transcript
        .get("text")
        .and_then(|v| v.as_str())
        .ok_or("Transcript text not found")?;

    Ok(text.to_string())
}

/// Paste the last transcript using the clipboard
#[command]
pub async fn paste_last_transcript(app: AppHandle) -> Result<(), String> {
    // Debounce: prevent rapid repeated calls (within 500ms)
    const DEBOUNCE_DURATION: Duration = Duration::from_millis(500);

    {
        let mut last_time = LAST_PASTE_TIME
            .lock()
            .map_err(|e| format!("Failed to lock paste time: {}", e))?;

        let now = Instant::now();

        if let Some(last) = *last_time {
            if now.duration_since(last) < DEBOUNCE_DURATION {
                println!("Paste triggered too soon, debouncing");
                return Ok(());
            }
        }

        *last_time = Some(now);
    }

    println!("Pasting last transcript");

    // Get the last transcript
    let text = get_last_transcript(app).await?;

    // Copy and paste it
    clipboard_utils::copy_and_paste(text)
        .await
        .map_err(|e| format!("Failed to paste transcript: {}", e))?;

    Ok(())
}

/// Route transcription to the appropriate provider
async fn transcribe_with_provider(
    app: &AppHandle,
    audio_data: Vec<u8>,
    model: &SelectedModel,
    language: Option<String>,
    whisper_state: State<'_, Arc<Mutex<WhisperManager>>>,
) -> Result<String, String> {
    let response = match model.provider.as_str() {
        "openai" => {
            let api_key = secure_storage::get_api_key_internal(app, &model.id)
                .await
                .map_err(|_| "OpenAI API key not found. Please add your API key in settings.")?;

            openai_transcription::transcribe_with_openai(
                audio_data,
                api_key,
                Some(model.id.clone()),
                language.clone(), // Use selected language
                None,             // temperature
            )
            .await?
        }
        "google" => {
            let api_key = secure_storage::get_api_key_internal(app, &model.id)
                .await
                .map_err(|_| "Google API key not found. Please add your API key in settings.")?;

            // Convert ISO 639-1 code to Google's format (e.g., "en" -> "en-US")
            let google_language = language
                .clone()
                .map(|lang| format!("{}-US", lang.to_uppercase()))
                .or(Some("en-US".to_string()));

            google_transcription::transcribe_with_google(audio_data, api_key, google_language)
                .await?
        }
        "apple" => {
            // Convert ISO 639-1 code to Apple's format (e.g., "en" -> "en-US")
            let apple_language = language
                .clone()
                .map(|lang| format!("{}-US", lang.to_uppercase()))
                .or(Some("en-US".to_string()));

            apple_speech::transcribe_audio_bytes(audio_data, apple_language).await?
        }
        "local-whisper" => {
            local_whisper::transcribe_with_local_whisper(
                audio_data,
                Some(model.id.clone()),
                language.clone(), // Use selected language
                whisper_state,
            )
            .await?
        }
        "elevenlabs" => {
            let api_key = secure_storage::get_api_key_internal(app, &model.id)
                .await
                .map_err(|_| {
                    "ElevenLabs API key not found. Please add your API key in settings."
                })?;

            elevenlabs_transcription::transcribe_with_elevenlabs(
                audio_data,
                api_key,
                Some(model.id.clone()),
                None, // language
            )
            .await?
        }
        _ => return Err(format!("Unsupported provider: {}", model.provider)),
    };

    Ok(response.text)
}

#[derive(Debug, Clone)]
struct SelectedModel {
    id: String,
    provider: String,
    path: Option<String>,
}
