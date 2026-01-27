import GameBoard from '@/components/game-board'

export default function Home() {
    return (
        <div className='flex min-h-screen flex-col items-center justify-center bg-[#0f0f23] p-8'>
            <h1 className='mb-8 text-4xl font-bold text-white'>🧩 퍼즐 배틀</h1>
            <p className='mb-6 text-gray-400'>
                드래그 또는 클릭으로 인접한 조각을 교환하세요!
            </p>
            <GameBoard />
        </div>
    )
}
