
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Zap, Target, ArrowRight } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import placeholderImages from '@/lib/placeholder-images.json';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Timed Challenges',
    description: 'Test your speed and accuracy against the clock. Complete up to 150 questions in our hardest levels.',
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: 'Multiple Test Types',
    description: 'Practice Addition, Subtraction, Multiplication, and Division across various difficulty levels.',
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: 'Focus on Improvement',
    description: 'Track your progress with detailed reports and focus on honing your mental math skills.',
  },
];

export default function Home() {
  usePageBackground('');

  return (
    <div className="space-y-16">
      <section>
        <div className="space-y-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-foreground font-headline">
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

      <section className="w-full">
         <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
             <Image 
                src={placeholderImages.homeHero.src}
                alt="A student happily using a laptop for learning"
                fill
                className="object-cover"
                data-ai-hint={placeholderImages.homeHero.hint}
                priority
             />
         </div>
      </section>

      <section className="w-full">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-headline">Why Choose <span className="text-primary">My Abacus Pro</span>?</h2>
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
