use crate::features::audio::{
    cancel_recording, start_recording, stop_recording, AudioRecorder, RecordingMode,
    RecordingState, RecordingStateManager,
};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::{Shortcut, ShortcutEvent, ShortcutState};

/// Handles recording shortcuts for both Toggle and PTT modes
pub struct RecordingShortcutHandler {
    last_press_time: Arc<Mutex<Option<Instant>>>,
    throttle_duration: Duration,
}

impl RecordingShortcutHandler {
    pub fn new() -> Self {
        Self {
            last_press_time: Arc::new(Mutex::new(None)),
            throttle_duration: Duration::from_millis(300),
        }
    }

    /// Check if the shortcut should be throttled
    fn should_throttle(&self) -> bool {
        let mut last_press = self.last_press_time.lock().unwrap();
        let now = Instant::now();

        if let Some(last) = *last_press {
            if now.duration_since(last) < self.throttle_duration {
                return true;
            }
        }

        *last_press = Some(now);
        false
    }

    /// Handle toggle mode shortcut (click to start/stop)
    pub async fn handle_toggle_mode(
        &self,
        app: &AppHandle,
        event: &ShortcutEvent,
    ) -> Result<(), String> {
        // Only respond to key press in toggle mode
        if event.state != ShortcutState::Pressed {
            return Ok(());
        }

        // Throttle rapid presses
        if self.should_throttle() {
            log::debug!("Throttling rapid shortcut press");
            return Ok(());
        }

        let state_manager = app.state::<Arc<RecordingStateManager>>();
        let recorder = app.state::<Arc<Mutex<AudioRecorder>>>();

        let current_state = state_manager.get_state();

        match current_state {
            RecordingState::Idle | RecordingState::Error => {
                log::info!("Toggle mode: Starting recording");
                start_recording(app.clone(), recorder.clone(), state_manager.clone()).await?;
            }
            RecordingState::Recording => {
                log::info!("Toggle mode: Stopping recording");
                stop_recording(app.clone(), recorder.clone(), state_manager.clone()).await?;
            }
            _ => {
                log::debug!("Toggle mode: Ignoring shortcut in state {:?}", current_state);
            }
        }

        Ok(())
    }

    /// Handle PTT mode shortcut (hold to record)
    pub async fn handle_ptt_mode(
        &self,
        app: &AppHandle,
        event: &ShortcutEvent,
    ) -> Result<(), String> {
        let state_manager = app.state::<Arc<RecordingStateManager>>();
        let recorder = app.state::<Arc<Mutex<AudioRecorder>>>();

        match event.state {
            ShortcutState::Pressed => {
                let current_state = state_manager.get_state();

                // Only start if idle or error
                if matches!(
                    current_state,
                    RecordingState::Idle | RecordingState::Error
                ) {
                    log::info!("PTT mode: Key pressed - starting recording");
                    start_recording(app.clone(), recorder.clone(), state_manager.clone()).await?;
                }
            }
            ShortcutState::Released => {
                let current_state = state_manager.get_state();

                // Stop if recording or starting
                if matches!(
                    current_state,
                    RecordingState::Recording | RecordingState::Starting
                ) {
                    log::info!("PTT mode: Key released - stopping recording");
                    stop_recording(app.clone(), recorder.clone(), state_manager.clone()).await?;
                }
            }
        }

        Ok(())
    }

    /// Handle recording shortcut based on mode from settings
    pub async fn handle_recording_shortcut(
        &self,
        app: &AppHandle,
        event: &ShortcutEvent,
    ) -> Result<(), String> {
        use crate::features::audio::get_recording_mode_from_settings;

        let mode = get_recording_mode_from_settings(app);

        match mode {
            RecordingMode::Toggle => self.handle_toggle_mode(app, event).await,
            RecordingMode::PushToTalk => self.handle_ptt_mode(app, event).await,
        }
    }

    /// Handle escape key (cancel recording)
    pub async fn handle_escape_shortcut(&self, app: &AppHandle) -> Result<(), String> {
        let state_manager = app.state::<Arc<RecordingStateManager>>();
        let recorder = app.state::<Arc<Mutex<AudioRecorder>>>();

        let current_state = state_manager.get_state();

        // Only allow cancel from active states
        if matches!(
            current_state,
            RecordingState::Recording
                | RecordingState::Starting
                | RecordingState::Stopping
                | RecordingState::Transcribing
        ) {
            log::info!("Escape pressed - cancelling recording");
            cancel_recording(app.clone(), recorder.clone(), state_manager.clone()).await?;
        }

        Ok(())
    }
}

impl Default for RecordingShortcutHandler {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_throttle() {
        let handler = RecordingShortcutHandler::new();

        // First call should not throttle
        assert!(!handler.should_throttle());

        // Immediate second call should throttle
        assert!(handler.should_throttle());

        // Wait and try again
        std::thread::sleep(Duration::from_millis(350));
        assert!(!handler.should_throttle());
    }
}
