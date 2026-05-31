'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/dialog'
import { TrophyIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { LeaderboardEntry } from '../_lib/queries'
import { Leaderboard } from './leaderboard'

interface LeaderboardDialogProps {
  nickname: string
  soloEntries: LeaderboardEntry[]
  battleEntries: LeaderboardEntry[]
  defaultOpen?: boolean
}

export function LeaderboardDialog({
  nickname,
  soloEntries,
  battleEntries,
  defaultOpen = false,
}: LeaderboardDialogProps) {
  const router = useRouter()

  return (
    <Dialog
      defaultOpen={defaultOpen}
      onOpenChange={(open) => {
        if (!open && defaultOpen) router.replace('/lobby')
      }}
    >
      <DialogTrigger asChild>
        <button className='flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 text-sm font-black text-amber-100 transition hover:bg-amber-300/15'>
          <TrophyIcon className='size-4' />
          Leaderboard
        </button>
      </DialogTrigger>
      <DialogContent className='flex max-h-svh grid-rows-none flex-col overflow-hidden sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Scores</DialogTitle>
          <DialogDescription>Compare solo and battle scores.</DialogDescription>
        </DialogHeader>
        <Leaderboard
          nickname={nickname}
          soloEntries={soloEntries}
          battleEntries={battleEntries}
          className='min-h-0 flex-1 border-0 bg-transparent p-0'
          isCompact
        />
      </DialogContent>
    </Dialog>
  )
}
