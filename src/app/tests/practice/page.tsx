
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { X, Divide } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const PlusMinus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);


const generalTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
  {
    id: 'addition-subtraction',
    title: 'Addition & Subtraction',
    description: 'A mix of addition and subtraction problems to test your foundational skills.',
    icon: PlusMinus,
    iconBg: 'bg-green-100',
  },
  {
    id: 'multiplication',
    title: 'Multiplication',
    description: 'Challenge your multiplication knowledge from single to four-digit numbers.',
    icon: X,
    iconBg: 'bg-yellow-100',
  },
  {
    id: 'division',
    title: 'Division',
    description: 'Test your ability to divide numbers quickly and accurately.',
    icon: Divide,
    iconBg: 'bg-blue-100',
  },
];

export default function PracticeTestsPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">General Practice Tests</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose a category and difficulty level to begin your training.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {generalTests.map((test) => (
          <TestCard
            key={test.id}
            testId={test.id}
            title={test.title}
            description={test.description}
            Icon={test.icon}
            iconBg={test.iconBg}
          />
        ))}
      </div>
    </div>
  );
}
