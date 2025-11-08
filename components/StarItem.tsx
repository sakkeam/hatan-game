'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Star as StarType } from '@/store/gameStore';

interface StarItemProps {
  star: StarType;
}

export function StarItem({ star }: StarItemProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current && !star.collected) {
      meshRef.current.position.x = star.position.x;
      meshRef.current.position.y = star.position.y;
      // Rotate for visual effect
      meshRef.current.rotation.z = state.clock.elapsedTime * 2;
    }
  });

  if (star.collected) {
    return null;
  }

  return (
    <mesh ref={meshRef}>
      <octahedronGeometry args={[0.4, 0]} />
      <meshStandardMaterial 
        color="#ffd700" 
        emissive="#ffaa00"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
