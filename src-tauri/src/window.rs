#![allow(unexpected_cfgs)]

#[cfg(target_os = "macos")]
use tauri_nspanel::{
    cocoa::{appkit::NSWindowCollectionBehavior, base::id as cocoa_id, foundation::NSSize},
    objc::{class, msg_send, sel, sel_impl},
    panel_delegate, Panel, WebviewWindowExt as PanelWebviewWindowExt,
};

use tauri::{Emitter, Manager, WebviewWindow};
use thiserror::Error;

type TauriError = tauri::Error;

#[derive(Error, Debug)]
enum Error {
    #[error("Unable to convert window to panel")]
    Panel,
}
#[cfg(target_os = "macos")]
pub trait WebviewWindowExt {
    fn to_spotlight_panel(&self) -> tauri::Result<Panel>;
}

#[cfg(target_os = "macos")]
impl WebviewWindowExt for WebviewWindow {
    fn to_spotlight_panel(&self) -> tauri::Result<Panel> {
        // Make window background transparent
        #[cfg(target_os = "macos")]
        unsafe {
            if let Ok(handle) = self.ns_window() {
                let handle = handle as cocoa_id;
                // Use clearColor for transparency instead of nil
                let clear_color: cocoa_id = msg_send![class!(NSColor), clearColor];
                let _: () = msg_send![handle, setBackgroundColor: clear_color];
                let _: () = msg_send![handle, setOpaque: 0];
                let _: () = msg_send![handle, setHasShadow: 0];
            }
        }

        // Convert window to panel
        let panel = self
            .to_panel()
            .map_err(|_| TauriError::Anyhow(Error::Panel.into()))?;

        // Set panel level to status window level (above full screen, below system dialogs)
        panel.set_level(25); // NSStatusWindowLevel, will appear above full screen windows but below system UI

        // Prevent the panel from activating the application
        #[allow(non_upper_case_globals)]
        const NSWindowStyleMaskNonactivatingPanel: i32 = 1 << 7;
        const NSWINDOW_COLLECTION_BEHAVIOR_TRANSIENT: i32 = 1 << 3;
        const NSWINDOW_COLLECTION_BEHAVIOR_IGNORES_CYCLE: i32 = 1 << 6;
        const NSWINDOW_COLLECTION_BEHAVIOR_STATIONARY: i32 = 1 << 4;
        const NSWINDOW_COLLECTION_BEHAVIOR_CANJIMP_TO_ACTIVE_SPACE: i32 = 1 << 0;
        const NSWINDOW_COLLECTION_BEHAVIOR_VISIBLE_ON_ALL_SPACES: i32 = 1 << 8;

        // Set style mask to prevent app activation
        panel.set_style_mask(NSWindowStyleMaskNonactivatingPanel);

        // Set collection behavior to make the panel float above all windows and spaces
        panel.set_collection_behaviour(NSWindowCollectionBehavior::from_bits_retain(
            (NSWINDOW_COLLECTION_BEHAVIOR_TRANSIENT
                | NSWINDOW_COLLECTION_BEHAVIOR_IGNORES_CYCLE
                | NSWINDOW_COLLECTION_BEHAVIOR_STATIONARY
                | NSWINDOW_COLLECTION_BEHAVIOR_CANJIMP_TO_ACTIVE_SPACE
                | NSWINDOW_COLLECTION_BEHAVIOR_VISIBLE_ON_ALL_SPACES) as u64,
        ));

        // Additional macOS-specific settings
        unsafe {
            if let Ok(handle) = self.ns_window() {
                let handle = handle as cocoa_id;
                let _: () = msg_send![handle, setCanHide: 0];
                let _: () = msg_send![handle, setHidesOnDeactivate: 0];
            }
        }

        // Set specific panel size - very small utility window
        unsafe {
            if let Ok(handle) = self.ns_window() {
                let handle = handle as cocoa_id;
                let size = NSSize::new(240.0, 50.0);
                let _: () = msg_send![handle, setContentSize: size];

                // Position at bottom center of screen
                let screen: cocoa_id = msg_send![class!(NSScreen), mainScreen];
                let screen_frame: tauri_nspanel::cocoa::foundation::NSRect =
                    msg_send![screen, visibleFrame];

                let x = screen_frame.origin.x + (screen_frame.size.width - size.width) / 2.0;
                let y = screen_frame.origin.y + 80.0; // 80 pixels from bottom

                let origin = tauri_nspanel::cocoa::foundation::NSPoint { x, y };
                let frame = tauri_nspanel::cocoa::foundation::NSRect { origin, size };
                let _: () = msg_send![handle, setFrame:frame display:1];
            }
        }

        #[allow(unexpected_cfgs)]
        let panel_delegate = panel_delegate!(SpotlightPanelDelegate {
            window_did_resign_key,
            window_did_become_key
        });

        let app_handle = self.app_handle().clone();

        let label = self.label().to_string();

        panel_delegate.set_listener(Box::new(move |delegate_name: String| {
            match delegate_name.as_str() {
                "window_did_become_key" => {
                    let _ = app_handle.emit(format!("{}_panel_did_become_key", label).as_str(), ());
                }
                "window_did_resign_key" => {
                    let _ = app_handle.emit(format!("{}_panel_did_resign_key", label).as_str(), ());
                }
                _ => (),
            }
        }));

        panel.set_delegate(panel_delegate);

        Ok(panel)
    }
}
