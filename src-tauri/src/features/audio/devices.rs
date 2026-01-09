use serde::{Deserialize, Serialize};
use tauri::command;
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/voice-input/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct AudioDevice {
    pub device_id: String,
    pub label: String,
    pub is_default: bool,
    pub is_recommended: bool,
}

/// Enumerate audio input devices
/// For now, this returns a placeholder. In production, you'd use platform-specific APIs.
#[command]
pub async fn enumerate_audio_devices() -> Result<Vec<AudioDevice>, String> {
    // This is a simplified version. For macOS, you'd use CoreAudio APIs
    // For now, we'll return a basic structure that the frontend can enhance
    // with browser's enumerateDevices()

    #[cfg(target_os = "macos")]
    {
        enumerate_macos_audio_devices().await
    }

    #[cfg(not(target_os = "macos"))]
    {
        // Fallback for non-macOS platforms
        Ok(vec![])
    }
}

#[cfg(target_os = "macos")]
async fn enumerate_macos_audio_devices() -> Result<Vec<AudioDevice>, String> {
    use std::process::Command;

    // Use system_profiler to get audio device information
    let output = Command::new("system_profiler")
        .arg("SPAudioDataType")
        .arg("-json")
        .output()
        .map_err(|e| format!("Failed to execute system_profiler: {}", e))?;

    if !output.status.success() {
        return Err("system_profiler command failed".to_string());
    }

    let output_str = String::from_utf8_lossy(&output.stdout);

    // Try to parse the JSON output
    let json_value: serde_json::Value = serde_json::from_str(&output_str)
        .map_err(|e| format!("Failed to parse system_profiler output: {}", e))?;

    let mut devices = Vec::new();

    // Extract audio devices from the JSON
    // The structure is: SPAudioDataType -> array of devices
    if let Some(audio_data) = json_value.get("SPAudioDataType") {
        if let Some(audio_array) = audio_data.as_array() {
            for item in audio_array {
                // Look for input devices
                if let Some(items) = item.get("_items") {
                    if let Some(items_array) = items.as_array() {
                        for device in items_array {
                            if let Some(name) = device.get("_name") {
                                let device_name = name.as_str().unwrap_or("Unknown").to_string();

                                // Check if this is an input device
                                let has_input = device
                                    .get("coreaudio_device_input")
                                    .and_then(|v| v.as_i64())
                                    .unwrap_or(0)
                                    > 0;

                                if has_input {
                                    let is_builtin =
                                        device_name.to_lowercase().contains("built-in")
                                            || device_name.to_lowercase().contains("macbook");

                                    devices.push(AudioDevice {
                                        device_id: device_name.clone(),
                                        label: device_name,
                                        is_default: false,
                                        is_recommended: is_builtin,
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // If no devices found, return a basic MacBook device
    if devices.is_empty() {
        devices.push(AudioDevice {
            device_id: "default".to_string(),
            label: "MacBook Pro".to_string(),
            is_default: true,
            is_recommended: true,
        });
    }

    Ok(devices)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_enumerate_audio_devices() {
        let result = enumerate_audio_devices().await;
        assert!(result.is_ok());
    }
}
