'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group } from 'three';
import { Obstacle as ObstacleType } from '@/store/gameStore';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export function Obstacle({ obstacle }: ObstacleProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = obstacle.position.x;
      groupRef.current.position.y = obstacle.position.y;
    }
  });

  return (
    <group ref={groupRef}>
      <Text
        font="/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf"
        fontSize={1.2}
        color="#4a5568"
        anchorX="center"
        anchorY="middle"
      >
        {obstacle.text}
      </Text>
    </group>
  );
}
