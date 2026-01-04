use serde_json::json;

/// Process transcript with Anthropic Claude API
pub async fn process_with_anthropic(
    text: String,
    system_prompt: String,
    api_key: String,
    model: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let body = json!({
        "model": model,
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [{
            "role": "user",
            "content": format!("Process this transcript:\n\n{}", text)
        }]
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Anthropic API request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("Anthropic API error ({}): {}", status, error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse Anthropic response: {}", e))?;

    // Extract the text from the response
    // Anthropic format: { "content": [{ "text": "..." }], ... }
    let processed_text = response_json
        .get("content")
        .and_then(|c| c.as_array())
        .and_then(|arr| arr.first())
        .and_then(|item| item.get("text"))
        .and_then(|t| t.as_str())
        .ok_or("Failed to extract text from Anthropic response")?
        .to_string();

    Ok(processed_text)
}

/// Process transcript with OpenAI GPT API
pub async fn process_with_openai(
    text: String,
    system_prompt: String,
    api_key: String,
    model: String,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let body = json!({
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": format!("Process this transcript:\n\n{}", text)
            }
        ],
        "max_tokens": 4096,
        "temperature": 0.3
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("OpenAI API request failed: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("OpenAI API error ({}): {}", status, error_text));
    }

    let response_json: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse OpenAI response: {}", e))?;

    // Extract the text from the response
    // OpenAI format: { "choices": [{ "message": { "content": "..." } }], ... }
    let processed_text = response_json
        .get("choices")
        .and_then(|c| c.as_array())
        .and_then(|arr| arr.first())
        .and_then(|choice| choice.get("message"))
        .and_then(|msg| msg.get("content"))
        .and_then(|c| c.as_str())
        .ok_or("Failed to extract text from OpenAI response")?
        .to_string();

    Ok(processed_text)
}
