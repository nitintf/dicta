use tauri::command;

#[cfg(target_os = "macos")]
use std::process::Command;

/// Copy text to clipboard and simulate paste at cursor position
#[command]
pub async fn copy_and_paste(text: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // First, copy to clipboard using pbcopy
        let mut pbcopy = Command::new("pbcopy")
            .stdin(std::process::Stdio::piped())
            .spawn()
            .map_err(|e| format!("Failed to spawn pbcopy: {}", e))?;

        use std::io::Write;
        if let Some(mut stdin) = pbcopy.stdin.take() {
            stdin
                .write_all(text.as_bytes())
                .map_err(|e| format!("Failed to write to pbcopy: {}", e))?;
        }

        pbcopy
            .wait()
            .map_err(|e| format!("Failed to wait for pbcopy: {}", e))?;

        // Wait a tiny bit to ensure clipboard is updated
        std::thread::sleep(std::time::Duration::from_millis(50));

        // Simulate Cmd+V using AppleScript
        let script = r#"
            tell application "System Events"
                keystroke "v" using command down
            end tell
        "#;

        Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| format!("Failed to execute paste command: {}", e))?;

        Ok(())
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Auto-paste is only supported on macOS".to_string())
    }
}
