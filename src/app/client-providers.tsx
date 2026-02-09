
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';
import BirthdayWish from '@/components/BirthdayWish';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <FirebaseErrorListener />
      <BirthdayWish />
      {children}
    </AuthProvider>
  );
}
