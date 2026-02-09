
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { Puzzle } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const bigBrotherAdditionTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { id: 'big-brother-addition-plus-9', title: '+9 = +10 - 1', description: 'Practice the +9 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-90', title: '+90 = +100 - 10', description: 'Practice the +90 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-8', title: '+8 = +10 - 2', description: 'Practice the +8 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-80', title: '+80 = +100 - 20', description: 'Practice the +80 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-7', title: '+7 = +10 - 3', description: 'Practice the +7 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-70', title: '+70 = +100 - 30', description: 'Practice the +70 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-6', title: '+6 = +10 - 4', description: 'Practice the +6 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-60', title: '+60 = +100 - 40', description: 'Practice the +60 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-5', title: '+5 = +10 - 5', description: 'Practice the +5 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-50', title: '+50 = +100 - 50', description: 'Practice the +50 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-4', title: '+4 = +10 - 6', description: 'Practice the +4 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-40', title: '+40 = +100 - 60', description: 'Practice the +40 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-3', title: '+3 = +10 - 7', description: 'Practice the +3 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-30', title: '+30 = +100 - 70', description: 'Practice the +30 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-2', title: '+2 = +10 - 8', description: 'Practice the +2 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-20', title: '+20 = +100 - 80', description: 'Practice the +20 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-1', title: '+1 = +10 - 9', description: 'Practice the +1 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
    { id: 'big-brother-addition-plus-10', title: '+10 = +100 - 90', description: 'Practice the +10 formula.', icon: Puzzle, iconBg: 'bg-red-100' },
];

const bigBrotherSubtractionTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { id: 'big-brother-subtraction-minus-9', title: '-9 = -10 + 1', description: 'Practice the -9 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-90', title: '-90 = -100 + 10', description: 'Practice the -90 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-8', title: '-8 = -10 + 2', description: 'Practice the -8 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-80', title: '-80 = -100 + 20', description: 'Practice the -80 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-7', title: '-7 = -10 + 3', description: 'Practice the -7 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-70', title: '-70 = -100 + 30', description: 'Practice the -70 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-6', title: '-6 = -10 + 4', description: 'Practice the -6 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-60', title: '-60 = -100 + 40', description: 'Practice the -60 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-5', title: '-5 = -10 + 5', description: 'Practice the -5 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-50', title: '-50 = -100 + 50', description: 'Practice the -50 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-4', title: '-4 = -10 + 6', description: 'Practice the -4 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-40', title: '-40 = -100 + 60', description: 'Practice the -40 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-3', title: '-3 = -10 + 7', description: 'Practice the -3 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-30', title: '-30 = -100 + 70', description: 'Practice the -30 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-2', title: '-2 = -10 + 8', description: 'Practice the -2 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-20', title: '-20 = -100 + 80', description: 'Practice the -20 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-1', title: '-1 = -10 + 9', description: 'Practice the -1 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
    { id: 'big-brother-subtraction-minus-10', title: '-10 = -100 + 90', description: 'Practice the -10 formula.', icon: Puzzle, iconBg: 'bg-cyan-100' },
];


export default function BigBrotherPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/big_brother_bg.jpg?alt=media');
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
              {[...Array(18)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          </div>
           <div className="space-y-8">
            <Skeleton className="h-10 w-1/3 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(18)].map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
            </div>
          </div>
        </div>
    );
  }


  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">Big Brother Formulas</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose a formula and difficulty level to begin your training.
        </p>
      </div>

      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Big Brother Addition Formulas</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Focus on specific Big Brother addition formulas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bigBrotherAdditionTests.map((test) => (
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
      
       <div className="space-y-8 mt-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Big Brother Subtraction Formulas</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Focus on specific Big Brother subtraction formulas.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bigBrotherSubtractionTests.map((test) => (
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
