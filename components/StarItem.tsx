'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Sprite } from 'three';
import { Star as StarType } from '@/store/gameStore';

interface StarItemProps {
  star: StarType;
}

export function StarItem({ star }: StarItemProps) {
  const spriteRef = useRef<Sprite>(null);
  const texture = useTexture('/assets/images/star.png');

  useFrame((state) => {
    if (spriteRef.current && !star.collected) {
      spriteRef.current.position.x = star.position.x;
      spriteRef.current.position.y = star.position.y;
      // Rotate for visual effect
      spriteRef.current.material.rotation = state.clock.elapsedTime * 2;
    }
  });

  if (star.collected) {
    return null;
  }

  return (
    <sprite ref={spriteRef} scale={[0.8, 0.8, 1]}>
      <spriteMaterial map={texture} transparent={true} />
    </sprite>
  );
}
