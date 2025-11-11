'use client';

import { useGameStore } from '@/store/gameStore';
import { useFullscreen } from '@/hooks/useFullscreen';

export function GameUI() {
  const gameState = useGameStore((state) => state.gameState);
  const distance = useGameStore((state) => state.distance);
  const timeRemaining = useGameStore((state) => state.timeRemaining);
  const player = useGameStore((state) => state.player);
  
  const { isFullscreen, toggleFullscreen, error } = useFullscreen();

  if (gameState !== 'playing') {
    return null;
  }

  const distanceToGoal = Math.max(0, Math.floor(1000 - distance));
  const seconds = Math.ceil(timeRemaining / 1000);
  const invincibleSeconds = (player.invincibleTimeRemaining / 1000).toFixed(1);

  return (
    <div className="fixed top-0 left-0 right-0 p-4 text-white pointer-events-none">
      <div className="flex justify-between items-start">
        <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          <p className="text-xl font-bold">ゴールまでの距離: {distanceToGoal}m</p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <div className="bg-blue-500 bg-opacity-90 px-4 py-2 rounded-lg">
            <p className="text-xl font-bold">残り時間: {seconds}秒</p>
          </div>
          {player.invincible && (
            <div 
              className="px-4 py-2 rounded-lg font-bold text-xl transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
                backgroundSize: '200% 100%',
                animation: 'rainbow-slide 2s linear infinite',
                opacity: player.invincible ? 1 : 0,
              }}
            >
              ⭐ {invincibleSeconds}s
            </div>
          )}
          <button
            onClick={toggleFullscreen}
            className="pointer-events-auto bg-gray-800 bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 px-3 py-2 rounded-lg text-2xl active:scale-95"
            title={isFullscreen ? '全画面を解除' : '全画面表示'}
            aria-label={isFullscreen ? '全画面を解除' : '全画面表示'}
          >
            {isFullscreen ? '⛶' : '⛶'}
          </button>
          {error && (
            <div className="bg-red-500 bg-opacity-90 px-3 py-1 rounded text-sm max-w-[200px]">
              {error}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes rainbow-slide {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
