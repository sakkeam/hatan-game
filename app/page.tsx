'use client';

import { GameScene } from '@/components/GameScene';
import { TitleScreen } from '@/components/TitleScreen';
import { GameOverScreen } from '@/components/GameOverScreen';
import { ClearScreen } from '@/components/ClearScreen';
import { GameUI } from '@/components/GameUI';

export default function Home() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <TitleScreen />
      <GameScene />
      <GameUI />
      <GameOverScreen />
      <ClearScreen />
    </div>
  );
}
