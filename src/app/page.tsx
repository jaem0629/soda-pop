import { LoginDialog } from '@/app/_components/login-dialog'
import { StartPlayingButton } from '@/app/_components/start-playing-button'
import { getAuthUser } from '@/app/_lib/queries'
import Link from 'next/link'
import { GamePreview } from './_components/game-preview'

export default async function HomePage() {
  const user = await getAuthUser()
  return (
    <main className='relative flex flex-1 items-center justify-center'>
      <section className='flex w-full items-center gap-16'>
        <div className='flex flex-1 flex-col gap-8'>
          <h1 className='text-8xl font-black tracking-tight'>
            <span className='text-red-400'>S</span>
            <span className='text-green-400'>O</span>
            <span className='text-blue-400'>D</span>
            <span className='text-amber-400'>A</span>
            <span className='ml-4 text-purple-400'>P</span>
            <span className='text-pink-400'>O</span>
            <span className='text-cyan-400'>P</span>
          </h1>

          <p className='max-w-md text-xl text-white/70'>
            Connect, pop, and compete. Match colorful pieces in real-time
            battles against friends.
          </p>

          {user ? (
            <Link href='/lobby' className='w-fit'>
              <StartPlayingButton />
            </Link>
          ) : (
            <div className='w-fit'>
              <LoginDialog />
            </div>
          )}
        </div>

        <div className='size-96 shrink-0 overflow-hidden rounded-xl'>
          <GamePreview />
        </div>
      </section>
    </main>
  )
}
