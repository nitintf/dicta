use crate::shortcut_utils::parse_shortcut;
use crate::SPOTLIGHT_LABEL;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tauri::{command, App, AppHandle, Emitter, Manager, Result, State};
use tauri_nspanel::ManagerExt;
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutEvent, ShortcutState,
};
use tauri_plugin_store::StoreExt;

pub struct ShortcutManager {
    pub voice_input_shortcut: Arc<Mutex<Option<Shortcut>>>,
    pub paste_shortcut: Arc<Mutex<Option<Shortcut>>>,
    pub shortcuts_enabled: Arc<Mutex<bool>>,
    pub last_paste_time: Arc<Mutex<Option<Instant>>>,
    pub last_voice_input_time: Arc<Mutex<Option<Instant>>>,
}

impl ShortcutManager {
    pub fn new() -> Self {
        Self {
            voice_input_shortcut: Arc::new(Mutex::new(None)),
            paste_shortcut: Arc::new(Mutex::new(None)),
            shortcuts_enabled: Arc::new(Mutex::new(true)),
            last_paste_time: Arc::new(Mutex::new(None)),
            last_voice_input_time: Arc::new(Mutex::new(None)),
        }
    }
}

/// Registers the voice input and paste shortcuts
pub fn register_voice_input_shortcut(app: &App) -> Result<()> {
    let voice_input_shortcut_str = get_voice_input_shortcut_from_settings(app.handle());
    let paste_shortcut_str = get_paste_shortcut_from_settings(app.handle());

    let voice_shortcut = parse_shortcut(&voice_input_shortcut_str)
        .unwrap_or(Shortcut::new(Some(Modifiers::ALT), Code::Space));

    let paste_shortcut = parse_shortcut(&paste_shortcut_str).unwrap_or(Shortcut::new(
        Some(Modifiers::SUPER | Modifiers::SHIFT),
        Code::KeyV,
    ));

    app.handle().plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_shortcuts([voice_shortcut.clone(), paste_shortcut.clone()])
            .expect("Failed to register shortcut")
            .with_handler(move |app, shortcut, event| {
                if shortcut.id() == voice_shortcut.id() {
                    handle_voice_input_shortcut(app, shortcut, event);
                } else if shortcut.id() == paste_shortcut.id() {
                    handle_paste_shortcut(app, shortcut, event);
                }
            })
            .build(),
    )?;

    // Store shortcuts in state
    let shortcut_state = app.state::<ShortcutManager>();
    if let Ok(mut current) = shortcut_state.voice_input_shortcut.lock() {
        *current = Some(voice_shortcut);
    }
    if let Ok(mut current) = shortcut_state.paste_shortcut.lock() {
        *current = Some(paste_shortcut);
    }

    Ok(())
}

/// Retrieves the voice input shortcut from settings
fn get_voice_input_shortcut_from_settings(app: &AppHandle) -> String {
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

/// Command to update the voice input shortcut
#[command]
pub async fn update_voice_input_shortcut(
    app: AppHandle,
    shortcut_str: String,
    shortcut_state: State<'_, ShortcutManager>,
) -> std::result::Result<(), String> {
    println!("Updating voice input shortcut to: {}", shortcut_str);

    // Check if shortcuts are enabled
    let shortcuts_enabled = *shortcut_state
        .shortcuts_enabled
        .lock()
        .map_err(|e| format!("Failed to lock shortcuts_enabled: {}", e))?;

    if !shortcuts_enabled {
        println!("Shortcuts are disabled, skipping registration");
        return Ok(());
    }

    // Parse the new shortcut
    let new_shortcut = parse_shortcut(&shortcut_str)
        .ok_or_else(|| format!("Failed to parse shortcut: {}", shortcut_str))?;

    // Unregister old shortcut if it exists
    if let Ok(mut old_shortcut) = shortcut_state.voice_input_shortcut.lock() {
        if let Some(old) = old_shortcut.take() {
            println!("Unregistering old voice input shortcut");
            let _ = app.global_shortcut().unregister(old);
        }
    }

    // Register new shortcut
    let shortcut_clone = new_shortcut.clone();
    app.global_shortcut()
        .on_shortcut(new_shortcut.clone(), move |app, shortcut, event| {
            handle_voice_input_shortcut(app, shortcut, event);
        })
        .map_err(|e| format!("Failed to register voice input shortcut: {}", e))?;

    // Store the new shortcut
    if let Ok(mut current) = shortcut_state.voice_input_shortcut.lock() {
        *current = Some(shortcut_clone);
    }

    println!("Voice input shortcut updated successfully");
    Ok(())
}

/// Command to update the paste last transcript shortcut
#[command]
pub async fn update_paste_shortcut(
    app: AppHandle,
    shortcut_str: String,
    shortcut_state: State<'_, ShortcutManager>,
) -> std::result::Result<(), String> {
    println!("Updating paste shortcut to: {}", shortcut_str);

    // Check if shortcuts are enabled
    let shortcuts_enabled = *shortcut_state
        .shortcuts_enabled
        .lock()
        .map_err(|e| format!("Failed to lock shortcuts_enabled: {}", e))?;

    if !shortcuts_enabled {
        println!("Shortcuts are disabled, skipping registration");
        return Ok(());
    }

    // Parse the new shortcut
    let new_shortcut = parse_shortcut(&shortcut_str)
        .ok_or_else(|| format!("Failed to parse shortcut: {}", shortcut_str))?;

    // Unregister old shortcut if it exists
    if let Ok(mut old_shortcut) = shortcut_state.paste_shortcut.lock() {
        if let Some(old) = old_shortcut.take() {
            println!("Unregistering old paste shortcut");
            let _ = app.global_shortcut().unregister(old);
        }
    }

    // Register new shortcut
    let shortcut_clone = new_shortcut.clone();
    app.global_shortcut()
        .on_shortcut(new_shortcut.clone(), move |app, shortcut, event| {
            handle_paste_shortcut(app, shortcut, event);
        })
        .map_err(|e| format!("Failed to register paste shortcut: {}", e))?;

    // Store the new shortcut
    if let Ok(mut current) = shortcut_state.paste_shortcut.lock() {
        *current = Some(shortcut_clone);
    }

    println!("Paste shortcut updated successfully");
    Ok(())
}

/// Handles the paste last transcript shortcut
fn handle_paste_shortcut(app: &AppHandle, shortcut: &Shortcut, event: ShortcutEvent) {
    if event.state == ShortcutState::Pressed && event.id == shortcut.id() {
        println!("Paste shortcut triggered");

        // Trigger paste in async runtime
        let app_clone = app.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = crate::transcription::paste_last_transcript(app_clone).await {
                eprintln!("Failed to paste last transcript: {}", e);
            }
        });
    }
}

