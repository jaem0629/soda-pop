import { Button } from '@/components/ui/button'
import { HomeIcon } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex flex-1 flex-col items-center justify-center gap-4 text-center'>
      <h1 className='text-6xl font-black tabular-nums'>404</h1>
      <p className='text-muted-foreground'>This page could not be found.</p>
      <Button asChild variant='ghost'>
        <Link href='/'>
          <HomeIcon className='size-4' />
          Back to Home
        </Link>
      </Button>
    </div>
  )
}
