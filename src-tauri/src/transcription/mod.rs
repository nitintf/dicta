pub mod elevenlabs_transcription;
pub mod google_transcription;
pub mod local_whisper;
pub mod openai_transcription;
pub mod orchestrator;

pub use orchestrator::{get_last_transcript, paste_last_transcript, transcribe_and_process};

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
