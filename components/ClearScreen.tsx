'use client';

import { useGameStore } from '@/store/gameStore';

export function ClearScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const resetGame = useGameStore((state) => state.resetGame);

  if (gameState !== 'clear') {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-yellow-400 to-orange-500 text-white">
      <h1 className="text-6xl font-bold mb-8 animate-bounce">CLEAR!</h1>
      <p className="text-3xl mb-4">🎉 おめでとうございます！ 🎉</p>
      <p className="text-2xl mb-4">無事ゴールに到着しました！</p>
      <p className="text-2xl mb-8">スコア: {score}</p>
      <button
        onClick={resetGame}
        className="px-8 py-4 text-2xl font-bold bg-white hover:bg-gray-100 text-orange-500 rounded-lg transition-colors shadow-lg"
      >
        タイトルに戻る
      </button>
    </div>
  );
}
