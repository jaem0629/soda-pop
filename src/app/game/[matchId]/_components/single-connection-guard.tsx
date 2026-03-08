'use client'

import { Spinner } from '@/app/_components/spinner'
import { useSingleConnection } from '@/hooks/use-single-connection'
import { CircleSlashIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface SingleConnectionGuardProps {
  userId: string
  children: ReactNode
}

export function SingleConnectionGuard({
  userId,
  children,
}: SingleConnectionGuardProps) {
  const { isDuplicate, isChecking } = useSingleConnection(userId)

  if (isChecking) {
    return <Spinner message='Checking connection...' />
  }

  if (isDuplicate) {
    return (
      <div className='absolute inset-0 flex flex-col items-center justify-center gap-4'>
        <CircleSlashIcon className='size-8' />
        <p className='text-lg'>Already connected in another tab.</p>
      </div>
    )
  }

  return <>{children}</>
}
