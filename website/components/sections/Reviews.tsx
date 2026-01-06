export default function Reviews() {
  const testimonials = [
    {
      quote: "Dicta has completely transformed how I write documentation. I can now focus on my thoughts instead of typing speed. It's like having a superpower.",
      author: "Sarah Chen",
      role: "Software Engineer",
      company: "Tech Startup",
      avatar: "SC",
    },
    {
      quote: "As someone with RSI, Dicta has been life-changing. I can work full days without pain, and my productivity has actually increased. Truly grateful for this tool.",
      author: "Michael Rodriguez",
      role: "Content Writer",
      company: "Remote",
      avatar: "MR",
    },
    {
      quote: "The local processing option means I can dictate sensitive client information without privacy concerns. Plus, it's incredibly accurate right out of the box.",
      author: "Emma Thompson",
      role: "Legal Assistant",
      company: "Law Firm",
      avatar: "ET",
    },
    {
      quote: "I was skeptical about voice typing, but Dicta's custom vocabulary feature learned all my technical terms in days. Now it's more accurate than my typing.",
      author: "David Park",
      role: "Data Scientist",
      company: "AI Research Lab",
      avatar: "DP",
    },
    {
      quote: "The snippets feature is genius. I set up shortcuts for common responses and now I can handle emails 3x faster. It's not just transcription, it's automation.",
      author: "Lisa Anderson",
      role: "Customer Success",
      company: "SaaS Company",
      avatar: "LA",
    },
    {
      quote: "Being open source gives me confidence that my data is safe. Plus, I've contributed a few features myself. The community is amazing!",
      author: "Alex Kumar",
      role: "Security Engineer",
      company: "Cybersecurity Firm",
      avatar: "AK",
    },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold">
            Loved by <span className="text-primary">thousands</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the community of writers, developers, and professionals who've discovered the power of voice
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-secondary/30 rounded-2xl p-8 border border-border hover:border-primary/50 transition-all space-y-6"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-primary fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground/90 leading-relaxed">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold border-2 border-primary/30">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center space-y-6">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="text-4xl font-bold text-primary">500K+</div>
              <div className="text-sm text-muted-foreground mt-1">Words Dictated Daily</div>
            </div>
            <div className="w-px bg-border" />
            <div>
              <div className="text-4xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground mt-1">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
