'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setFullscreenStore = useGameStore((state: any) => state.setFullscreen);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      const newIsFullscreen = !!fullscreenElement;
      setIsFullscreen(newIsFullscreen);
      setFullscreenStore(newIsFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [setFullscreenStore]);

  const toggleFullscreen = async () => {
    if (typeof window === 'undefined') return;

    try {
      setError(null);
      
      if (!document.fullscreenEnabled && 
          !(document as any).webkitFullscreenEnabled && 
          !(document as any).mozFullScreenEnabled && 
          !(document as any).msFullscreenEnabled) {
        setError('お使いのブラウザは全画面表示に対応していません');
        return;
      }

      if (isFullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      } else {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if ((elem as any).webkitRequestFullscreen) {
          await (elem as any).webkitRequestFullscreen();
        } else if ((elem as any).mozRequestFullScreen) {
          await (elem as any).mozRequestFullScreen();
        } else if ((elem as any).msRequestFullscreen) {
          await (elem as any).msRequestFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      setError('全画面表示の切り替えに失敗しました');
    }
  };

  return { isFullscreen, toggleFullscreen, error };
}
