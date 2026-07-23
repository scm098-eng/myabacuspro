'use client';

import React, { useState, useEffect } from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Megaphone, ShieldCheck, Lock, Sparkles, ChevronRight, Settings2, Zap, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const tiers = [
  { id: 'easy', title: 'Aural Novice', description: '1-Digit Numbers | Levels 1-50 (Verbal Progression)', color: 'bg-blue-100 text-blue-700', icon: Megaphone },
  { id: 'medium', title: 'Expert Listener', description: 'Mixed 1 & 2-Digit | Levels 1-50 (Verbal Progression)', color: 'bg-indigo-100 text-indigo-700', icon: Megaphone },
  { id: 'hard', title: 'Elite Dictation', description: 'Mixed 2 & 3-Digit | Levels 1-50 (Verbal Progression)', color: 'bg-purple-100 text-purple-700', icon: Megaphone },
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
          onClick={() => router.push(`/tests/voice-anzan/level-${tier}-${level}`)}
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

export default function VoiceAnzanLobbyPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/practice_bg.jpg?alt=media');
  const { user, profile, isLoading, isTrialActive } = useAuth();
  const router = useRouter();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [customSettings, setCustomSettings] = useState({
    digits: 1,
    rows: 8,
    speed: 1.0 // utterance rate
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v.filter(voice => voice.lang.includes('en')));
      if (v.length > 0 && !selectedVoice) setSelectedVoice(v[0].name);
    };
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoice]);

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
      s: customSettings.speed.toString(),
      v: selectedVoice
    });
    router.push(`/tests/voice-anzan/custom?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">Voice Based <span className="text-primary italic">Anzan</span></h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Training for the auditory mind. Listen to the dictation and reconstruct the beads in your mental vision.
        </p>
      </div>

      <section className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3 border-b pb-4">
          <Settings2 className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Voice Custom <span className="text-primary italic">Lab</span></h2>
          <Badge className="ml-auto bg-primary text-white font-black px-4 py-1">PRO FEATURE</Badge>
        </div>

        <Card className={cn("rounded-[2.5rem] border-4 border-dashed border-primary/20 overflow-hidden relative", !isPro && !isTrialActive && "opacity-60 grayscale cursor-not-allowed")}>
          {!isPro && !isTrialActive && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm p-6 text-center">
               <Card className="max-w-xs shadow-2xl border-none p-6 space-y-4 bg-white/90">
                  <Lock className="w-12 h-12 mx-auto text-primary" />
                  <p className="font-bold text-slate-700">Voice Lab is exclusive to Pro members. Customize your training environment!</p>
                  <Button asChild className="w-full font-black uppercase"><Link href="/pricing">Get Pro Access</Link></Button>
               </Card>
            </div>
          )}
          <CardContent className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-10">
                <div className="space-y-4">
                   <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Select Voice</Label>
                   <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                     <SelectTrigger className="h-12 border-2 font-bold rounded-xl"><SelectValue placeholder="Choose a voice" /></SelectTrigger>
                     <SelectContent>
                       {voices.map(v => (
                         <SelectItem key={v.name} value={v.name}>{v.name} ({v.lang})</SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Complexity (Digits)</Label>
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
                     <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Dictation Length</Label>
                     <Badge variant="outline" className="font-black text-primary border-primary/20">{customSettings.rows} Rows</Badge>
                   </div>
                   <Slider value={[customSettings.rows]} min={3} max={50} step={1} onValueChange={([val]) => setCustomSettings(p => ({ ...p, rows: val }))} />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Speech Rate</Label>
                     <Badge variant="outline" className="font-black text-primary border-primary/20">{customSettings.speed.toFixed(1)}x</Badge>
                   </div>
                   <Slider value={[customSettings.speed * 10]} min={5} max={25} step={1} onValueChange={([val]) => setCustomSettings(p => ({ ...p, speed: val / 10 }))} />
                </div>
             </div>

             <div className="flex flex-col justify-center text-center space-y-8 bg-slate-50 p-8 rounded-3xl border-2 shadow-inner">
                <div className="space-y-4">
                  <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit"><Volume2 className="w-8 h-8 text-primary" /></div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900">Audio Preview</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">Hear it: <span className="text-primary font-bold">"Add {customSettings.digits === 1 ? '7' : '25'}, Less {customSettings.digits === 1 ? '2' : '10'}... That is"</span></p>
                </div>
                <Button onClick={handleStartCustom} className="w-full h-20 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl">
                  Start Session <Zap className="ml-2 w-6 h-6 fill-white" />
                </Button>
             </div>
          </CardContent>
        </Card>
      </section>

      <div className="space-y-12 max-w-5xl mx-auto">
        {tiers.map((level) => {
          const isLocked = !isPro && !isTrialActive && level.id !== 'easy';
          return (
            <Card key={level.id} className={cn("rounded-[2.5rem] border-none shadow-xl overflow-hidden group transition-all", isLocked ? "opacity-60 grayscale" : "bg-white")}>
              <CardHeader className={cn("p-8 text-center", level.color)}>
                <div className="mx-auto bg-white/40 p-4 rounded-full w-fit mb-4"><level.icon className="w-8 h-8" /></div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">{level.title}</CardTitle>
                <CardDescription className="font-bold opacity-80">{level.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-muted/30 p-6 rounded-[1.5rem] border-2 border-dashed border-primary/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 text-center">Select Level (1-50)</p>
                  <LevelGrid tier={level.id} isLocked={isLocked} />
                </div>
                {isLocked && <Button asChild variant="secondary" className="w-full h-14 font-black uppercase rounded-2xl mt-6"><Link href="/pricing"><Lock className="mr-2 h-4 w-4" /> Upgrade to Pro</Link></Button>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
