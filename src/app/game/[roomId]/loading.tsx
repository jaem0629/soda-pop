import { Loader2Icon } from 'lucide-react'

export default function GameLoading() {
  return (
    <div className='flex flex-col items-center justify-center'>
      <Loader2Icon className='size-8 animate-spin' />
      <p className='text-muted-foreground mt-4'>Loading game...</p>
    </div>
  )
}
