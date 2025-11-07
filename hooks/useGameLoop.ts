'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Subject, interval } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { useGameStore } from '@/store/gameStore';

export function useGameLoop() {
  const gameState = useGameStore((state) => state.gameState);
  const updatePlayerPosition = useGameStore((state) => state.updatePlayerPosition);
  const updateObstacles = useGameStore((state) => state.updateObstacles);
  const updateStars = useGameStore((state) => state.updateStars);
  const checkCollision = useGameStore((state) => state.checkCollision);
  const collectStar = useGameStore((state) => state.collectStar);
  const gameOver = useGameStore((state) => state.gameOver);
  const updateInvincibility = useGameStore((state) => state.updateInvincibility);
  const player = useGameStore((state) => state.player);
  const stars = useGameStore((state) => state.stars);

  const destroySubject = useRef(new Subject<void>());

  useEffect(() => {
    const destroy$ = destroySubject.current;

    if (gameState === 'playing') {
      // Collision check stream using RxJS
      const collisionCheck$ = interval(100).pipe(
        filter(() => gameState === 'playing'),
        takeUntil(destroy$)
      );

      const subscription = collisionCheck$.subscribe(() => {
        if (checkCollision()) {
          gameOver();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [gameState, checkCollision, gameOver]);

  useEffect(() => {
    return () => {
      destroySubject.current.next();
      destroySubject.current.complete();
    };
  }, []);

  useFrame((state, delta) => {
    if (gameState !== 'playing') {
      return;
    }

    // Update game state
    updatePlayerPosition(delta);
    updateObstacles(delta);
    updateStars(delta);
    updateInvincibility(delta);

    // Check star collection
    stars.forEach((star) => {
      if (star.collected) return;

      const distance = Math.sqrt(
        Math.pow(player.position.x - star.position.x, 2) +
        Math.pow(player.position.y - star.position.y, 2)
      );

      if (distance < 1) {
        collectStar(star.id);
      }
    });
  });
}
