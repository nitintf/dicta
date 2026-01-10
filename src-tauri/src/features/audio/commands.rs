use super::player::{play_error_sound, play_recording_start_sound, play_recording_stop_sound};
use super::recorder::AudioRecorder;
use super::state::{RecordingMode, RecordingState, RecordingStateManager};
use crate::features::recordings::get_recordings_dir;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tauri::{command, AppHandle, Emitter, Manager, State};
use tauri_plugin_store::StoreExt;
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/voice-input/types/generated/")]
#[serde(rename_all = "camelCase")]
pub struct RecordingResponse {
    pub success: bool,
    pub state: RecordingState,
    pub error: Option<String>,
    pub file_path: Option<String>,
}

#[command]
pub async fn start_recording(
    app: AppHandle,
    recorder: State<'_, Arc<Mutex<AudioRecorder>>>,
    state_manager: State<'_, Arc<RecordingStateManager>>,
) -> Result<RecordingResponse, String> {
    log::info!("Start recording command called");

    // Check if already recording
    if state_manager.is_recording() {
        log::warn!("Already recording");
        return Ok(RecordingResponse {
            success: false,
            state: state_manager.get_state(),
            error: Some("Already recording".to_string()),
            file_path: None,
        });
    }

    // Check if a speech-to-text model is selected and downloaded
    if let Err(e) = check_model_available(&app) {
        log::warn!("Model not available: {}", e);
        log::info!("Skipping recording - model not downloaded or selected");
        return Ok(RecordingResponse {
            success: false,
            state: state_manager.get_state(),
            error: Some(e),
            file_path: None,
        });
    }

    let store = app
        .store("settings")
        .map_err(|e| format!("Failed to get settings: {}", e))?;

    let settings = store.get("settings");

    let device_id = settings
        .as_ref()
        .and_then(|s| s.as_object())
        .and_then(|settings_obj| settings_obj.get("voiceInput").and_then(|v| v.as_object()))
        .and_then(|voice_input_obj| voice_input_obj.get("microphoneDeviceId"))
        .and_then(|d| d.as_str())
        .map(String::from);

    let play_sound = settings
        .as_ref()
        .and_then(|s| s.as_object())
        .and_then(|settings_obj| settings_obj.get("system").and_then(|sys| sys.as_object()))
        .and_then(|system_obj| system_obj.get("playSoundOnRecording"))
        .and_then(|p| p.as_bool())
        .unwrap_or(true);

    // Transition to Starting state
    state_manager
        .set_state(RecordingState::Starting)
        .map_err(|e| format!("State transition failed: {}", e))?;

    // Emit state change
    let _ = app.emit("recording-state-changed", RecordingState::Starting);

    let timestamp = chrono::Local::now().timestamp_millis();
    let recording_folder =
        crate::features::recordings::storage::create_recording_folder(&app, timestamp)?;
    let file_path = recording_folder.join("audio.wav");

    state_manager.set_current_file(Some(file_path.clone()));
    state_manager.set_start_time(Some(timestamp));
    state_manager.set_recording_device(device_id.clone());

    if play_sound {
        let _ = play_recording_start_sound();
    }

    let mut recorder_guard = recorder
        .lock()
        .map_err(|e| format!("Failed to lock recorder: {}", e))?;

    // Set app handle for emitting audio levels
    recorder_guard.set_app_handle(app.clone());

    match recorder_guard.start_recording(&file_path, device_id) {
        Ok(_) => {
            state_manager
                .set_state(RecordingState::Recording)
                .map_err(|e| format!("State transition failed: {}", e))?;

            let _ = app.emit("recording-state-changed", RecordingState::Recording);

            if let Some(window) = app.get_webview_window("voice-input") {
                let _ = window.show();
                // Don't steal focus - keep user focused on their active application
            }

            log::info!("Recording started successfully");
            Ok(RecordingResponse {
                success: true,
                state: RecordingState::Recording,
                error: None,
                file_path: Some(file_path.to_string_lossy().to_string()),
            })
        }
        Err(e) => {
            log::error!("Failed to start recording: {}", e);

            state_manager.force_set_state(RecordingState::Error);
            state_manager.set_error(Some(e.clone()));

            // Clean up the recording folder since recording failed
            if let Some(parent) = file_path.parent() {
                if parent.exists() {
                    if let Err(cleanup_err) = std::fs::remove_dir_all(parent) {
                        log::warn!(
                            "Failed to cleanup recording folder after error: {}",
                            cleanup_err
                        );
                    } else {
                        log::info!("Cleaned up recording folder after recording failure");
                    }
                }
            }
            state_manager.set_current_file(None);
            state_manager.set_start_time(None);
            state_manager.set_recording_device(None);

            if play_sound {
                let _ = play_error_sound();
            }

            let _ = app.emit("recording-state-changed", RecordingState::Error);

            if let Some(window) = app.get_webview_window("voice-input") {
                let _ = window.hide();
            }

            Err(e)
        }
    }
}

