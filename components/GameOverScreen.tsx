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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 text-white">
      <h1 className="text-6xl font-bold mb-8 text-red-500">GAME OVER</h1>
      <p className="text-3xl mb-4">はたーんに当たってしまった...</p>
      <p className="text-2xl mb-8">到達距離: {Math.floor(distance)}m</p>
      <button
        onClick={resetGame}
        className="px-8 py-4 text-2xl font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        タイトルに戻る
      </button>
    </div>
  );
}
