'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useGameInput() {
  const movePlayerUp = useGameStore((state) => state.movePlayerUp);
  const movePlayerDown = useGameStore((state) => state.movePlayerDown);
  const gameState = useGameStore((state) => state.gameState);

  // Control body class for scroll prevention during gameplay
  useEffect(() => {
    if (gameState === 'playing') {
      document.body.classList.add('playing');
    } else {
      document.body.classList.remove('playing');
    }
    return () => {
      document.body.classList.remove('playing');
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayerUp();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayerDown();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, movePlayerUp, movePlayerDown]);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (Math.abs(deltaY) > 10) {
        if (deltaY > 0) {
          movePlayerUp();
        } else {
          movePlayerDown();
        }
        touchStartY = touchY;
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameState, movePlayerUp, movePlayerDown]);
}
