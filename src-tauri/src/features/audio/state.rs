use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use ts_rs::TS;

/// Recording mode: Toggle (click to start/stop) or PushToTalk (hold to record)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/voice-input/types/generated/")]
#[serde(rename_all = "lowercase")]
pub enum RecordingMode {
    Toggle,
    PushToTalk,
}

impl Default for RecordingMode {
    fn default() -> Self {
        Self::Toggle
    }
}

/// Recording state machine
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../src/features/voice-input/types/generated/")]
#[serde(rename_all = "lowercase")]
pub enum RecordingState {
    Idle,
    Starting,
    Recording,
    Stopping,
    Transcribing,
    Error,
}

impl RecordingState {
    /// Check if we can transition to the target state
    pub fn can_transition_to(&self, target: &RecordingState) -> bool {
        use RecordingState::*;

        match (self, target) {
            // From Idle
            (Idle, Starting) => true,
            // From Starting
            (Starting, Recording) | (Starting, Error) | (Starting, Idle) => true,
            // From Recording
            (Recording, Stopping) | (Recording, Error) => true,
            // From Stopping
            (Stopping, Transcribing) | (Stopping, Idle) | (Stopping, Error) => true,
            // From Transcribing
            (Transcribing, Idle) | (Transcribing, Error) => true,
            // From Error
            (Error, Idle) => true,
            // Same state is always allowed
            (a, b) if a == b => true,
            // All other transitions are invalid
            _ => false,
        }
    }
}

/// Global recording state
pub struct RecordingStateManager {
    state: Arc<Mutex<RecordingState>>,
    mode: Arc<Mutex<RecordingMode>>,
    current_file: Arc<Mutex<Option<PathBuf>>>,
    error_message: Arc<Mutex<Option<String>>>,
    recording_device: Arc<Mutex<Option<String>>>,
    start_time: Arc<Mutex<Option<i64>>>,
}

impl RecordingStateManager {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(RecordingState::Idle)),
            mode: Arc::new(Mutex::new(RecordingMode::Toggle)),
            current_file: Arc::new(Mutex::new(None)),
            error_message: Arc::new(Mutex::new(None)),
            recording_device: Arc::new(Mutex::new(None)),
            start_time: Arc::new(Mutex::new(None)),
        }
    }

    /// Get current state
    pub fn get_state(&self) -> RecordingState {
        *self.state.lock().unwrap()
    }

    /// Set state (with validation)
    pub fn set_state(&self, new_state: RecordingState) -> Result<(), String> {
        let mut state = self.state.lock().unwrap();

        if !state.can_transition_to(&new_state) {
            return Err(format!(
                "Invalid state transition: {:?} -> {:?}",
                *state, new_state
            ));
        }

        *state = new_state;
        Ok(())
    }

    /// Force set state (bypass validation - use with caution)
    pub fn force_set_state(&self, new_state: RecordingState) {
        *self.state.lock().unwrap() = new_state;
    }

    /// Get current mode
    pub fn get_mode(&self) -> RecordingMode {
        *self.mode.lock().unwrap()
    }

    /// Set recording mode
    pub fn set_mode(&self, new_mode: RecordingMode) {
        *self.mode.lock().unwrap() = new_mode;
    }

    /// Set current recording file
    pub fn set_current_file(&self, path: Option<PathBuf>) {
        *self.current_file.lock().unwrap() = path;
    }

    /// Get current recording file
    pub fn get_current_file(&self) -> Option<PathBuf> {
        self.current_file.lock().unwrap().clone()
    }

    /// Set error message
    pub fn set_error(&self, message: Option<String>) {
        *self.error_message.lock().unwrap() = message;
    }

    /// Get error message
    pub fn get_error(&self) -> Option<String> {
        self.error_message.lock().unwrap().clone()
    }

    /// Check if currently recording
    pub fn is_recording(&self) -> bool {
        matches!(self.get_state(), RecordingState::Recording)
    }

    /// Check if in active state (not idle or error)
    pub fn is_active(&self) -> bool {
        !matches!(
            self.get_state(),
            RecordingState::Idle | RecordingState::Error
        )
    }

    /// Set recording device
    pub fn set_recording_device(&self, device: Option<String>) {
        *self.recording_device.lock().unwrap() = device;
    }

    /// Get recording device
    pub fn get_recording_device(&self) -> Option<String> {
        self.recording_device.lock().unwrap().clone()
    }

    /// Set recording start time
    pub fn set_start_time(&self, time: Option<i64>) {
        *self.start_time.lock().unwrap() = time;
    }

    /// Get recording start time
    pub fn get_start_time(&self) -> Option<i64> {
        *self.start_time.lock().unwrap()
    }
}

impl Default for RecordingStateManager {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_state_transitions() {
        use RecordingState::*;

        // Valid transitions
        assert!(Idle.can_transition_to(&Starting));
        assert!(Starting.can_transition_to(&Recording));
        assert!(Recording.can_transition_to(&Stopping));
        assert!(Stopping.can_transition_to(&Transcribing));
        assert!(Transcribing.can_transition_to(&Idle));

        // Invalid transitions
        assert!(!Idle.can_transition_to(&Recording)); // Must go through Starting
        assert!(!Recording.can_transition_to(&Transcribing)); // Must go through Stopping
    }

    #[test]
    fn test_state_manager() {
        let manager = RecordingStateManager::new();

        assert_eq!(manager.get_state(), RecordingState::Idle);
        assert_eq!(manager.get_mode(), RecordingMode::Toggle);

        // Test valid transition
        let result = manager.set_state(RecordingState::Starting);
        assert!(result.is_ok());
        assert_eq!(manager.get_state(), RecordingState::Starting);

        // Test invalid transition
        let result = manager.set_state(RecordingState::Transcribing);
        assert!(result.is_err());
    }
}
