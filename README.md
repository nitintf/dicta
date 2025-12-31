# Dicta

A minimal, spotlight-style voice transcription app for macOS. Record quick voice notes with a global shortcut and they're automatically saved to your library.

## Tech Stack

**Frontend**

- React 19 + TypeScript
- Tailwind CSS 4 + Radix UI
- Zustand (state management with multi-window sync)
- React Router
- Motion (animations)

**Backend**

- Tauri 2.5 (Rust + Web)
- macOS NSPanel for spotlight-style UI
- Global shortcut support
- Native permissions handling

## Features

- ✅ Global shortcut (`Alt+Space`) to trigger voice recording
- ✅ Spotlight-style floating voice input panel
- ✅ Audio waveform visualization during recording
- ✅ Automatic recording save to persistent storage
- ✅ Real-time sync between main window and voice input panel
- ✅ Transcriptions library with stats (word count, duration, time)
- ✅ Copy/delete transcriptions
- ✅ Onboarding flow
- ✅ Settings management

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev

# Build for production
pnpm tauri build

# Lint and format
pnpm lint
pnpm format:all
```

## TODO

### High Priority

- [ ] Implement AI transcription (currently saves "[Recording saved - transcription pending]")
  - [ ] Add transcription provider interface (OpenAI Whisper, Google Speech-to-Text, LM Studio)
  - [ ] Add provider selection in settings
  - [ ] Add API key configuration
  - [ ] Process saved recordings to generate transcriptions

### Features

- [ ] Search/filter transcriptions
- [ ] Export transcriptions (text, JSON, CSV)
- [ ] Audio playback for saved recordings
- [ ] Transcription editing
- [ ] Categories/tags for organization
- [ ] Keyboard shortcuts for all actions
- [ ] Auto-paste transcription to active app (optional)
- [ ] Custom shortcuts configuration UI

### UI/UX

- [ ] Dark mode support
- [ ] Custom themes
- [ ] Transcription preview modal
- [ ] Better empty states
- [ ] Loading states for async operations
- [ ] Error handling and user feedback

### Technical

- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Performance optimization for large transcription lists
- [ ] Audio compression/optimization
- [ ] Auto-update functionality
- [ ] Crash reporting
- [ ] Analytics (privacy-focused)

### Platform

- [ ] Windows support
- [ ] Linux support
- [ ] System tray menu
- [ ] Launch at startup option

## License

[Add your license here]
