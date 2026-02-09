import { LoginDialog } from '@/app/_components/login-dialog'
import { StartPlayingButton } from '@/app/_components/start-playing-button'
import { getAuthUser } from '@/app/_lib/queries'
import Link from 'next/link'
import { MatchCard, PopCard, WinCard } from './_components/feature-cards'

export default async function HomePage() {
  const user = await getAuthUser()
  return (
    <main className='flex flex-1 flex-col items-center justify-center'>
      <div className='mb-8 flex w-full flex-col items-center gap-8'>
        <div className='flex flex-col items-center gap-8 text-center'>
          <h1 className='bg-linear-to-b from-white to-blue-400 bg-clip-text text-9xl font-bold text-transparent'>
            SODA POP
          </h1>

          <p className='text-muted-foreground max-w-lg text-xl'>
            Connect, pop, and compete. Match colorful bubbles in real-time
            battles against friends.
          </p>

          {user ? (
            <Link href='/lobby'>
              <StartPlayingButton />
            </Link>
          ) : (
            <LoginDialog />
          )}
        </div>

        <div className='mt-16 w-full'>
          <h2 className='text-muted-foreground mb-8 text-center font-semibold tracking-widest'>
            HOW TO PLAY
          </h2>

          <div className='grid grid-cols-1 place-items-center gap-8 lg:grid-cols-3'>
            <MatchCard />
            <PopCard />
            <WinCard />
          </div>
        </div>
      </div>
    </main>
  )
}
