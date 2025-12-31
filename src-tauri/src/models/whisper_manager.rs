use serde::{Deserialize, Serialize};
use std::fmt;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

/// Represents the current status of the Whisper model
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ModelStatus {
    Stopped,
    Loading,
    Ready,
    Error,
}

/// Error types for Whisper operations
#[derive(Debug)]
pub enum WhisperError {
    ModelNotFound,
    ModelLoadFailed(String),
    OutOfMemory,
    TranscriptionFailed(String),
    InvalidAudioFormat,
    NoModelLoaded,
    ModelNotReady,
}

impl fmt::Display for WhisperError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            WhisperError::ModelNotFound => write!(f, "Model file not found"),
            WhisperError::ModelLoadFailed(e) => write!(f, "Failed to load model: {}", e),
            WhisperError::OutOfMemory => {
                write!(f, "Out of memory - try a smaller model (tiny or base)")
            }
            WhisperError::TranscriptionFailed(e) => write!(f, "Transcription failed: {}", e),
            WhisperError::InvalidAudioFormat => write!(f, "Invalid audio format"),
            WhisperError::NoModelLoaded => write!(f, "No model is currently loaded"),
            WhisperError::ModelNotReady => write!(f, "Model is not ready for transcription"),
        }
    }
}

impl std::error::Error for WhisperError {}

/// Represents a loaded Whisper model instance
pub struct LoadedModel {
    pub name: String,
    pub path: String,
    pub context: WhisperContext,
}

/// Manages the lifecycle of Whisper models
///
/// This manager maintains a single loaded model in memory and provides
/// methods for loading, unloading, and using the model for transcription.
pub struct WhisperManager {
    current_model: Option<LoadedModel>,
    status: ModelStatus,
}

impl WhisperManager {
    /// Creates a new WhisperManager with no model loaded
    pub fn new() -> Self {
        Self {
            current_model: None,
            status: ModelStatus::Stopped,
        }
    }

    /// Returns the current status of the manager
    pub fn get_status(&self) -> ModelStatus {
        self.status.clone()
    }

    /// Returns the name of the currently loaded model, if any
    pub fn get_loaded_model_name(&self) -> Option<String> {
        self.current_model.as_ref().map(|m| m.name.clone())
    }

    /// Loads a Whisper model into memory
    ///
    /// # Arguments
    /// * `model_name` - The name of the model (e.g., "tiny", "base", "small", "medium")
    /// * `model_path` - The full path to the model file
    ///
    /// # Returns
    /// * `Ok(())` if the model was loaded successfully
    /// * `Err(WhisperError)` if loading failed
    pub fn load_model(
        &mut self,
        model_name: String,
        model_path: String,
    ) -> Result<(), WhisperError> {
        // Unload any existing model first
        if self.current_model.is_some() {
            self.unload_model();
        }

        self.status = ModelStatus::Loading;

        // Check if model file exists
        if !std::path::Path::new(&model_path).exists() {
            self.status = ModelStatus::Error;
            return Err(WhisperError::ModelNotFound);
        }

        // Load whisper model with default parameters
        let ctx_params = WhisperContextParameters::default();

        let context = WhisperContext::new_with_params(&model_path, ctx_params).map_err(|e| {
            self.status = ModelStatus::Error;
            let error_msg = e.to_string();

            // Provide user-friendly error messages
            if error_msg.contains("memory") || error_msg.contains("allocation") {
                WhisperError::OutOfMemory
            } else {
                WhisperError::ModelLoadFailed(error_msg)
            }
        })?;

        self.current_model = Some(LoadedModel {
            name: model_name,
            path: model_path,
            context,
        });

        self.status = ModelStatus::Ready;
        Ok(())
    }

    /// Unloads the current model from memory
    pub fn unload_model(&mut self) {
        self.current_model = None;
        self.status = ModelStatus::Stopped;
    }

    /// Transcribes audio using the loaded model
    ///
    /// # Arguments
    /// * `audio_data` - Audio samples as f32 values (normalized to -1.0 to 1.0)
    /// * `language` - Optional language code (e.g., "en", "es", "fr")
    ///
    /// # Returns
    /// * `Ok(String)` containing the transcribed text
    /// * `Err(WhisperError)` if transcription failed
    pub fn transcribe(
        &mut self,
        audio_data: Vec<f32>,
        language: Option<String>,
    ) -> Result<String, WhisperError> {
        // Ensure a model is loaded
        let model = self
            .current_model
            .as_mut()
            .ok_or(WhisperError::NoModelLoaded)?;

        // Ensure model is ready
        if self.status != ModelStatus::Ready {
            return Err(WhisperError::ModelNotReady);
        }

        // Create transcription parameters
        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });

        // Set language if provided
        if let Some(ref lang) = language {
            params.set_language(Some(lang));
        }

        // Disable printing to stdout
        params.set_print_progress(false);
        params.set_print_special(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);

        // Create a state for transcription
        let mut state = model
            .context
            .create_state()
            .map_err(|e| WhisperError::TranscriptionFailed(e.to_string()))?;

        // Run transcription
        state
            .full(params, &audio_data)
            .map_err(|e| WhisperError::TranscriptionFailed(e.to_string()))?;

        // Collect all text segments using iterator
        let mut full_text = String::new();
        for segment in state.as_iter() {
            let text = segment
                .to_str()
                .map_err(|e| WhisperError::TranscriptionFailed(e.to_string()))?;
            full_text.push_str(text.trim());
            full_text.push(' ');
        }

        Ok(full_text.trim().to_string())
    }
}

impl Default for WhisperManager {
    fn default() -> Self {
        Self::new()
    }
}
