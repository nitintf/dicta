use tauri::{Emitter, Listener, Manager};

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

use window::WebviewWindowExt;

mod audio_devices;
mod clipboard_utils;
mod menu;
mod models;
mod secure_storage;
mod shortcut_utils;
mod shortcuts;
mod transcription;
mod window;

use audio_devices::enumerate_audio_devices;
use models::{
    delete_whisper_model, download_whisper_model, get_all_models, get_local_model_status,
    start_local_model, stop_local_model, WhisperManager,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)] // only enable instrumentation in development builds
    let devtools = tauri_plugin_devtools::init();

    // Initialize WhisperManager state for persistent model loading
    let whisper_manager = Arc::new(Mutex::new(WhisperManager::new()));

    // Initialize ShortcutManager for managing global shortcuts
    let shortcut_manager = ShortcutManager::new();

    let mut builder = tauri::Builder::default()
        .manage(whisper_manager)
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
        // Hide dock icon - app will only appear in menu bar (must be first)
        app.set_activation_policy(ActivationPolicy::Accessory);

        let handle = app.app_handle();

        // Get whisper manager for cleanup on quit
        let whisper_state = app.state::<Arc<Mutex<WhisperManager>>>();
        let whisper_cleanup = whisper_state.inner().clone();

        // Setup system tray
        menu::setup_tray(app, whisper_cleanup.clone())?;

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

        Ok(())
    };

    let app = builder
        .invoke_handler(tauri::generate_handler![
            transcribe_and_process,
            get_all_models,
            download_whisper_model,
            delete_whisper_model,
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
            // Shortcuts management
            update_voice_input_shortcut,
            update_paste_shortcut,
            enable_global_shortcuts,
            disable_global_shortcuts,
            // Transcription utilities
            get_last_transcript,
            paste_last_transcript,
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
