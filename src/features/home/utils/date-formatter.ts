import { format, isToday, isYesterday, isSameYear, startOfDay } from 'date-fns'

/**
 * Gets a human-readable date label (Today, Yesterday, or formatted date)
 */
export function getDateLabel(timestamp: number): {
  label: string
  date: string
} {
  const date = new Date(timestamp)
  const dateOnly = startOfDay(date)

  if (isToday(date)) {
    return {
      label: 'Today',
      date: dateOnly.toISOString(),
    }
  }

  if (isYesterday(date)) {
    return {
      label: 'Yesterday',
      date: dateOnly.toISOString(),
    }
  }

  // Format: "Monday, January 15" or "Monday, January 15, 2024" (if different year)
  const formatPattern = isSameYear(date, new Date())
    ? 'EEEE, MMMM d'
    : 'EEEE, MMMM d, yyyy'

  return {
    label: format(date, formatPattern),
    date: dateOnly.toISOString(),
  }
}

/**
 * Formats a timestamp as time (e.g., "2:30 PM")
 */
export function formatTime(timestamp: number): string {
  return format(new Date(timestamp), 'h:mm a')
}

/**
 * Formats duration in seconds to human-readable format
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '--'

  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)

  if (mins > 0) {
    return `${mins}m ${secs}s`
  }

  return `${secs}s`
}
