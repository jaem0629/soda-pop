'use client'

import { cn } from '@/lib/utils'
import { HomeIcon, StarIcon, TrophyIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { MatchPlayer } from '../_lib/types'

interface MatchFinishedProps {
  myPlayer: MatchPlayer
  opponent: MatchPlayer | undefined
  myScore: number
  opponentScore: number
}

const RESULT_STYLES = {
  win: {
    text: 'VICTORY',
    className:
      'bg-linear-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent',
    subtitle: 'Great job!',
    stars: 3,
  },
  lose: {
    text: 'DEFEAT',
    className: 'text-red-400',
    subtitle: 'Better luck next time!',
    stars: 1,
  },
  draw: {
    text: 'DRAW',
    className: 'text-purple-400',
    subtitle: "It's a tie!",
    stars: 2,
  },
} as const

export default function MatchFinished({
  myPlayer,
  opponent,
  myScore,
  opponentScore,
}: MatchFinishedProps) {
  const router = useRouter()

  const isWinner = myScore > opponentScore
  const isDraw = myScore === opponentScore
  const result = isDraw ? 'draw' : isWinner ? 'win' : 'lose'
  const config = RESULT_STYLES[result]

  const players = [
    { name: myPlayer.player_name, score: myScore, isMe: true },
    {
      name: opponent?.player_name ?? 'Opponent',
      score: opponentScore,
      isMe: false,
    },
  ].sort((a, b) => b.score - a.score)

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <div className='flex w-full max-w-lg flex-col items-center'>
        {/* Stars */}
        <div className='mb-4 flex gap-3'>
          {[1, 2, 3].map((i) => (
            <StarIcon
              key={i}
              className={cn(
                'size-10',
                i <= config.stars
                  ? 'fill-amber-400 text-amber-400 drop-shadow-lg'
                  : 'text-white/10',
              )}
            />
          ))}
        </div>

        {/* Result Text */}
        <h1
          className={cn(
            'mb-1 text-5xl font-black tracking-tight',
            config.className,
          )}
        >
          {config.text}
        </h1>
        <p className='mb-8 text-white/50'>{config.subtitle}</p>

        {/* Score Summary */}
        <div className='mb-8 w-full rounded-2xl py-4'>
          <div className='mb-4 flex items-center justify-center gap-2 text-sm'>
            <TrophyIcon className='size-4 text-white/40' />
            <span className='font-medium text-white/40'>Match Results</span>
          </div>

          <div className='flex flex-col gap-3'>
            <ScoreRow player={players[0]} rank={1} />

            <div className='flex items-center gap-4 px-4'>
              <div className='h-px flex-1 bg-white/10' />
              <span className='text-xs font-bold text-white/20'>VS</span>
              <div className='h-px flex-1 bg-white/10' />
            </div>

            <ScoreRow player={players[1]} rank={2} />
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => router.push('/lobby')}
          className='flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 text-lg font-bold transition-opacity hover:opacity-90'
        >
          <HomeIcon className='size-5' />
          Back to Lobby
        </button>
      </div>
    </div>
  )
}

function ScoreRow({
  player,
  rank,
}: {
  player: { name: string; score: number; isMe: boolean }
  rank: number
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl p-4',
        player.isMe ? 'bg-white/10' : 'bg-white/5',
      )}
    >
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-full text-xs font-bold',
          rank === 1
            ? 'bg-linear-to-br from-amber-400 to-yellow-300 text-black'
            : 'bg-white/10 text-white/50',
        )}
      >
        {rank}
      </div>
      <div className='min-w-0 flex-1'>
        <p className='flex items-center gap-1 truncate font-semibold'>
          {player.name}
          {player.isMe && <span className='text-xs text-white/30'>(You)</span>}
        </p>
      </div>
      <span className='text-lg font-black tabular-nums'>
        {player.score.toLocaleString()}
      </span>
    </div>
  )
}
