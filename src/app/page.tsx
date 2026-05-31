import { LoginDialog } from '@/app/_components/login-dialog'
import { StartPlayingButton } from '@/app/_components/start-playing-button'
import { getAuthUser } from '@/app/_lib/queries'
import { SparklesIcon, TimerIcon, TrophyIcon } from 'lucide-react'
import Link from 'next/link'
import { GamePreview } from './_components/game-preview'

export default async function HomePage() {
  const user = await getAuthUser()
  return (
    <main className='bg-background flex flex-1 overflow-y-auto'>
      <section className='mx-auto grid min-h-full w-full max-w-7xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-12'>
        <div className='flex min-w-0 flex-col justify-center gap-7'>
          <div className='flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold tracking-widest text-white/50 uppercase'>
            <SparklesIcon className='size-4 text-white/50' />
            Arcade puzzle rush
          </div>

          <div className='flex flex-col gap-3'>
            <h1 className='soda-logo text-6xl leading-none font-black tracking-tight sm:text-8xl'>
              <span className='text-red-400'>S</span>
              <span className='text-green-400'>O</span>
              <span className='text-blue-400'>D</span>
              <span className='text-amber-300'>A</span>
              <span className='ml-2 text-violet-400 sm:ml-4'>P</span>
              <span className='text-pink-400'>O</span>
              <span className='text-cyan-300'>P</span>
            </h1>
            <div className='h-2 w-40 rounded-full bg-linear-to-r from-red-400 via-amber-300 to-cyan-300' />
          </div>

          <p className='max-w-xl text-lg leading-8 font-semibold text-white/72 sm:text-xl'>
            Snap pieces, stack combos, and chase the clock in quick solo runs or
            head-to-head battles.
          </p>

          {user ? (
            <Link href='/lobby' className='w-full sm:w-fit'>
              <StartPlayingButton />
            </Link>
          ) : (
            <div className='w-full sm:w-fit'>
              <LoginDialog />
            </div>
          )}
          <div className='flex flex-wrap gap-3'>
            <HomeMetric
              icon={<TrophyIcon className='size-4' />}
              label='Modes'
              value='Solo / Battle'
            />
            <HomeMetric
              icon={<TimerIcon className='size-4' />}
              label='Round'
              value='60 Seconds'
            />
            <HomeMetric
              icon={<SparklesIcon className='size-4' />}
              label='Input'
              value='Touch Ready'
            />
          </div>
        </div>

        <div className='flex min-w-0 items-center justify-center lg:justify-end'>
          <div className='relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/30'>
            <div className='aspect-square overflow-hidden rounded-2xl bg-slate-950'>
              <GamePreview />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function HomeMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className='flex min-w-44 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white'>
      <div className='flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/8 text-white/55'>
        {icon}
      </div>
      <div>
        <p className='text-xs font-bold tracking-widest text-white/40 uppercase'>
          {label}
        </p>
        <p className='mt-1 text-sm font-bold'>{value}</p>
      </div>
    </div>
  )
}
