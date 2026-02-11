'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CircleStarIcon,
  HomeIcon,
  MedalIcon,
  RefreshCwIcon,
  StarIcon,
  TrophyIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { MatchPlayer } from '../_lib/types'

interface MatchFinishedProps {
  myPlayer: MatchPlayer
  opponent: MatchPlayer | undefined
  myScore: number
  opponentScore: number
}

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

  const resultConfig = {
    win: { text: 'VICTORY', stars: 3 },
    lose: { text: 'DEFEAT', stars: 1 },
    draw: { text: 'DRAW', stars: 2 },
  } as const

  const { text, stars } = resultConfig[result]

  // Sort players by score descending
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
      <div className='flex w-full max-w-sm flex-col items-center'>
        {/* Result */}
        <h1 className='mb-2 text-5xl font-black tracking-tight'>{text}</h1>
        <p className='text-muted-foreground'>
          {isDraw
            ? "It's a tie!"
            : isWinner
              ? 'Great job!'
              : 'Better luck next time!'}
        </p>

        {/* Stars */}
        <div className='my-8 flex gap-2'>
          {[1, 2, 3].map((i) => (
            <StarIcon
              key={i}
              className={cn(
                'size-8',
                i <= stars
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'text-muted-foreground',
              )}
            />
          ))}
        </div>

        {/* Rankings */}
        <div className='mb-8 w-full'>
          <div className='mb-4 flex items-center justify-center gap-2 text-sm'>
            <TrophyIcon className='text-muted-foreground size-4' />
            <span className='text-muted-foreground font-medium'>
              Match Results
            </span>
          </div>
          <div className='flex flex-col gap-2'>
            {players.map((player, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-4 rounded-xl border p-4',
                  player.isMe && 'bg-muted',
                )}
              >
                <span className='text-muted-foreground w-5 text-center text-sm font-bold'>
                  {i + 1}
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='flex items-center gap-1 truncate font-semibold'>
                    {player.name}
                    {player.isMe && (
                      <span className='text-muted-foreground'>(You)</span>
                    )}
                  </p>
                </div>
                <span className='font-bold tabular-nums'>
                  {player.score.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <Button onClick={() => router.push('/lobby')} className='w-full'>
          <HomeIcon className='size-4' />
          Back to Lobby
        </Button>
      </div>
    </div>
  )
}
