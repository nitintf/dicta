use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{Device, Host, Stream, StreamConfig};
use hound::{WavSpec, WavWriter};
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};

/// Audio recorder state
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum RecorderState {
    Idle,
    Recording,
    Error,
}

/// Audio recorder configuration
#[derive(Debug, Clone)]
pub struct RecorderConfig {
    pub sample_rate: u32,
    pub channels: u16,
    pub bits_per_sample: u16,
}

impl Default for RecorderConfig {
    fn default() -> Self {
        Self {
            sample_rate: 16000, // Optimal for speech recognition
            channels: 1,        // Mono
            bits_per_sample: 16,
        }
    }
}

/// Main audio recorder
pub struct AudioRecorder {
    state: Arc<Mutex<RecorderState>>,
    stream: Arc<Mutex<Option<Stream>>>,
    writer: Arc<Mutex<Option<WavWriter<std::io::BufWriter<std::fs::File>>>>>,
    is_recording: Arc<AtomicBool>,
    config: RecorderConfig,
}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(RecorderState::Idle)),
            stream: Arc::new(Mutex::new(None)),
            writer: Arc::new(Mutex::new(None)),
            is_recording: Arc::new(AtomicBool::new(false)),
            config: RecorderConfig::default(),
        }
    }

    /// Get the default input device
    fn get_input_device(host: &Host) -> Result<Device, String> {
        host.default_input_device()
            .ok_or_else(|| "No input device available".to_string())
    }

    fn get_device_by_name(host: &Host, device_name: &str) -> Result<Device, String> {
        host.input_devices()
            .map_err(|e| format!("Failed to enumerate devices: {}", e))?
            .find(|device| {
                device
                    .description()
                    .map(|desc| desc.name() == device_name)
                    .unwrap_or(false)
            })
            .ok_or_else(|| format!("Device '{}' not found", device_name))
    }

    /// Start recording to a file
    pub fn start_recording(
        &mut self,
        output_path: impl AsRef<Path>,
        device_name: Option<String>,
    ) -> Result<(), String> {
        // Check if already recording
        if self.is_recording.load(Ordering::Acquire) {
            return Err("Already recording".to_string());
        }

        let host = cpal::default_host();

        // Get the input device
        let device = if let Some(name) = device_name {
            Self::get_device_by_name(&host, &name)?
        } else {
            Self::get_input_device(&host)?
        };

        let device_name = device
            .description()
            .map(|desc| desc.name().to_string())
            .unwrap_or_else(|_| "Unknown".to_string());
        log::info!("Using audio device: {}", device_name);

        // Get the default input config
        let config = device
            .default_input_config()
            .map_err(|e| format!("Failed to get default input config: {}", e))?;

        let stream_config: StreamConfig = config.into();

        // Create WAV writer
        let spec = WavSpec {
            channels: self.config.channels,
            sample_rate: self.config.sample_rate,
            bits_per_sample: self.config.bits_per_sample,
            sample_format: hound::SampleFormat::Int,
        };

        let writer = WavWriter::create(output_path.as_ref(), spec)
            .map_err(|e| format!("Failed to create WAV file: {}", e))?;

        // Store writer directly in self.writer so both callback and stop_recording can access it
        *self.writer.lock().unwrap() = Some(writer);

        // Clone Arc references for the callback
        let writer_clone = Arc::clone(&self.writer);
        let is_recording = Arc::clone(&self.is_recording);

        let stream = device
            .build_input_stream(
                &stream_config,
                move |data: &[f32], _: &cpal::InputCallbackInfo| {
                    if !is_recording.load(Ordering::Acquire) {
                        return;
                    }

                    let mut writer_guard = writer_clone.lock().unwrap();
                    if let Some(ref mut writer) = *writer_guard {
                        for &sample in data.iter() {
                            let sample_i16 = (sample * i16::MAX as f32) as i16;
                            let _ = writer.write_sample(sample_i16);
                        }
                    } else {
                        log::error!("Writer is None in audio callback - this should not happen!");
                    }
                },
                |err| {
                    log::error!("Audio stream error: {}", err);
                },
                None,
            )
            .map_err(|e| format!("Failed to build input stream: {}", e))?;

        // Start the stream
        stream
            .play()
            .map_err(|e| format!("Failed to start stream: {}", e))?;

        // Update state
        self.is_recording.store(true, Ordering::Release);
        *self.state.lock().unwrap() = RecorderState::Recording;
        *self.stream.lock().unwrap() = Some(stream);

        log::info!("Recording started");
        Ok(())
    }

    /// Stop recording
    pub fn stop_recording(&mut self) -> Result<(), String> {
        if !self.is_recording.load(Ordering::Acquire) {
            return Err("Not recording".to_string());
        }

        // Signal to stop recording
        self.is_recording.store(false, Ordering::Release);

        // Drop the stream to stop it
        if let Ok(mut stream_guard) = self.stream.lock() {
            *stream_guard = None;
        }

        // Finalize the WAV file
        if let Ok(mut writer_guard) = self.writer.lock() {
            if let Some(writer) = writer_guard.take() {
                writer
                    .finalize()
                    .map_err(|e| format!("Failed to finalize WAV file: {}", e))?;
            }
        }

        // Update state
        *self.state.lock().unwrap() = RecorderState::Idle;

        log::info!("Recording stopped");
        Ok(())
    }

    /// Check if currently recording
    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::Acquire)
    }

    /// Get current recorder state
    pub fn get_state(&self) -> RecorderState {
        *self.state.lock().unwrap()
    }

    pub fn list_devices() -> Result<Vec<String>, String> {
        let host = cpal::default_host();
        let devices = host
            .input_devices()
            .map_err(|e| format!("Failed to enumerate devices: {}", e))?;

        let device_names: Vec<String> = devices
            .filter_map(|device| {
                device
                    .description()
                    .ok()
                    .map(|desc| desc.name().to_string())
            })
            .collect();

        Ok(device_names)
    }
}

impl Drop for AudioRecorder {
    fn drop(&mut self) {
        // Ensure recording is stopped and resources are cleaned up
        let _ = self.stop_recording();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_recorder_initialization() {
        let recorder = AudioRecorder::new();
        assert_eq!(recorder.get_state(), RecorderState::Idle);
        assert!(!recorder.is_recording());
    }

    #[test]
    fn test_list_devices() {
        let devices = AudioRecorder::list_devices();
        // Should at least not error out
        assert!(devices.is_ok());
    }

    #[test]
    fn test_recording_lifecycle() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.wav");

        let mut recorder = AudioRecorder::new();

        // Start recording
        let result = recorder.start_recording(&file_path, None);
        if result.is_ok() {
            assert!(recorder.is_recording());
            assert_eq!(recorder.get_state(), RecorderState::Recording);

            // Stop recording
            std::thread::sleep(std::time::Duration::from_millis(100));
            let stop_result = recorder.stop_recording();
            assert!(stop_result.is_ok());
            assert!(!recorder.is_recording());
            assert_eq!(recorder.get_state(), RecorderState::Idle);

            // Verify file was created
            assert!(file_path.exists());
        }
    }
}
