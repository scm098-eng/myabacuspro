
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/error-emitter';
import { useToast } from '@/hooks/use-toast';
import { FirestorePermissionError } from '@/lib/errors';

export default function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      console.error(error); // This will show the detailed error in the dev console
      
      // Throwing the error here will make it appear in Next.js's dev overlay
      throw error;
    };
    
    errorEmitter.on('permission-error', handlePermissionError);
    
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);
  
  // This component does not render anything
  return null;
}
