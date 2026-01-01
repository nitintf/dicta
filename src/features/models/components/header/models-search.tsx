import { Search } from 'lucide-react'

import { Input } from '@/components/ui/input'

interface ModelsSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ModelsSearch({ value, onChange }: ModelsSearchProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  )
}
