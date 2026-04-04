
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Target, ArrowRight, Loader2 } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import placeholderImages from '@/lib/placeholder-images.json';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" aria-hidden="true" />,
    title: 'Timed Challenges',
    description: 'Test your speed and accuracy against the clock. Complete up to 150 questions in our hardest levels.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" aria-hidden="true" />,
    title: 'Multiple Test Types',
    description: 'Practice Addition, Subtraction, Multiplication, and Division across various difficulty levels.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" aria-hidden="true" />,
    title: 'Focus on Improvement',
    description: 'Track your progress with detailed reports and focus on honing your mental math skills.',
  },
];

export default function Home() {
  usePageBackground('');
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  // If user is already logged in, send them to their dashboard automatically
  useEffect(() => {
    if (!isLoading && user && profile) {
      if (profile.role === 'admin' || (profile.role === 'teacher' && profile.status === 'approved')) {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, profile, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold animate-pulse">Restoring your session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <section aria-labelledby="hero-heading">
        <div className="space-y-6 text-center">
          <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground font-headline">
            Master Mental Math with <span className="text-primary">My Abacus Pro</span>
          </h1>
          <p className="max-w-xl mx-auto text-lg text-muted-foreground">
            Sharpen your mind and boost your calculation speed. Our platform offers timed math challenges designed to help you excel at any level.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/tests">Start Practicing <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full" aria-label="Visual Preview">
         <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
             <Image 
                src={placeholderImages.homeHero.src}
                alt="Student using My Abacus Pro for learning mental math"
                fill
                className="object-cover"
                data-ai-hint={placeholderImages.homeHero.hint}
                priority
             />
         </div>
      </section>

      <section className="w-full" aria-labelledby="features-heading">
        <div className="text-center mb-12">
            <h2 id="features-heading" className="text-3xl font-bold font-headline">Why Choose <span className="text-primary">My Abacus Pro</span>?</h2>
            <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">An intuitive and motivating platform to turn the tedious task of practice into an engaging challenge.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-transparent hover:border-primary">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                  {feature.icon}
                </div>
                <CardTitle className="mt-4 font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
