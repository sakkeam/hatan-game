'use client';

import { useGameStore } from '@/store/gameStore';

export function GameOverScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const distance = useGameStore((state) => state.distance);
  const resetGame = useGameStore((state) => state.resetGame);

  if (gameState !== 'gameover') {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white overflow-y-auto py-4 pb-4 sm:pb-6">
      <h1 className="text-3xl sm:text-4xl md:text-6xl landscape:text-3xl font-bold mb-3 sm:mb-4 md:mb-8 landscape:mb-2 text-red-500">GAME OVER</h1>
      <p className="text-lg sm:text-xl md:text-3xl landscape:text-base mb-2 sm:mb-3 md:mb-4 landscape:mb-2">はたーんに当たってしまった...</p>
      <p className="text-base sm:text-lg md:text-2xl landscape:text-sm mb-3 sm:mb-4 md:mb-8 landscape:mb-3">ゴールまでの距離: {Math.max(0, Math.floor(100 - distance))}m</p>
      <button
        onClick={resetGame}
        className="px-6 py-3 md:px-8 md:py-4 landscape:px-5 landscape:py-2 text-xl md:text-2xl landscape:text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        タイトルに戻る
      </button>
    </div>
  );
}
