import { cn } from '@/lib/cn'

import { useTheme } from '../../providers/theme-provider'

import type { ModelProvider } from './types'
import type { ComponentProps } from 'react'

export interface ProviderInfo {
  name: string
  icon: React.ReactNode
  color: string
}

type ProviderLogoProps = Omit<ComponentProps<'img'>, 'src' | 'alt'> & {
  provider: string
}

const ProviderLogo = ({ provider, className, ...props }: ProviderLogoProps) => {
  const { actualTheme } = useTheme()

  return (
    <img
      {...props}
      alt={`${provider} logo`}
      className={cn(
        'size-4',
        {
          'dark:invert': actualTheme === 'dark',
        },
        className
      )}
      height={16}
      src={`https://models.dev/logos/${provider}.svg`}
      width={16}
    />
  )
}

export const getProviderInfo = (provider: ModelProvider): ProviderInfo => {
  switch (provider) {
    case 'openai':
      return {
        name: 'OpenAI',
        icon: <ProviderLogo provider="openai" />,
        color: 'text-green-600',
      }
    case 'anthropic':
      return {
        name: 'Anthropic',
        icon: <ProviderLogo provider="anthropic" />,
        color: 'text-orange-600',
      }
    case 'google':
      return {
        name: 'Google',
        icon: <ProviderLogo provider="google" />,
        color: 'text-blue-600',
      }
    case 'assemblyai':
      return {
        name: 'AssemblyAI',
        icon: <ProviderLogo provider="assemblyai" className="dark:invert" />,
        color: 'text-indigo-600',
      }
    case 'elevenlabs':
      return {
        name: 'ElevenLabs',
        icon: <ProviderLogo provider="elevenlabs" className="dark:invert" />,
        color: 'text-orange-600',
      }
    case 'ollama':
      return {
        name: 'Ollama',
        icon: <ProviderLogo provider="ollama" className="dark:invert" />,
        color: 'text-gray-600',
      }
    case 'lmstudio':
      return {
        name: 'LM Studio',
        icon: <ProviderLogo provider="lmstudio" />,
        color: 'text-gray-700',
      }
    case 'local-whisper':
      return {
        name: 'Whisper Local',
        icon: <ProviderLogo provider="openai" />,
        color: 'text-purple-600',
      }
    default:
      return {
        name: provider,
        icon: <ProviderLogo provider={provider} />,
        color: 'text-gray-600',
      }
  }
}
