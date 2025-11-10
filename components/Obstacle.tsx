'use client';

import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group } from 'three';
import { Obstacle as ObstacleType, useGameStore } from '@/store/gameStore';

interface ObstacleProps {
  obstacle: ObstacleType;
}

export function Obstacle({ obstacle }: ObstacleProps) {
  const groupRef = useRef<Group>(null);
  const updateObstacleDimensions = useGameStore((state) => state.updateObstacleDimensions);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = obstacle.position.x;
      groupRef.current.position.y = obstacle.position.y;
    }
  });

  const handleSync = useCallback((troika: any) => {
    if (troika.geometry?.boundingBox) {
      const bounds = troika.geometry.boundingBox;
      const width = bounds.max.x - bounds.min.x;
      const height = bounds.max.y - bounds.min.y;
      updateObstacleDimensions(obstacle.id, width, height);
    }
  }, [obstacle.id, updateObstacleDimensions]);

  return (
    <group ref={groupRef}>
      <Text
        font="/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf"
        fontSize={1.2}
        color="#4a5568"
        anchorX="center"
        anchorY="middle"
        onSync={handleSync}
      >
        {obstacle.text}
      </Text>
    </group>
  );
}
