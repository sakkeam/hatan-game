'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Image from 'next/image';
import { Player } from './Player';
import { Obstacle } from './Obstacle';
import { StarItem } from './StarItem';
import { useGameStore } from '@/store/gameStore';
import { useGameInput } from '@/hooks/useGameInput';
import { useGameLoop } from '@/hooks/useGameLoop';

const LANES = [-4.8, -2.4, 0, 2.4, 4.8]; // Y coordinates for 5 lanes (matching background sections)

function Scene() {
  const obstacles = useGameStore((state) => state.obstacles);
  const stars = useGameStore((state) => state.stars);

  useGameInput();
  useGameLoop();

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Player />
      {obstacles.map((obstacle) => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}
      {stars.map((star) => (
        <StarItem key={star.id} star={star} />
      ))}
    </>
  );
}

export function GameScene() {
  const gameState = useGameStore((state) => state.gameState);

  if (gameState === 'title') {
    return null;
  }

  return (
    <div className="relative w-full h-screen">
      {/* Background Image */}
      <Image
        src="/assets/images/haikei.png"
        alt="Game Background"
        fill
        style={{ objectFit: 'fill', zIndex: -1 }}
        priority
      />
      {/* Game Canvas */}
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 15], fov: 50 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