/// Command to disable all global shortcuts
#[command]
pub async fn disable_global_shortcuts(
    app: AppHandle,
    shortcut_state: State<'_, ShortcutManager>,
) -> std::result::Result<(), String> {
    println!("Disabling all global shortcuts");

    // Unregister voice input shortcut
    if let Ok(mut voice_shortcut) = shortcut_state.voice_input_shortcut.lock() {
        if let Some(shortcut) = voice_shortcut.take() {
            let _ = app.global_shortcut().unregister(shortcut);
        }
    }

    // Unregister paste shortcut
    if let Ok(mut paste_shortcut) = shortcut_state.paste_shortcut.lock() {
        if let Some(shortcut) = paste_shortcut.take() {
            let _ = app.global_shortcut().unregister(shortcut);
        }
    }

    // Set shortcuts as disabled
    if let Ok(mut enabled) = shortcut_state.shortcuts_enabled.lock() {
        *enabled = false;
    }

    println!("All global shortcuts disabled");
    Ok(())
}

/// Command to enable all global shortcuts
#[command]
pub async fn enable_global_shortcuts(
    app: AppHandle,
    shortcut_state: State<'_, ShortcutManager>,
) -> std::result::Result<(), String> {
    println!("Enabling all global shortcuts");

    // Set shortcuts as enabled
    if let Ok(mut enabled) = shortcut_state.shortcuts_enabled.lock() {
        *enabled = true;
    }

    // Re-register voice input shortcut from settings
    let voice_input_shortcut = get_voice_input_shortcut_from_settings(&app);
    if let Ok(parsed) = parse_shortcut(&voice_input_shortcut)
        .ok_or_else(|| "Failed to parse voice input shortcut".to_string())
    {
        let shortcut_clone = parsed.clone();
        app.global_shortcut()
            .on_shortcut(parsed.clone(), move |app, shortcut, event| {
                handle_voice_input_shortcut(app, shortcut, event);
            })
            .map_err(|e| format!("Failed to register voice input shortcut: {}", e))?;

        if let Ok(mut current) = shortcut_state.voice_input_shortcut.lock() {
            *current = Some(shortcut_clone);
        }
    }

    // Re-register paste shortcut from settings
    let paste_shortcut = get_paste_shortcut_from_settings(&app);
    if let Ok(parsed) =
        parse_shortcut(&paste_shortcut).ok_or_else(|| "Failed to parse paste shortcut".to_string())
    {
        let shortcut_clone = parsed.clone();
        app.global_shortcut()
            .on_shortcut(parsed.clone(), move |app, shortcut, event| {
                handle_paste_shortcut(app, shortcut, event);
            })
            .map_err(|e| format!("Failed to register paste shortcut: {}", e))?;

        if let Ok(mut current) = shortcut_state.paste_shortcut.lock() {
            *current = Some(shortcut_clone);
        }
    }

    println!("All global shortcuts enabled");
    Ok(())
}

/// Retrieves the paste shortcut from settings
fn get_paste_shortcut_from_settings(app: &AppHandle) -> String {
    let store = app.store("settings");
    store
        .ok()
        .and_then(|store| store.get("settings"))
        .and_then(|settings| {
            settings
                .as_object()
                .and_then(|s| s.get("shortcuts"))
                .and_then(|t| t.get("pasteLastTranscript"))
                .and_then(|m| m.as_str().map(String::from))
        })
        .unwrap_or("CmdOrCtrl+Shift+V".to_string())
}
