export default function LoadingSpinner() {
    return (
        <div className='flex min-h-svh items-center justify-center'>
            <div className='flex items-center gap-2 text-slate-400'>
                <div className='size-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent' />
                <span>Loading...</span>
            </div>
        </div>
    )
}
