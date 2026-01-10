use serde_json::Value;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

use crate::features::ai_processing::{post_process_transcript, PostProcessingRequest, SnippetData};
use crate::features::recordings::metadata::{
    ApplicationContext, PromptContext, SnippetInfo, SystemContext,
};
use crate::utils::app_categorization::{categorize_app, AppCategory};

/// Result of AI post-processing
pub struct PostProcessingResult {
    pub final_text: String,
    pub post_processed_text: String,
    pub style_applied: Option<String>,
    pub style_category: Option<String>,
    pub prompt_context: PromptContext,
    pub model_id: String,
    pub model_name: Option<String>,
    pub provider: Option<String>,
}

/// Apply AI post-processing to transcription
pub async fn apply_ai_post_processing(
    app: &AppHandle,
    raw_text: &str,
    focused_app_name: &str,
    settings: &Value,
) -> Result<PostProcessingResult, String> {
    // Get AI processing settings
    let ai_settings = settings
        .get("aiProcessing")
        .ok_or("AI processing settings not found")?;

    // Get post-processing model ID - if not selected, return error to skip post-processing
    let model_id = match ai_settings
        .get("postProcessingModelId")
        .and_then(|v| v.as_str())
    {
        Some(id) => id.to_string(),
        None => {
            // No model selected - caller should handle this gracefully
            return Err("No post-processing model selected".to_string());
        }
    };

    // Determine app category and get appropriate vibe
    let app_category = categorize_app(focused_app_name);
    let (vibe_name, vibe_prompt) = get_vibe_for_category(app, &app_category)?;

    // Get vocabulary words (always enabled when post-processing is on)
    let vocabulary = get_vocabulary_words(app)?;

    // Get snippets (always used as context for AI)
    let snippets = get_snippets(app)?;

    // Build prompt context for metadata
    let prompt_context = PromptContext {
        vocabulary_used: vocabulary.clone().unwrap_or_default(),
        snippets_used: snippets
            .as_ref()
            .map(|snips_vec| {
                snips_vec
                    .iter()
                    .map(|snip| SnippetInfo {
                        trigger: snip.trigger.clone(),
                        expansion: snip.expansion.clone(),
                    })
                    .collect()
            })
            .unwrap_or_default(),
        vibe_prompt: vibe_prompt.clone(),
        system_context: SystemContext {
            language: "en".to_string(), // TODO: get from settings
            time: chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        },
        application_context: ApplicationContext {
            name: focused_app_name.to_string(),
            category: app_category.as_str().to_string(),
        },
    };

    // Get model details from models store
    let models_store = app
        .store("models.json")
        .map_err(|e| format!("Failed to get models store: {}", e))?;

    let models = models_store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No models found in store")?;

    let (model_name, provider) = models
        .iter()
        .find(|m| {
            m.get("id")
                .and_then(|v| v.as_str())
                .map(|id| id == model_id.as_str())
                .unwrap_or(false)
        })
        .and_then(|model| {
            let name = model.get("name").and_then(|v| v.as_str()).map(String::from);
            let prov = model
                .get("provider")
                .and_then(|v| v.as_str())
                .map(String::from);
            Some((name, prov))
        })
        .unwrap_or((None, None));

    // Call AI post-processing
    let post_processed_text = post_process_transcript(
        PostProcessingRequest {
            text: raw_text.to_string(),
            model_id: model_id.clone(),
            vocabulary,
            snippets,
            vibe_prompt: vibe_prompt.clone(),
        },
        app.clone(),
    )
    .await?;

    crate::utils::logger::debug("Post processing was successful");

    Ok(PostProcessingResult {
        final_text: post_processed_text.clone(),
        post_processed_text,
        style_applied: vibe_name,
        style_category: Some(app_category.as_str().to_string()),
        prompt_context,
        model_id,
        model_name,
        provider,
    })
}

