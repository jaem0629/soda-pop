import { Loader2Icon } from 'lucide-react'

export function Spinner({ message }: { message?: string }) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <Loader2Icon className='size-8 animate-spin' />
      {message && <p className='mt-4 text-white/50'>{message}</p>}
    </div>
  )
}
