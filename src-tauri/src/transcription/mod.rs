pub mod apple_speech;
pub mod google_transcription;
pub mod local_whisper;
pub mod openai_transcription;
pub mod whisper_lifecycle;

pub use apple_speech::transcribe_with_apple_speech;
pub use google_transcription::transcribe_with_google;
pub use local_whisper::{check_whisper_available, transcribe_with_local_whisper};
pub use openai_transcription::transcribe_with_openai;
pub use whisper_lifecycle::{
    get_whisper_model_status, start_whisper_model, stop_whisper_model, WhisperState,
};
