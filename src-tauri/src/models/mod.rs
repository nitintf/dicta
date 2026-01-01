pub mod local_model_commands;
pub mod models_registry;
pub mod whisper_download;
pub mod whisper_manager;

pub use local_model_commands::{get_local_model_status, start_local_model, stop_local_model};
pub use models_registry::get_all_models;
pub use whisper_download::{delete_whisper_model, download_whisper_model};
pub use whisper_manager::WhisperManager;
