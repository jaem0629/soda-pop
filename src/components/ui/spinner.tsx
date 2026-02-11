import { Loader2Icon } from 'lucide-react'

export function Spinner({ message }: { message?: string }) {
  return (
    <div className='flex flex-1 flex-col items-center justify-center'>
      <Loader2Icon className='size-8 animate-spin' />
      {message && (
        <p className='text-muted-foreground mt-4'>{message}</p>
      )}
    </div>
  )
}
