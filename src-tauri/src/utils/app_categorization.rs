/// App categorization for determining which vibe style to apply
/// Maps application names to vibe categories

#[derive(Debug, Clone, PartialEq)]
pub enum AppCategory {
    Personal,
    Work,
    Email,
    Other,
}

impl AppCategory {
    pub fn as_str(&self) -> &str {
        match self {
            AppCategory::Personal => "personal",
            AppCategory::Work => "work",
            AppCategory::Email => "email",
            AppCategory::Other => "other",
        }
    }
}

/// Determine which category an app falls into based on its name
pub fn categorize_app(app_name: &str) -> AppCategory {
    let app_lower = app_name.to_lowercase();

    // Personal messaging apps
    if is_personal_app(&app_lower) {
        return AppCategory::Personal;
    }

    // Work/collaboration apps
    if is_work_app(&app_lower) {
        return AppCategory::Work;
    }

    // Email apps
    if is_email_app(&app_lower) {
        return AppCategory::Email;
    }

    // Default to Other for unknown apps
    AppCategory::Other
}

/// Check if app is a personal messaging app
fn is_personal_app(app_name: &str) -> bool {
    let personal_apps = [
        "messages",
        "imessage",
        "whatsapp",
        "telegram",
        "signal",
        "messenger",
        "facebook messenger",
        "discord",
        "snapchat",
        "instagram",
        "wechat",
        "line",
        "viber",
        "kik",
        "threema",
    ];

    personal_apps.iter().any(|&app| app_name.contains(app))
}

/// Check if app is a work/collaboration app
fn is_work_app(app_name: &str) -> bool {
    let work_apps = [
        "slack",
        "microsoft teams",
        "teams",
        "zoom",
        "google meet",
        "meet",
        "webex",
        "skype",
        "skype for business",
        "notion",
        "asana",
        "trello",
        "jira",
        "confluence",
        "monday",
        "clickup",
        "basecamp",
        "workplace",
        "mattermost",
        "rocketchat",
        "zulip",
    ];

    work_apps.iter().any(|&app| app_name.contains(app))
}

/// Check if app is an email client
fn is_email_app(app_name: &str) -> bool {
    let email_apps = [
        "mail",
        "gmail",
        "outlook",
        "thunderbird",
        "spark",
        "airmail",
        "postbox",
        "mailmate",
        "canary mail",
        "polymail",
        "superhuman",
        "hey",
        "protonmail",
        "fastmail",
    ];

    email_apps.iter().any(|&app| app_name.contains(app))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_personal_apps() {
        assert_eq!(categorize_app("Messages"), AppCategory::Personal);
        assert_eq!(categorize_app("WhatsApp"), AppCategory::Personal);
        assert_eq!(categorize_app("Telegram"), AppCategory::Personal);
    }

    #[test]
    fn test_work_apps() {
        assert_eq!(categorize_app("Slack"), AppCategory::Work);
        assert_eq!(categorize_app("Microsoft Teams"), AppCategory::Work);
        assert_eq!(categorize_app("Zoom"), AppCategory::Work);
    }

    #[test]
    fn test_email_apps() {
        assert_eq!(categorize_app("Mail"), AppCategory::Email);
        assert_eq!(categorize_app("Gmail"), AppCategory::Email);
        assert_eq!(categorize_app("Outlook"), AppCategory::Email);
    }

    #[test]
    fn test_unknown_app() {
        assert_eq!(categorize_app("Safari"), AppCategory::Other);
        assert_eq!(categorize_app("Chrome"), AppCategory::Other);
        assert_eq!(categorize_app("VSCode"), AppCategory::Other);
    }
}
