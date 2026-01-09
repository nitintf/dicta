use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/models/types/generated/")]
#[serde(rename_all = "lowercase")]
pub enum ModelType {
    Cloud,
    Local,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/models/types/generated/")]
#[serde(rename_all = "kebab-case")]
pub enum ModelPurpose {
    SpeechToText,
    PostProcessing,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/models/types/generated/")]
pub enum ModelProvider {
    #[serde(rename = "openai")]
    OpenAI,
    #[serde(rename = "anthropic")]
    Anthropic,
    #[serde(rename = "google")]
    Google,
    #[serde(rename = "assemblyai")]
    AssemblyAI,
    #[serde(rename = "elevenlabs")]
    ElevenLabs,
    #[serde(rename = "local-whisper")]
    LocalWhisper,
    #[serde(rename = "ollama")]
    Ollama,
    #[serde(rename = "lmstudio")]
    LMStudio,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/models/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct ModelDefinition {
    pub id: String,
    pub name: String,
    pub provider: ModelProvider,
    #[serde(rename = "type")]
    pub model_type: ModelType,
    pub purpose: ModelPurpose,
    /// Engine type for local models (e.g., "whisper", "llama")
    /// None for cloud models
    pub engine: Option<String>,
    pub size: Option<String>,
    pub requires_api_key: bool,
    pub is_selected: bool,
    pub is_downloaded: Option<bool>,
    pub path: Option<String>,
    pub description: Option<String>,
    /// Download URL for local models
    pub download_url: Option<String>,
    /// Filename to save the model as (for local models)
    pub filename: Option<String>,
}

// Speech-to-Text cloud models
const STT_CLOUD_MODELS: &[(&str, &str, &str, &str)] = &[
    (
        "whisper-1",
        "Whisper",
        "openai",
        "OpenAI Whisper - Fast and accurate speech recognition",
    ),
    (
        "google-cloud-speech",
        "Cloud Speech-to-Text",
        "google",
        "Google Cloud Speech-to-Text API - High accuracy transcription",
    ),
    (
        "scribe_v1",
        "Scribe V1",
        "elevenlabs",
        "ElevenLabs Scribe - High-quality speech-to-text with multilingual support",
    ),
];

// Post-Processing cloud models
const POST_PROCESSING_CLOUD_MODELS: &[(&str, &str, &str, &str)] = &[
    (
        "claude-3-5-sonnet-20241022",
        "Claude 3.5 Sonnet",
        "anthropic",
        "Anthropic's most intelligent model - excellent for text enhancement and formatting",
    ),
    (
        "claude-3-5-haiku-20241022",
        "Claude 3.5 Haiku",
        "anthropic",
        "Fastest Claude model - great for quick post-processing",
    ),
    (
        "gpt-4o",
        "GPT-4o",
        "openai",
        "OpenAI's most advanced model - powerful text processing and enhancement",
    ),
    (
        "gpt-4o-mini",
        "GPT-4o Mini",
        "openai",
        "Affordable and fast OpenAI model - good for basic post-processing",
    ),
];

// Local Whisper models
pub const WHISPER_MODELS: &[(&str, &str, &str)] = &[
    (
        "tiny",
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
        "75 MB",
    ),
    (
        "base",
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
        "142 MB",
    ),
    (
        "small",
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
        "466 MB",
    ),
    (
        "medium",
        "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-medium.bin",
        "1.5 GB",
    ),
];

#[command]
pub async fn get_all_models(app: AppHandle) -> Result<Vec<ModelDefinition>, String> {
    let mut models = Vec::new();

    // Add speech-to-text cloud models
    for (id, name, provider, description) in STT_CLOUD_MODELS {
        models.push(ModelDefinition {
            id: id.to_string(),
            name: name.to_string(),
            provider: match *provider {
                "openai" => ModelProvider::OpenAI,
                "google" => ModelProvider::Google,
                "assemblyai" => ModelProvider::AssemblyAI,
                "elevenlabs" => ModelProvider::ElevenLabs,
                _ => continue,
            },
            model_type: ModelType::Cloud,
            purpose: ModelPurpose::SpeechToText,
            engine: None, // Cloud models don't use local engines
            size: None,
            requires_api_key: true,
            is_selected: false,
            is_downloaded: None,
            path: None,
            description: Some(description.to_string()),
            download_url: None,
            filename: None,
        });
    }

    // Add post-processing cloud models
    for (id, name, provider, description) in POST_PROCESSING_CLOUD_MODELS {
        models.push(ModelDefinition {
            id: id.to_string(),
            name: name.to_string(),
            provider: match *provider {
                "anthropic" => ModelProvider::Anthropic,
                "openai" => ModelProvider::OpenAI,
                _ => continue,
            },
            model_type: ModelType::Cloud,
            purpose: ModelPurpose::PostProcessing,
            engine: None,
            size: None,
            requires_api_key: true,
            is_selected: false,
            is_downloaded: None,
            path: None,
            description: Some(description.to_string()),
            download_url: None,
            filename: None,
        });
    }

    // Add local Whisper models with download status
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let whisper_dir = app_data_dir.join("local_models").join("whisper");

    for (name, url, size) in WHISPER_MODELS {
        let filename = format!("ggml-{}.bin", name);
        let model_path = whisper_dir.join(&filename);
        let downloaded = model_path.exists();

        let model_name = format!(
            "Whisper {}",
            name.chars().next().unwrap().to_uppercase().to_string() + &name[1..]
        );

        models.push(ModelDefinition {
            id: format!("whisper-{}", name),
            name: model_name.clone(),
            provider: ModelProvider::LocalWhisper,
            model_type: ModelType::Local,
            purpose: ModelPurpose::SpeechToText,
            engine: Some("whisper".to_string()), // Uses Whisper engine
            size: Some(size.to_string()),
            requires_api_key: false,
            // Set whisper-tiny as default selected
            is_selected: *name == "tiny",
            is_downloaded: Some(downloaded),
            path: if downloaded {
                Some(model_path.to_string_lossy().to_string())
            } else {
                None
            },
            description: Some(format!(
                "{} model - Runs locally without internet",
                model_name
            )),
            download_url: Some(url.to_string()),
            filename: Some(filename),
        });
    }

    Ok(models)
}
