import * as FlagIcons from 'country-flag-icons/react/3x2'
import { Globe } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  getLanguageByCode,
  getPopularLanguages,
  SUPPORTED_LANGUAGES,
} from '../data/languages'
import { useSettingsStore } from '../store'

import type { Language } from '../data/languages'

function FlagIcon({ countryCode }: { countryCode: string }) {
  const FlagComponent = FlagIcons[countryCode as keyof typeof FlagIcons] as
    | React.ComponentType<{ className?: string }>
    | undefined

  if (!FlagComponent) {
    return <Globe className="h-3 w-5" />
  }

  return <FlagComponent className="h-3 w-5" />
}

function LanguageItem({ language }: { language: Language }) {
  return (
    <div className="flex items-center gap-2">
      <FlagIcon countryCode={language.countryCode} />
      <span>{language.name}</span>
    </div>
  )
}

export function LanguageSelector() {
  const { settings, setTranscriptionLanguage } = useSettingsStore()
  const selectedLanguageCode = settings.transcription.language

  const handleSelectLanguage = async (code: string) => {
    await setTranscriptionLanguage(code)
  }

  const selectedLanguage = getLanguageByCode(selectedLanguageCode)
  const popularLanguages = getPopularLanguages(10)
  const otherLanguages = SUPPORTED_LANGUAGES.filter(
    lang => !lang.popularity
  ).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {selectedLanguage ? (
            <>
              <FlagIcon countryCode={selectedLanguage.countryCode} />
              {selectedLanguage.name}
            </>
          ) : (
            <>
              <Globe className="h-4 w-4" />
              Select Language
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] max-h-[400px]">
        <DropdownMenuRadioGroup
          value={selectedLanguageCode}
          onValueChange={handleSelectLanguage}
        >
          {popularLanguages.map(language => (
            <DropdownMenuRadioItem key={language.code} value={language.code}>
              <LanguageItem language={language} />
            </DropdownMenuRadioItem>
          ))}

          <DropdownMenuSeparator />

          {otherLanguages.map(language => (
            <DropdownMenuRadioItem key={language.code} value={language.code}>
              <LanguageItem language={language} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
