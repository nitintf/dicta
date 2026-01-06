export default function VideoSection() {
  const steps = [
    {
      number: "01",
      title: "Install Dicta",
      description: "Download and install on your Mac. Takes less than a minute.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      ),
    },
    {
      number: "02",
      title: "Set Your Shortcut",
      description: "Choose your preferred keyboard shortcut for quick activation.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
    },
    {
      number: "03",
      title: "Start Speaking",
      description: "Press your shortcut anywhere and start talking. It's that simple.",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            See Dicta in <span className="font-serif italic">action</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Watch how easy it is to turn your voice into perfectly formatted text
          </p>
        </div>

        {/* Video placeholder */}
        <div className="mb-20">
          <div className="relative aspect-video bg-secondary/30 rounded-3xl overflow-hidden border border-border/50 group hover:border-primary/30 transition-all">
            {/* Gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -z-10" />

            {/* Placeholder for video */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-secondary via-accent to-secondary relative overflow-hidden">
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(61, 143, 95) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>

              <div className="text-center space-y-4 relative z-10">
                <div className="w-20 h-20 mx-auto bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform cursor-pointer">
                  <svg
                    className="w-10 h-10 text-primary ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="text-sm text-muted-foreground">
                  Watch the intro video (2:30)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick start guide - redesigned */}
        <div className="space-y-12">
          <h3 className="text-3xl md:text-4xl font-bold text-center">
            Get started in <span className="font-serif italic text-primary">3 simple steps</span>
          </h3>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 via-primary/50 to-transparent" />
                )}

                <div className="relative bg-secondary/30 rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all h-full space-y-4 overflow-hidden group">
                  {/* Hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-10 space-y-4">
                    {/* Icon badge */}
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/20 rounded-xl border border-primary/30 text-primary">
                      {step.icon}
                    </div>

                    {/* Step number - smaller and more subtle */}
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-primary/40">{step.number}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold">{step.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
