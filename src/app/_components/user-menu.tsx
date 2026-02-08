'use client'

import { signOut } from '@/app/_lib/actions'
import { Button } from '@/components/ui/button'
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
      <div className='flex items-center gap-2 rounded-full'>
        <div className='bg-muted flex size-8 items-center justify-center rounded-full'>
          <span className='text-sm font-bold'>
            {nickname.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className='text-sm font-medium text-white'>{nickname}</span>
      </div>
      <Button
        onClick={handleSignOut}
        disabled={isPending}
        variant='outline'
        size='sm'
        className='text-xs'
      >
        {isPending ? 'Signing out...' : 'Sign Out'}
      </Button>
    </div>
  )
}
