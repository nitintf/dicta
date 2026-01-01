use tauri_plugin_global_shortcut::{Code, Modifiers, Shortcut};

/// Converts a character to its corresponding keyboard Code
pub fn char_to_code(ch: char) -> Option<Code> {
    match ch {
        'A' => Some(Code::KeyA),
        'B' => Some(Code::KeyB),
        'C' => Some(Code::KeyC),
        'D' => Some(Code::KeyD),
        'E' => Some(Code::KeyE),
        'F' => Some(Code::KeyF),
        'G' => Some(Code::KeyG),
        'H' => Some(Code::KeyH),
        'I' => Some(Code::KeyI),
        'J' => Some(Code::KeyJ),
        'K' => Some(Code::KeyK),
        'L' => Some(Code::KeyL),
        'M' => Some(Code::KeyM),
        'N' => Some(Code::KeyN),
        'O' => Some(Code::KeyO),
        'P' => Some(Code::KeyP),
        'Q' => Some(Code::KeyQ),
        'R' => Some(Code::KeyR),
        'S' => Some(Code::KeyS),
        'T' => Some(Code::KeyT),
        'U' => Some(Code::KeyU),
        'V' => Some(Code::KeyV),
        'W' => Some(Code::KeyW),
        'X' => Some(Code::KeyX),
        'Y' => Some(Code::KeyY),
        'Z' => Some(Code::KeyZ),
        _ => None,
    }
}

/// Parses a shortcut string (e.g., "Alt+Space", "Ctrl+Shift+K") into a Shortcut
pub fn parse_shortcut(shortcut_str: &str) -> Option<Shortcut> {
    println!("Attempting to parse shortcut: {}", shortcut_str);
    let parts: Vec<&str> = shortcut_str.split('+').map(str::trim).collect();
    println!("Split parts: {:?}", parts);
    if parts.is_empty() {
        println!("No parts found in shortcut string");
        return None;
    }

    let mut modifiers = Modifiers::empty();
    let key_str = parts.last()?;
    println!("Key string: {}", key_str);

    // Parse modifiers from all parts except last
    for modifier in &parts[..parts.len() - 1] {
        println!("Processing modifier: {}", modifier);
        match modifier.to_lowercase().as_str() {
            "alt" => modifiers |= Modifiers::ALT,
            "ctrl" | "control" => modifiers |= Modifiers::CONTROL,
            "shift" => modifiers |= Modifiers::SHIFT,
            "super" | "cmd" | "command" => modifiers |= Modifiers::SUPER,
            "cmdorctrl" => {
                // On macOS use Super (Cmd), on other platforms use Control
                #[cfg(target_os = "macos")]
                {
                    modifiers |= Modifiers::SUPER;
                }
                #[cfg(not(target_os = "macos"))]
                {
                    modifiers |= Modifiers::CONTROL;
                }
            }
            _ => {
                println!("Unknown modifier: {}", modifier);
                return None;
            }
        }
    }
    println!("Final modifiers: {:?}", modifiers);

    let code = match key_str.to_lowercase().as_str() {
        "space" => Code::Space,
        "enter" => Code::Enter,
        "tab" => Code::Tab,
        "escape" => Code::Escape,
        c if c.len() == 1 => {
            let ch = c.chars().next()?;
            char_to_code(ch.to_ascii_uppercase())?
        }
        _ => return None,
    };

    Some(Shortcut::new(Some(modifiers), code))
}
