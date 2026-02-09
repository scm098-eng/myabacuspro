
'use client';

import { useEffect } from 'react';

export function usePageBackground(imageUrl: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (imageUrl) {
            document.body.style.backgroundImage = `url('${imageUrl}')`;
        } else {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundColor = 'var(--background)';
        }
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.backgroundImage = '';
      }
    };
  }, [imageUrl]);
}
