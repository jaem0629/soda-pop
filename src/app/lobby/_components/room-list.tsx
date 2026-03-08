'use client'

import { cn } from '@/lib/utils'
import {
  TargetIcon,
  UserIcon,
  Users2Icon,
  LockIcon,
  Loader2Icon,
} from 'lucide-react'
import { useState } from 'react'
import type { WaitingRoom } from '../_lib/queries'

interface RoomListProps {
  rooms: WaitingRoom[]
  onJoinRoom: (code: string) => Promise<void>
}

const MODE_CONFIG: Record<
  string,
  { icon: typeof TargetIcon; color: string; bg: string; label: string }
> = {
  solo: {
    icon: UserIcon,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
    label: 'Solo',
  },
  battle: {
    icon: TargetIcon,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    label: 'Battle',
  },
  coop: {
    icon: Users2Icon,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    label: 'Co-op',
  },
  custom: {
    icon: LockIcon,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    label: 'Custom',
  },
}

export function RoomList({ rooms, onJoinRoom }: RoomListProps) {
  return (
    <div className='flex flex-1 flex-col'>
      <p className='mb-4 text-xs font-semibold tracking-widest text-white/40 uppercase'>
        Open Rooms
      </p>

      {rooms.length === 0 ? (
        <div className='flex flex-1 items-center justify-center rounded-2xl bg-white/5'>
          <p className='text-sm text-white/30'>No open rooms — create one!</p>
        </div>
      ) : (
        <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'>
          {rooms.map((room) => (
            <RoomItem key={room.id} room={room} onJoin={onJoinRoom} />
          ))}
        </div>
      )}
    </div>
  )
}

function RoomItem({
  room,
  onJoin,
}: {
  room: WaitingRoom
  onJoin: (code: string) => Promise<void>
}) {
  const [isJoining, setIsJoining] = useState(false)
  const config = MODE_CONFIG[room.mode] ?? MODE_CONFIG.battle
  const ModeIcon = config.icon

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      await onJoin(room.code)
    } catch {
      setIsJoining(false)
    }
  }

  return (
    <div className='flex items-center gap-4 rounded-2xl bg-white/5 p-4'>
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          config.bg,
          config.color,
        )}
      >
        <ModeIcon className='size-5' />
      </div>

      <div className='min-w-0 flex-1'>
        <p className='truncate font-semibold'>{room.host_name}</p>
        <p className='text-xs text-white/40'>{config.label}</p>
      </div>

      <span className='text-sm text-white/40'>
        {room.player_count}/{room.max_players}
      </span>

      <button
        onClick={handleJoin}
        disabled={isJoining}
        className='cursor-pointer rounded-xl bg-white/10 px-4 py-2 text-sm font-bold transition-colors hover:bg-white/20 disabled:opacity-50'
      >
        {isJoining ? <Loader2Icon className='size-4 animate-spin' /> : 'Join'}
      </button>
    </div>
  )
}
