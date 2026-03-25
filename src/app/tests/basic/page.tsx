
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { BrainCircuit } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const basicTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { 
        id: 'basic-add-sub-l1', 
        title: 'Level 1: Within 0-9', 
        description: 'Practice single-digit calculations using only direct movements. No complements needed.', 
        icon: BrainCircuit, 
        iconBg: 'bg-blue-50' 
    },
    { 
        id: 'basic-add-sub-l2', 
        title: 'Level 2: Within 0-99', 
        description: 'Double-digit training. Every rod uses direct movement only. Build your speed and confidence.', 
        icon: BrainCircuit, 
        iconBg: 'bg-blue-100' 
    },
];

export default function BasicPracticePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/practice_bg.jpg?alt=media');
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
        <div className="space-y-12">
          <div className="text-center">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-5xl uppercase">Basic Add & Subtract</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Master the foundation. These levels use direct bead movements only—no complex formulas or timer pressure.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {basicTests.map((test) => (
            <TestCard
              key={test.id}
              testId={test.id}
              title={test.title}
              description={test.description}
              Icon={test.icon}
              iconBg={test.iconBg}
              isFormula={true}
            />
          ))}
      </div>
    </div>
  );
}
