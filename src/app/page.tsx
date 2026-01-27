import GameBoard from "@/components/game-board";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f23] flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-8">
        🧩 퍼즐 배틀
      </h1>
      <p className="text-gray-400 mb-6">
        드래그 또는 클릭으로 인접한 조각을 교환하세요!
      </p>
      <GameBoard />
    </div>
  );
}
