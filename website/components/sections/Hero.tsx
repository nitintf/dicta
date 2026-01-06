export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-20">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Main headline - more compact */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Stop typing. <span className="text-primary font-serif italic">Start speaking.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Turn your voice into polished writing with AI. Works everywhere on macOS.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
          <button className="px-6 py-3 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/90 transition-all hover:scale-105">
            Download for Mac
          </button>
          <button className="px-6 py-3 bg-transparent text-foreground rounded-xl font-semibold text-sm border border-border hover:border-foreground/50 transition-all">
            Watch Demo
          </button>
        </div>

        {/* Speed comparison badge - more compact */}
        <div className="pt-8">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/50 border border-border text-sm">
            <span className="text-muted-foreground/70">40 WPM</span>
            <span className="text-primary">→</span>
            <span className="font-bold text-primary">200 WPM</span>
            <span className="ml-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">5x</span>
          </div>
        </div>
      </div>

      {/* Product preview - more compact and with gradient glow */}
      <div className="max-w-5xl mx-auto mt-16 w-full relative">
        {/* Gradient glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl -z-10" />

        <div className="relative rounded-2xl border border-border/50 bg-secondary/30 overflow-hidden backdrop-blur-sm">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50 bg-secondary/50">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <div className="flex-1 ml-4">
              <div className="w-48 h-4 bg-accent/50 rounded" />
            </div>
          </div>
          {/* Content area - more aesthetic */}
          <div className="aspect-video bg-gradient-to-br from-secondary via-accent to-secondary flex items-center justify-center relative overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(61, 143, 95) 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }} />
            </div>

            <div className="text-center space-y-4 relative z-10">
              <div className="w-16 h-16 mx-auto bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 backdrop-blur-sm">
                <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                [Product Demo]
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
