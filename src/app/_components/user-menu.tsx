'use client'

import { signOut } from '@/app/_lib/actions'
import { useTransition } from 'react'

interface UserMenuProps {
  nickname: string
}

export function UserMenu({ nickname }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()

  const handleSignOut = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <div className='flex items-center gap-4'>
      <div className='flex items-center gap-2'>
        <div className='flex size-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-500'>
          <span className='text-sm font-bold'>
            {nickname.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className='text-sm font-medium text-white/70'>{nickname}</span>
      </div>
      <button
        onClick={handleSignOut}
        disabled={isPending}
        className='rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold transition-colors hover:bg-white/20 disabled:opacity-50'
      >
        {isPending ? 'Signing out...' : 'Sign Out'}
      </button>
    </div>
  )
}
