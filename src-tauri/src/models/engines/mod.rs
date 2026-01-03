use serde::{Deserialize, Serialize};

pub mod whisper;

/// Status of a local model engine
#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ModelStatus {
    Stopped,
    Loading,
    Ready,
    Error,
}

/// Configuration for loading a model
#[derive(Debug, Clone)]
pub struct ModelConfig {
    pub model_path: String,
    pub model_name: String,
    pub language: Option<String>,
}

/// Information about a loaded model
#[derive(Debug, Clone)]
pub struct ModelInfo {
    pub name: String,
    pub path: String,
    pub engine_type: String,
}

/// Common interface for all local model engines
///
/// Any local model (Whisper, Llama, Mistral, etc.) must implement this trait
/// to be managed by the LocalModelManager
pub trait LocalModelEngine: Send + Sync {
    /// Load a model into memory
    fn load_model(&mut self, config: ModelConfig) -> Result<(), String>;

    /// Unload the currently loaded model from memory
    fn unload_model(&mut self);

    /// Process audio data and return transcription
    ///
    /// Note: For non-transcription models (like LLMs), this might be used differently
    /// or they might implement a different trait in the future
    fn transcribe(
        &mut self,
        audio_data: Vec<u8>,
        language: Option<String>,
    ) -> Result<String, String>;

    /// Get current status of the engine
    fn get_status(&self) -> ModelStatus;

    /// Get information about the currently loaded model (if any)
    fn get_loaded_model_info(&self) -> Option<ModelInfo>;

    /// Get the engine type identifier (e.g., "whisper", "llama")
    fn engine_type(&self) -> &'static str;
}
