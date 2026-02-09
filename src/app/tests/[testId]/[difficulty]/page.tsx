
'use client';

import { getTestSettings } from '@/lib/questions';
import type { Difficulty, TestType } from '@/types';
import TestPageClient from '@/components/TestPageClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Crown, Terminal, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TestPageWrapper from '@/components/TestPageWrapper';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import BeadsTestPageClient from '@/components/BeadsTestPageClient';

export default function TestPage() {
  const params = useParams();
  const { testId, difficulty } = params as { testId: TestType, difficulty: Difficulty };
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);
  
  const settings = getTestSettings(testId, difficulty);
  const isBeadTest = testId === 'beads-identify' || testId === 'beads-set';

  if (isLoading || !user) {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-10 w-32" />
        </div>
    );
  }
  
  if (!user) {
     return (
       <div className="max-w-lg mx-auto text-center">
            <Alert>
                <LogIn className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                    You need to be logged in to access practice tests. Please log in to continue.
                </AlertDescription>
                 <div className="mt-4">
                    <Button asChild>
                        <Link href="/login">Login</Link>
                    </Button>
                </div>
            </Alert>
        </div>
    );
  }

  // Pro subscription check for non-bead tests for students
  if (profile?.role === 'student' && profile?.subscriptionStatus !== 'pro' && !isBeadTest) {
    return (
       <div className="max-w-lg mx-auto text-center">
            <Alert variant="destructive">
                <Crown className="h-4 w-4" />
                <AlertTitle>Pro Membership Required</AlertTitle>
                <AlertDescription>
                    You need to be a Pro member to access this practice test. Please upgrade your plan to continue.
                </AlertDescription>
                 <div className="mt-4">
                    <Button asChild>
                        <Link href="/pricing">Upgrade to Pro</Link>
                    </Button>
                </div>
            </Alert>
        </div>
    );
  }

  if (!settings) {
    return (
        <div className="max-w-lg mx-auto">
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Invalid Test</AlertTitle>
                <AlertDescription>
                    The test you are trying to access does not exist. Please go back and select a valid test.
                </AlertDescription>
                 <div className="mt-4">
                    <Button asChild>
                        <Link href="/tests">Go to Tests</Link>
                    </Button>
                </div>
            </Alert>
        </div>
    );
  }
  
  const TestComponent = isBeadTest ? BeadsTestPageClient : TestPageClient;

  return (
    <TestPageWrapper>
      <TestComponent testId={testId} difficulty={difficulty} settings={settings} />
    </TestPageWrapper>
  );
}
