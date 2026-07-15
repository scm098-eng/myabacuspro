
'use client';

import React from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ShieldCheck, Lock, Sparkles, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const levels = [
  { id: 'easy', title: 'Novice Flash', description: '1-Digit numbers, 5 rows, 1.5s interval.', color: 'bg-green-100 text-green-700', icon: Zap },
  { id: 'medium', title: 'Expert Flash', description: '2-Digit numbers, 8 rows, 1.0s interval.', color: 'bg-orange-100 text-orange-700', icon: Zap },
  { id: 'hard', title: 'Elite Flash', description: '2-Digit numbers, 12 rows, 0.6s interval.', color: 'bg-red-100 text-red-700', icon: Zap },
];

export default function FlashAnzanLobbyPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/practice_bg.jpg?alt=media');
  const { user, profile, isLoading, isTrialActive } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="space-y-12 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPro = profile?.subscriptionStatus === 'pro' || profile?.role === 'admin' || profile?.role === 'teacher';

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">Flash Card <span className="text-primary italic">Anzan</span></h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Build incredible mental calculation speed. The ultimate tool for mastering Soroban visualization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {levels.map((level) => {
          const isLocked = !isPro && !isTrialActive && level.id !== 'easy';
          
          return (
            <Card key={level.id} className={cn(
              "rounded-[2.5rem] border-none shadow-xl overflow-hidden group transition-all hover:scale-[1.02]",
              isLocked ? "opacity-60 grayscale" : "bg-white"
            )}>
              <CardHeader className={cn("p-8 text-center", level.color)}>
                <div className="mx-auto bg-white/40 p-4 rounded-full w-fit mb-4">
                  <level.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">{level.title}</CardTitle>
                <CardDescription className="font-bold opacity-80">{level.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    Accuracy Multiplier: {level.id === 'easy' ? '1x' : level.id === 'medium' ? '1.5x' : '2.5x'}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500 uppercase">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Mastery Points: High
                  </div>
                </div>
                {isLocked ? (
                  <Button asChild variant="secondary" className="w-full h-14 font-black uppercase rounded-2xl">
                    <Link href="/pricing"><Lock className="mr-2 h-4 w-4" /> Unlock Pro</Link>
                  </Button>
                ) : (
                  <Button onClick={() => router.push(`/tests/flash-anzan/${level.id}`)} className="w-full h-14 font-black uppercase rounded-2xl shadow-lg">
                    Enter Arena <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 text-center md:text-left space-y-2">
           <h3 className="text-2xl font-black uppercase italic tracking-tight">The Science of Anzan</h3>
           <p className="text-slate-400 font-medium text-sm leading-relaxed">
             By processing numbers at high speed, you train your brain to create a permanent mental image of the Soroban beads. This activates the right hemisphere for enhanced memory and creativity.
           </p>
        </div>
        <div className="relative z-10 shrink-0">
           <Badge className="bg-white/10 text-white border-white/20 py-2 px-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em]">High Focus Mode</Badge>
        </div>
      </div>
    </div>
  );
}
