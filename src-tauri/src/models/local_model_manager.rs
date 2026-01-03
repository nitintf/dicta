use std::collections::HashMap;

use super::engines::{
    whisper::WhisperEngine, LocalModelEngine, ModelConfig, ModelInfo, ModelStatus,
};

/// Generic manager for all local model engines
///
/// This manager can handle any type of local model (Whisper, Llama, Mistral, etc.)
/// as long as they implement the LocalModelEngine trait.
///
/// The manager maintains a registry of available engines and routes commands
/// to the appropriate engine based on the model's engine type.
pub struct LocalModelManager {
    /// Available engine instances
    engines: HashMap<String, Box<dyn LocalModelEngine>>,

    /// Currently active engine type (if any)
    active_engine: Option<String>,
}

impl LocalModelManager {
    /// Creates a new LocalModelManager with all available engines registered
    pub fn new() -> Self {
        let mut engines: HashMap<String, Box<dyn LocalModelEngine>> = HashMap::new();

        // Register Whisper engine
        engines.insert("whisper".to_string(), Box::new(WhisperEngine::new()));

        // Future engines can be registered here:
        // engines.insert("llama".to_string(), Box::new(LlamaEngine::new()));
        // engines.insert("mistral".to_string(), Box::new(MistralEngine::new()));

        Self {
            engines,
            active_engine: None,
        }
    }

    /// Load a model using the specified engine
    ///
    /// # Arguments
    /// * `engine_type` - The engine to use (e.g., "whisper", "llama")
    /// * `config` - Configuration for loading the model
    ///
    /// # Returns
    /// * `Ok(())` if the model was loaded successfully
    /// * `Err(String)` if loading failed
    pub fn load_model(&mut self, engine_type: &str, config: ModelConfig) -> Result<(), String> {
        // Check that the engine exists first
        if !self.engines.contains_key(engine_type) {
            return Err(format!("Unknown engine type: {}", engine_type));
        }

        // Unload any currently active model
        if let Some(active) = &self.active_engine {
            if active != engine_type {
                if let Some(active_engine) = self.engines.get_mut(active) {
                    active_engine.unload_model();
                }
            }
        }

        // Get the engine and load the new model
        let engine = self
            .engines
            .get_mut(engine_type)
            .ok_or_else(|| format!("Unknown engine type: {}", engine_type))?;

        engine.load_model(config)?;

        self.active_engine = Some(engine_type.to_string());
        Ok(())
    }

    /// Unload the currently active model
    pub fn unload_model(&mut self) {
        if let Some(active) = &self.active_engine {
            if let Some(engine) = self.engines.get_mut(active) {
                engine.unload_model();
            }
            self.active_engine = None;
        }
    }

    /// Transcribe audio using the currently active engine
    ///
    /// # Arguments
    /// * `audio_data` - Raw audio data
    /// * `language` - Optional language code
    ///
    /// # Returns
    /// * `Ok(String)` containing the transcription
    /// * `Err(String)` if transcription failed or no model is loaded
    pub fn transcribe(
        &mut self,
        audio_data: Vec<u8>,
        language: Option<String>,
    ) -> Result<String, String> {
        let active = self
            .active_engine
            .as_ref()
            .ok_or("No model is currently loaded")?;

        let engine = self
            .engines
            .get_mut(active)
            .ok_or("Active engine not found")?;

        engine.transcribe(audio_data, language)
    }

    /// Get the current status of the active engine
    pub fn get_status(&self) -> ModelStatus {
        if let Some(active) = &self.active_engine {
            if let Some(engine) = self.engines.get(active) {
                return engine.get_status();
            }
        }
        ModelStatus::Stopped
    }

    /// Get information about the currently loaded model
    pub fn get_loaded_model_info(&self) -> Option<ModelInfo> {
        if let Some(active) = &self.active_engine {
            if let Some(engine) = self.engines.get(active) {
                return engine.get_loaded_model_info();
            }
        }
        None
    }

    /// Get the name of the currently loaded model (if any)
    pub fn get_loaded_model_name(&self) -> Option<String> {
        self.get_loaded_model_info().map(|info| info.name)
    }

    /// Check if a specific engine type is available
    pub fn has_engine(&self, engine_type: &str) -> bool {
        self.engines.contains_key(engine_type)
    }

    /// Get the currently active engine type
    pub fn get_active_engine_type(&self) -> Option<&String> {
        self.active_engine.as_ref()
    }
}

impl Default for LocalModelManager {
    fn default() -> Self {
        Self::new()
    }
}
