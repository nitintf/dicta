import { InfoCard } from '@/components/ui/info-card'

export function ModelsInfoBanner() {
  return (
    <InfoCard variant="accent" className="mb-8">
      <InfoCard.Content>
        <div>
          <InfoCard.Title>
            Manage{' '}
            <span className="text-primary italic sour-gummy">
              transcription models
            </span>
          </InfoCard.Title>
          <InfoCard.Description>
            Choose from cloud AI providers, run models locally, or use Apple's
            built-in speech recognition. Configure API keys, manage downloads,
            and select your preferred transcription engine to get the best
            accuracy and performance for your needs.
          </InfoCard.Description>
        </div>
      </InfoCard.Content>
    </InfoCard>
  )
}
