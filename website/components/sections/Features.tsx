export default function Features() {
  return (
    <>
      {/* Section 1: Voice Intelligence */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Powered by{" "}
              <span className="font-serif italic">advanced AI</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              State-of-the-art speech recognition that learns your style and adapts to your vocabulary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="aspect-video bg-gradient-to-br from-secondary via-accent to-secondary rounded-2xl flex items-center justify-center border border-border/30 relative z-10">
                <div className="text-center space-y-4 p-8">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm text-muted-foreground">Listening...</span>
                  </div>
                  <div className="space-y-3 max-w-md">
                    <div className="h-2 bg-primary/30 rounded w-3/4 mx-auto" />
                    <div className="h-2 bg-primary/30 rounded w-full mx-auto" />
                    <div className="h-2 bg-primary/30 rounded w-5/6 mx-auto" />
                  </div>
                  <p className="text-sm text-foreground/70 italic pt-4">
                    "Let me show you how this works in real-time..."
                  </p>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">
                  Real-time Transcription.{" "}
                  <span className="text-muted-foreground font-normal text-base">
                    Watch your words appear as you speak. No lag, just instant text.
                  </span>
                </h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="aspect-video bg-gradient-to-br from-secondary via-accent to-secondary rounded-2xl flex items-center justify-center p-8 border border-border/30">
                <div className="w-full space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {["TypeScript", "Next.js", "Anthropic", "PostgreSQL", "Tailwind"].map((term) => (
                      <div
                        key={term}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-xl text-sm border border-primary/30 font-medium"
                      >
                        {term}
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground pl-2">+ 67 more custom terms</div>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
                      <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">
                  Smart Vocabulary.{" "}
                  <span className="text-muted-foreground font-normal text-base">
                    Train Dicta on your terms, names, and phrases. It learns and remembers.
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Workflow Enhancement - Unique Bento Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Amplify your{" "}
              <span className="font-serif italic">productivity</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Intelligent features that understand what you need and help you work faster.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
            {/* Large card - Voice Snippets */}
            <div className="md:col-span-2 bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Voice Snippets</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Create voice-activated shortcuts. Say "email signature" and watch it appear.
                </p>
                <div className="space-y-2">
                  <div className="p-3 bg-accent/50 rounded-xl border border-border/30 flex items-center justify-between">
                    <span className="text-sm">email signature</span>
                    <span className="text-xs text-primary">→ Full block</span>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-xl border border-border/30 flex items-center justify-between">
                    <span className="text-sm">meeting link</span>
                    <span className="text-xs text-primary">→ Zoom URL</span>
                  </div>
                  <div className="p-3 bg-accent/50 rounded-xl border border-border/30 flex items-center justify-between">
                    <span className="text-sm">thanks</span>
                    <span className="text-xs text-primary">→ Thank you</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tall card - Vibes */}
            <div className="md:row-span-2 bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Vibes</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  Transform your writing tone instantly.
                </p>
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="flex flex-col gap-2">
                    {["Professional", "Casual", "Technical", "Friendly"].map((vibe, i) => (
                      <button
                        key={vibe}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          i === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-accent-foreground border border-border/30 hover:border-primary/30"
                        }`}
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Wide card - Shortcuts */}
            <div className="md:col-span-2 bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Global Shortcuts</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-6">
                  System-wide hotkeys work in any app. One keystroke away.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-accent/50 rounded-xl border border-border/30">
                    <div className="text-xs text-muted-foreground mb-2">Start Recording</div>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-secondary rounded text-xs border border-border/50 font-mono">⌘</kbd>
                      <kbd className="px-2 py-1 bg-secondary rounded text-xs border border-border/50 font-mono">Shift</kbd>
                      <kbd className="px-2 py-1 bg-secondary rounded text-xs border border-border/50 font-mono">D</kbd>
                    </div>
                  </div>
                  <div className="p-4 bg-accent/50 rounded-xl border border-border/30">
                    <div className="text-xs text-muted-foreground mb-2">Quick Insert</div>
                    <div className="flex gap-1">
                      <kbd className="px-2 py-1 bg-secondary rounded text-xs border border-border/50 font-mono">⌘</kbd>
                      <kbd className="px-2 py-1 bg-secondary rounded text-xs border border-border/50 font-mono">D</kbd>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Privacy & Performance */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Built for{" "}
              <span className="font-serif italic">privacy & speed</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Your voice data stays yours. Choose between local and cloud processing.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="aspect-video bg-gradient-to-br from-secondary via-accent to-secondary rounded-2xl flex items-center justify-center p-8 border border-border/30 relative z-10">
                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="p-5 bg-accent/50 rounded-2xl border-2 border-primary space-y-3">
                    <div className="text-sm font-semibold text-primary">Local</div>
                    <div className="text-xs text-muted-foreground">Fast • Private • Offline</div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs font-medium">Active</span>
                    </div>
                  </div>
                  <div className="p-5 bg-accent/50 rounded-2xl border border-border/30 space-y-3 opacity-60">
                    <div className="text-sm font-semibold">Cloud</div>
                    <div className="text-xs text-muted-foreground">Accurate • Advanced</div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="w-2 h-2 rounded-full bg-muted" />
                      <span className="text-xs text-muted-foreground">Standby</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">
                  Dual Engine.{" "}
                  <span className="text-muted-foreground font-normal text-base">
                    Switch between local and cloud. Your data, your choice.
                  </span>
                </h3>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-secondary/30 rounded-3xl p-8 border border-border/50 space-y-6 relative overflow-hidden group hover:border-primary/30 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="aspect-video bg-gradient-to-br from-secondary via-accent to-secondary rounded-2xl flex items-center justify-center p-8 border border-border/30">
                <div className="w-full space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl border border-border/30">
                      <span className="text-sm font-medium">Start Recording</span>
                      <div className="flex gap-2">
                        <kbd className="px-3 py-1.5 bg-secondary rounded-lg text-xs border border-border/50 font-mono">⌘</kbd>
                        <kbd className="px-3 py-1.5 bg-secondary rounded-lg text-xs border border-border/50 font-mono">Shift</kbd>
                        <kbd className="px-3 py-1.5 bg-secondary rounded-lg text-xs border border-border/50 font-mono">D</kbd>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-accent/50 rounded-xl border border-border/30">
                      <span className="text-sm font-medium">Quick Insert</span>
                      <div className="flex gap-2">
                        <kbd className="px-3 py-1.5 bg-secondary rounded-lg text-xs border border-border/50 font-mono">⌘</kbd>
                        <kbd className="px-3 py-1.5 bg-secondary rounded-lg text-xs border border-border/50 font-mono">D</kbd>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold">
                  Global Shortcuts.{" "}
                  <span className="text-muted-foreground font-normal text-base">
                    System-wide hotkeys work everywhere. One keystroke away.
                  </span>
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
