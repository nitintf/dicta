import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold mb-8">Roadmap</h1>
        <div className="space-y-8">
          <p className="text-muted-foreground">
            See what we're working on and what's coming next for Dicta.
          </p>
          {/* Roadmap content will go here */}
        </div>
      </main>
      <Footer />
    </div>
  )
}

