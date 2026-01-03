export interface TypeBadgeConfig {
  label: string
  className: string
}

export const MODEL_TYPE_CONFIG: Record<string, TypeBadgeConfig> = {
  cloud: {
    label: 'Cloud',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  local: {
    label: 'Local',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
  },
} as const

export function getTypeBadgeConfig(type: string): TypeBadgeConfig {
  return (
    MODEL_TYPE_CONFIG[type] || {
      label: type,
      className: 'bg-gray-50 text-gray-700 border-gray-200',
    }
  )
}
