"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6">
      <nav
        className={`transition-all duration-500 rounded-full px-6 py-3 max-w-2xl w-full ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl border border-border/50 shadow-lg"
            : "bg-background/50 backdrop-blur-md border border-border/30"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              D
            </div>
            <span className="text-lg font-bold">Dicta</span>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/nitintf/dicta"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 text-sm font-medium text-foreground/90 hover:text-foreground transition-colors rounded-full border border-border hover:border-foreground/30"
            >
              GitHub
            </a>
            <button className="px-5 py-1.5 bg-foreground text-background rounded-full text-sm font-semibold hover:bg-foreground/90 transition-all">
              Download
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
