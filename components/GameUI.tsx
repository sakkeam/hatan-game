'use client';

import { useGameStore } from '@/store/gameStore';

export function GameUI() {
  const gameState = useGameStore((state) => state.gameState);
  const score = useGameStore((state) => state.score);
  const player = useGameStore((state) => state.player);

  if (gameState !== 'playing') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 p-4 text-white pointer-events-none">
      <div className="flex justify-between items-start">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-xl font-bold">スコア: {score}</p>
        </div>
        {player.invincible && (
          <div className="bg-yellow-500 bg-opacity-90 px-4 py-2 rounded-lg">
            <p className="text-xl font-bold text-black">
              ⭐ 無敵タイム: {Math.ceil(player.invincibleTimeRemaining / 1000)}秒
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
