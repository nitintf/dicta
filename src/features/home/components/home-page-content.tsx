import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { Flame, FileText, Zap, Copy, Trash2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'
import {
  useTranscriptionsStore,
  initializeTranscriptions,
  setupTranscriptionsSync,
  type Transcription,
} from '@/features/transcriptions'

interface GroupedTranscriptions {
  label: string
  date: string
  transcriptions: Transcription[]
}

export function HomePageContent() {
  const { transcriptions, initialized, getStats, deleteTranscription } =
    useTranscriptionsStore()
  const stats = getStats()

  // Initialize store from Tauri persistent storage and set up sync
  useEffect(() => {
    if (!initialized) {
      void initializeTranscriptions()
    }
    // Set up listener for changes from other windows
    setupTranscriptionsSync()
  }, [initialized])

  const handleCopy = async (text: string) => {
    try {
      void writeText(text)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const formatTime = (timestamp: number) => {
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

  const getDateLabel = (timestamp: number): { label: string; date: string } => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Reset time parts for comparison
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
    const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate()
    )

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return { label: 'Today', date: dateOnly.toISOString() }
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return { label: 'Yesterday', date: dateOnly.toISOString() }
    } else {
      const label = date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year:
          date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
      })
      return { label, date: dateOnly.toISOString() }
    }
  }

  const groupedTranscriptions = useMemo(() => {
    const groups = new Map<string, GroupedTranscriptions>()

    transcriptions.forEach(transcription => {
      const { label, date } = getDateLabel(transcription.timestamp)

      if (!groups.has(date)) {
        groups.set(date, { label, date, transcriptions: [] })
      }
      groups.get(date)!.transcriptions.push(transcription)
    })

    // Sort groups by date (newest first)
    return Array.from(groups.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [transcriptions])

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 p-8 pt-16">
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
        <InfoCard variant="accent">
          <InfoCard.Content>
            <div>
              <InfoCard.Title>
                Transform your voice into{' '}
                <span className="text-primary italic">perfect text</span>
              </InfoCard.Title>
              <InfoCard.Description>
                Dicta uses advanced AI to transcribe your voice with incredible
                accuracy. Create snippets, apply custom styles, and let AI help
                you communicate better across all your apps. Press the global
                shortcut to start recording anytime.
              </InfoCard.Description>
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>

      {/* Scrollable History Container */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide sticky top-0 bg-background z-20 pb-4 pt-2">
          Recent Transcriptions
        </h2>

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
          groupedTranscriptions.map(group => (
            <div key={group.date}>
              {/* Sticky Date Header */}
              <div className="sticky top-[42px] bg-background z-10 pb-3 pt-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {group.label}
                </h3>
              </div>

              {/* Transcriptions for this date */}
              <div className="space-y-2 mb-6">
                {group.transcriptions.map(transcription => (
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
                          <span>{formatTime(transcription.timestamp)}</span>
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
                          onClick={() =>
                            void deleteTranscription(transcription.id)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
