'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Obstacle as ObstacleType } from '@/store/gameStore';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export function Obstacle({ obstacle }: ObstacleProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.x = obstacle.position.x;
      meshRef.current.position.y = obstacle.position.y;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[obstacle.width, obstacle.height, 0.5]} />
      <meshStandardMaterial color="#4a5568" />
    </mesh>
  );
}
