import { Loader2 } from 'lucide-react'

export default function GameLoading() {
    return (
        <div className='flex min-h-svh flex-col items-center justify-center bg-[#0B1120]'>
            <Loader2 className='size-8 animate-spin text-cyan-400' />
            <p className='mt-4 text-slate-400'>Loading game...</p>
        </div>
    )
}
