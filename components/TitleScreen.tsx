'use client';

import { useGameStore } from '@/store/gameStore';
import Image from 'next/image';
import { useState, useEffect } from 'react';

const TITLE_IMAGES = [
  '/assets/images/title1_red.png',
  '/assets/images/title2_daidai.png',
  '/assets/images/title3_yellow.png',
  '/assets/images/title4_green.png',
  '/assets/images/title5_lightblue.png',
  '/assets/images/title6_blue.png',
  '/assets/images/title7_purple.png',
];

export function TitleScreen() {
  const gameState = useGameStore((state) => state.gameState);
  const startGame = useGameStore((state) => state.startGame);
  const [currentLogoIndex, setCurrentLogoIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentLogoIndex((prev) => (prev + 1) % TITLE_IMAGES.length);
    }, 800);

    return () => clearInterval(intervalId);
  }, []);

  if (gameState !== 'title') {
    return null;
  }

  const handleStart = () => {
    startGame();
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 text-white overflow-y-auto py-4 pb-4 sm:pb-6">
      <div className="mb-2 sm:mb-4 md:mb-8 landscape:mb-2 w-full max-w-[600px] md:max-w-[800px] h-[120px] sm:h-[200px] md:h-[300px] landscape:h-[100px] relative px-4">
        <Image
          src={TITLE_IMAGES[currentLogoIndex]}
          alt="はたんゲーム"
          fill
          className="object-contain transition-opacity duration-300"
          priority
        />
      </div>
      <div className="max-w-2xl text-center mb-2 sm:mb-4 md:mb-8 landscape:mb-2 px-4">
        <p className="text-lg sm:text-xl md:text-2xl landscape:text-base mb-2 sm:mb-3 md:mb-4 landscape:mb-1">&quot;やべえ遅刻だ！&quot;</p>
        <p className="text-sm sm:text-base md:text-lg landscape:text-xs mb-1 sm:mb-2">寝坊したキミは、全力で走り出す。</p>
        <p className="text-sm sm:text-base md:text-lg landscape:text-xs mb-1 sm:mb-2">道中にある「はたーん」をよけながら、ゴールを目指そう。</p>
        <p className="text-sm sm:text-base md:text-lg landscape:text-xs mb-1 sm:mb-2">途中にあるスターをとれば、「はたーん」を吹き飛ばせる。</p>
        <p className="text-sm sm:text-base md:text-lg landscape:text-xs">&quot;はたーん&quot;を乗り越え、ゴールを目指せ！</p>
      </div>
      <div className="mb-2 sm:mb-4 md:mb-8 landscape:mb-2 text-left bg-black bg-opacity-30 p-3 sm:p-4 md:p-6 landscape:p-2 rounded-lg">
        <h2 className="text-base sm:text-lg md:text-xl landscape:text-sm font-bold mb-2 sm:mb-3 md:mb-4 landscape:mb-1">操作方法</h2>
        <div className="space-y-1 sm:space-y-2 landscape:space-y-1">
          <p className="text-sm sm:text-base md:text-lg landscape:text-xs">🖱️ PC: ↑↓キー または W/Sキー</p>
          <p className="text-sm sm:text-base md:text-lg landscape:text-xs">📱 スマホ: 上下にスワイプ</p>
        </div>
      </div>
      <button
        onClick={handleStart}
        className="px-6 py-3 md:px-8 md:py-4 landscape:px-5 landscape:py-2 text-xl md:text-2xl landscape:text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors shadow-lg"
      >
        ゲームスタート
      </button>
    </div>
  );
}
