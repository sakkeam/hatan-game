'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Group, Sprite } from 'three';
import { Obstacle as ObstacleType, useGameStore } from '@/store/gameStore';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export function Obstacle({ obstacle }: ObstacleProps) {
  const groupRef = useRef<Group>(null);
  const spriteRef = useRef<Sprite>(null);
  const updateObstacleDimensions = useGameStore((state) => state.updateObstacleDimensions);

  // Preload all hatan textures
  const textures = useTexture({
    hiragana: '/assets/images/hatan_hiragana.png',
    katakana: '/assets/images/hatan_katakaba.png',
    kanji: '/assets/images/hatan_kanji.png',
    romaji: '/assets/images/hatan_English.png',
  });

  // Select texture based on obstacle pattern
  const currentTexture = useMemo(() => {
    switch (obstacle.obstaclePattern) {
      case 'hiragana':
        return textures.hiragana;
      case 'katakana':
        return textures.katakana;
      case 'kanji':
        return textures.kanji;
      case 'romaji':
        return textures.romaji;
      default:
        return textures.hiragana;
    }
  }, [obstacle.obstaclePattern, textures]);

  // Set fixed dimensions on mount
  useEffect(() => {
    // Fixed dimensions based on image size
    const width = 1.6;
    const height = 1.2;
    updateObstacleDimensions(obstacle.id, width, height);
  }, [obstacle.id, updateObstacleDimensions]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = obstacle.position.x;
      groupRef.current.position.y = obstacle.position.y;
    }
  });

  return (
    <group ref={groupRef}>
      <sprite ref={spriteRef} scale={[1.6, 1.2, 1]}>
        <spriteMaterial map={currentTexture} transparent={true} />
      </sprite>
    </group>
  );
}
