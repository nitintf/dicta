use tauri::AppHandle;

#[cfg(target_os = "macos")]
pub fn setup_pill_window(app: &AppHandle) -> tauri::Result<()> {
    use objc2::MainThreadMarker;
    use objc2_app_kit::NSScreen;
    use tauri::{WebviewUrl, WebviewWindowBuilder};

    log::info!("💊 Setting up pill window...");

    let (pos_x, pos_y) = unsafe {
        let mtm = MainThreadMarker::new_unchecked();
        let screen = NSScreen::mainScreen(mtm).expect("Failed to get main screen");
        let screen_frame = screen.frame();
        let visible_frame = screen.visibleFrame();

        let pill_width = 240.0;
        let pill_height = 40.0;
        let bottom_offset = 16.0;

        let x = visible_frame.origin.x + (visible_frame.size.width - pill_width) / 2.0;
        let macos_y = visible_frame.origin.y + bottom_offset;
        let y = screen_frame.size.height - macos_y - pill_height;

        (x, y)
    };

    let pill_builder = WebviewWindowBuilder::new(
        app,
        "voice-input",
        WebviewUrl::App("voice-input.html".into()),
    )
    .title("Voice Input")
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .decorations(false)
    .always_on_top(true)
    .visible_on_all_workspaces(true)
    .content_protected(true)
    .skip_taskbar(true)
    .transparent(true)
    .shadow(false)
    .inner_size(240.0, 40.0)
    .position(pos_x, pos_y)
    .visible(false)
    .focused(false);

    #[cfg(not(debug_assertions))]
    let pill_builder = pill_builder.initialization_script(
        "document.addEventListener('contextmenu', e => e.preventDefault());",
    );

    #[cfg(debug_assertions)]
    let pill_builder = pill_builder;

    log::info!("💊 Building pill window at position ({}, {})", pos_x, pos_y);
    let pill_window = pill_builder.build()?;
    log::info!("💊 Pill window built successfully");

    use tauri_nspanel::WebviewWindowExt;
    match pill_window.to_panel() {
        Ok(_) => log::info!("💊 Pill window converted to NSPanel successfully"),
        Err(e) => log::error!("💊 Failed to convert pill to NSPanel: {:?}", e),
    }

    crate::utils::logger::info_with(
        "✅ Pill window created and ready",
        &[("x", &pos_x.to_string()), ("y", &pos_y.to_string())],
    );

    Ok(())
}
