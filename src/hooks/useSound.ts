
'use client';

import { useCallback } from 'react';

const sounds = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3', // Clear buzzer sound
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  timerTick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  timerWarning: 'https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3',
  timerUrgent: 'https://assets.mixkit.co/active_storage/sfx/2535/2535-preview.mp3',
};

export const useSound = () => {
  const playSound = useCallback((type: keyof typeof sounds) => {
    try {
      const audio = new Audio(sounds[type]);
      // Adjust volumes based on sound type
      if (type === 'timerTick') audio.volume = 0.2;
      else if (type === 'timerUrgent') audio.volume = 0.4;
      else if (type === 'wrong') audio.volume = 0.6;
      else audio.volume = 0.5;
      
      audio.play().catch(e => {
        // Silent catch for browser autoplay restrictions
      });
    } catch (e) {
      console.error('Audio initialization failed:', e);
    }
  }, []);

  return { playSound };
};
