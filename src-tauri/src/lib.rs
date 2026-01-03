use tauri::{Emitter, Listener, Manager};

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

use tauri_plugin_store::StoreExt;
use window::WebviewWindowExt;

mod audio_devices;
mod clipboard_utils;
mod data_export;
mod menu;
mod models;
mod secure_storage;
mod shortcut_utils;
mod shortcuts;
mod transcription;
mod window;

use audio_devices::enumerate_audio_devices;
use data_export::{export_all_data, import_all_data, import_from_json};
use models::{
    delete_local_model, download_local_model, get_all_models, get_local_model_status,
    start_local_model, stop_local_model, LocalModelManager,
};
use secure_storage::{get_api_key, has_api_key, remove_api_key, store_api_key};
use shortcuts::{
    disable_global_shortcuts, enable_global_shortcuts, update_paste_shortcut,
    update_voice_input_shortcut, ShortcutManager,
};
use transcription::{get_last_transcript, paste_last_transcript, transcribe_and_process};

use std::sync::Arc;
use tokio::sync::Mutex;

pub const SPOTLIGHT_LABEL: &str = "voice-input";

/// Auto-start the selected local model if it's downloaded
async fn auto_start_selected_model(
    app: &tauri::AppHandle,
    model_manager: Arc<Mutex<LocalModelManager>>,
) -> Result<(), String> {
    // Get the models store
    let store = app
        .store("models.json")
        .map_err(|e| format!("Failed to get models store: {}", e))?;

    let models = store
        .get("models")
        .and_then(|v| v.as_array().cloned())
        .ok_or("No models found in store")?;

    for model in models {
        let obj = model.as_object().ok_or("Model is not an object")?;

        let is_selected = obj
            .get("isSelected")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if !is_selected {
            continue;
        }

        let model_type = obj
            .get("type")
            .and_then(|v| v.as_str())
            .ok_or("Model type not found")?;

        // Only auto-start local models (works for any local model, not just whisper)
        if model_type != "local" {
            return Ok(());
        }

        let is_downloaded = obj
            .get("isDownloaded")
            .and_then(|v| v.as_bool())
            .unwrap_or(false);

        if !is_downloaded {
            println!("Selected model is not downloaded, skipping auto-start");
            return Ok(());
        }

        let model_id = obj
            .get("id")
            .and_then(|v| v.as_str())
            .ok_or("Model ID not found")?;

        let model_path = obj
            .get("path")
            .and_then(|v| v.as_str())
            .ok_or("Model path not found")?;

        let engine_type = obj
            .get("engine")
            .and_then(|v| v.as_str())
            .ok_or("Engine type not found for local model")?;

        // Get model name (use the name field, or derive from ID if not available)
        let model_name = obj.get("name").and_then(|v| v.as_str()).unwrap_or(model_id);

        println!(
            "Auto-starting local model: {} (engine: {}) at {}",
            model_name, engine_type, model_path
        );

        // Start the model using the generic manager
        let mut manager = model_manager.lock().await;

        use models::engines::ModelConfig;
        let config = ModelConfig {
            model_path: model_path.to_string(),
            model_name: model_name.to_string(),
            language: None,
        };

        manager
            .load_model(engine_type, config)
            .map_err(|e| format!("Failed to load model: {}", e))?;

        // Emit status event
        app.emit(
            "local-model-status",
            serde_json::json!({
                "status": "ready",
                "modelName": model_name,
                "modelId": model_id,
            }),
        )
        .map_err(|e| format!("Failed to emit status: {}", e))?;

        println!("Successfully auto-started model: {}", model_name);
        return Ok(());
    }

    Ok(())
}

#[cfg(target_os = "macos")]
#[tauri::command]
fn set_show_in_dock(app: tauri::AppHandle, show: bool) -> Result<(), String> {
    let policy = if show {
        ActivationPolicy::Regular
    } else {
        ActivationPolicy::Accessory
    };

    app.set_activation_policy(policy)
        .map_err(|e| format!("Failed to set activation policy: {}", e))?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)] // only enable instrumentation in development builds
    let devtools = tauri_plugin_devtools::init();

    // Initialize LocalModelManager state for persistent model loading
    let local_model_manager = Arc::new(Mutex::new(LocalModelManager::new()));

    // Initialize ShortcutManager for managing global shortcuts
    let shortcut_manager = ShortcutManager::new();

    let mut builder = tauri::Builder::default()
        .manage(local_model_manager)
        .manage(shortcut_manager)
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
        let store = app
            .store("settings")
            .map_err(|e| format!("Failed to get settings store: {}", e))?;

        let show_in_dock = if let Some(settings) = store.get("settings") {
            settings
                .get("system")
                .and_then(|sys| sys.get("showInDock"))
                .and_then(|v| v.as_bool())
                .unwrap_or(true)
        } else {
            true // Default to showing in dock if no settings found
        };

        let policy = if show_in_dock {
            ActivationPolicy::Regular
        } else {
            ActivationPolicy::Accessory
        };

        app.set_activation_policy(policy);

        println!(
            "Applied dock setting from store: show_in_dock={}",
            show_in_dock
        );

        let handle = app.app_handle();

        // Get local model manager for cleanup on quit
        let model_manager_state = app.state::<Arc<Mutex<LocalModelManager>>>();
        let model_manager_cleanup = model_manager_state.inner().clone();

        // Setup system tray
        menu::setup_tray(app, model_manager_cleanup.clone())?;

        // Setup menu bar
        menu::setup_menu_bar(app)?;

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

        // Register global shortcuts
        shortcuts::register_voice_input_shortcut(app)?;

        // Auto-start selected local model if downloaded
        let app_handle = app.app_handle().clone();
        let model_manager_clone = model_manager_cleanup.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = auto_start_selected_model(&app_handle, model_manager_clone).await {
                eprintln!("Failed to auto-start model on startup: {}", e);
            }
        });

        Ok(())
    };

    let app = builder
        .invoke_handler(tauri::generate_handler![
            transcribe_and_process,
            get_all_models,
            // Local model download commands
            download_local_model,
            delete_local_model,
            // Local model lifecycle commands
            start_local_model,
            stop_local_model,
            get_local_model_status,
            // Secure API key storage
            store_api_key,
            get_api_key,
            remove_api_key,
            has_api_key,
            // Audio devices
            enumerate_audio_devices,
            // Clipboard utilities
            clipboard_utils::get_focused_app,
            // Shortcuts management
            update_voice_input_shortcut,
            update_paste_shortcut,
            enable_global_shortcuts,
            disable_global_shortcuts,
            // Transcription utilities
            get_last_transcript,
            paste_last_transcript,
            // System preferences
            set_show_in_dock,
            // Data export/import
            export_all_data,
            import_all_data,
            import_from_json,
        ])
        .setup(setup_fn)
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // Get local model manager for cleanup on exit
    let local_model_manager_cleanup = app.state::<Arc<Mutex<LocalModelManager>>>().inner().clone();

    app.run(move |_app_handle, event| {
        if let tauri::RunEvent::ExitRequested { .. } = event {
            // Cleanup local model before app exits
            let runtime = tokio::runtime::Runtime::new().unwrap();
            runtime.block_on(async {
                let mut manager = local_model_manager_cleanup.lock().await;
                manager.unload_model();
                println!("Local model stopped on app exit");
            });
        }
    });
}
