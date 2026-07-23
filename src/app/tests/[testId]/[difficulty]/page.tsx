'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { getTestSettings } from '@/lib/questions';
import type { Difficulty, TestType } from '@/types';
import TestPageClient from '@/components/TestPageClient';
import BeadsTestPageClient from '@/components/BeadsTestPageClient';
import FlashAnzanClient from '@/components/FlashAnzanClient';
import VoiceAnzanClient from '@/components/VoiceAnzanClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Crown, Terminal, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TestPageWrapper from '@/components/TestPageWrapper';
import { Skeleton } from '@/components/ui/skeleton';

export default function TestPage() {
  const params = useParams();
  const { testId, difficulty } = params as { testId: TestType, difficulty: Difficulty };
  const { user, profile, isLoading, isTrialActive } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);
  
  const settings = getTestSettings(testId, difficulty);
  const isBeadTest = testId === 'beads-identify' || testId === 'beads-set';
  const isFlashAnzan = testId === 'flash-anzan';
  const isVoiceAnzan = testId === 'voice-anzan';

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

  // Pro subscription check for non-bead/flash tests for students (allowing trial access)
  const isPublicTest = isBeadTest || (isFlashAnzan && difficulty === 'easy') || (isVoiceAnzan && difficulty === 'easy');
  if (profile?.role === 'student' && profile?.subscriptionStatus !== 'pro' && !isPublicTest && !isTrialActive) {
    return (
       <div className="max-w-lg mx-auto text-center">
            <Alert variant="destructive">
                <Crown className="h-4 w-4" />
                <AlertTitle>Pro Membership Required</AlertTitle>
                <AlertDescription>
                    You need to be a Pro member to access this advanced practice test. Please upgrade your plan to continue.
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
  
  let TestComponent = TestPageClient;
  if (isBeadTest) TestComponent = BeadsTestPageClient;
  if (isFlashAnzan) TestComponent = FlashAnzanClient as any;
  if (isVoiceAnzan) TestComponent = VoiceAnzanClient as any;

  return (
    <TestPageWrapper>
      <TestComponent testId={testId} difficulty={difficulty} settings={settings} />
    </TestPageWrapper>
  );
}
