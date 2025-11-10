'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Group } from 'three';

export interface Goal {
  id: string;
  position: { x: number; y: number };
  width: number;
  height: number;
  reached: boolean;
}

interface GoalProps {
  goal: Goal;
}

export function Goal({ goal }: GoalProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = goal.position.x;
      groupRef.current.position.y = goal.position.y;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Goal gate structure */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[goal.width, goal.height, 0.5]} />
        <meshStandardMaterial 
          color="#fbbf24" 
          emissive="#fbbf24" 
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* GOAL text */}
      <Text
        font="/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf"
        fontSize={2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.3]}
      >
        GOAL
      </Text>
    </group>
  );
}
