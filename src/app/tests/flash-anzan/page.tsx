'use client';

import React, { useState, useEffect } from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, ShieldCheck, Lock, Sparkles, ChevronRight, Settings2, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

const levels = [
  { id: 'easy', title: 'Novice Flash', description: '1-Digit Numbers | Levels 1-50 (Progression from 3 rows/2.0s to 10 rows/1.5s)', color: 'bg-green-100 text-green-700', icon: Zap },
  { id: 'medium', title: 'Expert Flash', description: 'Mixed 1 & 2-Digit | Levels 1-50 (Progression from 3 rows/2.0s to 10 rows/1.5s)', color: 'bg-orange-100 text-orange-700', icon: Zap },
  { id: 'hard', title: 'Elite Flash', description: 'Mixed 2 & 3-Digit | Levels 1-50 (Progression from 3 rows/2.0s to 10 rows/1.5s)', color: 'bg-red-100 text-red-700', icon: Zap },
];

const LevelGrid = ({ tier, isLocked }: { tier: string, isLocked: boolean }) => {
  const router = useRouter();
  const levels = Array.from({ length: 50 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 py-4">
      {levels.map((level) => (
        <Button
          key={level}
          variant="outline"
          disabled={isLocked}
          onClick={() => router.push(`/tests/flash-anzan/level-${tier}-${level}`)}
          className={cn(
            "h-10 w-10 p-0 text-xs font-black transition-all hover:scale-110 rounded-lg flex items-center justify-center",
            isLocked ? "opacity-50 grayscale" : "border-primary/20 hover:border-primary bg-card hover:bg-primary/5 shadow-sm"
          )}
        >
          {level}
        </Button>
      ))}
    </div>
  );
};

export default function FlashAnzanLobbyPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/practice_bg.jpg?alt=media');
  const { user, profile, isLoading, isTrialActive } = useAuth();
  const router = useRouter();

  const [customSettings, setCustomSettings] = useState({
    digits: 2,
    rows: 10,
    speed: 1000 // ms
  });

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

  const handleStartCustom = () => {
    const params = new URLSearchParams({
      d: customSettings.digits.toString(),
      r: customSettings.rows.toString(),
      s: customSettings.speed.toString()
    });
    router.push(`/tests/flash-anzan/custom?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">Flash Card <span className="text-primary italic">Anzan</span></h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Build incredible mental calculation speed. The ultimate tool for mastering Soroban visualization.
        </p>
      </div>

      <div className="space-y-12 max-w-5xl mx-auto">
        {levels.map((level) => {
          const isLocked = !isPro && !isTrialActive && level.id !== 'easy';
          
          return (
            <Card key={level.id} className={cn(
              "rounded-[2.5rem] border-none shadow-xl overflow-hidden group transition-all",
              isLocked ? "opacity-60 grayscale" : "bg-white"
            )}>
              <CardHeader className={cn("p-8 text-center", level.color)}>
                <div className="mx-auto bg-white/40 p-4 rounded-full w-fit mb-4">
                  <level.icon className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">{level.title}</CardTitle>
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

                <div className="bg-muted/30 p-6 rounded-[1.5rem] border-2 border-dashed border-primary/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 text-center">Select Level (1-50)</p>
                  <LevelGrid tier={level.id} isLocked={isLocked} />
                </div>

                {isLocked && (
                  <Button asChild variant="secondary" className="w-full h-14 font-black uppercase rounded-2xl">
                    <Link href="/pricing"><Lock className="mr-2 h-4 w-4" /> Unlock Pro to Access All Levels</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b pb-4">
          <Settings2 className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Anzan Custom <span className="text-primary italic">Lab</span></h2>
          <Badge className="ml-auto bg-primary text-white font-black px-4 py-1">PRO FEATURE</Badge>
        </div>

        <Card className={cn("rounded-[2.5rem] border-4 border-dashed border-primary/20 overflow-hidden relative", !isPro && !isTrialActive && "opacity-60 grayscale cursor-not-allowed")}>
          {!isPro && !isTrialActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm p-6 text-center">
               <Card className="max-w-xs shadow-2xl border-none p-6 space-y-4 bg-white/90">
                  <Lock className="w-12 h-12 mx-auto text-primary" />
                  <p className="font-bold text-slate-700">Custom Lab is exclusive to Pro members. Customize your digits, rows, and speed!</p>
                  <Button asChild className="w-full font-black uppercase"><Link href="/pricing">Get Pro Access</Link></Button>
               </Card>
            </div>
          )}
          <CardContent className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-10">
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Number of Digits</Label>
                     <Badge variant="outline" className="font-black text-primary border-primary/20">{customSettings.digits} Digit(s)</Badge>
                   </div>
                   <div className="grid grid-cols-4 gap-2">
                     {[1, 2, 3, 4].map(num => (
                       <Button 
                         key={num} 
                         variant={customSettings.digits === num ? 'default' : 'outline'} 
                         className="font-black"
                         onClick={() => setCustomSettings(p => ({ ...p, digits: num }))}
                        >
                         {num}
                       </Button>
                     ))}
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Sequence Length (Rows)</Label>
                     <Badge variant="outline" className="font-black text-primary border-primary/20">{customSettings.rows} Rows</Badge>
                   </div>
                   <Slider 
                     value={[customSettings.rows]} 
                     min={3} 
                     max={50} 
                     step={1} 
                     onValueChange={([val]) => setCustomSettings(p => ({ ...p, rows: val }))}
                   />
                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Easy (3)</span>
                     <span>Expert (20)</span>
                     <span>Legend (50)</span>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Flash Interval (Speed)</Label>
                     <Badge variant="outline" className="font-black text-primary border-primary/20">{(customSettings.speed / 1000).toFixed(1)} Seconds</Badge>
                   </div>
                   <Slider 
                     value={[customSettings.speed]} 
                     min={200} 
                     max={3000} 
                     step={100} 
                     onValueChange={([val]) => setCustomSettings(p => ({ ...p, speed: val }))}
                   />
                   <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Instant (0.2s)</span>
                     <span>Slow (3.0s)</span>
                   </div>
                </div>
             </div>

             <div className="flex flex-col justify-center text-center space-y-8 bg-slate-50 p-8 rounded-3xl border-2 shadow-inner">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Training Profile</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Your mental visualization will process <span className="text-primary font-bold">{customSettings.rows}</span> sequential numbers, each with <span className="text-primary font-bold">{customSettings.digits}</span> digit complexity, every <span className="text-primary font-bold">{(customSettings.speed / 1000).toFixed(1)}s</span>.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleStartCustom} 
                    className="h-20 text-base sm:text-lg font-black uppercase tracking-wide rounded-2xl shadow-xl shadow-orange-500/20 whitespace-normal px-4 py-2 leading-tight"
                  >
                    Launch Lab <Zap className="ml-2 w-6 h-6 fill-white shrink-0" />
                  </Button>
                  <Button 
                    asChild
                    variant="outline"
                    className="h-20 text-base sm:text-lg font-black uppercase tracking-wide rounded-2xl border-2 hover:bg-orange-50"
                  >
                    <Link href="/game/duels?mode=flash">Arena Duel <Swords className="ml-2 w-6 h-6 text-primary" /></Link>
                  </Button>
                </div>
             </div>
          </CardContent>
        </Card>
      </section>

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
