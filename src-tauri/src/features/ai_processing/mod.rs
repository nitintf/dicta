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
    let mut prompt = "You are a transcript post-processor. Your job is to enhance the given transcript with proper formatting while preserving the EXACT words spoken.".to_string();

    prompt.push_str("\n\nCORE RULES:");
    prompt.push_str("\n1. NEVER change, replace, or rephrase the words that were actually spoken");
    prompt.push_str("\n2. ONLY add punctuation (periods, commas, question marks, etc.)");
    prompt.push_str("\n3. ONLY add paragraph breaks and formatting where appropriate");
    prompt.push_str("\n4. Keep the original word order and phrasing exactly as spoken");

    // Add vocabulary context
    if let Some(words) = vocabulary {
        if !words.is_empty() {
            prompt.push_str("\n\nVOCABULARY - Proper Capitalization:");
            prompt.push_str("\nIf any of these words appear in the transcript, ensure they are properly capitalized:");
            prompt.push_str("\n");
            prompt.push_str(&words.join(", "));
            prompt.push_str("\nOnly apply this to words that are ALREADY in the transcript - do not insert these words.");
        }
    }

    // Add snippet expansion instructions
    if let Some(snips) = snippets {
        if !snips.is_empty() {
            prompt.push_str("\n\nSNIPPET EXPANSION:");
            prompt.push_str(
                "\nOnly if you detect these exact trigger phrases in the transcript, expand them:",
            );
            for snip in snips {
                prompt.push_str(&format!(
                    "\n- If the transcript contains '{}', replace it with '{}'",
                    snip.trigger, snip.expansion
                ));
            }
            prompt.push_str(
                "\nDo NOT insert snippets if their triggers are not present in the transcript.",
            );
        }
    }

    // Add smart formatting instructions
    prompt.push_str("\n\nSMART FORMATTING:");
    prompt.push_str("\n- If the transcript describes a list (e.g., 'I need to buy apples bananas and oranges'), format it as a bulleted list");
    prompt.push_str(
        "\n- If the transcript has natural paragraph breaks (topic changes), add paragraph spacing",
    );
    prompt.push_str("\n- If the transcript asks a question, ensure it ends with a question mark");
    prompt.push_str("\n- Use proper sentence capitalization");

    // Add vibe formatting instructions
    if let Some(vibe) = vibe_prompt {
        if !vibe.trim().is_empty() {
            prompt.push_str("\n\nADDITIONAL STYLE REQUIREMENTS:");
            prompt.push_str("\n");
            prompt.push_str(vibe);
        }
    }

    prompt.push_str("\n\nOUTPUT FORMAT:");
    prompt.push_str("\n- Return ONLY the enhanced transcript");
    prompt.push_str("\n- Do NOT add explanations, meta-commentary, or phrases like 'Here is the enhanced version:'");
    prompt.push_str("\n- The output should be the exact words from the input, just with better punctuation and formatting");

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
