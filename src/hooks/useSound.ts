
'use client';

import { useCallback } from 'react';

const sounds = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
};

export const useSound = () => {
  const playSound = useCallback((type: keyof typeof sounds) => {
    try {
      const audio = new Audio(sounds[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play blocked until interaction:', e));
    } catch (e) {
      console.error('Audio initialization failed:', e);
    }
  }, []);

  return { playSound };
};
