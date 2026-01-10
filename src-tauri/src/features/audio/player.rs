use std::path::PathBuf;
use std::process::Command;

fn get_sound_path(filename: &str) -> Result<PathBuf, String> {
    let locations = vec![
        PathBuf::from(format!("../public/{}", filename)),
        {
            let mut path = std::env::current_dir().unwrap_or_default();
            path.push("public");
            path.push(filename);
            path
        },
        {
            let exe_path = std::env::current_exe().unwrap_or_default();
            let mut path = exe_path
                .parent()
                .unwrap_or(std::path::Path::new("."))
                .to_path_buf();

            #[cfg(target_os = "macos")]
            if path.ends_with("MacOS") {
                path.pop();
                path.push("Resources");
            }

            path.push(filename);
            path
        },
    ];

    for path in locations {
        if path.exists() {
            log::info!("Found sound file at: {}", path.display());
            return Ok(path);
        }
    }

    Err(format!(
        "Sound file not found: {}. Tried multiple locations.",
        filename
    ))
}

#[cfg(target_os = "macos")]
pub fn play_sound(filename: &str) -> Result<(), String> {
    play_sound_with_volume(filename, 0.03)
}

#[cfg(target_os = "macos")]
pub fn play_sound_with_volume(filename: &str, volume: f32) -> Result<(), String> {
    match get_sound_path(filename) {
        Ok(sound_path) => {
            let sound_path_str = sound_path.to_string_lossy().to_string();

            std::thread::spawn(move || {
                let result = Command::new("afplay")
                    .arg("-v")
                    .arg(volume.to_string())
                    .arg(&sound_path_str)
                    .spawn();
                if let Err(e) = result {
                    log::error!("Failed to play sound {}: {}", sound_path_str, e);
                }
            });
            Ok(())
        }
        Err(e) => {
            log::warn!("Sound file not found, skipping: {}", e);
            Ok(())
        }
    }
}

#[cfg(target_os = "windows")]
pub fn play_sound(filename: &str) -> Result<(), String> {
    play_sound_with_volume(filename, 0.03)
}

#[cfg(target_os = "windows")]
pub fn play_sound_with_volume(filename: &str, volume: f32) -> Result<(), String> {
    match get_sound_path(filename) {
        Ok(sound_path) => {
            let sound_path_str = sound_path.to_string_lossy().to_string();
            // Escape single quotes for PowerShell
            let escaped_path = sound_path_str.replace('\'', "''");

            std::thread::spawn(move || {
                // Use PowerShell to play sound with volume control
                let _ = Command::new("powershell")
                    .args([
                        "-c",
                        &format!(
                            "$player = New-Object Media.SoundPlayer '{}'; $player.Volume = {}; $player.PlaySync()",
                            escaped_path, volume
                        ),
                    ])
                    .spawn();
            });
            Ok(())
        }
        Err(e) => {
            log::warn!("Sound file not found, skipping: {}", e);
            Ok(())
        }
    }
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub fn play_sound(_filename: &str) -> Result<(), String> {
    Ok(())
}

#[cfg(not(any(target_os = "macos", target_os = "windows")))]
pub fn play_sound_with_volume(_filename: &str, _volume: f32) -> Result<(), String> {
    Ok(())
}

pub fn play_recording_start_sound() -> Result<(), String> {
    play_sound("main.mp3")
}

pub fn play_recording_stop_sound() -> Result<(), String> {
    play_sound("main.mp3")
}

pub fn play_error_sound() -> Result<(), String> {
    play_sound("cancel.wav")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_play_sound() {
        let result = play_recording_start_sound();
        assert!(result.is_ok());
    }
}
