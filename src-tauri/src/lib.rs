use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

use tauri_plugin_store::StoreExt;

mod commands;
mod features;
mod menu;
mod types;
mod utils;

use features::ai_processing::post_process_transcript;
use features::audio::{
    cancel_recording, enumerate_audio_devices, get_recording_state, start_recording,
    stop_recording, AudioRecorder, RecordingStateManager,
};
use features::data::{export_all_data, import_all_data, import_from_json};
use features::models::{
    auto_start_selected_models, delete_local_model, download_local_model, get_all_models,
    get_local_model_status, start_local_model, stop_local_model, LocalModelManager,
};
use features::recordings::{delete_recording, get_all_transcriptions, get_recording_audio_path};
use features::security::{get_api_key, has_api_key, remove_api_key, store_api_key};
use features::shortcuts::{
    disable_global_shortcuts, enable_global_shortcuts, register_escape_shortcut,
    register_ptt_shortcut, unregister_escape_shortcut, unregister_ptt_shortcut,
    update_paste_shortcut, update_ptt_shortcut, update_voice_input_shortcut,
    RecordingShortcutHandler, ShortcutManager,
};
use features::transcription::{get_last_transcript, paste_last_transcript, transcribe_and_process};
use utils::logger::{log_complete, log_failed, log_lifecycle_event, log_start, log_with_context};

use std::sync::Arc;
use std::time::Instant;
use tokio::sync::Mutex;

pub const SPOTLIGHT_LABEL: &str = "voice-input";

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