/// Stop recording command
#[command]
pub async fn stop_recording(
    app: AppHandle,
    recorder: State<'_, Arc<Mutex<AudioRecorder>>>,
    state_manager: State<'_, Arc<RecordingStateManager>>,
) -> Result<RecordingResponse, String> {
    log::info!("Stop recording command called");

    // Check if not recording
    if !state_manager.is_recording() {
        log::warn!("Not currently recording");
        return Ok(RecordingResponse {
            success: false,
            state: state_manager.get_state(),
            error: Some("Not recording".to_string()),
            file_path: None,
        });
    }

    let store = app.store("settings").map_err(|e| e.to_string())?;
    let settings = store.get("settings");
    let play_sound = settings
        .as_ref()
        .and_then(|s| s.as_object())
        .and_then(|settings_obj| settings_obj.get("system").and_then(|sys| sys.as_object()))
        .and_then(|system_obj| system_obj.get("playSoundOnRecording"))
        .and_then(|p| p.as_bool())
        .unwrap_or(true);

    // Transition to Stopping state
    state_manager
        .set_state(RecordingState::Stopping)
        .map_err(|e| format!("State transition failed: {}", e))?;

    // Emit state change
    let _ = app.emit("recording-state-changed", RecordingState::Stopping);

    // Stop recording
    let mut recorder_guard = recorder
        .lock()
        .map_err(|e| format!("Failed to lock recorder: {}", e))?;

    match recorder_guard.stop_recording() {
        Ok(_) => {
            let file_path = state_manager.get_current_file();

            if play_sound {
                let _ = play_recording_stop_sound();
            }

            drop(recorder_guard);

            if let Some(ref audio_path) = file_path {
                let app_clone = app.clone();
                let state_manager_clone = state_manager.inner().clone();
                let audio_path_clone = audio_path.clone();

                // Get recording metadata
                let recording_device = state_manager.get_recording_device();
                let start_time = state_manager.get_start_time();

                tokio::spawn(async move {
                    state_manager_clone.force_set_state(RecordingState::Transcribing);
                    let _ = app_clone.emit("recording-state-changed", RecordingState::Transcribing);

                    // Extract timestamp from the folder path (folder name is the timestamp)
                    let timestamp = audio_path_clone
                        .parent()
                        .and_then(|p| p.file_name())
                        .and_then(|n| n.to_str())
                        .and_then(|s| s.parse::<i64>().ok())
                        .unwrap_or_else(|| chrono::Local::now().timestamp_millis());

                    // Calculate duration in seconds
                    let duration = start_time.map(|start| {
                        let end_time = chrono::Local::now().timestamp_millis();
                        ((end_time - start) as f64) / 1000.0
                    });

                    match std::fs::read(&audio_path_clone) {
                        Ok(audio_data) => {
                            let request =
                                crate::features::transcription::orchestrator::TranscribeRequest {
                                    audio_data,
                                    timestamp,
                                    duration,
                                    language: Some("en".to_string()),
                                    recording_device,
                                };

                            if let Some(local_model_state) =
                                app_clone.try_state::<Arc<
                                    tokio::sync::Mutex<crate::features::models::LocalModelManager>,
                                >>()
                            {
                                match crate::features::transcription::orchestrator::transcribe_and_process(
                                    request,
                                    app_clone.clone(),
                                    local_model_state,
                                ).await {
                                    Ok(_) => {
                                        log::info!("Transcription completed successfully");
                                    }
                                    Err(e) => {
                                        log::error!("Transcription failed: {}", e);

                                        // Clean up the recording folder since transcription failed
                                        if let Some(parent) = audio_path_clone.parent() {
                                            if parent.exists() {
                                                if let Err(cleanup_err) = std::fs::remove_dir_all(parent) {
                                                    log::warn!("Failed to cleanup recording folder after transcription error: {}", cleanup_err);
                                                } else {
                                                    log::info!("Cleaned up recording folder after transcription failure");
                                                }
                                            }
                                        }

                                        state_manager_clone.force_set_state(RecordingState::Error);
                                        state_manager_clone.set_error(Some(format!("Transcription failed: {}", e)));
                                        let _ = app_clone.emit("recording-state-changed", RecordingState::Error);
                                    }
                                }
                            }
                        }
                        Err(e) => {
                            log::error!("Failed to read audio file: {}", e);

                            // Clean up the recording folder since we couldn't read the audio
                            if let Some(parent) = audio_path_clone.parent() {
                                if parent.exists() {
                                    if let Err(cleanup_err) = std::fs::remove_dir_all(parent) {
                                        log::warn!("Failed to cleanup recording folder after read error: {}", cleanup_err);
                                    } else {
                                        log::info!(
                                            "Cleaned up recording folder after read failure"
                                        );
                                    }
                                }
                            }

                            state_manager_clone.force_set_state(RecordingState::Error);
                            state_manager_clone
                                .set_error(Some(format!("Failed to read audio file: {}", e)));
                            let _ =
                                app_clone.emit("recording-state-changed", RecordingState::Error);
                        }
                    }

                    // Only transition to Idle if we're not in Error state
                    if state_manager_clone.get_state() != RecordingState::Error {
                        state_manager_clone.force_set_state(RecordingState::Idle);
                        state_manager_clone.set_current_file(None);
                        state_manager_clone.set_start_time(None);
                        state_manager_clone.set_recording_device(None);
                        let _ = app_clone.emit("recording-state-changed", RecordingState::Idle);
                    }

                    if let Some(window) = app_clone.get_webview_window("voice-input") {
                        let _ = window.hide();
                    }
                });
            }

            log::info!("Recording stopped successfully");

            Ok(RecordingResponse {
                success: true,
                state: RecordingState::Stopping,
                error: None,
                file_path: file_path.map(|p| p.to_string_lossy().to_string()),
            })
        }
        Err(e) => {
            log::error!("Failed to stop recording: {}", e);

            state_manager.force_set_state(RecordingState::Error);
            state_manager.set_error(Some(e.clone()));

            // Clean up the recording folder since stopping failed
            if let Some(audio_path) = state_manager.get_current_file() {
                if let Some(parent) = audio_path.parent() {
                    if parent.exists() {
                        if let Err(cleanup_err) = std::fs::remove_dir_all(parent) {
                            log::warn!(
                                "Failed to cleanup recording folder after stop error: {}",
                                cleanup_err
                            );
                        } else {
                            log::info!("Cleaned up recording folder after stop failure");
                        }
                    }
                }
            }
            state_manager.set_current_file(None);
            state_manager.set_start_time(None);
            state_manager.set_recording_device(None);

            if play_sound {
                let _ = play_error_sound();
            }

            let _ = app.emit("recording-state-changed", RecordingState::Error);

            if let Some(window) = app.get_webview_window("voice-input") {
                let _ = window.hide();
            }

            Err(e)
        }
    }
}

