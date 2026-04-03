
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { X, Divide, Keyboard, BrainCircuit } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

const PlusMinus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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

const foundationTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
  {
    id: 'addition-subtraction',
    title: 'Addition & Subtraction',
    description: 'Timed challenges with 4 options. Build speed and mental accuracy.',
    icon: PlusMinus,
    iconBg: 'bg-green-100',
  },
  {
    id: 'multiplication',
    title: 'Multiplication',
    description: 'Practice multi-digit multiplication with helpful answer hints.',
    icon: X,
    iconBg: 'bg-yellow-100',
  },
  {
    id: 'division',
    title: 'Division',
    description: 'Master division operations across three difficulty tiers.',
    icon: Divide,
    iconBg: 'bg-blue-100',
  },
];

const masterModeTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
  {
    id: 'addition-subtraction-input',
    title: 'Master Add & Sub',
    description: 'Elite Level: No options provided. Type your answer to submit.',
    icon: Keyboard,
    iconBg: 'bg-slate-100',
  },
  {
    id: 'multiplication-input',
    title: 'Master Multiplication',
    description: 'Elite Level: Calculate complex products and input directly.',
    icon: Keyboard,
    iconBg: 'bg-slate-100',
  },
  {
    id: 'division-input',
    title: 'Master Division',
    description: 'Elite Level: Total accuracy required. Type the quotient to score.',
    icon: Keyboard,
    iconBg: 'bg-slate-100',
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
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="text-center">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">General Practice</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Choose between building your foundation with hints or testing your mastery with direct input.
        </p>
      </div>

      <section className="space-y-8">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BrainCircuit className="text-primary w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Foundation Mode <span className="text-sm font-bold text-muted-foreground align-middle ml-2">(Multiple Choice)</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {foundationTests.map((test) => (
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
      </section>

      <Separator />

      <section className="space-y-8 pb-12">
        <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                <Keyboard className="text-slate-700 w-6 h-6" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Mastery Mode <span className="text-sm font-bold text-muted-foreground align-middle ml-2">(Direct Input)</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {masterModeTests.map((test) => (
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
      </section>
    </div>
  );
}
