use serde::{Deserialize, Serialize};

/// Comprehensive metadata for each recording
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecordingMetadata {
    // Core transcription data
    pub result: String,                        // Final processed text
    pub raw_result: String,                    // Original transcription text
    pub post_processed_result: Option<String>, // AI post-processed text (if applied)

    // Timing information
    pub datetime: String,     // ISO 8601 timestamp
    pub duration: f64,        // Duration in milliseconds
    pub processing_time: u64, // Time taken to process in ms

    // Model information
    pub model_key: String,  // Model ID used for transcription
    pub model_name: String, // Human-readable model name
    pub provider: String,   // Provider (openai, google, local-whisper, etc.)

    // Language
    pub language_selected: String, // Language code (e.g., "en")

    // Device information
    pub recording_device: String, // Microphone device ID/name

    // Post-processing context
    pub post_processing_enabled: bool,
    pub style_applied: Option<String>, // Which vibe/style was applied
    pub style_category: Option<String>, // Category (personal/work/email/other)

    // Application context
    pub focused_app_name: String,     // Name of the focused application
    pub focused_app_category: String, // Categorized type (personal/work/email/other)

    // Prompt context (for AI post-processing)
    pub prompt_context: PromptContext,

    // App version
    pub app_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PromptContext {
    pub vocabulary_used: Vec<String>,
    pub snippets_used: Vec<SnippetInfo>,
    pub vibe_prompt: Option<String>,
    pub system_context: SystemContext,
    pub application_context: ApplicationContext,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetInfo {
    pub trigger: String,
    pub expansion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemContext {
    pub language: String,
    pub time: String, // Current time when recording was made
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApplicationContext {
    pub name: String,
    pub category: String,
}

impl RecordingMetadata {
    pub fn new(
        raw_result: String,
        final_result: String,
        post_processed_result: Option<String>,
        timestamp: i64,
        duration: f64,
        processing_time: u64,
        model_key: String,
        model_name: String,
        provider: String,
        language: String,
        recording_device: String,
        focused_app_name: String,
        focused_app_category: String,
        post_processing_enabled: bool,
        style_applied: Option<String>,
        style_category: Option<String>,
        prompt_context: PromptContext,
    ) -> Self {
        use chrono::prelude::*;

        // Convert timestamp to ISO 8601
        let datetime = DateTime::from_timestamp(timestamp / 1000, 0)
            .unwrap_or_else(|| Utc::now())
            .format("%Y-%m-%dT%H:%M:%S")
            .to_string();

        Self {
            result: final_result,
            raw_result,
            post_processed_result,
            datetime,
            duration,
            processing_time,
            model_key,
            model_name,
            provider,
            language_selected: language,
            recording_device,
            post_processing_enabled,
            style_applied,
            style_category,
            focused_app_name,
            focused_app_category,
            prompt_context,
            app_version: env!("CARGO_PKG_VERSION").to_string(),
        }
    }
}
