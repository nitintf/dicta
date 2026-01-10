use crate::features::audio::enumerate_audio_devices;
use crate::features::models::LocalModelManager;
use crate::utils::logger;
use serde_json::json;
use std::sync::Arc;
use tauri::menu::{MenuBuilder, MenuItem, PredefinedMenuItem, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{App, AppHandle, Emitter, Manager, Result};
use tauri_plugin_store::StoreExt;
use tokio::sync::Mutex;

/// Sets up the system tray icon and menu
pub fn setup_tray(app: &App, model_manager_cleanup: Arc<Mutex<LocalModelManager>>) -> Result<()> {
    // Get available audio devices
    let runtime = tokio::runtime::Runtime::new().unwrap();
    let devices = runtime
        .block_on(enumerate_audio_devices())
        .unwrap_or_default();

    // Get current microphone device from settings
    let store = app.store("settings").map_err(|e| {
        tauri::Error::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to get store: {}", e),
        ))
    })?;
    let current_device_id = store.get("settings").and_then(|settings| {
        settings
            .get("voiceInput")
            .and_then(|voice_input| voice_input.get("microphoneDeviceId"))
            .and_then(|device_id| device_id.as_str().map(|s| s.to_string()))
    });

    // Build microphone submenu dynamically
    let mut microphone_submenu_builder = SubmenuBuilder::new(app, "Microphone");

    // Add "Auto-detect" option with tick if selected
    let auto_detect_label = if current_device_id.is_none() {
        "✓ Auto-detect"
    } else {
        "Auto-detect"
    };
    microphone_submenu_builder = microphone_submenu_builder.item(&MenuItem::with_id(
        app,
        "mic-auto-detect",
        auto_detect_label,
        true,
        None::<&str>,
    )?);

    // Add separator if we have devices
    if !devices.is_empty() {
        microphone_submenu_builder = microphone_submenu_builder.separator();
    }

    // Add each device with tick if selected
    for device in &devices {
        let menu_id = format!("mic-{}", device.device_id);
        let is_selected = current_device_id.as_ref() == Some(&device.device_id);

        let mut label = String::new();
        if is_selected {
            label.push_str("✓ ");
        }
        label.push_str(&device.label);
        if device.is_recommended {
            label.push_str(" (Recommended)");
        }

        microphone_submenu_builder = microphone_submenu_builder.item(&MenuItem::with_id(
            app,
            menu_id.as_str(),
            label.as_str(),
            true,
            None::<&str>,
        )?);
    }

    let microphone_submenu = microphone_submenu_builder.build()?;

    let tray_menu = MenuBuilder::new(app)
        .item(&MenuItem::with_id(app, "home", "Home", true, None::<&str>)?)
        .separator()
        .item(&MenuItem::with_id(
            app,
            "check-updates",
            "Check for updates...",
            true,
            None::<&str>,
        )?)
        .separator()
        .item(&MenuItem::with_id(
            app,
            "paste-last",
            "Paste last transcript",
            true,
            Some("CmdOrCtrl+Shift+V"),
        )?)
        .separator()
        .item(&microphone_submenu)
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
    let _tray = TrayIconBuilder::with_id("main")
        .icon(app.default_window_icon().unwrap().clone())
        .icon_as_template(true)
        .menu(&tray_menu)
        // .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| {
            handle_tray_event(app, event.id().as_ref(), model_manager_cleanup.clone());
        })
        .build(app)?;

    Ok(())
}

/// Rebuilds the tray menu with updated microphone selection
fn rebuild_tray_menu(app: &AppHandle, _model_manager: Arc<Mutex<LocalModelManager>>) -> Result<()> {
    // Get available audio devices
    let runtime = tokio::runtime::Runtime::new().unwrap();
    let devices = runtime
        .block_on(enumerate_audio_devices())
        .unwrap_or_default();

    // Get current microphone device from settings
    let store = app.store("settings").map_err(|e| {
        tauri::Error::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to get store: {}", e),
        ))
    })?;
    let current_device_id = store.get("settings").and_then(|settings| {
        settings
            .get("voiceInput")
            .and_then(|voice_input| voice_input.get("microphoneDeviceId"))
            .and_then(|device_id| device_id.as_str().map(|s| s.to_string()))
    });

    // Build microphone submenu dynamically
    let mut microphone_submenu_builder = SubmenuBuilder::new(app, "Microphone");

    // Add "Auto-detect" option with tick if selected
    let auto_detect_label = if current_device_id.is_none() {
        "✓ Auto-detect"
    } else {
        "Auto-detect"
    };
    microphone_submenu_builder = microphone_submenu_builder.item(&MenuItem::with_id(
        app,
        "mic-auto-detect",
        auto_detect_label,
        true,
        None::<&str>,
    )?);

    // Add separator if we have devices
    if !devices.is_empty() {
        microphone_submenu_builder = microphone_submenu_builder.separator();
    }

    // Add each device with tick if selected
    for device in &devices {
        let menu_id = format!("mic-{}", device.device_id);
        let is_selected = current_device_id.as_ref() == Some(&device.device_id);

        let mut label = String::new();
        if is_selected {
            label.push_str("✓ ");
        }
        label.push_str(&device.label);
        if device.is_recommended {
            label.push_str(" (Recommended)");
        }

        microphone_submenu_builder = microphone_submenu_builder.item(&MenuItem::with_id(
            app,
            menu_id.as_str(),
            label.as_str(),
            true,
            None::<&str>,
        )?);
    }

    let microphone_submenu = microphone_submenu_builder.build()?;

    // Rebuild the entire tray menu
    let tray_menu = MenuBuilder::new(app)
        .item(&MenuItem::with_id(app, "home", "Home", true, None::<&str>)?)
        .separator()
        .item(&MenuItem::with_id(
            app,
            "check-updates",
            "Check for updates...",
            true,
            None::<&str>,
        )?)
        .separator()
        .item(&MenuItem::with_id(
            app,
            "paste-last",
            "Paste last transcript",
            true,
            Some("CmdOrCtrl+Shift+V"),
        )?)
        .separator()
        .item(&microphone_submenu)
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

    // Update the tray icon's menu
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_menu(Some(tray_menu))?;
    }

    Ok(())
}

