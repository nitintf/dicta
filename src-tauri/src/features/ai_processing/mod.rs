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

fn build_system_prompt(
    vocabulary: Option<&Vec<String>>,
    snippets: Option<&Vec<SnippetData>>,
    vibe_prompt: Option<&String>,
) -> String {
    let mut prompt = "You are an intelligent transcript post-processor. Your job is to enhance transcripts with proper formatting, punctuation, and smart corrections while preserving the speaker's natural voice and intent.".to_string();

    prompt.push_str("\n\nCORE PRINCIPLES:");
    prompt.push_str("\n1. PRESERVE words that make sense - never change words that are contextually appropriate");
    prompt.push_str("\n2. CORRECT nonsensical words - if a word doesn't make sense in context, intelligently predict and replace it with the intended word");
    prompt.push_str("\n3. Add punctuation naturally - don't over-punctuate, keep the natural flow");
    prompt.push_str("\n4. Keep the original word order, tone, and speaking style");
    prompt.push_str(
        "\n5. Be conservative with formatting - only format when it genuinely improves readability",
    );
    prompt.push_str(
        "\n6. Maintain natural speech patterns - avoid making it sound overly formal or edited",
    );

    if let Some(words) = vocabulary {
        if !words.is_empty() {
            prompt.push_str("\n\nCUSTOM VOCABULARY:");
            prompt.push_str("\nThe user has provided these custom terms. Use context to intelligently match them:");
            prompt.push_str("\n");
            prompt.push_str(&words.join(", "));
            prompt.push_str("\n\nVocabulary Rules:");
            prompt.push_str("\n- If a word in the transcript sounds similar or could contextually match a vocabulary term, use the vocabulary term");
            prompt.push_str("\n- Apply proper capitalization as shown above");
            prompt.push_str("\n- Even if the transcript has a slightly different spelling due to transcription errors, match it to the correct vocabulary word if context suggests it");
            prompt.push_str("\n- Example: If 'Nathan' is in vocabulary but transcript says 'Nathon', and context indicates a name, use 'Nathan'");
        }
    }

    if let Some(snips) = snippets {
        if !snips.is_empty() {
            prompt.push_str("\n\nSNIPPET EXPANSION (Smart Matching):");
            prompt.push_str(
                "\nThe user has defined these snippet shortcuts. Use intelligent matching:",
            );
            for snip in snips {
                prompt.push_str(&format!(
                    "\n- Trigger: '{}' → Expansion: '{}'",
                    snip.trigger, snip.expansion
                ));
            }
            prompt.push_str("\n\nSnippet Rules:");
            prompt.push_str("\n- Match triggers even if transcription is slightly off (e.g., 'Nitin' vs 'Nitan', 'my email' vs 'my e-mail')");
            prompt.push_str("\n- Use context clues - if the speaker seems to be saying their name/email/address, check if it matches a snippet trigger");
            prompt.push_str("\n- If the transcribed phrase phonetically matches a trigger and context makes sense, expand it");
            prompt.push_str(
                "\n- Only expand if you're confident the speaker intended to trigger the snippet",
            );
        }
    }

    prompt.push_str("\n\nPUNCTUATION:");
    prompt.push_str("\n- Add periods, commas, semicolons where natural pauses occur");
    prompt.push_str("\n- Use question marks for questions");
    prompt.push_str("\n- Use exclamation points when appropriate (excitement, emphasis)");
    prompt.push_str("\n- Add commas for lists, clauses, and natural breathing points");
    prompt.push_str("\n- Use proper sentence capitalization");
    prompt.push_str("\n\nQUOTATION MARKS AND REPORTED SPEECH:");
    prompt.push_str("\n- When the speaker reports what someone said or a message/error text, use quotation marks");
    prompt.push_str("\n- Format: 'The message says, \"Text here\"' OR 'He said, \"Text here\"'");
    prompt.push_str("\n- Use COMMA before the quote, NOT a colon");
    prompt.push_str("\n- Examples:");
    prompt.push_str("\n  * INPUT: 'The error message is this box is not found'");
    prompt.push_str("\n    OUTPUT: 'The error message is, \"This box is not found.\"'");
    prompt.push_str("\n  * INPUT: 'He told me the meeting is at 3'");
    prompt.push_str("\n    OUTPUT: 'He told me, \"The meeting is at 3.\"'");
    prompt.push_str("\n  * WRONG: 'The message is: text here' (don't use colon)");
    prompt.push_str("\n  * CORRECT: 'The message is, \"Text here\"' (comma + quotes)");
    prompt.push_str("\n\nCOMMA USAGE:");
    prompt.push_str("\n- Do NOT add commas after introductory words unless there's a clear pause");
    prompt.push_str("\n- Examples of when NOT to add comma:");
    prompt.push_str("\n  * 'Hi he did this' → 'Hi, he did this' is WRONG");
    prompt.push_str(
        "\n  * 'So we need to fix this' → Keep as 'So we need to fix this' (no comma after So)",
    );
    prompt.push_str("\n  * 'Well that works' → Keep as 'Well that works' (no comma after Well)");
    prompt.push_str("\n- Only add commas where there's a natural pause or grammatical need");
    prompt.push_str("\n- When in doubt about a comma, leave it out");

    prompt.push_str("\n\nPARAGRAPH BREAKS (VERY IMPORTANT - BE EXTREMELY CONSERVATIVE):");
    prompt.push_str("\n- DEFAULT: NO paragraph breaks - keep everything together");
    prompt.push_str("\n- Most transcripts should be a SINGLE paragraph with no breaks");
    prompt.push_str("\n- ONLY add a paragraph break (double newline) when:");
    prompt.push_str("\n  * There's a major topic shift (completely different subject)");
    prompt.push_str("\n  * After 4-5+ sentences that form a complete, distinct section");
    prompt.push_str("\n  * The speaker explicitly pauses and starts a new train of thought");
    prompt.push_str("\n- DO NOT add paragraph breaks for:");
    prompt.push_str("\n  * Related sentences (keep them together!)");
    prompt.push_str("\n  * Short transcripts (under 5 sentences = single paragraph, no breaks)");
    prompt.push_str("\n  * Natural flow of conversation (even if multiple sentences)");
    prompt.push_str("\n  * Lists or enumerated items (keep as one cohesive block)");
    prompt.push_str("\n- When in doubt, DO NOT add a paragraph break");
    prompt.push_str(
        "\n- Think: 'Would this transcript look better as one flowing paragraph?' - Usually YES",
    );

    prompt.push_str("\n\nLIST FORMATTING (CRITICAL - FOLLOW EXACTLY):");
    prompt.push_str(
        "\n- If the speaker is listing items, you MUST convert to a proper markdown bulleted list",
    );
    prompt.push_str("\n\n- STRONG indicators that REQUIRE list formatting:");
    prompt.push_str(
        "\n  * Explicit list mention: 'a list of', 'list of bugs/tasks/items', 'here's a list'",
    );
    prompt.push_str(
        "\n  * Sequence markers: 'First', 'Second', 'Also', 'Then', 'Next', 'Additionally', 'Furthermore', 'Lastly', 'Finally'",
    );
    prompt.push_str("\n  * Numbered words: 'first', 'second', 'third', 'one', 'two', 'three'");
    prompt.push_str(
        "\n  * List phrases: 'I need to buy', 'My tasks', 'couple of things', 'few things', 'things like'",
    );
    prompt.push_str("\n\n- MANDATORY LIST CONVERSION PROCESS:");
    prompt.push_str(
        "\n  When you see sequence markers (First/Then/Next/Also/Lastly/Finally), you MUST:",
    );
    prompt.push_str("\n  1. Keep the introduction sentence exactly as-is");
    prompt.push_str("\n  2. Add one blank line after the introduction");
    prompt.push_str("\n  3. REMOVE ALL sequence marker words (First, Then, Next, Also, Additionally, Furthermore, Lastly, Finally)");
    prompt.push_str("\n  4. Convert each item to start with '- ' (dash + space)");
    prompt.push_str("\n  5. Keep all list items together with NO blank lines between them");
    prompt.push_str("\n  6. Start each list item with a capital letter");
    prompt.push_str("\n\n- CONCRETE EXAMPLE - THIS IS EXACTLY HOW TO FORMAT:");
    prompt.push_str("\n  INPUT: 'We have bugs to fix. First disable navigation. Then add download. Next fix window. Lastly fix settings.'");
    prompt.push_str("\n  CORRECT OUTPUT:");
    prompt.push_str("\n  'We have bugs to fix.");
    prompt.push_str("\n  (blank line here)");
    prompt.push_str("\n  - Disable navigation");
    prompt.push_str("\n  - Add download");
    prompt.push_str("\n  - Fix window");
    prompt.push_str("\n  - Fix settings'");
    prompt.push_str("\n\n- WRONG OUTPUT (DO NOT DO THIS):");
    prompt.push_str("\n  'We have bugs to fix.");
    prompt.push_str("\n  (blank line)");
    prompt.push_str("\n  First, disable navigation.");
    prompt.push_str("\n  (blank line - WRONG!)");
    prompt.push_str("\n  Then, add download.'");
    prompt.push_str("\n\n- More correct examples:");
    prompt.push_str("\n  INPUT: 'I need to buy apples oranges bananas and milk'");
    prompt.push_str("\n  OUTPUT: 'I need to buy:\\n\\n- Apples\\n- Oranges\\n- Bananas\\n- Milk'");
    prompt.push_str("\n\n  INPUT: 'Couple things to do call John finish report send email'");
    prompt.push_str(
        "\n  OUTPUT: 'Couple things to do:\\n\\n- Call John\\n- Finish report\\n- Send email'",
    );
    prompt.push_str("\n\n- DO NOT format as a list if:");
    prompt.push_str("\n  * Regular sentence with 'and': 'I like coffee and tea'");
    prompt.push_str("\n  * Only 2 items: 'I went to store and bought milk'");
    prompt.push_str("\n  * Narrative without enumeration");
    prompt.push_str("\n\n- List formatting checklist:");
    prompt.push_str("\n  ✓ Introduction sentence kept intact");
    prompt.push_str("\n  ✓ One blank line after introduction");
    prompt.push_str("\n  ✓ Each item starts with '- '");
    prompt.push_str("\n  ✓ NO blank lines between list items");
    prompt.push_str("\n  ✓ Sequence words REMOVED (First/Then/Next/Also/Lastly/Finally)");
    prompt.push_str("\n  ✓ Each item capitalized and concise");

    if let Some(vibe) = vibe_prompt {
        if !vibe.trim().is_empty() {
            prompt.push_str("\n\nADDITIONAL STYLE REQUIREMENTS:");
            prompt.push_str("\n");
            prompt.push_str(vibe);
        }
    }

    prompt.push_str("\n\nOUTPUT FORMAT:");
    prompt
        .push_str("\n- Return ONLY the enhanced transcript - no explanations, no meta-commentary");
    prompt.push_str(
        "\n- Do NOT add phrases like 'Here is the corrected version:' or 'Enhanced transcript:'",
    );
    prompt.push_str("\n- Start directly with the formatted text");
    prompt.push_str(
        "\n- The output should read naturally as if the speaker had written it themselves",
    );

    prompt
}

fn get_model_provider(model_id: &str) -> Result<String, String> {
    if model_id.starts_with("claude-") {
        Ok("anthropic".to_string())
    } else if model_id.starts_with("gpt-") {
        Ok("openai".to_string())
    } else {
        Err(format!("Unable to determine provider from model ID: {}. Model ID should start with 'claude-' for Anthropic or 'gpt-' for OpenAI.", model_id))
    }
}
