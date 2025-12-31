use tauri::menu::{MenuBuilder, MenuItem, PredefinedMenuItem, SubmenuBuilder};
use tauri::{Emitter, Listener, Manager};
use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_store::StoreExt;

#[cfg(target_os = "macos")]
use tauri_nspanel::ManagerExt;
use window::WebviewWindowExt;

mod window;

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

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_stronghold::Builder::new(|_pass| todo!()).build())
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
        let handle = app.app_handle();

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

    builder
        .setup(setup_fn)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
