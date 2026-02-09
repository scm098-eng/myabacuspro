
'use client';

import { usePageBackground } from '@/hooks/usePageBackground';

export default function TestPageWrapper({ children }: { children: React.ReactNode }) {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/test_wrapper_bg.jpg?alt=media');
  return <>{children}</>;
}
