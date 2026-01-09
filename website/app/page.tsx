import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import VideoSection from "@/components/sections/VideoSection";
import Reviews from "@/components/sections/Reviews";
import OpenSource from "@/components/sections/OpenSource";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="demo">
          <VideoSection />
        </div>
        <Reviews />
        <div id="open-source">
          <OpenSource />
        </div>
        <Pricing />
        <div id="faq">
          <FAQ />
        </div>
      </main>
      <Footer />
    </div>
  );
}
