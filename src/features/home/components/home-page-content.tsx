import { useEffect, useMemo } from 'react'

import {
  useTranscriptionsStore,
  initializeTranscriptions,
  setupTranscriptionsSync,
} from '@/features/transcriptions'

import { groupTranscriptionsByDate } from '../utils'
import { EmptyState } from './empty-state'
import { StatsHeader } from './stats-header'
import { TranscriptionGroup } from './transcription-group'
import { WelcomeBanner } from './welcome-banner'

export function HomePageContent() {
  const { transcriptions, initialized, getStats, deleteTranscription } =
    useTranscriptionsStore()

  const stats = getStats()

  // Initialize transcriptions store
  useEffect(() => {
    if (!initialized) {
      void initializeTranscriptions()
    }

    setupTranscriptionsSync()
  }, [initialized])

  // Group transcriptions by date
  const groupedTranscriptions = useMemo(
    () => groupTranscriptionsByDate(transcriptions),
    [transcriptions]
  )

  const handleDeleteTranscription = (id: string) => {
    void deleteTranscription(id)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Fixed Header Section */}
      <div className="shrink-0 p-8 pt-16">
        <StatsHeader
          todayCount={stats.todayCount}
          totalTranscriptions={stats.totalTranscriptions}
          totalWords={stats.totalWords}
        />

        <WelcomeBanner />
      </div>

      {/* Scrollable History Container */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide sticky top-0 bg-background z-20 pb-4 pt-2">
          Recent Transcriptions
        </h2>

        {transcriptions.length === 0 ? (
          <EmptyState />
        ) : (
          groupedTranscriptions.map(group => (
            <TranscriptionGroup
              key={group.date}
              group={group}
              onDeleteTranscription={handleDeleteTranscription}
            />
          ))
        )}
      </div>
    </div>
  )
}
