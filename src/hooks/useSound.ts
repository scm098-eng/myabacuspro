
'use client';

import { useCallback } from 'react';

/**
 * Custom hook to manage sound effects across the application.
 * Uses professional, high-fidelity assets for a premium user experience.
 */
const sounds = {
  correct: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  points: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
  timerTick: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  // Professional digital beep for alerts
  timerWarning: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 
  // Rhythmic electronic ticking for final countdown
  timerUrgent: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
};

export const useSound = () => {
  const playSound = useCallback((type: keyof typeof sounds) => {
    try {
      const audio = new Audio(sounds[type]);
      
      // Fine-tuned volume levels for a prominent professional experience
      if (type === 'timerTick') {
        audio.volume = 0.7; // Loud enough to be a clear anchor
      } else if (type === 'timerWarning') {
        audio.volume = 0.9; // High-priority "heads-up" notification
      } else if (type === 'timerUrgent') {
        audio.volume = 0.5; // Rhythmic countdown tension
      } else if (type === 'wrong') {
        audio.volume = 0.4;
      } else {
        audio.volume = 0.4;
      }
      
      audio.play().catch(e => {
        // Silently handle browser autoplay restrictions
      });
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  }, []);

  return { playSound };
};
