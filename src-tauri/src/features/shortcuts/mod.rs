pub mod manager;
pub mod recording_handler;
pub mod utils;

pub use manager::{
    disable_global_shortcuts, enable_global_shortcuts, register_escape_shortcut,
    register_ptt_shortcut, register_voice_input_shortcut, unregister_escape_shortcut,
    unregister_ptt_shortcut, update_paste_shortcut, update_ptt_shortcut,
    update_voice_input_shortcut, ShortcutManager,
};
pub use recording_handler::RecordingShortcutHandler;
