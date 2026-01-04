pub mod elevenlabs;
pub mod google;
pub mod local_whisper;
pub mod openai;

// Common transcription response type
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionResponse {
    pub text: String,
    pub language: Option<String>,
    pub segments: Option<Vec<TranscriptionSegment>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TranscriptionSegment {
    pub start: f64,
    pub end: f64,
    pub text: String,
}
