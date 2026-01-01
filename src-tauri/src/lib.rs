use tauri::menu::{MenuBuilder, MenuItem, PredefinedMenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Listener, Manager};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

#[cfg(target_os = "macos")]
use tauri_nspanel::ManagerExt;
use window::WebviewWindowExt;

mod clipboard_utils;
mod models;
mod transcription;
mod window;

use models::{
    delete_whisper_model, download_whisper_model, get_all_models, get_local_model_status,
    get_model_path, list_available_models, start_local_model, stop_local_model, WhisperManager,
};
use transcription::{check_whisper_available, transcribe_and_process};

use std::sync::Arc;
use tokio::sync::Mutex;

pub const SPOTLIGHT_LABEL: &str = "voice-input";

fn char_to_code(ch: char) -> Option<Code> {
    match ch {
        'A' => Some(Code::KeyA),
        'B' => Some(Code::KeyB),
        'C' => Some(Code::KeyC),
        'D' => Some(Code::KeyD),
        'E' => Some(Code::KeyE),
        'F' => Some(Code::KeyF),
        'G' => Some(Code::KeyG),
        'H' => Some(Code::KeyH),
        'I' => Some(Code::KeyI),
        'J' => Some(Code::KeyJ),
        'K' => Some(Code::KeyK),
        'L' => Some(Code::KeyL),
        'M' => Some(Code::KeyM),
        'N' => Some(Code::KeyN),
        'O' => Some(Code::KeyO),
        'P' => Some(Code::KeyP),
        'Q' => Some(Code::KeyQ),
        'R' => Some(Code::KeyR),
        'S' => Some(Code::KeyS),
        'T' => Some(Code::KeyT),
        'U' => Some(Code::KeyU),
        'V' => Some(Code::KeyV),
        'W' => Some(Code::KeyW),
        'X' => Some(Code::KeyX),
        'Y' => Some(Code::KeyY),
        'Z' => Some(Code::KeyZ),
        _ => None,
    }
}

