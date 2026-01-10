use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::sync::Arc;
use std::time::{Duration, Instant};
use tauri::{command, AppHandle, Emitter, State};
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

use crate::features::clipboard;
use crate::features::models::LocalModelManager;
use crate::features::security;
use crate::utils::app_categorization::{categorize_app, AppCategory};

use super::orchestrator_helpers::{
    apply_ai_post_processing, create_empty_prompt_context, get_model_name,
};
use super::providers::{elevenlabs, google, local_whisper, openai};
use crate::features::recordings::metadata::RecordingMetadata;
use crate::features::recordings::storage::{get_all_recordings, read_metadata, save_metadata};

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
    pub recording_device: Option<String>,
}

/// Unified transcription command that handles the entire flow:
/// 1. Get selected model and focused app
/// 2. Transcribe using appropriate provider
/// 3. Apply AI post-processing if enabled
/// 4. Save to recordings/TIMESTAMP/ folder
/// 5. Copy and paste text
/// 6. Emit events for UI updates
#[command]
pub async fn transcribe_and_process(
    request: TranscribeRequest,
    app: AppHandle,
    local_model_state: State<'_, Arc<Mutex<LocalModelManager>>>,
) -> Result<Option<TranscriptionRecord>, String> {
    let start_time = Instant::now();

    // Step 1: Get selected transcription model
    let selected_model = get_selected_model(&app)?;

    // Step 2: Get focused application
    let focused_app =
        clipboard::get_focused_app()
            .await
            .unwrap_or_else(|_| clipboard::FocusedApp {
                name: "Unknown".to_string(),
                bundle_id: "".to_string(),
            });
    let focused_app_name = focused_app.name.clone();

    if is_audio_silent(&request.audio_data)? {
        println!("Audio is silent, skipping transcription");

        // Clean up the recording folder since audio is silent
        let recordings_dir = crate::features::recordings::get_recordings_dir(&app)?;
        let recording_folder = recordings_dir.join(request.timestamp.to_string());

        if recording_folder.exists() {
            if let Err(e) = std::fs::remove_dir_all(&recording_folder) {
                log::warn!(
                    "Failed to cleanup recording folder after silent audio detection: {}",
                    e
                );
            } else {
                log::info!("Cleaned up recording folder for silent audio");
            }
        }

        return Ok(None);
    }

    // Step 4: Transcribe using appropriate provider
    let raw_transcription = transcribe_with_provider(
        &app,
        request.audio_data.clone(),
        &selected_model,
        request.language.clone(),
        local_model_state,
    )
    .await?;

    // Skip if transcription is empty
    if raw_transcription.trim().is_empty() {
        println!("Transcription is empty, skipping");
        return Ok(None);
    }

    // Step 5: Get the existing recording folder (already created during start_recording)
    let recordings_dir = crate::features::recordings::get_recordings_dir(&app)?;
    let recording_folder = recordings_dir.join(request.timestamp.to_string());

    // Verify the folder exists (it should have been created during recording)
    if !recording_folder.exists() {
        return Err(format!(
            "Recording folder does not exist: {}",
            recording_folder.display()
        ));
    }

    // Step 6: Check if AI post-processing is enabled
    let settings = get_settings(&app)?;
    let ai_processing_enabled = settings
        .get("aiProcessing")
        .and_then(|a| a.get("enabled"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let (
        final_text,
        post_processed_text,
        style_applied,
        style_category,
        prompt_context,
        post_processing_model_id,
        post_processing_model_name,
        post_processing_provider,
    ) = if ai_processing_enabled {
        // Try to apply AI post-processing
        match apply_ai_post_processing(&app, &raw_transcription, &focused_app.name, &settings).await
        {
            Ok(result) => (
                result.final_text,
                Some(result.post_processed_text),
                result.style_applied,
                result.style_category,
                result.prompt_context,
                Some(result.model_id),
                result.model_name,
                result.provider,
            ),
            Err(e) => {
                // Post-processing failed (likely no model selected) - continue without it
                eprintln!(
                    "Post-processing failed: {}. Continuing with raw transcription.",
                    e
                );

                // Show notification to user
                use tauri_plugin_notification::NotificationExt;
                let _ = app
                    .notification()
                    .builder()
                    .title("Post-processing Skipped")
                    .body("No post-processing model selected. Go to Models to select one.")
                    .show();

                // Use raw transcription
                (
                    raw_transcription.clone(),
                    None,
                    None,
                    None,
                    create_empty_prompt_context(),
                    None,
                    None,
                    None,
                )
            }
        }
    } else {
        // No post-processing
        (
            raw_transcription.clone(),
            None,
            None,
            None,
            create_empty_prompt_context(),
            None,
            None,
            None,
        )
    };

    // Step 8: Calculate processing time
    let processing_time = start_time.elapsed().as_millis() as u64;

    // Step 9: Determine app category
    let app_category = categorize_app(&focused_app.name);

    // Step 10: Create comprehensive metadata
    let metadata = RecordingMetadata::new(
        raw_transcription.clone(),
        final_text.clone(),
        post_processed_text,
        request.timestamp,
        request.duration.unwrap_or(0.0) * 1000.0, // Convert to ms
        processing_time,
        selected_model.id.clone(),
        get_model_name(&selected_model),
        selected_model.provider.clone(),
        post_processing_model_id,
        post_processing_model_name,
        post_processing_provider,
        request.language.unwrap_or_else(|| "en".to_string()),
        request
            .recording_device
            .unwrap_or_else(|| "Unknown".to_string()),
        focused_app_name,
        app_category.as_str().to_string(),
        ai_processing_enabled,
        style_applied,
        style_category,
        prompt_context,
    );

    // Step 11: Save metadata
    save_metadata(&recording_folder, &metadata)?;

    // Step 12: Handle auto-paste/copy
    let auto_paste = settings
        .get("transcription")
        .and_then(|t| t.get("autoPaste"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    let auto_copy_to_clipboard = settings
        .get("transcription")
        .and_then(|t| t.get("autoCopyToClipboard"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);

    if auto_paste {
        app.emit("hide_voice_input", ())
            .map_err(|e| format!("Failed to emit hide event: {}", e))?;

        if let Err(e) = clipboard::copy_and_paste(final_text.clone()).await {
            eprintln!("Failed to copy and paste: {}", e);
        }
    } else if auto_copy_to_clipboard {
        use tauri_plugin_clipboard_manager::ClipboardExt;
        if let Err(e) = app.clipboard().write_text(final_text.clone()) {
            eprintln!("Failed to copy to clipboard: {}", e);
        }
    }

    // Step 13: Emit events for UI updates
    app.emit("transcriptions-changed", ())
        .map_err(|e| format!("Failed to emit sync event: {}", e))?;

    // Return record for backward compatibility
    Ok(Some(TranscriptionRecord {
        id: request.timestamp.to_string(),
        text: final_text,
        timestamp: request.timestamp,
        duration: request.duration,
        word_count: raw_transcription.split_whitespace().count(),
        model_id: selected_model.id,
        provider: selected_model.provider,
    }))
}

/// Get settings from the settings store
fn get_settings(app: &AppHandle) -> Result<Value, String> {
    let store = app
        .store("settings")
        .map_err(|e| format!("Failed to get settings store: {}", e))?;

    let settings = store
        .get("settings")
        .ok_or("No settings found in store")?
        .clone();

    Ok(settings)
}

/// Get the selected speech-to-text model from settings
fn get_selected_model(app: &AppHandle) -> Result<SelectedModel, String> {
    // Get selected model ID from settings
    let settings = get_settings(app)?;
    let selected_model_id = settings
        .get("transcription")
        .and_then(|t| t.get("speechToTextModelId"))
        .and_then(|v| v.as_str())
        .ok_or("No speech-to-text model selected in settings")?;

    // Get the model details from models store
    let models_store = app
        .store("models.json")
        .map_err(|e| format!("Failed to get models store: {}", e))?;

    let models_value = models_store
        .get("models")
        .ok_or("No models found in store")?;
    let models = models_value.as_array().ok_or("Models is not an array")?;

    // Find the model by ID
    for model_value in models {
        let model = model_value.as_object().ok_or("Model is not an object")?;

        let id = model.get("id").and_then(|v| v.as_str()).unwrap_or("");

        if id == selected_model_id {
            let provider = model
                .get("provider")
                .and_then(|v| v.as_str())
                .ok_or("Model provider not found")?
                .to_string();

            let path = model.get("path").and_then(|v| v.as_str()).map(String::from);

            return Ok(SelectedModel {
                id: id.to_string(),
                provider,
                path,
            });
        }
    }

    Err(format!(
        "Model '{}' not found in models store",
        selected_model_id
    ))
}

/// Get the last (most recent) transcript from the new recordings storage
#[command]
pub async fn get_last_transcript(app: AppHandle) -> Result<String, String> {
    // Get all recordings sorted by timestamp (newest first)
    let recordings = get_all_recordings(&app)?;

    if recordings.is_empty() {
        return Err("No recordings found".to_string());
    }

    // Get the first (most recent) recording
    let last_recording = recordings.first().ok_or("No recordings available")?;

    // Read metadata from the recording
    let metadata = read_metadata(last_recording)?;

    Ok(metadata.result)
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
    clipboard::copy_and_paste(text)
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
    local_model_state: State<'_, Arc<Mutex<LocalModelManager>>>,
) -> Result<String, String> {
    let response = match model.provider.as_str() {
        "openai" => {
            let api_key = security::get_api_key_internal(app, &model.id)
                .await
                .map_err(|_| "OpenAI API key not found. Please add your API key in settings.")?;

            openai::transcribe_with_openai(
                audio_data,
                api_key,
                Some(model.id.clone()),
                language.clone(), // Use selected language
                None,             // temperature
            )
            .await?
        }
        "google" => {
            let api_key = security::get_api_key_internal(app, &model.id)
                .await
                .map_err(|_| "Google API key not found. Please add your API key in settings.")?;

            // Convert ISO 639-1 code to Google's format (e.g., "en" -> "en-US")
            let google_language = language
                .clone()
                .map(|lang| format!("{}-US", lang.to_uppercase()))
                .or(Some("en-US".to_string()));

            google::transcribe_with_google(audio_data, api_key, google_language).await?
        }
        "local-whisper" => {
            local_whisper::transcribe_with_local_whisper(
                audio_data,
                Some(model.id.clone()),
                language.clone(), // Use selected language
                local_model_state,
            )
            .await?
        }
        "elevenlabs" => {
            let api_key = security::get_api_key_internal(app, &model.id)
                .await
                .map_err(|_| {
                    "ElevenLabs API key not found. Please add your API key in settings."
                })?;

            elevenlabs::transcribe_with_elevenlabs(
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
pub struct SelectedModel {
    pub id: String,
    pub provider: String,
    pub path: Option<String>,
}

/// Detects if audio is silent by analyzing the waveform
/// Returns true if audio is mostly silent (no speech detected)
fn is_audio_silent(audio_data: &[u8]) -> Result<bool, String> {
    use hound::WavReader;
    use std::io::Cursor;

    // Parse WAV file
    let cursor = Cursor::new(audio_data);
    let mut reader =
        WavReader::new(cursor).map_err(|e| format!("Failed to parse WAV audio: {}", e))?;

    let spec = reader.spec();

    // Read all samples and calculate RMS (Root Mean Square)
    let samples: Vec<f32> = match spec.sample_format {
        hound::SampleFormat::Float => reader
            .samples::<f32>()
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| format!("Failed to read samples: {}", e))?,
        hound::SampleFormat::Int => {
            // Convert i16 samples to f32
            let max_val = i16::MAX as f32;
            reader
                .samples::<i16>()
                .map(|s| s.map(|v| v as f32 / max_val))
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to read samples: {}", e))?
        }
    };

    if samples.is_empty() {
        return Ok(true); // Empty audio is considered silent
    }

    // Calculate RMS
    let sum_squares: f32 = samples.iter().map(|&s| s * s).sum();
    let rms = (sum_squares / samples.len() as f32).sqrt();

    // Also check peak amplitude
    let peak = samples.iter().map(|&s| s.abs()).fold(0.0f32, f32::max);

    // Thresholds for silence detection
    const RMS_THRESHOLD: f32 = 0.01; // Very low RMS indicates silence
    const PEAK_THRESHOLD: f32 = 0.02; // Very low peak indicates silence

    // Audio is considered silent if both RMS and peak are below thresholds
    let is_silent = rms < RMS_THRESHOLD && peak < PEAK_THRESHOLD;

    println!(
        "Audio analysis - RMS: {:.4}, Peak: {:.4}, Silent: {}",
        rms, peak, is_silent
    );

    Ok(is_silent)
}
