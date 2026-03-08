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
  Loader2Icon,
  LockIcon,
  PlusIcon,
  TargetIcon,
  UserIcon,
  Users2Icon,
} from 'lucide-react'
import { useState } from 'react'

interface CreateRoomDialogProps {
  onCreateRoom: (mode: string) => Promise<void>
}

const MODES = [
  {
    id: 'battle',
    name: 'Battle',
    description: '1v1 Ranked PvP',
    players: '2 Players',
    icon: TargetIcon,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    enabled: true,
  },
  {
    id: 'solo',
    name: 'Solo',
    description: 'Practice alone',
    players: '1 Player',
    icon: UserIcon,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    enabled: false,
  },
  {
    id: 'coop',
    name: 'Co-op',
    description: 'Team up & play',
    players: '4 Players',
    icon: Users2Icon,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    enabled: false,
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Private match',
    players: 'Up to 8',
    icon: LockIcon,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    enabled: false,
  },
]

export function CreateRoomDialog({ onCreateRoom }: CreateRoomDialogProps) {
  const [open, setOpen] = useState(false)
  const [loadingMode, setLoadingMode] = useState<string | null>(null)

  const handleSelect = async (modeId: string) => {
    setLoadingMode(modeId)
    try {
      await onCreateRoom(modeId)
    } catch {
      setLoadingMode(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className='flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 px-8 font-bold transition-opacity hover:opacity-90'>
          <PlusIcon className='size-5' />
          Create Room
        </button>
      </DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>Select Mode</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3'>
          {MODES.map((mode) => {
            const Icon = mode.icon
            const isLoading = loadingMode === mode.id

            return (
              <button
                key={mode.id}
                onClick={() => mode.enabled && handleSelect(mode.id)}
                disabled={!mode.enabled || loadingMode !== null}
                className={cn(
                  'flex items-center gap-4 rounded-2xl p-4 transition-colors',
                  mode.enabled
                    ? 'cursor-pointer bg-white/5 hover:bg-white/10'
                    : 'cursor-default opacity-40',
                )}
              >
                <div
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl',
                    mode.bg,
                    mode.color,
                  )}
                >
                  {isLoading ? (
                    <Loader2Icon className='size-5 animate-spin' />
                  ) : (
                    <Icon className='size-5' />
                  )}
                </div>
                <div className='flex-1 text-left'>
                  <p className='font-semibold'>{mode.name}</p>
                  <p className='text-xs text-white/40'>{mode.description}</p>
                </div>
                <span className='text-xs text-white/40'>
                  {mode.enabled ? mode.players : 'Coming soon'}
                </span>
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