fn parse_shortcut(shortcut_str: &str) -> Option<Shortcut> {
    println!("Attempting to parse shortcut: {}", shortcut_str);
    let parts: Vec<&str> = shortcut_str.split('+').map(str::trim).collect();
    println!("Split parts: {:?}", parts);
    if parts.is_empty() {
        println!("No parts found in shortcut string");
        return None;
    }

    let mut modifiers = Modifiers::empty();
    let key_str = parts.last()?;
    println!("Key string: {}", key_str);

    // Parse modifiers from all parts except last
    for modifier in &parts[..parts.len() - 1] {
        println!("Processing modifier: {}", modifier);
        match modifier.to_lowercase().as_str() {
            "alt" => modifiers |= Modifiers::ALT,
            "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "super" | "cmd" | "command" => modifiers |= Modifiers::SUPER,
            _ => {
                println!("Unknown modifier: {}", modifier);
                return None;
            }
        }
    }
    println!("Final modifiers: {:?}", modifiers);

    let code = match key_str.to_lowercase().as_str() {
        "space" => Code::Space,
        "enter" => Code::Enter,
        "tab" => Code::Tab,
        "escape" => Code::Escape,
        c if c.len() == 1 => {
            let ch = c.chars().next()?;
            char_to_code(ch.to_ascii_uppercase())?
        }
        _ => return None,
    };

    Some(Shortcut::new(Some(modifiers), code))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)] // only enable instrumentation in development builds
    let devtools = tauri_plugin_devtools::init();

    // Initialize WhisperManager state for persistent model loading
    let whisper_manager = Arc::new(Mutex::new(WhisperManager::new()));

    let mut builder = tauri::Builder::default()
        .manage(whisper_manager)
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(
            tauri_plugin_stronghold::Builder::new(|_pass| {
                // Simple password derivation for now
                vec![0u8; 32]
            })
            .build(),
        )
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_macos_permissions::init())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_mic_recorder::init());

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools);
    }

    #[cfg(target_os = "macos")]
    {
        builder = builder.plugin(tauri_nspanel::init());
    }

    #[cfg(target_os = "macos")]
    let setup_fn = move |app: &mut tauri::App| {
        // Hide dock icon - app will only appear in menu bar (must be first)
        app.set_activation_policy(ActivationPolicy::Accessory);

        let handle = app.app_handle();

        // Get whisper manager for cleanup on quit
        let whisper_state = app.state::<Arc<Mutex<WhisperManager>>>();
        let whisper_cleanup = whisper_state.inner().clone();

        // Create system tray menu
        let shortcuts_submenu = SubmenuBuilder::new(app, "Shortcuts")
            .item(&MenuItem::with_id(
                app,
                "microphone",
                "Microphone",
                true,
                None::<&str>,
            )?)
            .build()?;

        let tray_menu = MenuBuilder::new(app)
            .item(&MenuItem::with_id(app, "home", "Home", true, None::<&str>)?)
            .item(&MenuItem::with_id(
                app,
                "check-updates",
                "Check for updates...",
                true,
                None::<&str>,
            )?)
            .item(&MenuItem::with_id(
                app,
                "paste-last",
                "Paste last transcript",
                true,
                Some("CmdOrCtrl+Shift+V"),
            )?)
            .separator()
            .item(&shortcuts_submenu)
            .separator()
            .item(&MenuItem::with_id(
                app,
                "settings-tray",
                "Settings",
                true,
                None::<&str>,
            )?)
            .separator()
            .item(&MenuItem::with_id(
                app,
                "help-center",
                "Help Center",
                true,
                None::<&str>,
            )?)
            .item(&MenuItem::with_id(
                app,
                "talk-to-support",
                "Talk to support",
                true,
                Some("CmdOrCtrl+/"),
            )?)
            .item(&MenuItem::with_id(
                app,
                "general-feedback",
                "General feedback",
                true,
                None::<&str>,
            )?)
            .separator()
            .item(&MenuItem::with_id(
                app,
                "quit",
                "Quit Dicta",
                true,
                Some("CmdOrCtrl+Q"),
            )?)
            .build()?;

        // Create tray icon with menu
        let _tray = TrayIconBuilder::new()
            .menu(&tray_menu)
            .icon(app.default_window_icon().unwrap().clone())
            .on_menu_event(move |app, event| {
                match event.id().as_ref() {
                    "home" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "check-updates" => {
                        // TODO: Implement update check
                        println!("Check for updates clicked");
                    }
                    "paste-last" => {
                        // TODO: Implement paste last transcript
                        println!("Paste last transcript clicked");
                    }
                    "microphone" => {
                        // TODO: Open microphone settings
                        println!("Microphone settings clicked");
                    }
                    "settings-tray" => {
                        // TODO: Open settings window/page
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                            // TODO: Navigate to settings page
                        }
                    }
                    "help-center" => {
                        // TODO: Open help center URL
                        println!("Help center clicked");
                    }
                    "talk-to-support" => {
                        // TODO: Open support URL
                        println!("Talk to support clicked");
                    }
                    "general-feedback" => {
                        // TODO: Open feedback URL
                        println!("General feedback clicked");
                    }
                    "quit" => {
                        // Cleanup whisper model before exit
                        let whisper = whisper_cleanup.clone();
                        let runtime = tokio::runtime::Runtime::new().unwrap();
                        runtime.block_on(async {
                            let mut manager = whisper.lock().await;
                            manager.unload_model();
                            println!("Whisper model stopped on app exit");
                        });
                        app.exit(0);
                    }
                    _ => {}
                }
            })
            .build(app)?;

        // Prevent app from quitting when main window is closed
        if let Some(window) = app.get_webview_window("main") {
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    // Prevent default close behavior
                    api.prevent_close();
                    // Hide the window instead
                    let _ = window_clone.hide();
                }
            });
        }

        let app_menu = SubmenuBuilder::new(app, "Dicta")
            .item(&MenuItem::with_id(
                app,
                "about-dicta",
                "About Dicta",
                true,
                None::<&str>,
            )?)
            .separator()
            .item(&MenuItem::with_id(
                app,
                "settings",
                "Settings",
                true,
                Some("CmdOrCtrl+,"),
            )?)
            .separator()
            .item(&PredefinedMenuItem::hide(app, None)?)
            .item(&PredefinedMenuItem::hide_others(app, None)?)
            .item(&PredefinedMenuItem::show_all(app, None)?)
            .separator()
            .item(&PredefinedMenuItem::quit(app, None)?)
            .build()?;

        // Create Edit menu with native copy/paste
        let edit_menu = SubmenuBuilder::new(app, "Edit")
            .item(&PredefinedMenuItem::undo(app, None)?)
            .item(&PredefinedMenuItem::redo(app, None)?)
            .separator()
            .item(&PredefinedMenuItem::cut(app, None)?)
            .item(&PredefinedMenuItem::copy(app, None)?)
            .item(&PredefinedMenuItem::paste(app, None)?)
            .item(&PredefinedMenuItem::select_all(app, None)?)
            .build()?;

        // Create View menu
        let view_menu = SubmenuBuilder::new(app, "View")
            .item(&PredefinedMenuItem::fullscreen(app, None)?)
            .build()?;

        // Create Window menu
        let window_menu = SubmenuBuilder::new(app, "Window")
            .item(&PredefinedMenuItem::minimize(app, None)?)
            .item(&PredefinedMenuItem::maximize(app, None)?)
            .separator()
            .item(&PredefinedMenuItem::close_window(app, None)?)
            .build()?;

        // Create Shortcuts menu

        // Create Updates menu
        let updates_menu = SubmenuBuilder::new(app, "Updates")
            .item(&MenuItem::with_id(
                app,
                "changelog",
                "Changelog",
                true,
                None::<&str>,
            )?)
            .build()?;

        // Build the complete menu
        let menu = MenuBuilder::new(app)
            .item(&app_menu)
            .item(&edit_menu)
            .item(&view_menu)
            .item(&window_menu)
            .item(&updates_menu)
            .build()?;

        // Set as app menu
        app.set_menu(menu)?;

        // Initialize the store
        let window = handle.get_webview_window(SPOTLIGHT_LABEL).unwrap();

        // Convert the window to a spotlight panel
        let _panel = window.to_spotlight_panel()?;

        let cloned_handle = handle.clone();

        // Listen for panel becoming key (gaining focus)
        handle.listen(
            format!("{}_panel_did_become_key", SPOTLIGHT_LABEL),
            move |_| {
                // Emit an event that the frontend can listen for
                cloned_handle.emit("voice-input-focused", ()).unwrap();
            },
        );

        // Read the quickChat shortcut from the settings store.
        let store = app.store("settings");
        let voice_input_shortcut = store
            .ok()
            .and_then(|store| store.get("settings"))
            .and_then(|settings| {
                settings
                    .as_object()
                    .and_then(|s| s.get("voiceInput"))
                    .and_then(|t| t.get("shortcut"))
                    .and_then(|m| m.as_str().map(String::from))
            })
            .unwrap_or("Alt+Space".to_string());

        let shortcut = parse_shortcut(&voice_input_shortcut)
            .unwrap_or(Shortcut::new(Some(Modifiers::ALT), Code::Space));

        // Register the voice input shortcut.
        app.handle().plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts([shortcut])
                .expect("Failed to register shortcut")
                .with_handler(move |app, shortcut, event| {
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
                })
                .build(),
        )?;

        Ok(())
    };

    let app = builder
        .invoke_handler(tauri::generate_handler![
            transcribe_and_process,
            check_whisper_available,
            get_all_models,
            list_available_models,
            download_whisper_model,
            delete_whisper_model,
            get_model_path,
            // Local model lifecycle commands
            start_local_model,
            stop_local_model,
            get_local_model_status,
        ])
        .setup(setup_fn)
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // Get whisper manager for cleanup on exit
    let whisper_manager = app.state::<Arc<Mutex<WhisperManager>>>().inner().clone();

    app.run(move |_app_handle, event| {
        if let tauri::RunEvent::ExitRequested { .. } = event {
            // Cleanup whisper model before app exits
            let runtime = tokio::runtime::Runtime::new().unwrap();
            runtime.block_on(async {
                let mut manager = whisper_manager.lock().await;
                manager.unload_model();
                println!("Whisper model stopped on app exit");
            });
        }
    });
}
