use crate::shortcut_utils::parse_shortcut;
use crate::SPOTLIGHT_LABEL;
use tauri::{App, Emitter, Manager, Result};
use tauri_nspanel::ManagerExt;
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutEvent, ShortcutState};
use tauri_plugin_store::StoreExt;

/// Configuration for a shortcut
pub struct ShortcutConfig {
    /// The shortcut key combination
    pub shortcut: Shortcut,
    /// The setting key in the store (for future use with multiple shortcuts)
    pub setting_key: String,
    /// The default shortcut string (e.g., "Alt+Space")
    pub default: String,
}

/// Registers the voice input shortcut
pub fn register_voice_input_shortcut(app: &App) -> Result<()> {
    let voice_input_shortcut = get_voice_input_shortcut_from_settings(app);

    let shortcut = parse_shortcut(&voice_input_shortcut)
        .unwrap_or(Shortcut::new(Some(Modifiers::ALT), Code::Space));

    app.handle().plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_shortcuts([shortcut])
            .expect("Failed to register shortcut")
            .with_handler(move |app, shortcut, event| {
                handle_voice_input_shortcut(app, shortcut, event);
            })
            .build(),
    )?;

    Ok(())
}

/// Retrieves the voice input shortcut from settings
fn get_voice_input_shortcut_from_settings(app: &App) -> String {
    let store = app.store("settings");
    store
        .ok()
        .and_then(|store| store.get("settings"))
        .and_then(|settings| {
            settings
                .as_object()
                .and_then(|s| s.get("voiceInput"))
                .and_then(|t| t.get("shortcut"))
                .and_then(|m| m.as_str().map(String::from))
        })
        .unwrap_or("Alt+Space".to_string())
}

/// Handles the voice input shortcut press
fn handle_voice_input_shortcut(app: &tauri::AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    if event.state == ShortcutState::Pressed && event.id == shortcut.id() {
        let panel = app.get_webview_panel(SPOTLIGHT_LABEL).unwrap();
        if panel.is_visible() {
            let handle = app.app_handle();
            handle.emit("stop_recording", ()).unwrap();
        } else {
            let handle = app.app_handle();
            handle.emit("show_voice_input", ()).unwrap();
            panel.show();
        }
    }
}

// Future: Function to register multiple shortcuts
// pub fn register_shortcuts(app: &App, configs: Vec<ShortcutConfig>) -> Result<()> {
//     // Implementation for registering multiple shortcuts
//     // This can be used when we need to register different shortcuts for different features
//     Ok(())
// }
