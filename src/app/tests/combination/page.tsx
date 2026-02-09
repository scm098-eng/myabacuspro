
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { Puzzle } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const combinationAdditionTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { id: 'combination-plus-6', title: '+6 = +10 - 5 + 1', description: 'Practice the +6 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-60', title: '+60 = +100 - 50 + 10', description: 'Practice the +60 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-7', title: '+7 = +10 - 5 + 2', description: 'Practice the +7 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-70', title: '+70 = +100 - 50 + 20', description: 'Practice the +70 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-8', title: '+8 = +10 - 5 + 3', description: 'Practice the +8 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-80', title: '+80 = +100 - 50 + 30', description: 'Practice the +80 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-9', title: '+9 = +10 - 5 + 4', description: 'Practice the +9 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
    { id: 'combination-plus-90', title: '+90 = +100 - 50 + 40', description: 'Practice the +90 combination formula.', icon: Puzzle, iconBg: 'bg-green-100' },
];

const combinationSubtractionTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
    { id: 'combination-minus-6', title: '-6 = -10 + 5 - 1', description: 'Practice the -6 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-60', title: '-60 = -100 + 50 - 10', description: 'Practice the -60 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-7', title: '-7 = -10 + 5 - 2', description: 'Practice the -7 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-70', title: '-70 = -100 + 50 - 20', description: 'Practice the -70 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-8', title: '-8 = -10 + 5 - 3', description: 'Practice the -8 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-80', title: '-80 = -100 + 50 - 30', description: 'Practice the -80 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-9', title: '-9 = -10 + 5 - 4', description: 'Practice the -9 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
    { id: 'combination-minus-90', title: '-90 = -100 + 50 - 40', description: 'Practice the -90 combination formula.', icon: Puzzle, iconBg: 'bg-orange-100' },
];


export default function CombinationPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/combination_bg.jpg?alt=media');
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
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">Combination Formulas</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Master new calculation techniques with these combination formulas.
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Combination Addition Formulas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {combinationAdditionTests.map((test) => (
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
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Combination Subtraction Formulas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {combinationSubtractionTests.map((test) => (
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
