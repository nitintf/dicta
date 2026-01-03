<div align="center">
  <img src="public/icon.png" alt="Dicta Logo" width="120" height="120">

# Dicta

**Dicta is a sleek, Spotlight-inspired voice transcription app for macOS, capture your ideas instantly with AI-powered accuracy.**

[Features](#-features) •
[Installation](#-installation) •
[Tech Stack](#-tech-stack) •
[Development](#-development) •
[Contributing](#-contributing)

[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](https://www.apple.com/macos)
<img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19">
<img src="https://img.shields.io/badge/Tauri-2.5-ffc131?logo=tauri" alt="Tauri 2.5">
<img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript" alt="TypeScript">
<img src="https://img.shields.io/badge/Rust-1.83-ce422b?logo=rust" alt="Rust">

</div>

---

## Features

### Voice Recording

- **Global Shortcut** - Press `Alt+Space` anywhere to start recording
- **Spotlight-Style UI** - Beautiful floating panel that appears instantly
- **Visual Feedback** - Real-time audio waveform visualization
- **Auto-Save** - Recordings are automatically saved to your library

### AI Transcription

- **Multiple Providers** - Support for OpenAI Whisper, Google Speech-to-Text, Deepgram, AssemblyAI, ElevenLabs, and Local Whisper
- **High Accuracy** - AI-powered transcription with excellent accuracy
- **Multiple Languages** - Transcribe in various languages
- **Local Processing** - Option to run Whisper models locally for privacy

### Transcription Management

- **Library View** - Browse all your transcriptions with search and filtering
- **Rich Metadata** - View word count, duration, timestamp, and model used
- **Quick Actions** - Copy, delete, or export transcriptions instantly
- **Auto-Paste** - Optionally paste transcriptions directly to active apps

### Customization

- **Text Styles (Vibes)** - Apply different formatting styles to your transcriptions
  - Personal: Polished, Relaxed, Chill
  - Work: Executive, Collaborative, Casual
  - Email: Professional, Friendly, Enthusiastic
- **Custom Vibes** - Create your own formatting styles with custom prompts
- **Text Snippets** - Create reusable text expansions
- **Vocabulary** - Add custom words for better transcription accuracy

## Installation

### From Release (Recommended)

1. Download the latest `.dmg` from [Releases](https://github.com/yourusername/dicta/releases)
2. Open the `.dmg` and drag Dicta to Applications
3. Launch Dicta and grant microphone permissions when prompted

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/dicta.git
cd dicta

# Install dependencies
pnpm install

# Build for production
pnpm tauri build

# The built app will be in src-tauri/target/release/bundle/macos/
```

## Tech Stack

### Frontend

- **React 19** - Modern UI framework with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Zustand** - Lightweight state management with multi-window sync
- **Motion** - Smooth animations
- **React Router 7** - Client-side routing

### Backend

- **Tauri 2.5** - Rust-powered desktop framework
- **Rust** - High-performance native backend
- **macOS NSPanel** - Native spotlight-style window
- **Tauri Plugins** - Store, Clipboard, Shell, Autostart

### AI & Transcription

- **OpenAI API** - Whisper and GPT models
- **Google Cloud** - Speech-to-Text API
- **Deepgram** - Real-time transcription (WIP)
- **AssemblyAI** - Advanced transcription features (WIP)
- **ElevenLabs** - High-quality voice AI
- **Local Whisper** - Privacy-focused local processing

## 🚀 Development

### Prerequisites

- **Node.js** 20.19+ or 22.12+
- **pnpm** 8.0+
- **Rust** 1.75+
- **Xcode Command Line Tools** (macOS)

### Setup

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build
```

### Code Quality

```bash
# Lint code
pnpm lint
pnpm lint:fix

# Format code
pnpm format:all

# Type check
pnpm build  # TypeScript compilation happens here
```

### Project Structure

```
dicta/
├── src/                      # React frontend
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature-specific modules
│   │   ├── home/           # Home page
│   │   ├── settings/       # Settings management
│   │   ├── snippets/       # Text snippets
│   │   ├── styles/         # Text formatting (vibes)
│   │   ├── transcriptions/ # Transcription library
│   │   ├── vocabulary/     # Custom vocabulary
│   │   └── voice-input/    # Voice recording UI
│   └── utils/              # Utility functions
├── src-tauri/               # Rust backend
│   ├── src/
│   │   ├── audio_devices.rs    # Microphone enumeration
│   │   ├── clipboard_utils.rs  # Clipboard operations
│   │   ├── data_export.rs      # Export/import functionality
│   │   ├── menu.rs             # Tray and menu bar
│   │   ├── models/             # Whisper model management
│   │   ├── shortcuts.rs        # Global shortcuts
│   │   ├── transcription/      # Transcription providers
│   │   └── window.rs           # Window management
│   └── Cargo.toml
└── package.json
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- **Report bugs** - Open an issue with detailed reproduction steps
- **Suggest features** - Share your ideas for improvements
- **Improve documentation** - Help others understand the project
- **Submit pull requests** - Fix bugs or add features

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Write clear, concise commit messages
   - Follow the existing code style
   - Add tests if applicable
4. **Run code quality checks**
   ```bash
   pnpm lint:fix
   pnpm format:all
   pnpm build
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**
   - Describe your changes in detail
   - Link any related issues
   - Wait for review and address feedback

### Code Style

- **TypeScript/React**: Follow ESLint and Prettier configurations
- **Rust**: Use `cargo fmt` for formatting
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `test:` - Adding tests
  - `chore:` - Maintenance tasks

### Getting Help

- **Discussions** - Ask questions and share ideas
- **Email** - Contact maintainers directly
- **Wiki** - Check the project wiki for guides

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Tauri](https://tauri.app/) - The cross-platform app framework
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)
- Transcription powered by various AI providers
