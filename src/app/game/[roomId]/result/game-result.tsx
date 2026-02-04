'use client'

import { GlassPanel } from '@/components/glass-panel'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { MatchPlayer } from '../_lib/types'

interface GameResultProps {
  myPlayer: MatchPlayer
  opponent: MatchPlayer | undefined
  myScore: number
  opponentScore: number
}

export default function GameResult({
  myPlayer,
  opponent,
  myScore,
  opponentScore,
}: GameResultProps) {
  const router = useRouter()

  const isWinner = myScore > opponentScore
  const isDraw = myScore === opponentScore

  const getResultText = () => {
    if (isDraw) return 'DRAW'
    return isWinner ? 'VICTORY' : 'DEFEAT'
  }

  const getResultColor = () => {
    if (isDraw) return 'text-yellow-400'
    return isWinner ? 'text-cyan-400' : 'text-red-400'
  }

  const getResultGlow = () => {
    if (isDraw) return 'drop-shadow-[0_0_30px_rgba(250,204,21,0.5)]'
    return isWinner
      ? 'drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]'
      : 'drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]'
  }

  return (
    <div className='flex flex-1 items-center justify-center p-4'>
      <div className='flex w-full max-w-4xl flex-col items-center gap-8 lg:flex-row lg:items-start'>
        {/* Main Result Card */}
        <GlassPanel className='w-full max-w-md flex-1 overflow-hidden p-8'>
          {/* Glow Effect */}
          <div className='absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-70' />

          {/* Result Header */}
          <div className='mb-4 gap-2 text-center'>
            <h1
              className={`text-5xl font-black tracking-tighter sm:text-6xl ${getResultColor()} ${getResultGlow()}`}
            >
              {getResultText()}
            </h1>
            <p className='text-lg font-medium text-slate-300'>
              {isDraw
                ? "It's a tie!"
                : isWinner
                  ? 'Great job!'
                  : 'Better luck next time!'}
            </p>
          </div>

          {/* Stars */}
          <div className='mb-6 flex justify-center gap-3'>
            {[1, 2, 3].map((star) => (
              <svg
                key={star}
                className={`size-12 ${
                  (isWinner && star <= 3) ||
                  (isDraw && star <= 2) ||
                  (!isWinner && !isDraw && star <= 1)
                    ? 'text-yellow-400 drop-shadow-lg'
                    : 'text-slate-700'
                }`}
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
              </svg>
            ))}
          </div>

          {/* Final Score */}
          <div className='relative mb-8 flex justify-center py-6'>
            <div className='absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl' />
            <div className='relative text-7xl font-black text-white tabular-nums'>
              {myScore.toLocaleString()}
            </div>
          </div>

          {/* Rewards */}
          <div className='mb-8 flex gap-4'>
            <div className='flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-[#162032] p-4 transition-colors hover:bg-white/5'>
              <span className='text-2xl font-bold text-green-400'>
                +{isWinner ? 150 : isDraw ? 75 : 50} XP
              </span>
              <span className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                Experience
              </span>
            </div>
            <div className='flex flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-white/10 bg-[#162032] p-4 transition-colors hover:bg-white/5'>
              <span className='text-2xl font-bold text-yellow-400'>
                +{isWinner ? 25 : isDraw ? 15 : 10}
              </span>
              <span className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                Coins
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className='flex flex-col gap-3'>
            <Button
              onClick={() => router.push('/lobby')}
              className='h-14 w-full rounded-full bg-cyan-400 text-lg font-bold text-slate-900 shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all hover:scale-[1.02] hover:bg-cyan-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]'
            >
              <svg
                className='mr-2 size-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' />
              </svg>
              Play Again
            </Button>
            <Button
              variant='ghost'
              onClick={() => router.push('/')}
              className='w-full rounded-full border border-white/10 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white'
            >
              <svg
                className='mr-2 size-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' />
              </svg>
              Back to Home
            </Button>
          </div>
        </GlassPanel>

        {/* Ranking Card */}
        <GlassPanel className='w-full max-w-sm overflow-hidden lg:max-w-xs'>
          <div className='border-b border-white/5 bg-[#0B1120]/80 p-6'>
            <h3 className='flex items-center gap-2 text-xl font-bold text-white'>
              <svg
                className='size-6 text-cyan-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth={2}
              >
                <path d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
              </svg>
              Match Results
            </h3>
          </div>

          <div className='gap-2 p-4'>
            {/* Winner */}
            <div
              className={`flex items-center gap-4 rounded-xl p-3 ${
                isWinner
                  ? 'border border-cyan-400/50 bg-cyan-400/20'
                  : 'border border-white/10 bg-[#162032]'
              }`}
            >
              <div className='text-center text-xl font-bold text-yellow-400'>
                1
              </div>
              <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-cyan-500 to-blue-600 font-bold text-white'>
                {isWinner
                  ? myPlayer.player_name.charAt(0).toUpperCase()
                  : (opponent?.player_name?.charAt(0).toUpperCase() ?? '?')}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-bold text-white'>
                  {isWinner
                    ? myPlayer.player_name
                    : (opponent?.player_name ?? 'Opponent')}
                </p>
              </div>
              <div className='text-right'>
                <p className='font-bold text-white tabular-nums'>
                  {(isWinner ? myScore : opponentScore).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Loser */}
            <div
              className={`flex items-center gap-4 rounded-xl p-3 ${
                !isWinner && !isDraw
                  ? 'border border-cyan-400/50 bg-cyan-400/20'
                  : 'border border-white/10 bg-[#162032]'
              }`}
            >
              <div className='text-center text-xl font-bold text-slate-400'>
                2
              </div>
              <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-600 font-bold text-white'>
                {!isWinner
                  ? myPlayer.player_name.charAt(0).toUpperCase()
                  : (opponent?.player_name?.charAt(0).toUpperCase() ?? '?')}
              </div>
              <div className='min-w-0 flex-1'>
                <p className='truncate font-bold text-white'>
                  {!isWinner
                    ? myPlayer.player_name
                    : (opponent?.player_name ?? 'Opponent')}
                </p>
              </div>
              <div className='text-right'>
                <p className='font-bold text-slate-400 tabular-nums'>
                  {(!isWinner ? myScore : opponentScore).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}