/// Cancel recording command (stops recording without transcription)
#[command]
pub async fn cancel_recording(
    app: AppHandle,
    recorder: State<'_, Arc<Mutex<AudioRecorder>>>,
    state_manager: State<'_, Arc<RecordingStateManager>>,
) -> Result<RecordingResponse, String> {
    log::info!("Cancel recording command called");

    let current_state = state_manager.get_state();

    // Only allow cancel from active states
    if !matches!(
        current_state,
        RecordingState::Recording | RecordingState::Starting
    ) {
        log::warn!("Cannot cancel from state: {:?}", current_state);
        return Ok(RecordingResponse {
            success: false,
            state: current_state,
            error: Some("Not in a cancellable state".to_string()),
            file_path: None,
        });
    }

    // Stop the recorder if recording
    if state_manager.is_recording() {
        let mut recorder_guard = recorder
            .lock()
            .map_err(|e| format!("Failed to lock recorder: {}", e))?;

        let _ = recorder_guard.stop_recording();
    }

    // Clean up the entire recording folder
    if let Some(file_path) = state_manager.get_current_file() {
        if let Some(parent) = file_path.parent() {
            if parent.exists() {
                if let Err(e) = std::fs::remove_dir_all(parent) {
                    log::warn!("Failed to remove cancelled recording folder: {}", e);
                } else {
                    log::info!("Cleaned up cancelled recording folder");
                }
            }
        }
    }

    state_manager.set_current_file(None);
    state_manager.set_start_time(None);
    state_manager.set_recording_device(None);

    state_manager.force_set_state(RecordingState::Idle);

    let _ = app.emit("recording-state-changed", RecordingState::Idle);

    let store = app.store("settings").ok();
    let settings = store.as_ref().and_then(|s| s.get("settings"));
    let play_sound = settings
        .as_ref()
        .and_then(|s| s.as_object())
        .and_then(|settings_obj| settings_obj.get("system").and_then(|sys| sys.as_object()))
        .and_then(|system_obj| system_obj.get("playSoundOnRecording"))
        .and_then(|p| p.as_bool())
        .unwrap_or(true);

    if play_sound {
        let _ = play_error_sound();
    }

    let app_clone = app.clone();
    tokio::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
        if let Some(window) = app_clone.get_webview_window("voice-input") {
            let _ = window.hide();
        }
    });

    log::info!("Recording cancelled successfully");

    Ok(RecordingResponse {
        success: true,
        state: RecordingState::Idle,
        error: None,
        file_path: None,
    })
}

