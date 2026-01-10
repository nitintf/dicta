use tauri::AppHandle;

#[cfg(target_os = "macos")]
pub fn setup_toast_window(app: &AppHandle) -> tauri::Result<()> {
    use objc2::MainThreadMarker;
    use objc2_app_kit::NSScreen;
    use tauri::{WebviewUrl, WebviewWindowBuilder};

    log::info!("🍞 Setting up toast window...");

    let (toast_x, toast_y) = unsafe {
        let mtm = MainThreadMarker::new_unchecked();
        let screen = NSScreen::mainScreen(mtm).expect("Failed to get main screen");
        let screen_frame = screen.frame();
        let visible_frame = screen.visibleFrame();

        let toast_width = 400.0;
        let toast_height = 80.0;
        let pill_width = 240.0;
        let pill_height = 40.0;
        let bottom_offset = 16.0;
        let gap = 8.0;

        let pill_x = visible_frame.origin.x + (visible_frame.size.width - pill_width) / 2.0;
        let pill_macos_y = visible_frame.origin.y + bottom_offset;
        let toast_macos_y = pill_macos_y + pill_height + gap;

        let x = pill_x + (pill_width - toast_width) / 2.0;
        let y = screen_frame.size.height - toast_macos_y - toast_height;

        (x, y)
    };

    let toast_builder =
        WebviewWindowBuilder::new(app, "toast", WebviewUrl::App("toast.html".into()))
            .title("Feedback")
            .resizable(false)
            .maximizable(false)
            .minimizable(false)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .transparent(true)
            .inner_size(400.0, 80.0)
            .position(toast_x, toast_y)
            .visible(false);

    #[cfg(not(debug_assertions))]
    let toast_builder = toast_builder.initialization_script(
        "document.addEventListener('contextmenu', e => e.preventDefault());",
    );

    #[cfg(debug_assertions)]
    let toast_builder = toast_builder;

    log::info!(
        "🍞 Building toast window at position ({}, {})",
        toast_x,
        toast_y
    );
    let toast_window = toast_builder.build()?;
    log::info!("🍞 Toast window built successfully");

    use tauri_nspanel::WebviewWindowExt;
    match toast_window.to_panel() {
        Ok(_) => log::info!("🍞 Toast window converted to NSPanel successfully"),
        Err(e) => log::error!("🍞 Failed to convert toast to NSPanel: {:?}", e),
    }

    crate::utils::logger::info_with(
        "✅ Toast window created and ready",
        &[("x", &toast_x.to_string()), ("y", &toast_y.to_string())],
    );

    Ok(())
}
