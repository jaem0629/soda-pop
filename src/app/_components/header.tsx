import { getCurrentUser } from '@/app/_lib/queries'
import Link from 'next/link'
import { UserMenu } from './user-menu'

export async function Header() {
  const user = await getCurrentUser()

  return (
    <header className='flex w-full items-center justify-between px-16 py-4'>
      <Link href='/'>
        <span className='text-xl font-black tracking-tight'>
          <span className='text-red-400'>S</span>
          <span className='text-green-400'>O</span>
          <span className='text-blue-400'>D</span>
          <span className='text-amber-400'>A</span>
          <span className='ml-1 text-purple-400'>P</span>
          <span className='text-pink-400'>O</span>
          <span className='text-cyan-400'>P</span>
        </span>
      </Link>
      {user && <UserMenu nickname={user.nickname} />}
    </header>
  )
}
