use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle};

mod providers;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SnippetData {
    pub trigger: String,
    pub expansion: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PostProcessingRequest {
    pub text: String,
    pub model_id: String,
    pub vocabulary: Option<Vec<String>>,
    pub snippets: Option<Vec<SnippetData>>,
    pub vibe_prompt: Option<String>,
}

/// Main command to post-process a transcript using AI
#[command]
pub async fn post_process_transcript(
    request: PostProcessingRequest,
    app: AppHandle,
) -> Result<String, String> {
    // Build system prompt
    let system_prompt = build_system_prompt(
        request.vocabulary.as_ref(),
        request.snippets.as_ref(),
        request.vibe_prompt.as_ref(),
    );

    // Get API key for selected model
    let api_key = crate::features::security::get_api_key_internal(&app, &request.model_id)
        .await
        .map_err(|_| {
            "API key not found for selected model. Please add your API key in settings.".to_string()
        })?;

    // Determine provider from model_id
    let provider = get_model_provider(&request.model_id)?;

    // Route to appropriate provider
    let processed_text = match provider.as_str() {
        "anthropic" | "anthropic-chat" => {
            providers::process_with_anthropic(
                request.text,
                system_prompt,
                api_key,
                request.model_id,
            )
            .await?
        }
        "openai" | "openai-chat" => {
            providers::process_with_openai(request.text, system_prompt, api_key, request.model_id)
                .await?
        }
        _ => {
            return Err(format!(
                "Unsupported AI model provider: {}. Please select an Anthropic or OpenAI model.",
                provider
            ))
        }
    };

    Ok(processed_text)
}

/// Build system prompt from enabled features
fn build_system_prompt(
    vocabulary: Option<&Vec<String>>,
    snippets: Option<&Vec<SnippetData>>,
    vibe_prompt: Option<&String>,
) -> String {
    let mut prompt = "You are a transcript post-processor. Your job is to enhance the given transcript while preserving the original meaning and intent.".to_string();

    // Add vocabulary context
    if let Some(words) = vocabulary {
        if !words.is_empty() {
            prompt.push_str("\n\nVOCABULARY CONTEXT:\n");
            prompt.push_str("Ensure these words are properly recognized and capitalized:\n");
            prompt.push_str(&words.join(", "));
        }
    }

    // Add snippet expansion instructions
    if let Some(snips) = snippets {
        if !snips.is_empty() {
            prompt.push_str("\n\nSNIPPET EXPANSION:\n");
            prompt.push_str(
                "If you detect these triggers in the transcript, expand them to their full form:\n",
            );
            for snip in snips {
                prompt.push_str(&format!("- '{}' → '{}'\n", snip.trigger, snip.expansion));
            }

            prompt.push_str("\nSNIPPET CONTEXT:\n");
            prompt.push_str("Use these snippets as examples of the user's common phrases and communication style:\n");
            for snip in snips {
                prompt.push_str(&format!("- {}\n", snip.expansion));
            }
        }
    }

    // Add vibe formatting instructions
    if let Some(vibe) = vibe_prompt {
        if !vibe.trim().is_empty() {
            prompt.push_str("\n\nFORMATTING STYLE:\n");
            prompt.push_str(vibe);
        }
    }

    prompt.push_str("\n\nIMPORTANT: Return only the enhanced transcript text. Do not include any explanations, meta-commentary, or wrapper text like 'Here is the enhanced version:'. Just return the processed transcript directly.");

    prompt
}

/// Determine the provider from model ID
fn get_model_provider(model_id: &str) -> Result<String, String> {
    // Check model ID patterns to determine provider
    if model_id.starts_with("claude-") {
        Ok("anthropic".to_string())
    } else if model_id.starts_with("gpt-") {
        Ok("openai".to_string())
    } else {
        // Fallback: try to parse from model ID format
        Err(format!("Unable to determine provider from model ID: {}. Model ID should start with 'claude-' for Anthropic or 'gpt-' for OpenAI.", model_id))
    }
}
