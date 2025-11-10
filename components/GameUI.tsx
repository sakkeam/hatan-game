'use client';

import { useGameStore } from '@/store/gameStore';

export function GameUI() {
  const gameState = useGameStore((state) => state.gameState);
  const distance = useGameStore((state) => state.distance);

  if (gameState !== 'playing') {
    return null;
  }

  const distanceToGoal = Math.max(0, Math.floor(100 - distance));

  return (
    <div className="fixed top-0 left-0 right-0 p-4 text-white pointer-events-none">
      <div className="flex justify-between items-start">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-xl font-bold">ゴールまでの距離: {distanceToGoal}m</p>
        </div>
      </div>
    </div>
  );
}
