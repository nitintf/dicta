use reqwest::multipart::{Form, Part};
use serde::{Deserialize, Serialize};
use tauri::command;

use super::TranscriptionResponse;

#[derive(Debug, Serialize, Deserialize)]
struct ElevenLabsError {
    detail: ElevenLabsErrorDetail,
}

#[derive(Debug, Serialize, Deserialize)]
struct ElevenLabsErrorDetail {
    message: String,
    status: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ElevenLabsResponse {
    text: String,
    #[serde(default)]
    language: Option<String>,
}

/// Transcribe audio using ElevenLabs Speech-to-Text API
///
/// API Reference: https://elevenlabs.io/docs/api-reference/speech-to-text
#[command]
pub async fn transcribe_with_elevenlabs(
    audio_data: Vec<u8>,
    api_key: String,
    model: Option<String>,
    language: Option<String>,
) -> Result<TranscriptionResponse, String> {
    // ElevenLabs uses "scribe_v1" model for speech-to-text
    let model_id = model.unwrap_or_else(|| "scribe_v1".to_string());

    // Create multipart form - field must be named "file" per API docs
    let audio_part = Part::bytes(audio_data)
        .file_name("audio.wav")
        .mime_str("audio/wav")
        .map_err(|e| format!("Failed to create audio part: {}", e))?;

    let mut form = Form::new()
        .part("file", audio_part)
        .text("model_id", model_id);

    // Add language if provided
    if let Some(lang) = language {
        form = form.text("language", lang);
    }

    // Make request to ElevenLabs API
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.elevenlabs.io/v1/speech-to-text")
        .header("xi-api-key", api_key)
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to send request to ElevenLabs: {}", e))?;

    let status = response.status();
    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if !status.is_success() {
        // Try to parse error response
        if let Ok(error) = serde_json::from_str::<ElevenLabsError>(&response_text) {
            return Err(format!(
                "ElevenLabs API error ({}): {}",
                status, error.detail.message
            ));
        }
        return Err(format!(
            "ElevenLabs API request failed with status {}: {}",
            status, response_text
        ));
    }

    // Parse successful response
    let elevenlabs_response: ElevenLabsResponse = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse ElevenLabs response: {}", e))?;

    Ok(TranscriptionResponse {
        text: elevenlabs_response.text,
        language: elevenlabs_response.language,
        segments: None, // ElevenLabs doesn't provide segments in basic response
    })
}
