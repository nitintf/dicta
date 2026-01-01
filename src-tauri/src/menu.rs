use crate::models::WhisperManager;
use std::sync::Arc;
use tauri::menu::{MenuBuilder, MenuItem, PredefinedMenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{App, AppHandle, Emitter, Manager, Result};
use tokio::sync::Mutex;

/// Sets up the system tray icon and menu
pub fn setup_tray(app: &App, whisper_cleanup: Arc<Mutex<WhisperManager>>) -> Result<()> {
    // Microphone submenu
    let microphone_submenu = SubmenuBuilder::new(app, "Microphone")
        .item(&MenuItem::with_id(
            app,
            "mic-default",
            "Default System Microphone",
            true,
            None::<&str>,
        )?)
        .separator()
        .item(&MenuItem::with_id(
            app,
            "mic-settings",
            "Change in Settings...",
            true,
            None::<&str>,
        )?)
        .build()?;

    // Language submenu with popular languages
    let language_submenu = SubmenuBuilder::new(app, "Language")
        .item(&MenuItem::with_id(
            app,
            "lang-en",
            "🇺🇸 English",
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            "lang-es",
            "🇪🇸 Spanish",
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            "lang-fr",
            "🇫🇷 French",
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            "lang-de",
            "🇩🇪 German",
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            "lang-pt",
            "🇵🇹 Portuguese",
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            "lang-zh",
            "🇨🇳 Chinese",
            true,
            None::<&str>,
        )?)
        .item(&MenuItem::with_id(
            app,
            "lang-ja",
            "🇯🇵 Japanese",
            true,
            None::<&str>,
        )?)
        .separator()
        .item(&MenuItem::with_id(
            app,
            "lang-more",
            "More languages...",
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
        .item(&microphone_submenu)
        .item(&language_submenu)
        .item(&MenuItem::with_id(
            app,
            "shortcuts",
            "Shortcuts",
            true,
            None::<&str>,
        )?)
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
        .icon_as_template(true)
        .on_menu_event(move |app, event| {
            handle_tray_event(app, event.id().as_ref(), whisper_cleanup.clone());
        })
        .build(app)?;

    Ok(())
}

/// Handles tray menu events
fn handle_tray_event(app: &AppHandle, event_id: &str, whisper_cleanup: Arc<Mutex<WhisperManager>>) {
    match event_id {
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
            println!("Paste last transcript clicked");
            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = crate::transcription::paste_last_transcript(app_clone).await {
                    eprintln!("Failed to paste last transcript: {}", e);
                }
            });
        }
        "mic-default" => {
            // This is just a label, no action needed
            println!("Default microphone selected (no-op)");
        }
        "mic-settings" => {
            // Open microphone settings in General section
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = app.emit("open-settings", serde_json::json!({ "section": "general" }));
            }
        }
        "lang-more" => {
            // Open language settings in General section
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = app.emit("open-settings", serde_json::json!({ "section": "general" }));
            }
        }
        "shortcuts" => {
            // Open shortcuts settings panel
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = app.emit(
                    "open-settings",
                    serde_json::json!({ "section": "shortcuts" }),
                );
            }
        }
        "settings-tray" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                // Emit event to open settings dialog
                let _ = app.emit("open-settings", serde_json::json!({ "section": null }));
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
            let runtime = tokio::runtime::Runtime::new().unwrap();
            runtime.block_on(async {
                let mut manager = whisper_cleanup.lock().await;
                manager.unload_model();
                println!("Whisper model stopped on app exit");
            });
            app.exit(0);
        }
        event_id if event_id.starts_with("lang-") => {
            // Handle language selection
            let code = event_id.strip_prefix("lang-").unwrap();
            println!("Language selected: {}", code);

            // For now, just open settings to the general panel
            // TODO: In future, could directly update settings and emit event
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = app.emit("open-settings", serde_json::json!({ "section": "general" }));
            }
        }
        _ => {}
    }
}

/// Sets up the macOS menu bar
pub fn setup_menu_bar(app: &App) -> Result<()> {
    let handle = app.app_handle().clone();

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

    // Handle menu bar events
    app.on_menu_event(move |app, event| {
        handle_menu_bar_event(&handle, event.id().as_ref());
    });

    Ok(())
}

/// Handles menu bar events
fn handle_menu_bar_event(app: &AppHandle, event_id: &str) {
    match event_id {
        "settings" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                // Emit event to open settings dialog
                let _ = app.emit("open-settings", serde_json::json!({ "section": null }));
            }
        }
        "about-dicta" => {
            // Open settings with "about" section
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
                let _ = app.emit("open-settings", serde_json::json!({ "section": "about" }));
            }
        }
        "changelog" => {
            // TODO: Open changelog
            println!("Changelog clicked");
        }
        _ => {}
    }
}
