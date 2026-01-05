import { InfoCard } from '@/components/ui/info-card'

export function WelcomeBanner() {
  return (
    <InfoCard variant="accent">
      <InfoCard.Content>
        <div>
          <InfoCard.Title>
            Transform your voice into{' '}
            <span className="text-primary italic sour-gummy">perfect text</span>
          </InfoCard.Title>
          <InfoCard.Description>
            Dicta uses advanced AI to transcribe your voice with incredible
            accuracy. Create snippets, apply custom styles, and let AI help you
            communicate better across all your apps. Press the global shortcut
            to start recording anytime.
          </InfoCard.Description>
        </div>
      </InfoCard.Content>
    </InfoCard>
  )
}