/// Get current recording state
#[command]
pub async fn get_recording_state(
    state_manager: State<'_, Arc<RecordingStateManager>>,
) -> Result<RecordingResponse, String> {
    Ok(RecordingResponse {
        success: true,
        state: state_manager.get_state(),
        error: state_manager.get_error(),
        file_path: state_manager
            .get_current_file()
            .map(|p| p.to_string_lossy().to_string()),
    })
}

/// Get current recording mode from settings
pub fn get_recording_mode_from_settings(app: &AppHandle) -> RecordingMode {
    let store = app.store("settings");
    let settings = store.ok().and_then(|store| store.get("settings"));

    let mode_str = settings
        .as_ref()
        .and_then(|settings| {
            settings
                .as_object()
                .and_then(|s| s.get("voiceInput"))
                .and_then(|v| v.as_object())
                .and_then(|v| v.get("recordingMode"))
                .and_then(|m| m.as_str())
        })
        .unwrap_or("toggle");

    match mode_str {
        "pushtotalk" => RecordingMode::PushToTalk,
        _ => RecordingMode::Toggle,
    }
}

/// Check if a speech-to-text model is selected and available for use
fn check_model_available(app: &AppHandle) -> Result<(), String> {
    // Get settings to find selected model
    let settings_store = app
        .store("settings")
        .map_err(|e| format!("Failed to get settings store: {}", e))?;

    let settings = settings_store
        .get("settings")
        .ok_or("No settings found in store")?;

    // Get selected model ID
    let selected_model_id = settings
        .get("transcription")
        .and_then(|t| t.get("speechToTextModelId"))
        .and_then(|v| v.as_str())
        .ok_or("No speech-to-text model selected. Please select a model in settings.")?;

    // Get models store to check if model exists and is downloaded
    let models_store = app
        .store("models.json")
        .map_err(|e| format!("Failed to get models store: {}", e))?;

    let models_value = models_store
        .get("models")
        .ok_or("No models found in store")?;

    let models = models_value.as_array().ok_or("Models is not an array")?;

    // Find the selected model
    for model_value in models {
        let model = model_value.as_object().ok_or("Model is not an object")?;

        let id = model.get("id").and_then(|v| v.as_str()).unwrap_or("");

        if id == selected_model_id {
            let provider = model.get("provider").and_then(|v| v.as_str()).unwrap_or("");

            // For local models, check if downloaded
            if provider == "local-whisper" {
                let is_downloaded = model
                    .get("isDownloaded")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(false);

                if !is_downloaded {
                    return Err(format!(
                        "Model '{}' is not downloaded. Please download it in the Models page.",
                        id
                    ));
                }
            }

            // Model found and available
            return Ok(());
        }
    }

    Err(format!(
        "Selected model '{}' not found in models store",
        selected_model_id
    ))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recording_response_serialization() {
        let response = RecordingResponse {
            success: true,
            state: RecordingState::Recording,
            error: None,
            file_path: Some("/path/to/file.wav".to_string()),
        };

        let json = serde_json::to_string(&response).unwrap();
        assert!(json.contains("recording"));
    }
}
