use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use serde_json::Value;
use tauri::{command, AppHandle};
use tauri_plugin_store::StoreExt;

const NONCE: &[u8; 12] = b"unique nonce"; // In production, use random nonce per encryption

/// Get or create encryption key
fn get_encryption_key(app: &AppHandle) -> Result<[u8; 32], String> {
    let store = app
        .store(".secrets")
        .map_err(|e| format!("Failed to access secrets store: {}", e))?;

    // Try to get existing key
    if let Some(key_value) = store.get("encryption_key") {
        if let Some(key_str) = key_value.as_str() {
            let key_bytes = general_purpose::STANDARD
                .decode(key_str)
                .map_err(|e| format!("Failed to decode encryption key: {}", e))?;

            if key_bytes.len() == 32 {
                let mut key = [0u8; 32];
                key.copy_from_slice(&key_bytes);
                return Ok(key);
            }
        }
    }

    // Generate new key
    let key = Aes256Gcm::generate_key(&mut OsRng);
    let key_bytes: &[u8] = key.as_ref();
    let key_b64 = general_purpose::STANDARD.encode(key_bytes);

    store.set("encryption_key", Value::String(key_b64));
    store
        .save()
        .map_err(|e| format!("Failed to save encryption key: {}", e))?;

    let mut key_array = [0u8; 32];
    key_array.copy_from_slice(key_bytes);
    Ok(key_array)
}

/// Encrypt a string
fn encrypt_string(key: &[u8; 32], plaintext: &str) -> Result<String, String> {
    let cipher = Aes256Gcm::new(key.into());
    let nonce = Nonce::from_slice(NONCE);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    Ok(general_purpose::STANDARD.encode(ciphertext))
}

/// Decrypt a string
fn decrypt_string(key: &[u8; 32], ciphertext: &str) -> Result<String, String> {
    let cipher = Aes256Gcm::new(key.into());
    let nonce = Nonce::from_slice(NONCE);

    let ciphertext_bytes = general_purpose::STANDARD
        .decode(ciphertext)
        .map_err(|e| format!("Failed to decode ciphertext: {}", e))?;

    let plaintext = cipher
        .decrypt(nonce, ciphertext_bytes.as_ref())
        .map_err(|e| format!("Decryption failed: {}", e))?;

    String::from_utf8(plaintext).map_err(|e| format!("Failed to decode plaintext: {}", e))
}

/// Store an API key securely in models.json
#[command]
pub async fn store_api_key(
    app: AppHandle,
    model_id: String,
    api_key: String,
) -> Result<(), String> {
    let key = get_encryption_key(&app)?;
    let encrypted = encrypt_string(&key, &api_key)?;

    let store = app
        .store("models.json")
        .map_err(|e| format!("Failed to access models store: {}", e))?;

    // Get all models
    let mut models = store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    // Find and update the model
    let mut found = false;
    for model in models.iter_mut() {
        if let Some(obj) = model.as_object_mut() {
            if let Some(id) = obj.get("id").and_then(|v| v.as_str()) {
                if id == model_id {
                    // Store encrypted API key
                    obj.insert("apiKey".to_string(), Value::String(encrypted.clone()));
                    // Set hasApiKey flag for frontend
                    obj.insert("hasApiKey".to_string(), Value::Bool(true));
                    found = true;
                    break;
                }
            }
        }
    }

    if !found {
        return Err(format!("Model with ID '{}' not found", model_id));
    }

    // Save back to store
    store.set("models", Value::Array(models));
    store
        .save()
        .map_err(|e| format!("Failed to save models: {}", e))?;

    Ok(())
}

/// Retrieve an API key securely
#[command]
pub async fn get_api_key(app: AppHandle, model_id: String) -> Result<String, String> {
    get_api_key_internal(&app, &model_id).await
}

/// Remove an API key from models.json
#[command]
pub async fn remove_api_key(app: AppHandle, model_id: String) -> Result<(), String> {
    let store = app
        .store("models.json")
        .map_err(|e| format!("Failed to access models store: {}", e))?;

    // Get all models
    let mut models = store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .unwrap_or_default();

    // Find and update the model
    let mut found = false;
    for model in models.iter_mut() {
        if let Some(obj) = model.as_object_mut() {
            if let Some(id) = obj.get("id").and_then(|v| v.as_str()) {
                if id == model_id {
                    // Remove encrypted API key
                    obj.remove("apiKey");
                    // Set hasApiKey flag to false for frontend
                    obj.insert("hasApiKey".to_string(), Value::Bool(false));
                    found = true;
                    break;
                }
            }
        }
    }

    if !found {
        return Err(format!("Model with ID '{}' not found", model_id));
    }

    // Save back to store
    store.set("models", Value::Array(models));
    store
        .save()
        .map_err(|e| format!("Failed to save models: {}", e))?;

    Ok(())
}

/// Check if an API key exists for a model
#[command]
pub async fn has_api_key(app: AppHandle, model_id: String) -> Result<bool, String> {
    let store = app
        .store("models.json")
        .map_err(|e| format!("Failed to access models store: {}", e))?;

    let models = store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No models found")?;

    for model in &models {
        if let Some(obj) = model.as_object() {
            if let Some(id) = obj.get("id").and_then(|v| v.as_str()) {
                if id == model_id {
                    return Ok(obj.get("apiKey").is_some());
                }
            }
        }
    }

    Ok(false)
}

/// Internal function to retrieve and decrypt API key (non-command, for Rust-only usage)
pub async fn get_api_key_internal(app: &AppHandle, model_id: &str) -> Result<String, String> {
    let key = get_encryption_key(app)?;

    let store = app
        .store("models.json")
        .map_err(|e| format!("Failed to access models store: {}", e))?;

    let models = store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No models found")?;

    // Find the model and get its encrypted API key
    for model in &models {
        if let Some(obj) = model.as_object() {
            if let Some(id) = obj.get("id").and_then(|v| v.as_str()) {
                if id == model_id {
                    let encrypted = obj
                        .get("apiKey")
                        .and_then(|v| v.as_str())
                        .ok_or_else(|| format!("No API key found for model: {}", model_id))?;

                    return decrypt_string(&key, encrypted);
                }
            }
        }
    }

    Err(format!("Model not found: {}", model_id))
}
