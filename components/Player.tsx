'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, TextureLoader, Texture } from 'three';
import { useGameStore } from '@/store/gameStore';

export function Player() {
  const meshRef = useRef<Mesh>(null);
  const player = useGameStore((state) => state.player);
  const [textures, setTextures] = useState<Texture[] | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const frameTimer = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    const loader = new TextureLoader();
    const texturePromises = [
      loader.loadAsync('/assets/images/run1.png'),
      loader.loadAsync('/assets/images/run2.png'),
      loader.loadAsync('/assets/images/run3.png'),
      loader.loadAsync('/assets/images/run4.png'),
    ];

    Promise.all(texturePromises).then((loadedTextures) => {
      setTextures(loadedTextures);
    });
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.position.x = player.position.x;
      meshRef.current.position.y = player.position.y;
      meshRef.current.lookAt(camera.position);

      // 10fps animation (0.1 seconds per frame)
      frameTimer.current += delta;
      if (frameTimer.current >= 0.1) {
        frameTimer.current = 0;
        setCurrentFrame((prev) => (prev + 1) % 4);
      }
    }
  });

  if (!textures) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={textures[currentFrame]} transparent={true} />
    </mesh>
  );
}
