import { Flame, FileText, Zap } from 'lucide-react'

interface StatsHeaderProps {
  todayCount: number
  totalTranscriptions: number
  totalWords: number
}

export function StatsHeader({
  todayCount,
  totalTranscriptions,
  totalWords,
}: StatsHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-foreground mb-4">Welcome back</h1>

      <div className="flex items-center gap-6 text-sm">
        <StatItem
          icon={Flame}
          color="text-orange-500"
          label={`${todayCount} today`}
        />
        <StatItem
          icon={FileText}
          color="text-primary"
          label={`${totalTranscriptions} transcriptions`}
        />
        <StatItem
          icon={Zap}
          color="text-yellow-500"
          label={`${totalWords} words`}
        />
      </div>
    </div>
  )
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>
  color: string
  label: string
}

function StatItem({ icon: Icon, color, label }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}
