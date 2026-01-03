import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { Download, Check, AlertCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

import { TranscriptionModel } from '../../../models'
import { useOnboarding } from '../../hooks/use-onboarding'

interface DownloadProgress {
  downloaded: number
  total: number
  percentage: number
  modelId: string
}

export function ModelDownloadStep() {
  const { completeCurrentStepAndGoNext, markStepComplete } = useOnboarding()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [downloadedMB, setDownloadedMB] = useState(0)
  const [totalMB, setTotalMB] = useState(75)

  const checkIfDownloaded = useCallback(async () => {
    try {
      const models = await invoke<TranscriptionModel[]>('get_all_models')
      const tinyModel = models.find(m => m.id === 'whisper-tiny')
      if (tinyModel?.isDownloaded) {
        setIsDownloaded(true)
        markStepComplete('model-download')
      }
    } catch (err) {
      console.error('Failed to check model status:', err)
    }
  }, [markStepComplete])

  useEffect(() => {
    // Check if model is already downloaded
    checkIfDownloaded()

    // Listen for download progress
    const unlisten = listen<DownloadProgress>(
      'local-model-download-progress',
      event => {
        const { downloaded, total, percentage, modelId } = event.payload
        // Only update progress for whisper-tiny
        if (modelId === 'whisper-tiny') {
          setProgress(percentage)
          setDownloadedMB(Math.round(downloaded / 1024 / 1024))
          setTotalMB(Math.round(total / 1024 / 1024))

          if (percentage >= 100) {
            setIsDownloaded(true)
            setIsDownloading(false)
            markStepComplete('model-download')
          }
        }
      }
    )

    return () => {
      unlisten.then(fn => fn())
    }
  }, [markStepComplete, checkIfDownloaded])

  const handleDownload = async () => {
    setIsDownloading(true)
    setError(null)
    setProgress(0)

    try {
      // Get model metadata
      const models = await invoke<TranscriptionModel[]>('get_all_models')
      const tinyModel = models.find(m => m.id === 'whisper-tiny')

      if (
        !tinyModel ||
        !tinyModel.downloadUrl ||
        !tinyModel.filename ||
        !tinyModel.engine
      ) {
        throw new Error('Model configuration not found')
      }

      // Download the model
      await invoke('download_local_model', {
        modelId: tinyModel.id,
        downloadUrl: tinyModel.downloadUrl,
        filename: tinyModel.filename,
        engineType: tinyModel.engine,
      })

      // Recheck if downloaded
      await checkIfDownloaded()
    } catch (err) {
      console.error('Download failed:', err)
      setError(err instanceof Error ? err.message : 'Download failed')
      setIsDownloading(false)
    }
  }

  const handleContinue = () => {
    if (isDownloaded) {
      completeCurrentStepAndGoNext()
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-16 py-12">
      <div className="max-w-xl w-full">
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
          className="mx-auto mb-8 flex size-16 items-center justify-center rounded-full border-2 border-onboarding-border bg-onboarding-bg"
        >
          <Download
            size={28}
            className="text-onboarding-text"
            strokeWidth={2}
          />
        </motion.div>

        <h2 className="mb-3 text-center text-2xl font-bold tracking-tight text-onboarding-text">
          Download AI Model
        </h2>

        <p className="mb-6 text-center text-sm text-onboarding-text-muted">
          Download Whisper Tiny (75 MB) for offline transcription
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-onboarding-border p-5 bg-gray-50/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium mb-1.5 text-sm text-onboarding-text">
                  Why download this?
                </h3>
                <p className="text-xs leading-relaxed text-onboarding-text-muted">
                  Whisper Tiny is a lightweight AI model that runs completely
                  offline on your device. No internet required, fully private,
                  and no API costs.
                </p>
              </div>
            </div>
          </div>

          {isDownloaded ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm rounded-lg p-3 text-onboarding-primary bg-onboarding-primary-light">
                <Check size={18} strokeWidth={2.5} />
                <span className="font-medium">
                  Model downloaded successfully!
                </span>
              </div>
              <Button onClick={handleContinue} className="w-full h-10 text-sm">
                Continue →
              </Button>
            </div>
          ) : isDownloading ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-onboarding-text-muted">
                  <span>Downloading...</span>
                  <span>
                    {downloadedMB} MB / {totalMB} MB
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-onboarding-text-muted">
                  {progress.toFixed(1)}% complete
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle
                    className="text-red-500 shrink-0 mt-0.5"
                    size={18}
                    strokeWidth={2.5}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-red-700 mb-1 text-sm">
                      Download failed
                    </p>
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <Button onClick={handleDownload} className="w-full h-10 text-sm">
              Download Model (75 MB)
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
