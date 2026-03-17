'use client';

import { useEffect } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';
import BirthdayWish from '@/components/BirthdayWish';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Prevent right-click across the entire application
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent text selection (optional, but requested for data protection)
    const handleSelectStart = (e: Event) => {
      // Allow selection inside input and textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return (
    <AuthProvider>
      <FirebaseErrorListener />
      <BirthdayWish />
      {children}
    </AuthProvider>
  );
}
