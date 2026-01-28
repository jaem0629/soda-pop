'use client'

type WaitingRoomProps = {
    code: string | null
    hasOpponent: boolean
    isHost: boolean
    canStart: boolean
    onStartGame: () => void
}

export default function WaitingRoom({
    code,
    hasOpponent,
    isHost,
    canStart,
    onStartGame,
}: WaitingRoomProps) {
    return (
        <div className='flex flex-col items-center gap-4 rounded-2xl bg-[#1a1a2e] p-8'>
            <p className='text-xl text-white'>방 코드</p>
            <p className='text-4xl font-bold tracking-widest text-purple-400'>
                {code ?? '---'}
            </p>
            <p className='text-gray-400'>이 코드를 상대방에게 공유하세요</p>

            {!hasOpponent && (
                <div className='mt-4 flex items-center gap-2 text-gray-400'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent' />
                    상대방 대기 중...
                </div>
            )}

            {canStart && (
                <button
                    onClick={onStartGame}
                    className='mt-4 rounded-xl bg-linear-to-r from-green-500 to-emerald-500 px-8 py-4 font-bold text-white transition-all hover:from-green-600 hover:to-emerald-600'>
                    게임 시작!
                </button>
            )}

            {hasOpponent && !isHost && (
                <p className='mt-4 text-gray-400'>
                    방장이 게임을 시작합니다...
                </p>
            )}
        </div>
    )
}
