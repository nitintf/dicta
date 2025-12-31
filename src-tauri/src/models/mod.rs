pub mod models_registry;
pub mod whisper_download;
pub mod whisper_manager;

pub use models_registry::{get_all_models, WHISPER_MODELS};
pub use whisper_download::{
    delete_whisper_model, download_whisper_model, get_model_path, list_available_models,
};
pub use whisper_manager::{ModelStatus, WhisperManager};
