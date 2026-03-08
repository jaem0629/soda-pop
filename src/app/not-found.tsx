import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
      <h1 className='text-6xl font-black tabular-nums'>404</h1>
      <p className='text-white/50'>This page could not be found.</p>
      <Link
        href='/'
        className='flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white/70 transition-colors hover:bg-white/10'
      >
        <HomeIcon className='size-4' />
        Back to Home
      </Link>
    </div>
  )
}
