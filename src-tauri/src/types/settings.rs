use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Onboarding settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct OnboardingSettings {
    pub completed: bool,
}

/// Voice input settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct VoiceInputSettings {
    pub shortcut: String,
    pub microphone_device_id: Option<String>,
}

/// Transcription settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct TranscriptionSettings {
    pub language: String,
    pub auto_paste: bool,
    pub auto_copy_to_clipboard: bool,
    pub speech_to_text_model_id: Option<String>,
}

/// Shortcuts settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct ShortcutsSettings {
    pub paste_last_transcript: String,
    pub global_shortcuts_enabled: bool,
}

/// System settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct SystemSettings {
    pub show_in_dock: bool,
    pub save_audio_recordings: bool,
}

/// Privacy settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct PrivacySettings {
    pub analytics: bool,
    pub error_logging: bool,
}

/// AI Processing settings
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct AiProcessingSettings {
    pub enabled: bool,
    pub post_processing_model_id: Option<String>,
}

/// Root settings object
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct Settings {
    pub onboarding: OnboardingSettings,
    pub voice_input: VoiceInputSettings,
    pub transcription: TranscriptionSettings,
    pub shortcuts: ShortcutsSettings,
    pub system: SystemSettings,
    pub privacy: PrivacySettings,
    pub ai_processing: AiProcessingSettings,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            onboarding: OnboardingSettings { completed: false },
            voice_input: VoiceInputSettings {
                shortcut: "Alt+Space".to_string(),
                microphone_device_id: None,
            },
            transcription: TranscriptionSettings {
                language: "en".to_string(),
                auto_paste: false,
                auto_copy_to_clipboard: false,
                speech_to_text_model_id: None,
            },
            shortcuts: ShortcutsSettings {
                paste_last_transcript: "CmdOrCtrl+Shift+V".to_string(),
                global_shortcuts_enabled: true,
            },
            system: SystemSettings {
                show_in_dock: true,
                save_audio_recordings: false,
            },
            privacy: PrivacySettings {
                analytics: false,
                error_logging: true,
            },
            ai_processing: AiProcessingSettings {
                enabled: false,
                post_processing_model_id: None,
            },
        }
    }
}
