#[cfg(target_os = "macos")]
#[tauri::command]
pub fn trigger_haptic_feedback() -> Result<(), String> {
    use objc2::rc::Retained;
    use objc2::{msg_send, ClassType};
    use objc2_app_kit::NSHapticFeedbackManager;

    unsafe {
        let manager: Retained<NSHapticFeedbackManager> =
            msg_send![NSHapticFeedbackManager::class(), defaultPerformer];

        // NSHapticFeedbackPerformanceGeneric = 1
        let pattern: isize = 1;
        let _: () = msg_send![
            &manager,
            performFeedbackPattern: pattern,
            performanceTime: 0 as isize // NSHapticFeedbackPerformanceTimeDefault = 0
        ];
    }

    Ok(())
}

#[cfg(not(target_os = "macos"))]
#[tauri::command]
pub fn trigger_haptic_feedback() -> Result<(), String> {
    // No-op on non-macOS platforms
    Ok(())
}
