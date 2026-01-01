use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelType {
    Cloud,
    Local,
    Apple,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ModelProvider {
    #[serde(rename = "openai")]
    OpenAI,
    #[serde(rename = "google")]
    Google,
    #[serde(rename = "assemblyai")]
    AssemblyAI,
    #[serde(rename = "elevenlabs")]
    ElevenLabs,
    #[serde(rename = "apple")]
    Apple,
    #[serde(rename = "local-whisper")]
    LocalWhisper,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelDefinition {
    pub id: String,
    pub name: String,
    pub provider: ModelProvider,
    #[serde(rename = "type")]
    pub model_type: ModelType,
    pub size: Option<String>,
    pub requires_api_key: bool,
    pub is_selected: bool,
    pub is_enabled: bool,
    pub is_downloaded: Option<bool>,
    pub path: Option<String>,
    pub description: Option<String>,
}

// Cloud models
const CLOUD_MODELS: &[(&str, &str, &str, &str)] = &[
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

fn get_models_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let models_dir = app_data_dir.join("whisper_models");

    std::fs::create_dir_all(&models_dir)
        .map_err(|e| format!("Failed to create models directory: {}", e))?;

    Ok(models_dir)
}

#[command]
pub async fn get_all_models(app: AppHandle) -> Result<Vec<ModelDefinition>, String> {
    let mut models = Vec::new();

    // Add cloud models
    for (id, name, provider, description) in CLOUD_MODELS {
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
            size: None,
            requires_api_key: true,
            is_selected: false,
            is_enabled: true,
            is_downloaded: None,
            path: None,
            description: Some(description.to_string()),
        });
    }

    // Add local Whisper models with download status
    let models_dir = get_models_dir(&app)?;

    for (name, _url, size) in WHISPER_MODELS {
        let model_path = models_dir.join(format!("ggml-{}.bin", name));
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
            size: Some(size.to_string()),
            requires_api_key: false,
            is_selected: false,
            is_enabled: true,
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
        });
    }

    // Add Apple Speech Recognition
    models.push(ModelDefinition {
        id: "apple-speech".to_string(),
        name: "Apple Speech Recognition".to_string(),
        provider: ModelProvider::Apple,
        model_type: ModelType::Apple,
        size: None,
        requires_api_key: false,
        is_selected: true, // Default selected
        is_enabled: true,
        is_downloaded: None,
        path: None,
        description: Some("Built-in macOS speech recognition - works offline".to_string()),
    });

    Ok(models)
}
