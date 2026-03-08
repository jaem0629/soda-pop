type ConnectionIndicatorProps = {
  isConnected: boolean
}

export default function ConnectionIndicator({
  isConnected,
}: ConnectionIndicatorProps) {
  if (isConnected) return null

  return (
    <div className='fixed right-4 bottom-4 flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1.5'>
      <div className='size-2 animate-pulse rounded-full bg-red-400' />
      <span className='text-xs font-semibold text-red-400'>Reconnecting</span>
    </div>
  )
}
