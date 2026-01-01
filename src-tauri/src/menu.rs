use crate::models::WhisperManager;
use std::sync::Arc;
use tauri::menu::{MenuBuilder, MenuItem, PredefinedMenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{App, AppHandle, Manager, Result};
use tokio::sync::Mutex;

/// Sets up the system tray icon and menu
pub fn setup_tray(app: &App, whisper_cleanup: Arc<Mutex<WhisperManager>>) -> Result<()> {
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
            let runtime = tokio::runtime::Runtime::new().unwrap();
            runtime.block_on(async {
                let mut manager = whisper_cleanup.lock().await;
                manager.unload_model();
                println!("Whisper model stopped on app exit");
            });
            app.exit(0);
        }
        _ => {}
    }
}

/// Sets up the macOS menu bar
pub fn setup_menu_bar(app: &App) -> Result<()> {
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

    Ok(())
}
