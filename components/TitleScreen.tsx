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
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900 text-white">
      <div className="mb-8 w-[600px] h-[200px] relative">
        <Image
          src={TITLE_IMAGES[currentLogoIndex]}
          alt="はたんゲーム"
          fill
          className="object-contain transition-opacity duration-300"
          priority
        />
      </div>
      <div className="max-w-2xl text-center mb-8 px-4">
        <p className="text-2xl mb-4">&quot;やべえ遅刻だ！&quot;</p>
        <p className="text-lg mb-2">寝坊したキミは、食パンをかじりながら走り出す。</p>
        <p className="text-lg mb-2">道中にある「はたーん」をよけながら、ゴールを目指そう。</p>
        <p className="text-lg mb-2">途中にあるスターをとれば、「はたーん」を吹き飛ばせる。</p>
        <p className="text-lg">&quot;はたーん&quot;を乗り越え、ゴールを目指せ！</p>
      </div>
      <div className="mb-8 text-left bg-black bg-opacity-30 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">操作方法</h2>
        <div className="space-y-2">
          <p>🖱️ PC: ↑↓キー または W/Sキー</p>
          <p>📱 スマホ: 上下にスワイプ</p>
        </div>
      </div>
      <button
        onClick={handleStart}
        className="px-8 py-4 text-2xl font-bold bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg transition-colors shadow-lg"
      >
        ゲームスタート
      </button>
    </div>
  );
}
