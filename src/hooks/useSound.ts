
'use client';

import { useCallback } from 'react';

const sounds = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3', // Clear buzzer sound
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  timerTick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  timerWarning: 'https://assets.mixkit.co/active_storage/sfx/1103/1103-preview.mp3', // Modern digital chime for 1 minute
  timerUrgent: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3', // Sharp rhythmic pulse for final 10 seconds
};

export const useSound = () => {
  const playSound = useCallback((type: keyof typeof sounds) => {
    try {
      const audio = new Audio(sounds[type]);
      // Adjust volumes based on sound type
      if (type === 'timerTick') audio.volume = 0.15;
      else if (type === 'timerWarning') audio.volume = 0.5;
      else if (type === 'timerUrgent') audio.volume = 0.35; // Lower volume as it repeats every second
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
