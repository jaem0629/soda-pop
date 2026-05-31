'use client'

import { cn } from '@/lib/utils'
import { HomeIcon, TrophyIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { GameMode, MatchPlayer } from '../_lib/types'

interface MatchFinishedProps {
  mode: GameMode
  myPlayer: MatchPlayer
  opponent: MatchPlayer | undefined
  myScore: number
  opponentScore: number
}

const BATTLE_RESULT_STYLES = {
  win: {
    text: 'VICTORY',
    className:
      'bg-linear-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent',
    subtitle: 'Great job!',
  },
  lose: {
    text: 'DEFEAT',
    className: 'text-red-400',
    subtitle: 'Better luck next time!',
  },
  draw: {
    text: 'DRAW',
    className: 'text-purple-400',
    subtitle: "It's a tie!",
  },
} as const

export default function MatchFinished({
  mode,
  myPlayer,
  opponent,
  myScore,
  opponentScore,
}: MatchFinishedProps) {
  const router = useRouter()

  if (mode === 'solo') {
    return (
      <SoloFinished
        myPlayer={myPlayer}
        myScore={myScore}
        onBackToLobby={() => router.push('/lobby')}
      />
    )
  }

  return (
    <BattleFinished
      myPlayer={myPlayer}
      opponent={opponent}
      myScore={myScore}
      opponentScore={opponentScore}
      onBackToLobby={() => router.push('/lobby')}
    />
  )
}

function SoloFinished({
  myPlayer,
  myScore,
  onBackToLobby,
}: {
  myPlayer: MatchPlayer
  myScore: number
  onBackToLobby: () => void
}) {
  return (
    <div className='flex flex-1 items-center justify-center p-2 sm:p-4'>
      <div className='flex w-full max-w-lg flex-col items-center'>
        <h1 className='mb-1 bg-linear-to-r from-green-400 to-emerald-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl'>
          GAME OVER
        </h1>
        <p className='mb-8 text-white/50'>Nice playing!</p>

        <div className='mb-8 w-full rounded-2xl py-4'>
          <div className='mb-4 flex items-center justify-center gap-2 text-sm'>
            <TrophyIcon className='size-4 text-white/40' />
            <span className='font-medium text-white/40'>Your Score</span>
          </div>

          <div className='flex items-center gap-4 rounded-lg bg-white/10 p-4'>
            <div className='flex size-10 items-center justify-center rounded-full bg-linear-to-br from-green-500 to-emerald-500 text-xs font-bold'>
              {myPlayer.player_name.charAt(0).toUpperCase()}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate font-semibold'>{myPlayer.player_name}</p>
            </div>
            <span className='text-2xl font-black tabular-nums'>
              {myScore.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={onBackToLobby}
          className='flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-white text-base font-black text-slate-950 transition hover:bg-sky-100 sm:h-14 sm:text-lg'
        >
          <HomeIcon className='size-5' />
          Back to Lobby
        </button>
      </div>
    </div>
  )
}

function BattleFinished({
  myPlayer,
  opponent,
  myScore,
  opponentScore,
  onBackToLobby,
}: {
  myPlayer: MatchPlayer
  opponent: MatchPlayer | undefined
  myScore: number
  opponentScore: number
  onBackToLobby: () => void
}) {
  const isWinner = myScore > opponentScore
  const isDraw = myScore === opponentScore
  const result = isDraw ? 'draw' : isWinner ? 'win' : 'lose'
  const config = BATTLE_RESULT_STYLES[result]

  const players = [
    { name: myPlayer.player_name, score: myScore, isMe: true },
    {
      name: opponent?.player_name ?? 'Opponent',
      score: opponentScore,
      isMe: false,
    },
  ].sort((a, b) => b.score - a.score)

  return (
    <div className='flex flex-1 items-center justify-center p-2 sm:p-4'>
      <div className='flex w-full max-w-lg flex-col items-center'>
        <h1
          className={cn(
            'mb-1 text-4xl font-black tracking-tight sm:text-5xl',
            config.className,
          )}
        >
          {config.text}
        </h1>
        <p className='mb-8 text-white/50'>{config.subtitle}</p>

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

        <button
          onClick={onBackToLobby}
          className='flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-white text-base font-black text-slate-950 transition hover:bg-sky-100 sm:h-14 sm:text-lg'
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
        'flex items-center gap-4 rounded-lg p-4',
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