/// Setup logging with rotation and filtering
fn setup_logging() -> tauri_plugin_log::Builder {
    use chrono::Local;
    use tauri_plugin_log::{Target, TargetKind};

    let today = Local::now().format("%Y-%m-%d").to_string();

    tauri_plugin_log::Builder::default()
        .targets([
            Target::new(TargetKind::Stdout).filter(|metadata| {
                // Filter out noisy logs
                let target = metadata.target();
                !target.contains("whisper_rs")
                    && !target.contains("audio::level_meter")
                    && !target.contains("cpal")
                    && !target.contains("rubato")
                    && !target.contains("hound")
            }),
            Target::new(TargetKind::LogDir {
                file_name: Some(format!("dicta-{}", today)),
            })
            .filter(|metadata| {
                // Filter out noisy logs from file as well
                let target = metadata.target();
                !target.contains("whisper_rs")
                    && !target.contains("audio::level_meter")
                    && !target.contains("cpal")
                    && !target.contains("rubato")
                    && !target.contains("hound")
            }),
        ])
        .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
        .max_file_size(10_000_000) // 10MB per file
        .level(if cfg!(debug_assertions) {
            log::LevelFilter::Debug
        } else {
            log::LevelFilter::Info
        })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app_version = env!("CARGO_PKG_VERSION");

    #[cfg(debug_assertions)]
    let devtools = tauri_plugin_devtools::init();

    let local_model_manager = Arc::new(Mutex::new(LocalModelManager::new()));
    let shortcut_manager = ShortcutManager::new();

    // Audio recording state
    let audio_recorder = Arc::new(std::sync::Mutex::new(AudioRecorder::new()));
    let recording_state_manager = Arc::new(RecordingStateManager::new());
    let recording_shortcut_handler = Arc::new(RecordingShortcutHandler::new());

    let mut builder = tauri::Builder::default()
        .manage(local_model_manager)
        .manage(shortcut_manager)
        .manage(audio_recorder)
        .manage(recording_state_manager)
        .manage(recording_shortcut_handler)
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_autostart::Builder::new().build())
        .plugin(tauri_plugin_mic_recorder::init())
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            // When a second instance is launched, bring the existing window to focus
            if let Some(win) = app.get_webview_window("main") {
                let _ = win.show();
                let _ = win.set_focus();
            }
        }));

    // Only initialize logging plugin if devtools is not enabled
    // Devtools plugin initializes logging automatically, so we skip it in debug mode
    #[cfg(not(debug_assertions))]
    {
        builder = builder.plugin(setup_logging().build());
    }

    #[cfg(target_os = "macos")]
    {
        builder = builder
            .plugin(tauri_nspanel::init())
            .plugin(tauri_plugin_macos_permissions::init());
    }

    #[cfg(debug_assertions)]
    {
        builder = builder.plugin(devtools);
    }

    #[cfg(target_os = "macos")]
    let setup_fn = move |app: &mut tauri::App| {
        // Setup panic handler
        log_start("PANIC_HANDLER_SETUP");
        log_with_context(
            log::Level::Debug,
            "Setting up panic handler",
            &[("component", "panic_handler")],
        );

        std::panic::set_hook(Box::new(|panic_info| {
            let location = panic_info
                .location()
                .map(|l| format!("{}:{}:{}", l.file(), l.line(), l.column()))
                .unwrap_or_else(|| "unknown location".to_string());

            let message = if let Some(s) = panic_info.payload().downcast_ref::<&str>() {
                s.to_string()
            } else if let Some(s) = panic_info.payload().downcast_ref::<String>() {
                s.clone()
            } else {
                "Unknown panic payload".to_string()
            };

            log::error!("💥 CRITICAL PANIC at {}: {}", location, message);
            log_failed("PANIC", "Application panic occurred");
            log_with_context(
                log::Level::Error,
                "Panic details",
                &[
                    ("panic_location", &location),
                    ("panic_message", &message),
                    ("severity", "critical"),
                ],
            );
            eprintln!("Application panic at {}: {}", location, message);

            // Try to save panic info to a crash file for debugging
            if let Ok(home_dir) = std::env::var("HOME").or_else(|_| std::env::var("USERPROFILE")) {
                let crash_file = std::path::Path::new(&home_dir).join(".dicta_crash.log");
                let _ = std::fs::write(
                    &crash_file,
                    format!(
                        "Panic at {}: {}\nFull info: {:?}\nTime: {:?}",
                        location,
                        message,
                        panic_info,
                        chrono::Local::now()
                    ),
                );
            }
        }));

        log::info!("✅ Panic handler configured");
        log_lifecycle_event("APPLICATION_START", Some(app_version), None);

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

        // Check onboarding completion status
        let onboarding_complete = if let Some(settings) = store.get("settings") {
            settings
                .get("onboarding")
                .and_then(|onboarding| onboarding.get("completed"))
                .and_then(|v| v.as_bool())
                .unwrap_or(false)
        } else {
            false // Default to not completed if no settings found
        };

        let handle = app.app_handle();

        let model_manager_state = app.state::<Arc<Mutex<LocalModelManager>>>();
        let model_manager_cleanup = model_manager_state.inner().clone();

        menu::setup_tray(app, model_manager_cleanup.clone())?;
        menu::setup_menu_bar(app)?;

        if let Some(window) = app.get_webview_window("main") {
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = window_clone.hide();
                }
            });

            // Disable context menu in production
            #[cfg(not(debug_assertions))]
            {
                let _ = window
                    .eval("document.addEventListener('contextmenu', e => e.preventDefault());");
            }

            // Show window if onboarding is not complete (user needs to complete onboarding)
            if !onboarding_complete {
                let _ = window.show();
                let _ = window.set_focus();
                log::info!("Showing main window for onboarding (onboarding not complete)");
            }
        }

        features::window::setup_pill_window(&handle)?;
        features::window::setup_toast_window(&handle)?;

        features::shortcuts::register_voice_input_shortcut(app)?;

        let app_handle = app.app_handle().clone();
        let model_manager_clone = model_manager_cleanup.clone();
        tauri::async_runtime::spawn(async move {
            if let Err(e) = auto_start_selected_models(&app_handle, model_manager_clone).await {
                eprintln!("Failed to auto-start models on startup: {}", e);
            }
        });

        log_start("LOG_CLEANUP");
        log_with_context(
            log::Level::Debug,
            "Cleaning up old logs",
            &[("retention_days", "30")],
        );

        let app_handle_cleanup = app.app_handle().clone();
        tauri::async_runtime::spawn(async move {
            let cleanup_start = Instant::now();
            match commands::clear_old_logs(app_handle_cleanup, 30).await {
                Ok(deleted) => {
                    log_complete("LOG_CLEANUP", cleanup_start.elapsed().as_millis() as u64);
                    log_with_context(
                        log::Level::Debug,
                        "Log cleanup complete",
                        &[("files_deleted", &deleted.to_string())],
                    );
                    if deleted > 0 {
                        log::info!("🧹 Cleaned up {} old log files", deleted);
                    }
                }
                Err(e) => {
                    log_failed("LOG_CLEANUP", &e);
                    log_with_context(
                        log::Level::Debug,
                        "Log cleanup failed",
                        &[("retention_days", "30")],
                    );
                    log::warn!("Failed to clean up old logs: {}", e);
                }
            }
        });

        Ok(())
    };

    let app = builder
        .invoke_handler(tauri::generate_handler![
            transcribe_and_process,
            post_process_transcript,
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
            // Audio recording
            start_recording,
            stop_recording,
            cancel_recording,
            get_recording_state,
            // Clipboard utilities
            features::clipboard::get_focused_app,
            // Shortcuts management
            update_voice_input_shortcut,
            update_paste_shortcut,
            register_ptt_shortcut,
            unregister_ptt_shortcut,
            update_ptt_shortcut,
            register_escape_shortcut,
            unregister_escape_shortcut,
            enable_global_shortcuts,
            disable_global_shortcuts,
            // Transcription utilities
            get_last_transcript,
            paste_last_transcript,
            // Recordings management
            get_all_transcriptions,
            delete_recording,
            get_recording_audio_path,
            // System preferences
            set_show_in_dock,
            // Data export/import
            export_all_data,
            import_all_data,
            import_from_json,
            // Haptic feedback
            utils::haptic::trigger_haptic_feedback,
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
