export default function Pricing() {
  const features = [
    "Unlimited voice transcription",
    "Local & cloud processing",
    "Custom vocabulary builder",
    "Unlimited text snippets",
    "All Vibes presets",
    "Keyboard shortcuts",
    "System-wide integration",
    "Regular updates",
    "Community support",
    "No usage limits",
    "No hidden fees",
    "Forever free",
  ];

  const reasons = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Community Built",
      description: "Made by developers who believe great tools should be accessible to everyone",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      title: "Open Source",
      description: "Transparency and freedom are core values. Fork it, modify it, contribute to it",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "No Venture Capital",
      description: "Not beholden to investors. Our users are our stakeholders",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Simple pricing: <span className="font-serif italic text-primary">$0</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            No tiers, no limits, no credit card required. Just download and start speaking.
          </p>
        </div>

        {/* Pricing card - New design */}
        <div className="max-w-5xl mx-auto mb-24">
          <div className="relative">
            {/* Decorative glows */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10" />

            <div className="relative bg-secondary/30 rounded-3xl border border-border/50 overflow-hidden group hover:border-primary/30 transition-all">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(61, 143, 95) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>

              <div className="relative z-10 grid md:grid-cols-2 gap-12 p-12">
                {/* Left side - Price and CTA */}
                <div className="space-y-8">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    FREE FOREVER
                  </div>

                  {/* Price */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl font-bold mt-2">$</span>
                      <span className="text-7xl font-bold text-primary">0</span>
                    </div>
                    <p className="text-muted-foreground text-base">
                      No subscriptions. No trials. No catch.
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="space-y-4 pt-4">
                    <button className="w-full px-6 py-4 bg-foreground text-background rounded-xl font-semibold text-base hover:bg-foreground/90 transition-all hover:scale-105 flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Download Dicta for Free
                    </button>
                    <p className="text-xs text-muted-foreground text-center">
                      macOS 10.15 or later • Apple Silicon & Intel
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="pt-4 border-t border-border/50">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">∞</div>
                        <div className="text-xs text-muted-foreground">Transcriptions</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">50+</div>
                        <div className="text-xs text-muted-foreground">Languages</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">0</div>
                        <div className="text-xs text-muted-foreground">Hidden Fees</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Features */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Everything included:</h3>
                    <p className="text-sm text-muted-foreground">All features. No upgrades. No paywalls.</p>
                  </div>

                  <div className="grid gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 text-sm group/item">
                        <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30 group-hover/item:scale-110 transition-transform">
                          <svg
                            className="w-3 h-3 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-foreground/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why free section - Redesigned */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h3 className="text-3xl md:text-4xl font-bold">
              Why is Dicta <span className="font-serif italic text-primary">completely free?</span>
            </h3>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Our mission is to make powerful voice-to-text accessible to everyone
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className="relative bg-secondary/30 rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all group overflow-hidden"
              >
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 space-y-4">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {reason.icon}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-base">{reason.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Supporting statement */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/50 border border-border/50">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Made with love by the community, for the community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
