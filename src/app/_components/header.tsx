'use client'

import { CupSodaIcon } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <header className='relative z-50 flex items-center justify-between px-16 py-4 backdrop-blur-md'>
      <Link href='/'>
        <div className='flex items-center gap-4'>
          <CupSodaIcon />
          <h1 className='text-xl font-bold tracking-tight'>SODA POP</h1>
        </div>
      </Link>
    </header>
  )
}
