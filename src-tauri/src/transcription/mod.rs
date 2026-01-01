pub mod apple_speech;
pub mod google_transcription;
pub mod local_whisper;
pub mod openai_transcription;
pub mod orchestrator;

pub use apple_speech::transcribe_with_apple_speech;
pub use google_transcription::transcribe_with_google;
pub use local_whisper::{check_whisper_available, transcribe_with_local_whisper};
pub use openai_transcription::transcribe_with_openai;
pub use orchestrator::transcribe_and_process;

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
