import { getCurrentUser } from '@/app/_lib/queries'
import { CupSodaIcon } from 'lucide-react'
import Link from 'next/link'
import { UserMenu } from './user-menu'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className='bg-background/90 sticky top-0 z-50 flex w-full items-center justify-between px-16 py-4 backdrop-blur-xs'>
      <Link href='/'>
        <div className='flex items-center gap-4'>
          <CupSodaIcon />
          <h1 className='text-xl font-bold tracking-tight'>SODA POP</h1>
        </div>
      </Link>
      {user && <UserMenu nickname={user.nickname} />}
    </header>
  )
}
