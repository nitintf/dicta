use tauri::command;

#[cfg(target_os = "macos")]
use std::process::Command;

#[cfg(target_os = "macos")]
use serde::{Deserialize, Serialize};

use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(
    export,
    export_to = "../../src/features/transcriptions/types/generated/"
)]
#[serde(rename_all = "camelCase")]
pub struct FocusedApp {
    pub name: String,
    pub bundle_id: String,
}

/// Get the currently focused application (macOS only)
#[command]
pub async fn get_focused_app() -> Result<FocusedApp, String> {
    #[cfg(target_os = "macos")]
    {
        // Use AppleScript to get frontmost application info
        let script = r#"
            tell application "System Events"
                set frontApp to first application process whose frontmost is true
                set appName to name of frontApp
                set appBundleID to bundle identifier of frontApp
                return appName & "|" & appBundleID
            end tell
        "#;

        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| format!("Failed to get focused app: {}", e))?;

        let result = String::from_utf8_lossy(&output.stdout);
        let parts: Vec<&str> = result.trim().split('|').collect();

        if parts.len() >= 2 {
            Ok(FocusedApp {
                name: parts[0].to_string(),
                bundle_id: parts[1].to_string(),
            })
        } else {
            Err("Failed to parse focused app info".to_string())
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("get_focused_app is only supported on macOS".to_string())
    }
}

/// Copy text to clipboard and simulate paste at cursor position
#[command]
pub async fn copy_and_paste(text: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        // DEBUG: Check which app is focused before pasting
        let focused_app = match get_focused_app().await {
            Ok(app) => {
                println!("=== PASTE DEBUG ===");
                println!("Focused app: {} ({})", app.name, app.bundle_id);
                println!("Text to paste: {}", &text[..text.len().min(50)]);
                app
            }
            Err(e) => {
                println!("=== PASTE DEBUG ===");
                println!("ERROR: Could not get focused app: {}", e);
                return Err(e);
            }
        };

        // Copy to clipboard using pbcopy
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

        println!("Clipboard updated, waiting before paste...");

        // Wait for clipboard to be ready
        std::thread::sleep(std::time::Duration::from_millis(100));

        // CRITICAL: Activate the app and make it key window to receive keyboard input
        let activate_script = format!(
            r#"
            tell application "{}"
                activate
            end tell
            tell application "System Events"
                tell process "{}"
                    set frontmost to true
                end tell
            end tell
            "#,
            focused_app.name, focused_app.name
        );

        println!(
            "Activating {} and making it key window...",
            focused_app.name
        );

        Command::new("osascript")
            .arg("-e")
            .arg(&activate_script)
            .output()
            .map_err(|e| format!("Failed to activate app: {}", e))?;

        // Wait for activation to complete
        std::thread::sleep(std::time::Duration::from_millis(200));

        // Use System Events to paste - this should work with the frontmost app
        let paste_script = r#"
            tell application "System Events"
                keystroke "v" using command down
            end tell
        "#;

        println!("Sending Cmd+V...");

        let output = Command::new("osascript")
            .arg("-e")
            .arg(paste_script)
            .output()
            .map_err(|e| format!("Failed to execute paste command: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            println!("Paste command failed: {}", stderr);
        } else {
            println!("Paste command sent successfully");
        }

        println!("===================");

        Ok(())
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Auto-paste is only supported on macOS".to_string())
    }
}
