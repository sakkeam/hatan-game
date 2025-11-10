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
  const updateGoal = useGameStore((state) => state.updateGoal);
  const updateDistance = useGameStore((state) => state.updateDistance);
  const checkCollision = useGameStore((state) => state.checkCollision);
  const checkStarCollection = useGameStore((state) => state.checkStarCollection);
  const checkGoalReached = useGameStore((state) => state.checkGoalReached);
  const gameOver = useGameStore((state) => state.gameOver);

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
    updateGoal(delta);
    updateDistance(delta);

    // Check for star collection
    checkStarCollection();
    
    // Check for goal reached
    checkGoalReached();
  });
}