/// Get vocabulary words from store
fn get_vocabulary_words(app: &AppHandle) -> Result<Option<Vec<String>>, String> {
    let store = app
        .store("vocabulary.json")
        .map_err(|e| format!("Failed to get vocabulary store: {}", e))?;

    let words_value = store.get("words");
    if words_value.is_none() {
        return Ok(None);
    }

    let words: Vec<String> = words_value
        .and_then(|v| v.as_array().cloned())
        .map(|arr| {
            arr.iter()
                .filter_map(|w| w.get("word")?.as_str())
                .map(String::from)
                .collect()
        })
        .unwrap_or_default();

    if words.is_empty() {
        Ok(None)
    } else {
        Ok(Some(words))
    }
}

/// Get snippets from store
fn get_snippets(app: &AppHandle) -> Result<Option<Vec<SnippetData>>, String> {
    let store = app
        .store("snippets.json")
        .map_err(|e| format!("Failed to get snippets store: {}", e))?;

    let snippets_value = store.get("snippets");
    if snippets_value.is_none() {
        return Ok(None);
    }

    let snippets: Vec<SnippetData> = snippets_value
        .and_then(|v| v.as_array().cloned())
        .map(|arr| {
            arr.iter()
                .filter_map(|s| {
                    Some(SnippetData {
                        trigger: s.get("snippet")?.as_str()?.to_string(),
                        expansion: s.get("expansion")?.as_str()?.to_string(),
                    })
                })
                .collect()
        })
        .unwrap_or_default();

    if snippets.is_empty() {
        Ok(None)
    } else {
        Ok(Some(snippets))
    }
}

/// Get vibe for a specific app category
fn get_vibe_for_category(
    app: &AppHandle,
    category: &AppCategory,
) -> Result<(Option<String>, Option<String>), String> {
    let vibes_store = app
        .store("vibes.json")
        .map_err(|e| format!("Failed to get vibes store: {}", e))?;

    // Get selected vibes map
    let selected_vibes = vibes_store.get("selectedVibes").map(|v| v.clone());
    if selected_vibes.is_none() {
        return Ok((None, None));
    }

    // Get the selected vibe ID for this category
    let vibe_id = selected_vibes
        .and_then(|sv| sv.get(category.as_str()).cloned())
        .and_then(|v| v.as_str().map(String::from));

    if vibe_id.is_none() {
        return Ok((None, None));
    }

    let vibe_id = vibe_id.unwrap();

    // Check if it's the default "raw transcription" vibe - skip if so
    if vibe_id == "other-raw" {
        return Ok((None, None));
    }

    let vibes = vibes_store
        .get("vibes")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No vibes found in store")?;

    // Find the vibe by ID
    for vibe in vibes {
        let id = vibe.get("id").and_then(|v| v.as_str());
        if id.as_deref() == Some(vibe_id.as_str()) {
            let name = vibe.get("name").and_then(|v| v.as_str()).map(String::from);
            let prompt = vibe
                .get("prompt")
                .and_then(|v| v.as_str())
                .map(String::from);
            return Ok((name, prompt));
        }
    }

    Ok((None, None))
}

/// Create empty prompt context when not using AI
pub fn create_empty_prompt_context() -> PromptContext {
    PromptContext {
        vocabulary_used: vec![],
        snippets_used: vec![],
        vibe_prompt: None,
        system_context: SystemContext {
            language: "en".to_string(),
            time: chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        },
        application_context: ApplicationContext {
            name: String::new(),
            category: String::new(),
        },
    }
}

/// Get human-readable model name
pub fn get_model_name(model: &super::orchestrator::SelectedModel) -> String {
    // Try to extract a nice name from the ID
    if model.id.starts_with("whisper-") {
        let variant = model.id.strip_prefix("whisper-").unwrap_or("unknown");
        format!(
            "Whisper {}",
            variant.chars().next().unwrap().to_uppercase().to_string() + &variant[1..]
        )
    } else if model.id.starts_with("claude-") {
        "Claude".to_string()
    } else if model.id.starts_with("gpt-") {
        "GPT".to_string()
    } else {
        model.id.clone()
    }
}
