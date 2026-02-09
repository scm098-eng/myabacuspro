
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { Puzzle } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const additionFormulaTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { id: 'basic-addition-plus-4', title: '+4 = +5 - 1', description: 'Practice the +4 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-40', title: '+40 = +50 - 10', description: 'Practice the +40 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-3', title: '+3 = +5 - 2', description: 'Practice the +3 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-30', title: '+30 = +50 - 20', description: 'Practice the +30 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-2', title: '+2 = +5 - 3', description: 'Practice the +2 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-20', title: '+20 = +50 - 30', description: 'Practice the +20 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-1', title: '+1 = +5 - 4', description: 'Practice the +1 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
    { id: 'basic-addition-plus-10', title: '+10 = +50 - 40', description: 'Practice the +10 formula.', icon: Puzzle, iconBg: 'bg-purple-100' },
];

const subtractionFormulaTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { id: 'basic-subtraction-minus-4', title: '-4 = -5 + 1', description: 'Practice the -4 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-40', title: '-40 = -50 + 10', description: 'Practice the -40 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-3', title: '-3 = -5 + 2', description: 'Practice the -3 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-30', title: '-30 = -50 + 20', description: 'Practice the -30 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-2', title: '-2 = -5 + 3', description: 'Practice the -2 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-20', title: '-20 = -50 + 30', description: 'Practice the -20 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-1', title: '-1 = -5 + 4', description: 'Practice the -1 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
    { id: 'basic-subtraction-minus-10', title: '-10 = -50 + 40', description: 'Practice the -10 formula.', icon: Puzzle, iconBg: 'bg-pink-100' },
];


export default function SmallSisterPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/small_sister_bg.jpg?alt=media');
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
          <div className="space-y-8">
            <Skeleton className="h-10 w-1/3 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          </div>
           <div className="space-y-8">
            <Skeleton className="h-10 w-1/3 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">Small Sister Formulas</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose a formula and difficulty level to begin your training.
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Small Sister Addition Formulas</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Focus on specific Small Sister addition formulas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionFormulaTests.map((test) => (
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
      
       <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Small Sister Subtraction Formulas</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Focus on specific Small Sister subtraction formulas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {subtractionFormulaTests.map((test) => (
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

    </div>
  );
}
