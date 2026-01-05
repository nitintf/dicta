import { motion } from 'motion/react'
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useLayoutEffect,
} from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useModelsStore, initializeModels, type TranscriptionModel } from '..'
import { ApiKeyModal } from '../components/api-key-modal'
import {
  ModelsHeader,
  ModelsInfoBanner,
  ModelsSearch,
} from '../components/header'
import { ModelsTable } from '../components/table'
import {
  downloadModel,
  deleteModel,
  syncModels,
  createModelColumns,
} from '../utils'

import type { ColumnFiltersState, SortingState } from '@tanstack/react-table'

export function ModelsPage() {
  const {
    models,
    initialized,
    selectModel,
    setApiKey,
    removeApiKey,
    syncDefaultModels,
    refreshModelStatus,
    startLocalModel,
    stopLocalModel,
  } = useModelsStore()

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const [apiKeyModalModel, setApiKeyModalModel] =
    useState<TranscriptionModel | null>(null)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<
    'speech-to-text' | 'post-processing'
  >('speech-to-text')

  useEffect(() => {
    if (!initialized) {
      void initializeModels()
    }
  }, [initialized])

  const handleDownloadModel = useCallback(
    async (model: TranscriptionModel) => {
      setDownloading(model.id)
      try {
        await downloadModel(model, selectModel)
      } finally {
        setDownloading(null)
      }
    },
    [selectModel]
  )

  const handleDeleteModel = useCallback(async (model: TranscriptionModel) => {
    await deleteModel(model)
  }, [])

  const handleSyncModels = async () => {
    await syncModels(syncDefaultModels)
  }

  const columns = useMemo(
    () =>
      createModelColumns({
        downloading,
        onSelectModel: id => void selectModel(id),
        onSetApiKey: setApiKeyModalModel,
        onRemoveApiKey: id => void removeApiKey(id),
        onDownloadModel: handleDownloadModel,
        onDeleteModel: handleDeleteModel,
        onRefreshStatus: async id => void refreshModelStatus(id),
        onStartModel: async id => void startLocalModel(id),
        onStopModel: async id => void stopLocalModel(id),
      }),
    [
      downloading,
      selectModel,
      removeApiKey,
      refreshModelStatus,
      startLocalModel,
      stopLocalModel,
      handleDownloadModel,
      handleDeleteModel,
    ]
  )

  const sttModels = useMemo(
    () => models.filter(m => m.purpose === 'speech-to-text'),
    [models]
  )
  const postProcessingModels = useMemo(
    () => models.filter(m => m.purpose === 'post-processing'),
    [models]
  )

  useLayoutEffect(() => {
    const activeIndex = ['speech-to-text', 'post-processing'].indexOf(activeTab)
    const activeTabElement = tabRefs.current[activeIndex]

    if (activeTabElement) {
      setUnderlineStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      })
    }
  }, [activeTab])

  const activeModels =
    activeTab === 'speech-to-text' ? sttModels : postProcessingModels

  const cloudModelsCount = activeModels.filter(m => m.type === 'cloud').length
  const localModelsCount = activeModels.filter(m => m.type === 'local').length
  const selectedModel = activeModels.find(m => m.isSelected)

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading models...</p>
      </div>
    )
  }

  return (
    <div className="h-full p-8 pt-16">
      <ModelsHeader
        cloudModelsCount={cloudModelsCount}
        localModelsCount={localModelsCount}
        selectedModel={selectedModel}
        onSyncModels={handleSyncModels}
      />

      <ModelsInfoBanner />

      <Tabs
        value={activeTab}
        onValueChange={v =>
          setActiveTab(v as 'speech-to-text' | 'post-processing')
        }
        className="mt-6"
      >
        <TabsList className="bg-background relative rounded-none border-b p-0 w-auto">
          <TabsTrigger
            value="speech-to-text"
            ref={el => {
              tabRefs.current[0] = el
            }}
            className="bg-background w-min dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none"
          >
            Speech-to-Text ({sttModels.length})
          </TabsTrigger>
          <TabsTrigger
            value="post-processing"
            ref={el => {
              tabRefs.current[1] = el
            }}
            className="bg-background w-min dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none"
          >
            Post-Processing ({postProcessingModels.length})
          </TabsTrigger>

          <motion.div
            className="bg-primary w-min absolute bottom-0 z-20 h-0.5"
            layoutId="underline-models"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 40,
            }}
          />
        </TabsList>

        <TabsContent value="speech-to-text" className="mt-6">
          <ModelsSearch value={globalFilter ?? ''} onChange={setGlobalFilter} />

          <ModelsTable
            models={sttModels}
            columns={columns}
            sorting={sorting}
            columnFilters={columnFilters}
            globalFilter={globalFilter}
            onSortingChange={setSorting}
            onColumnFiltersChange={setColumnFilters}
            onGlobalFilterChange={setGlobalFilter}
          />
        </TabsContent>

        <TabsContent value="post-processing" className="mt-6">
          <ModelsSearch value={globalFilter ?? ''} onChange={setGlobalFilter} />

          <ModelsTable
            models={postProcessingModels}
            columns={columns}
            sorting={sorting}
            columnFilters={columnFilters}
            globalFilter={globalFilter}
            onSortingChange={setSorting}
            onColumnFiltersChange={setColumnFilters}
            onGlobalFilterChange={setGlobalFilter}
          />
        </TabsContent>
      </Tabs>

      <ApiKeyModal
        model={apiKeyModalModel}
        open={!!apiKeyModalModel}
        onOpenChange={open => {
          if (!open) setApiKeyModalModel(null)
        }}
        onSave={async apiKey => {
          if (apiKeyModalModel) {
            await setApiKey(apiKeyModalModel.id, apiKey)
          }
        }}
      />
    </div>
  )
}
