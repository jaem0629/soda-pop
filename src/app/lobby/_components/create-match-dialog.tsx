'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/dialog'
import { cn } from '@/lib/utils'
import {
  GlobeIcon,
  Loader2Icon,
  LockIcon,
  SwordsIcon,
  UserIcon,
} from 'lucide-react'
import { useState } from 'react'

interface CreateMatchDialogProps {
  onCreateMatch: (mode: string, entryType: string) => Promise<void>
}

const MATCH_OPTIONS = [
  {
    id: 'solo',
    mode: 'solo',
    entryType: 'private',
    name: 'Solo',
    description: 'Practice alone',
    players: '1 Player',
    icon: UserIcon,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    id: 'battle-public',
    mode: 'battle',
    entryType: 'public',
    name: 'Battle · Public',
    description: 'Anyone can join',
    players: '2 Players',
    icon: GlobeIcon,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    id: 'battle-private',
    mode: 'battle',
    entryType: 'private',
    name: 'Battle · Private',
    description: 'Share code with a friend',
    players: '2 Players',
    icon: LockIcon,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
]

export function CreateMatchDialog({ onCreateMatch }: CreateMatchDialogProps) {
  const [open, setOpen] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) setLoadingId(null)
  }

  const handleSelect = async (option: (typeof MATCH_OPTIONS)[number]) => {
    setLoadingId(option.id)
    try {
      await onCreateMatch(option.mode, option.entryType)
    } catch {
      setLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className='flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-linear-to-r from-blue-500 to-purple-500 px-3 text-xs font-bold transition-opacity hover:opacity-90'>
          <SwordsIcon className='size-3.5' />
          Create Match
        </button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Create Match</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3'>
          {MATCH_OPTIONS.map((option) => {
            const Icon = option.icon
            const isLoading = loadingId === option.id

            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option)}
                disabled={loadingId !== null}
                className='flex cursor-pointer items-center gap-4 rounded-2xl bg-white/5 p-4 transition-colors hover:bg-white/10 disabled:cursor-default disabled:opacity-50'
              >
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    option.bg,
                    option.color,
                  )}
                >
                  {isLoading ? (
                    <Loader2Icon className='size-5 animate-spin' />
                  ) : (
                    <Icon className='size-5' />
                  )}
                </div>
                <div className='flex-1 text-left'>
                  <p className='font-semibold'>{option.name}</p>
                  <p className='text-xs text-white/40'>{option.description}</p>
                </div>
                <span className='text-xs text-white/40'>{option.players}</span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
