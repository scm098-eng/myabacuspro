
'use client';

import { useCallback } from 'react';

/**
 * Custom hook to manage sound effects across the application.
 * Uses high-quality, professional assets from Mixkit.
 */
const sounds = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  timerTick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  // Professional rising tone for 1-minute warning
  timerWarning: 'https://assets.mixkit.co/active_storage/sfx/1815/1815-preview.mp3', 
  // Clean, high-pitched digital beep for final urgency
  timerUrgent: 'https://assets.mixkit.co/active_storage/sfx/1003/1003-preview.mp3',
};

export const useSound = () => {
  const playSound = useCallback((type: keyof typeof sounds) => {
    try {
      const audio = new Audio(sounds[type]);
      
      // Fine-tuned volume levels for a professional balance
      if (type === 'timerTick') {
        audio.volume = 0.1; // Very subtle background tick
      } else if (type === 'timerWarning') {
        audio.volume = 0.4; // Clear notification level
      } else if (type === 'timerUrgent') {
        audio.volume = 0.25; // Urgency without being startling
      } else if (type === 'wrong') {
        audio.volume = 0.5;
      } else {
        audio.volume = 0.4;
      }
      
      audio.play().catch(e => {
        // Handle browser autoplay restrictions silently
      });
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, []);

  return { playSound };
};
