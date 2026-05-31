import { LoginDialog } from '@/app/_components/login-dialog'
import { StartPlayingButton } from '@/app/_components/start-playing-button'
import { getAuthUser } from '@/app/_lib/queries'
import Link from 'next/link'
import { GamePreview } from './_components/game-preview'

export default async function HomePage() {
  const user = await getAuthUser()
  return (
    <main className='relative -mx-4 -my-4 flex flex-1 overflow-hidden sm:-mx-6 sm:-my-6 lg:-mx-8'>
      <div className='absolute inset-0 opacity-35'>
        <GamePreview />
      </div>
      <div className='absolute inset-0 bg-black/55' />

      <section className='relative z-10 flex min-h-full w-full flex-col justify-between px-4 py-8 sm:px-6 lg:px-8'>
        <div className='flex max-w-3xl flex-1 flex-col justify-center gap-6'>
          <h1 className='text-6xl font-black tracking-tight sm:text-8xl'>
            <span className='text-red-400'>S</span>
            <span className='text-green-400'>O</span>
            <span className='text-blue-400'>D</span>
            <span className='text-amber-400'>A</span>
            <span className='ml-2 text-purple-400 sm:ml-4'>P</span>
            <span className='text-pink-400'>O</span>
            <span className='text-cyan-400'>P</span>
          </h1>

          <p className='max-w-xl text-lg font-medium text-white/75 sm:text-xl'>
            Chain bright pieces in solo runs or 60-second battles built for
            quick rematches on desktop and mobile.
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
        </div>

        <div className='grid gap-3 pt-8 sm:grid-cols-3'>
          <HomeMetric label='Modes' value='Solo / Battle' />
          <HomeMetric label='Round' value='60 Seconds' />
          <HomeMetric label='Input' value='Touch Ready' />
        </div>
      </section>
    </main>
  )
}

function HomeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-white/10 bg-white/10 px-4 py-3'>
      <p className='text-xs font-black tracking-widest text-white/40 uppercase'>
        {label}
      </p>
      <p className='mt-1 text-sm font-black text-white'>{value}</p>
    </div>
  )
}
