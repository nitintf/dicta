import { Plus } from 'lucide-react'
import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'

import appleMailIcon from '@/assets/apps/apple-mail.svg'
import appleNotesIcon from '@/assets/apps/apple-notes.svg'
import chatgptIcon from '@/assets/apps/chatgpt.svg'
import gmailIcon from '@/assets/apps/gmail.svg'
import googleDocsIcon from '@/assets/apps/google-docs.svg'
import jiraIcon from '@/assets/apps/jira.svg'
import messagesIcon from '@/assets/apps/messages.svg'
import teamsIcon from '@/assets/apps/microsoft-teams.svg'
import outlookIcon from '@/assets/apps/outlook.svg'
import slackIcon from '@/assets/apps/slack.svg'
import superhumanIcon from '@/assets/apps/superhuman.svg'
import telegramIcon from '@/assets/apps/telegram.svg'
import vscodeIcon from '@/assets/apps/vscode.svg'
import whatsappIcon from '@/assets/apps/whatsapp.svg'
import { InfoCard } from '@/components/ui/info-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useVibesStore } from '../store'
import { AppAvatarGroup } from './app-avatar-group'
import { DefaultPreview } from './preview/default-preview'
import { EmailPreview } from './preview/email-preview'
import { MessengerPreview } from './preview/messenger-preview'
import { SlackPreview } from './preview/slack-preview'
import { VibeCard } from './vibe-card'
import { VibeDialog } from './vibe-dialog'

import type { Vibe, VibeCategory } from '../types'

const CATEGORIES: readonly VibeCategory[] = [
  'personal',
  'work',
  'email',
  'other',
] as const

const CATEGORY_CONFIG: Record<
  VibeCategory,
  {
    label: string
    info?: { title: string; subtitle: string }
    icons?: string[]
  }
> = {
  personal: {
    label: 'Personal messages',
    info: {
      title: 'This vibe applies in personal messengers',
      subtitle:
        'Available on desktop in English. iOS and more languages coming soon',
    },
    icons: [messagesIcon, whatsappIcon, telegramIcon],
  },
  work: {
    label: 'Work messages',
    info: {
      title: 'This vibe applies in work messages',
      subtitle:
        'Perfect for Slack, Teams, and other professional communication tools',
    },
    icons: [slackIcon, jiraIcon, teamsIcon],
  },
  email: {
    label: 'Email',
    info: {
      title: 'This vibe applies in email',
      subtitle: 'Ideal for Gmail, Outlook, and other email clients',
    },
    icons: [gmailIcon, outlookIcon, superhumanIcon, appleMailIcon],
  },
  other: {
    label: 'Other',
    info: {
      title: 'This vibe applies in other apps',
      subtitle: 'Ideal for Google Docs, VS Code, and other apps',
    },
    icons: [googleDocsIcon, vscodeIcon, appleNotesIcon, chatgptIcon],
  },
}

// Get preview component based on category
const getPreviewComponent = (category: VibeCategory, text: string) => {
  const previews = {
    personal: <MessengerPreview text={text} />,
    work: <SlackPreview text={text} />,
    email: <EmailPreview text={text} />,
    other: <DefaultPreview text={text} />,
  }
  return previews[category]
}

function CategoryInfo({ category }: { category: VibeCategory }) {
  const config = CATEGORY_CONFIG[category]
  const { info, icons } = config

  if (!info && !icons) return null

  return (
    <InfoCard variant="accent" className="flex items-start gap-4">
      {icons && <AppAvatarGroup icons={icons} />}
      {info && (
        <div className="flex-1">
          <InfoCard.Title className="text-base font-semibold mb-1">
            {info.title}
          </InfoCard.Title>
          <InfoCard.Description>{info.subtitle}</InfoCard.Description>
        </div>
      )}
    </InfoCard>
  )
}

// Add new vibe button
function AddVibeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[300px] group"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        Create Custom Vibe
      </p>
    </button>
  )
}

export function VibesPanel() {
  const { vibes, selectedVibes, selectVibeForCategory, deleteVibe } =
    useVibesStore()

  const [activeTab, setActiveTab] = useState<VibeCategory>('personal')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVibe, setEditingVibe] = useState<
    | (Pick<Vibe, 'id' | 'name' | 'description' | 'prompt'> & {
        example?: string
      })
    | null
  >(null)
  const [creatingForCategory, setCreatingForCategory] =
    useState<VibeCategory | null>(null)

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 })

  useLayoutEffect(() => {
    const activeIndex = CATEGORIES.indexOf(activeTab)
    const activeTabElement = tabRefs.current[activeIndex]

    if (activeTabElement) {
      setUnderlineStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      })
    }
  }, [activeTab])

  const handleEdit = (vibe: Vibe) => {
    setEditingVibe({
      id: vibe.id,
      name: vibe.name,
      description: vibe.description,
      prompt: vibe.prompt,
      example: vibe.example,
    })
    setCreatingForCategory(null)
    setDialogOpen(true)
  }

  const handleCreate = (category: VibeCategory) => {
    setEditingVibe(null)
    setCreatingForCategory(category)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vibe?')) return
    try {
      await deleteVibe(id)
    } catch (error) {
      console.error('Failed to delete vibe:', error)
    }
  }

  const handleSelect = async (category: VibeCategory, vibeId: string) => {
    await selectVibeForCategory(category, vibeId)
  }

  const getCategoryVibes = (category: VibeCategory) =>
    vibes.filter(s => s.category === category)

  return (
    <>
      <Tabs
        value={activeTab}
        onValueChange={v => setActiveTab(v as VibeCategory)}
        className="gap-4"
      >
        <TabsList className="bg-background relative rounded-none border-b p-0 w-auto">
          {CATEGORIES.map((category, index) => (
            <TabsTrigger
              key={category}
              value={category}
              ref={el => {
                tabRefs.current[index] = el
              }}
              className="bg-background w-min dark:data-[state=active]:bg-background relative z-10 rounded-none border-0 data-[state=active]:shadow-none"
            >
              {CATEGORY_CONFIG[category].label}
            </TabsTrigger>
          ))}

          <motion.div
            className="bg-primary w-min absolute bottom-0 z-20 h-0.5"
            layoutId="underline-vibes"
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

        {CATEGORIES.map(category => {
          const categoryVibes = getCategoryVibes(category)

          return (
            <TabsContent key={category} value={category} className="space-y-6">
              <CategoryInfo category={category} />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryVibes.map(vibe => (
                  <VibeCard
                    key={vibe.id}
                    id={vibe.id}
                    name={vibe.name}
                    description={vibe.description}
                    isSelected={selectedVibes[category] === vibe.id}
                    isDefault={vibe.isDefault}
                    showActions={category === 'other'}
                    preview={getPreviewComponent(
                      category,
                      vibe.example || 'No example provided'
                    )}
                    onSelect={() => handleSelect(category, vibe.id)}
                    onEdit={() => handleEdit(vibe)}
                    onDelete={() => handleDelete(vibe.id)}
                  />
                ))}

                {category === 'other' && (
                  <AddVibeButton onClick={() => handleCreate(category)} />
                )}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      <VibeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingVibe={editingVibe}
        category={creatingForCategory}
      />
    </>
  )
}
