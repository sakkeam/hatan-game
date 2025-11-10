'use client';

import { useGameStore } from '@/store/gameStore';

export function GameUI() {
  const gameState = useGameStore((state) => state.gameState);
  const distance = useGameStore((state) => state.distance);
  const timeRemaining = useGameStore((state) => state.timeRemaining);

  if (gameState !== 'playing') {
    return null;
  }

  const seconds = Math.ceil(timeRemaining / 1000);

  return (
    <div className="fixed top-0 left-0 right-0 p-4 text-white pointer-events-none">
      <div className="flex justify-between items-start">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">到達距離: {Math.floor(distance)}m</p>
        </div>
        <div className="bg-blue-500 bg-opacity-90 px-4 py-2 rounded-lg">
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold">残り時間: {seconds}秒</p>
        </div>
      </div>
    </div>
  );
}
