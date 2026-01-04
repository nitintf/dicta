pub mod manager;
pub mod utils;

pub use manager::{
    disable_global_shortcuts, enable_global_shortcuts, register_voice_input_shortcut,
    update_paste_shortcut, update_voice_input_shortcut, ShortcutManager,
};
