
'use client';

import { TestCard } from '@/components/TestCard';
import type { TestType } from '@/types';
import { MousePointerClick } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const BeadIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M12 2L12 22" />
      <path d="M18 9C15.2386 9 13 11.2386 13 14L11 14C11 11.2386 8.76142 9 6 9" />
      <path d="M6 15C8.76142 15 11 12.7614 11 10L13 10C13 12.7614 15.2386 15 18 15" />
    </svg>
);


const beadTests: { id: TestType; title: string; description: string; icon: React.ElementType; iconBg: string }[] = [
  {
    id: 'beads-identify',
    title: 'Identify Beads Value',
    description: 'Recognize the value of beads shown on the abacus. Tests your visual identification skills.',
    icon: BeadIcon,
    iconBg: 'bg-yellow-100',
  },
  {
    id: 'beads-set',
    title: 'Set Beads Value',
    description: 'Set the correct value on the abacus based on the number shown. Tests your setting skills.',
    icon: MousePointerClick,
    iconBg: 'bg-blue-100',
  }
];

export default function BeadsValuePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/beads_value_bg.jpg?alt=media');
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">Beads Value Practice</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Select a practice mode to test your bead recognition and setting skills.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
        {beadTests.map((test) => (
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
