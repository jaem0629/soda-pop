'use client'

type ConnectionIndicatorProps = {
    isConnected: boolean
}

export default function ConnectionIndicator({
    isConnected,
}: ConnectionIndicatorProps) {
    return (
        <div className='fixed right-4 bottom-4'>
            <div
                className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
            />
        </div>
    )
}
