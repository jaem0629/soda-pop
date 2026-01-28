'use client'

type GameResultProps = {
    myNickname: string
    myScore: number
    opponentName: string | null | undefined
    opponentScore: number
    onGoHome: () => void
}

export default function GameResult({
    myNickname,
    myScore,
    opponentName,
    opponentScore,
    onGoHome,
}: GameResultProps) {
    const result =
        myScore > opponentScore
            ? '🎉 승리!'
            : myScore < opponentScore
              ? '😢 패배'
              : '🤝 무승부'

    return (
        <div className='flex flex-col items-center gap-4 rounded-2xl bg-[#1a1a2e] p-8'>
            <p className='text-3xl font-bold text-white'>{result}</p>

            <div className='flex gap-8 text-center'>
                <div>
                    <p className='text-gray-400'>{myNickname}</p>
                    <p className='text-3xl font-bold text-yellow-400'>
                        {myScore}
                    </p>
                </div>
                <div className='text-3xl font-bold text-gray-600'>vs</div>
                <div>
                    <p className='text-gray-400'>{opponentName}</p>
                    <p className='text-3xl font-bold text-pink-400'>
                        {opponentScore}
                    </p>
                </div>
            </div>

            <button
                onClick={onGoHome}
                className='mt-4 rounded-xl bg-linear-to-r from-purple-500 to-pink-500 px-8 py-4 font-bold text-white transition-all hover:from-purple-600 hover:to-pink-600'>
                메인으로
            </button>
        </div>
    )
}
