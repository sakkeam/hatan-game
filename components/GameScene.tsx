'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Player } from './Player';
import { Obstacle } from './Obstacle';
import { useGameStore } from '@/store/gameStore';
import { useGameInput } from '@/hooks/useGameInput';
import { useGameLoop } from '@/hooks/useGameLoop';

function Scene() {
  const obstacles = useGameStore((state) => state.obstacles);

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
      {/* Ground reference */}
      <mesh position={[0, -6, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 20]} />
        <meshStandardMaterial color="#2d3748" opacity={0.3} transparent />
      </mesh>
    </>
  );
}

export function GameScene() {
  const gameState = useGameStore((state) => state.gameState);

  if (gameState === 'title') {
    return null;
  }

  return (
    <div className="w-full h-screen">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        style={{ background: '#1a202c' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
