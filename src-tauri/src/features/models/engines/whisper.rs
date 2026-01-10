use std::fmt;
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext, WhisperContextParameters};

use super::{LocalModelEngine, ModelConfig, ModelInfo, ModelStatus};

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
struct LoadedWhisperModel {
    name: String,
    path: String,
    context: WhisperContext,
}

/// Whisper engine implementation
///
/// Manages Whisper models using whisper.cpp bindings
pub struct WhisperEngine {
    current_model: Option<LoadedWhisperModel>,
    status: ModelStatus,
}

impl WhisperEngine {
    /// Creates a new WhisperEngine with no model loaded
    pub fn new() -> Self {
        Self {
            current_model: None,
            status: ModelStatus::Stopped,
        }
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
    fn transcribe_internal(
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

    /// Convert WAV audio bytes to f32 samples and resample to 16kHz for Whisper
    fn convert_audio_to_samples(audio_data: Vec<u8>) -> Result<Vec<f32>, String> {
        use hound::WavReader;
        use std::io::Cursor;

        let cursor = Cursor::new(audio_data);
        let mut reader =
            WavReader::new(cursor).map_err(|e| format!("Failed to parse WAV audio: {}", e))?;

        let spec = reader.spec();
        let input_sample_rate = spec.sample_rate;
        let channels = spec.channels as usize;

        log::info!(
            "Input audio: {} Hz, {} channel(s)",
            input_sample_rate,
            channels
        );

        // Read all samples and convert to f32
        let mut samples: Vec<f32> = match spec.sample_format {
            hound::SampleFormat::Float => reader
                .samples::<f32>()
                .collect::<Result<Vec<_>, _>>()
                .map_err(|e| format!("Failed to read samples: {}", e))?,
            hound::SampleFormat::Int => {
                // Convert i16 samples to f32
                let max_val = i16::MAX as f32;
                reader
                    .samples::<i16>()
                    .map(|s| s.map(|v| v as f32 / max_val))
                    .collect::<Result<Vec<_>, _>>()
                    .map_err(|e| format!("Failed to read samples: {}", e))?
            }
        };

        // If stereo, convert to mono by averaging channels
        if channels == 2 {
            log::info!("Converting stereo to mono");
            samples = samples
                .chunks(2)
                .map(|chunk| (chunk[0] + chunk[1]) / 2.0)
                .collect();
        } else if channels > 2 {
            return Err(format!(
                "Unsupported channel count: {}. Only mono and stereo are supported.",
                channels
            ));
        }

        // Whisper expects 16kHz audio - resample if necessary
        const TARGET_SAMPLE_RATE: u32 = 16000;
        if input_sample_rate != TARGET_SAMPLE_RATE {
            log::info!(
                "Resampling from {} Hz to {} Hz",
                input_sample_rate,
                TARGET_SAMPLE_RATE
            );
            samples = Self::resample_audio(samples, input_sample_rate, TARGET_SAMPLE_RATE)?;
            log::info!("Resampling complete: {} samples", samples.len());
        }

        Ok(samples)
    }

    /// Resample audio from one sample rate to another
    fn resample_audio(
        input: Vec<f32>,
        input_rate: u32,
        output_rate: u32,
    ) -> Result<Vec<f32>, String> {
        use rubato::{
            Resampler, SincFixedIn, SincInterpolationParameters, SincInterpolationType,
            WindowFunction,
        };

        if input.is_empty() {
            return Ok(input);
        }

        // Calculate resampling ratio
        let resample_ratio = output_rate as f64 / input_rate as f64;

        // Create resampler with high quality settings
        let params = SincInterpolationParameters {
            sinc_len: 256,
            f_cutoff: 0.95,
            interpolation: SincInterpolationType::Linear,
            oversampling_factor: 256,
            window: WindowFunction::BlackmanHarris2,
        };

        let mut resampler = SincFixedIn::<f32>::new(
            resample_ratio,
            2.0,
            params,
            input.len(),
            1, // 1 channel (mono)
        )
        .map_err(|e| format!("Failed to create resampler: {}", e))?;

        // Rubato expects Vec<Vec<f32>> where outer vec is channels
        let input_frames = vec![input];

        // Perform resampling
        let output_frames = resampler
            .process(&input_frames, None)
            .map_err(|e| format!("Resampling failed: {}", e))?;

        // Extract mono channel
        Ok(output_frames[0].clone())
    }
}

impl LocalModelEngine for WhisperEngine {
    fn load_model(&mut self, config: ModelConfig) -> Result<(), String> {
        // Unload any existing model first
        if self.current_model.is_some() {
            self.unload_model();
        }

        self.status = ModelStatus::Loading;

        // Check if model file exists
        if !std::path::Path::new(&config.model_path).exists() {
            self.status = ModelStatus::Error;
            return Err("Model file not found".to_string());
        }

        // Load whisper model with default parameters
        let ctx_params = WhisperContextParameters::default();

        let context =
            WhisperContext::new_with_params(&config.model_path, ctx_params).map_err(|e| {
                self.status = ModelStatus::Error;
                let error_msg = e.to_string();

                // Provide user-friendly error messages
                if error_msg.contains("memory") || error_msg.contains("allocation") {
                    "Out of memory - try a smaller model (tiny or base)".to_string()
                } else {
                    format!("Failed to load model: {}", error_msg)
                }
            })?;

        self.current_model = Some(LoadedWhisperModel {
            name: config.model_name,
            path: config.model_path,
            context,
        });

        self.status = ModelStatus::Ready;
        Ok(())
    }

    fn unload_model(&mut self) {
        self.current_model = None;
        self.status = ModelStatus::Stopped;
    }

    fn transcribe(
        &mut self,
        audio_data: Vec<u8>,
        language: Option<String>,
    ) -> Result<String, String> {
        // Convert audio bytes to samples
        let samples = Self::convert_audio_to_samples(audio_data)?;

        // Perform transcription
        self.transcribe_internal(samples, language)
            .map_err(|e| e.to_string())
    }

    fn get_status(&self) -> ModelStatus {
        self.status
    }

    fn get_loaded_model_info(&self) -> Option<ModelInfo> {
        self.current_model.as_ref().map(|m| ModelInfo {
            name: m.name.clone(),
            path: m.path.clone(),
            engine_type: "whisper".to_string(),
        })
    }

    fn engine_type(&self) -> &'static str {
        "whisper"
    }
}

impl Default for WhisperEngine {
    fn default() -> Self {
        Self::new()
    }
}
