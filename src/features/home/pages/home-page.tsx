import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { Flame, FileText, Zap, Mic, Copy, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'
import { useTranscriptionsStore } from '@/features/transcriptions'

export function HomePage() {
  const { transcriptions, getStats, deleteTranscription } =
    useTranscriptionsStore()
  const stats = getStats()

  const handleCopy = async (text: string) => {
    try {
      await writeText(text)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  return (
    <div className="h-full p-8 pt-16 max-w-6xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Welcome back
        </h1>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-muted-foreground">
              {stats.todayCount} today
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {stats.totalTranscriptions} transcriptions
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-muted-foreground">
              {stats.totalWords} words
            </span>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <InfoCard variant="accent" className="mb-8">
        <InfoCard.Content>
          <div>
            <InfoCard.Title>
              Transform your voice into{' '}
              <span className="text-primary italic">perfect text</span>
            </InfoCard.Title>
            <InfoCard.Description>
              Dicta uses advanced AI to transcribe your voice with incredible
              accuracy. Create snippets, apply custom styles, and let AI help
              you communicate better across all your apps.
            </InfoCard.Description>
          </div>
          <div>
            <Button className="h-9 px-4">
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>

      {/* Transcription History */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
          Recent Transcriptions
        </h2>
        <div className="space-y-2">
          {transcriptions.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-lg bg-gray-50/30">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                No transcriptions yet
              </h3>
              <p className="text-xs text-muted-foreground text-center max-w-sm">
                Press the global shortcut to start your first transcription
              </p>
            </div>
          ) : (
            transcriptions.map(transcription => (
              <div
                key={transcription.id}
                className="group p-4 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2 mb-2">
                      {transcription.text}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(transcription.timestamp)}</span>
                      <span>{transcription.wordCount} words</span>
                      <span>{formatDuration(transcription.duration)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleCopy(transcription.text)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteTranscription(transcription.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
