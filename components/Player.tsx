'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useGameStore } from '@/store/gameStore';

export function Player() {
  const meshRef = useRef<Mesh>(null);
  const player = useGameStore((state) => state.player);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = player.position.x;
      meshRef.current.position.y = player.position.y;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial 
        color='#ff6b6b' 
      />
    </mesh>
  );
}
