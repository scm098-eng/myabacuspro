
'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { ArrowRight, BookOpen, BrainCircuit, Puzzle, Eye, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const testCategories = [
  {
    href: '/tests/beads-value',
    title: 'Beads Value Practice',
    description: 'Learn to recognize the value of beads on the abacus with this visual test.',
    icon: Eye,
    iconBg: 'bg-yellow-100'
  },
  {
    href: '/tests/small-sister',
    title: 'Small Sister Formulas',
    description: 'Focus on specific "Small Sister" addition and subtraction abacus formulas.',
    icon: Puzzle,
    iconBg: 'bg-purple-100'
  },
  {
    href: '/tests/big-brother',
    title: 'Big Brother Formulas',
    description: 'Practice targeted "Big Brother" addition formulas to master complex calculations.',
    icon: Puzzle,
    iconBg: 'bg-red-100'
  },
  {
    href: '/tests/combination',
    title: 'Combination Formulas',
    description: 'Challenge yourself with a mix of all Small Sister and Big Brother formulas.',
    icon: BookOpen,
    iconBg: 'bg-blue-100'
  },
  {
    href: '/tests/practice',
    title: 'General Practice',
    description: 'Master Addition, Subtraction, Multiplication, and Division with timed challenges.',
    icon: BrainCircuit,
    iconBg: 'bg-green-100'
  },
  {
    href: '/game',
    title: 'Bubble Game',
    description: 'A fun and engaging game to practice your math skills by popping bubbles.',
    icon: Gamepad2,
    iconBg: 'bg-pink-100'
  }
];

export default function TestsPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/tests_bg.jpg?alt=media');
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
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">Practice Tests & Games</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Select a category to begin your training. Each section focuses on different skills to help you master mental math.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testCategories.map((category) => (
          <Card key={category.href} className="flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full w-fit ${category.iconBg}`}>
                        <category.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{category.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{category.description}</CardDescription>
            </CardContent>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href={category.href}>Go to {category.title} <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
