use std::sync::Arc;
use tauri::{command, State};
use tokio::sync::Mutex;

use super::TranscriptionResponse;
use crate::models::whisper_manager::WhisperManager;

/// Converts WAV audio bytes to f32 samples for whisper-rs
///
/// This function parses the WAV header and converts 16-bit PCM samples
/// to normalized f32 values (-1.0 to 1.0)
fn convert_audio_to_samples(audio_data: Vec<u8>) -> Result<Vec<f32>, String> {
    use hound::WavReader;
    use std::io::Cursor;

    // Create a cursor from the audio bytes
    let cursor = Cursor::new(audio_data);

    // Parse WAV file
    let reader = WavReader::new(cursor).map_err(|e| format!("Failed to parse WAV audio: {}", e))?;

    let spec = reader.spec();

    // Verify it's 16-bit PCM (most common format)
    if spec.bits_per_sample != 16 {
        return Err(format!(
            "Unsupported audio format: expected 16-bit, got {}-bit",
            spec.bits_per_sample
        ));
    }

    // Convert samples to f32
    let samples: Result<Vec<f32>, _> = reader
        .into_samples::<i16>()
        .map(|s| s.map(|sample| sample as f32 / 32768.0))
        .collect();

    samples.map_err(|e| format!("Failed to read audio samples: {}", e))
}

/// Transcribes audio using the loaded local Whisper model
///
/// This command uses the WhisperManager to transcribe audio with the
/// currently loaded model. The model must be started first using
/// `start_whisper_model`.
///
/// # Arguments
/// * `audio_data` - Raw audio bytes in WAV format
/// * `model` - Model name (currently ignored, uses loaded model)
/// * `language` - Optional language code (e.g., "en", "es")
/// * `state` - Shared WhisperManager state
#[command]
pub async fn transcribe_with_local_whisper(
    audio_data: Vec<u8>,
    model: Option<String>,
    language: Option<String>,
    state: State<'_, Arc<Mutex<WhisperManager>>>,
) -> Result<TranscriptionResponse, String> {
    // Note: The model parameter is kept for API compatibility but not used
    // The loaded model from WhisperManager is used instead
    let _ = model;

    // Convert WAV audio to f32 samples
    let samples = convert_audio_to_samples(audio_data)?;

    // Transcribe using the loaded model
    let mut manager = state.lock().await;
    let text = manager
        .transcribe(samples, language.clone())
        .map_err(|e| e.to_string())?;

    Ok(TranscriptionResponse {
        text,
        language,
        segments: None, // Can be enhanced later to return segment information
    })
}
