import Navbar from '@/components/Navbar'
import Footer from '@/components/sections/Footer'

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-4xl font-bold mb-8">Changelog</h1>
        <div className="space-y-8">
          <p className="text-muted-foreground">
            Stay updated with the latest changes and improvements to Dicta.
          </p>
          {/* Changelog content will go here */}
        </div>
      </main>
      <Footer />
    </div>
  )
}

