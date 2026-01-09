"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How accurate is Dicta's transcription?",
      answer: "Dicta uses state-of-the-art AI models to achieve 95%+ accuracy. With custom vocabulary, accuracy improves as it learns your specific terms and writing style.",
      category: "Features",
    },
    {
      question: "Is my voice data stored or sent to servers?",
      answer: "By default, everything processes locally. Your voice never leaves your computer. If you use cloud models, data is encrypted in transit and immediately deleted.",
      category: "Privacy",
    },
    {
      question: "What languages does Dicta support?",
      answer: "Dicta supports 50+ languages including English, Spanish, French, German, Chinese, and Japanese. You can switch languages on the fly.",
      category: "Features",
    },
    {
      question: "Can I use Dicta in any application?",
      answer: "Yes! Dicta works system-wide on macOS. Use it in any text editor, email client, messaging app, or form - just press your shortcut and speak.",
      category: "Usage",
    },
    {
      question: "Do I need an internet connection?",
      answer: "Not necessarily. Local processing works completely offline. Cloud-based models require an internet connection.",
      category: "Technical",
    },
    {
      question: "Will Dicta always be free?",
      answer: "Yes, forever. Dicta is an open-source project with no plans for paid tiers or subscriptions. All features remain free for everyone.",
      category: "Pricing",
    },
  ];

  const categories = ["All", ...Array.from(new Set(faqs.map(f => f.category)))];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredFaqs = selectedCategory === "All"
    ? faqs
    : faqs.filter(f => f.category === selectedCategory);

  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Frequently Asked <span className="font-serif italic text-primary">Questions</span>
          </h2>
          <p className="text-base text-muted-foreground">
            Everything you need to know about Dicta
          </p>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary border border-border/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="bg-secondary/30 rounded-2xl border border-border/50 overflow-hidden hover:border-primary/30 transition-all group"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left group"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5 border border-primary/30">
                    <span className="text-primary text-xs font-bold">Q</span>
                  </div>
                  <span className="font-semibold text-base pr-4">
                    {faq.question}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50 border border-border/30 hidden sm:block">
                    {faq.category}
                  </span>
                  <svg
                    className={`w-5 h-5 text-primary flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-5 pb-5 pl-14 text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support CTA - more compact and modern */}
        <div className="mt-16">
          <div className="relative bg-secondary/30 rounded-3xl p-8 border border-border/50 overflow-hidden group hover:border-primary/30 transition-all">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/20 rounded-2xl border border-primary/30 text-2xl">
                💬
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Still have questions?</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Join our community or check out the documentation
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">
                  Join Discord
                </button>
                <button className="px-5 py-2.5 bg-transparent text-foreground rounded-xl text-sm font-semibold border border-border hover:border-primary/30 transition-all">
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