/// Sets the microphone device in settings and rebuilds tray menu
fn set_microphone_device(
    app: &AppHandle,
    device_id: Option<String>,
    model_manager: Arc<Mutex<LocalModelManager>>,
) -> Result<()> {
    let store = app.store("settings").map_err(|e| {
        tauri::Error::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to get store: {}", e),
        ))
    })?;

    // Get current settings
    let mut settings = store
        .get("settings")
        .ok_or_else(|| {
            tauri::Error::Io(std::io::Error::new(
                std::io::ErrorKind::NotFound,
                "No settings found in store",
            ))
        })?
        .clone();

    // Update microphone device
    if let Some(settings_obj) = settings.as_object_mut() {
        if let Some(voice_input) = settings_obj.get_mut("voiceInput") {
            if let Some(voice_input_obj) = voice_input.as_object_mut() {
                voice_input_obj.insert(
                    "microphoneDeviceId".to_string(),
                    device_id
                        .as_ref()
                        .map(|id| json!(id))
                        .unwrap_or(json!(null)),
                );
            }
        }
    }

    // Save updated settings
    store.set("settings", settings);
    store.save().map_err(|e| {
        tauri::Error::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            format!("Failed to save store: {}", e),
        ))
    })?;

    // Emit event to notify frontend
    let _ = app.emit(
        "microphone-device-changed",
        json!({
            "microphoneDeviceId": device_id
        }),
    );

    // Rebuild tray menu to update checkmarks
    rebuild_tray_menu(app, model_manager)?;

    Ok(())
}

/// Handles tray menu events
fn handle_tray_event(
    app: &AppHandle,
    event_id: &str,
    model_manager_cleanup: Arc<Mutex<LocalModelManager>>,
) {
    match event_id {
        "home" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        "check-updates" => {
            // TODO: Implement update check
            logger::info("Check for updates clicked");
        }
        "paste-last" => {
            logger::info("Paste last transcript clicked");
            let app_clone = app.clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) =
                    crate::features::transcription::paste_last_transcript(app_clone).await
                {
                    logger::error(&format!("Failed to paste last transcript: {}", e));
                }
            });
        }
        "mic-auto-detect" => {
            // Set microphone to auto-detect (null)
            if let Err(e) = set_microphone_device(app, None, model_manager_cleanup.clone()) {
                logger::error(&format!("Failed to set microphone to auto-detect: {}", e));
            } else {
                logger::info("Microphone set to auto-detect");
            }
        }
        event_id if event_id.starts_with("mic-") => {
            // Handle specific microphone selection
            let device_id = event_id.strip_prefix("mic-").unwrap().to_string();
            if let Err(e) =
                set_microphone_device(app, Some(device_id.clone()), model_manager_cleanup.clone())
            {
                logger::error(&format!("Failed to set microphone to {}: {}", device_id, e));
            } else {
                logger::info(&format!("Microphone set to: {}", device_id));
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
        "general-feedback" => {
            // TODO: Open feedback URL
            logger::info("General feedback clicked");
        }
        "quit" => {
            // Cleanup local model before exit
            let runtime = tokio::runtime::Runtime::new().unwrap();
            runtime.block_on(async {
                let mut manager = model_manager_cleanup.lock().await;
                manager.unload_model();
                logger::info("Local model stopped on app exit");
            });
            app.exit(0);
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
    app.on_menu_event(move |_app, event| {
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
            logger::info("Changelog clicked");
        }
        _ => {}
    }
}
