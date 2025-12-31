use reqwest::multipart::{Form, Part};
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionSegment {
    pub start: f64,
    pub end: f64,
    pub text: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionResponse {
    pub text: String,
    pub language: Option<String>,
    pub segments: Option<Vec<TranscriptionSegment>>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIError {
    error: OpenAIErrorDetail,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIErrorDetail {
    message: String,
    #[serde(rename = "type")]
    error_type: String,
}

#[command]
pub async fn transcribe_with_openai(
    audio_data: Vec<u8>,
    api_key: String,
    model: Option<String>,
    language: Option<String>,
    temperature: Option<f64>,
) -> Result<TranscriptionResponse, String> {
    let model = model.unwrap_or_else(|| "whisper-1".to_string());

    // Create multipart form
    let audio_part = Part::bytes(audio_data)
        .file_name("audio.wav")
        .mime_str("audio/wav")
        .map_err(|e| format!("Failed to create audio part: {}", e))?;

    let mut form = Form::new()
        .part("file", audio_part)
        .text("model", model)
        .text("response_format", "verbose_json");

    if let Some(lang) = language {
        form = form.text("language", lang);
    }

    if let Some(temp) = temperature {
        form = form.text("temperature", temp.to_string());
    }

    // Make request to OpenAI API
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/audio/transcriptions")
        .header("Authorization", format!("Bearer {}", api_key))
        .multipart(form)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    let status = response.status();
    let response_text = response
        .text()
        .await
        .map_err(|e| format!("Failed to read response: {}", e))?;

    if !status.is_success() {
        // Try to parse error response
        if let Ok(error) = serde_json::from_str::<OpenAIError>(&response_text) {
            return Err(format!(
                "OpenAI API error ({}): {}",
                status, error.error.message
            ));
        }
        return Err(format!(
            "OpenAI API request failed with status {}: {}",
            status, response_text
        ));
    }

    // Parse successful response
    let transcription: TranscriptionResponse = serde_json::from_str(&response_text)
        .map_err(|e| format!("Failed to parse transcription response: {}", e))?;

    Ok(transcription)
}
