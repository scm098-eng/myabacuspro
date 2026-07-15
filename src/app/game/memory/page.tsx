'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Trophy, Timer, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import BeadDisplay from '@/components/BeadDisplay';
import { useSound } from '@/hooks/useSound';
import { getRandomInt, generateOptions } from '@/lib/questions';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const ROUNDS_PER_LEVEL = 10;

export default function MemoryGamePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/game_bg.jpg?alt=media');
  const { user, profile, addPoints } = useAuth();
  const router = useRouter();
  const { playSound } = useSound();

  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<'idle' | 'showing' | 'recalling' | 'input' | 'feedback' | 'complete' | 'fail'>('idle');
  const [targetValue, setTargetValue] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showTime, setShowTime] = useState(3000); // ms
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRound = useCallback(() => {
    // Determine complexity based on level
    let digits = 1;
    let time = 3000;

    if (level <= 2) { digits = 1; time = 3000 - (level * 500); }
    else if (level <= 5) { digits = 2; time = 4000 - ((level - 2) * 500); }
    else if (level <= 8) { digits = 3; time = 5000 - ((level - 5) * 500); }
    else { digits = 4; time = 6000 - ((level - 8) * 500); }

    const min = Math.pow(10, digits - 1);
    const max = Math.pow(10, digits) - 1;
    const newVal = getRandomInt(min, max);

    setTargetValue(newVal);
    setShowTime(Math.max(500, time));
    setInputValue('');
    setIsCorrect(null);
    setStatus('showing');

    timerRef.current = setTimeout(() => {
      setStatus('input');
      setTimeout(() => inputRef.current?.focus(), 50);
    }, time);
  }, [level]);

  useEffect(() => {
    if (status === 'idle') {
        const t = setTimeout(() => startRound(), 1000);
        return () => clearTimeout(t);
    }
  }, [status, startRound]);

  const handleAnswer = () => {
    if (status !== 'input') return;
    
    const isRight = parseInt(inputValue, 10) === targetValue;
    setIsCorrect(isRight);
    setStatus('feedback');
    
    if (isRight) {
      setScore(s => s + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      if (round < ROUNDS_PER_LEVEL) {
        setRound(r => r + 1);
        startRound();
      } else {
        finishGame();
      }
    }, 1500);
  };

  const finishGame = async () => {
    setIsSubmitting(true);
    const accuracy = (score / ROUNDS_PER_LEVEL) * 100;
    
    if (accuracy >= 80) {
      if (user) {
        const bonus = level * 10;
        await addPoints(user.uid, bonus);
      }
      setStatus('complete');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } else {
      setStatus('fail');
    }
    setIsSubmitting(false);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    setRound(1);
    setScore(0);
    setStatus('idle');
  };

  const dynamicRodCount = useMemo(() => {
    if (targetValue < 100) return 3;
    if (targetValue < 1000) return 4;
    return 7;
  }, [targetValue]);

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <h2 className="text-2xl font-black uppercase italic tracking-widest text-slate-800">Preparing Level {level}...</h2>
      </div>
    );
  }

  if (status === 'complete' || status === 'fail') {
    const isWin = status === 'complete';
    return (
      <Card className="max-w-md mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className={cn("p-10 text-center text-white", isWin ? "bg-green-600" : "bg-red-600")}>
          <div className="mx-auto bg-white/20 p-4 rounded-full w-fit mb-4">
            {isWin ? <Trophy className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">{isWin ? 'Level Cleared!' : 'Keep Practicing!'}</h2>
          <p className="font-bold opacity-80 mt-2">{score}/{ROUNDS_PER_LEVEL} Correct Rounds</p>
        </div>
        <CardContent className="p-10 space-y-6">
          <p className="text-center text-slate-600 font-medium leading-relaxed">
            {isWin 
              ? `Outstanding visualization skills! You've unlocked Level ${level + 1} and earned a mastery bonus.` 
              : 'Hold the abacus image in your mind longer. Try this level again to rank up.'}
          </p>
          <div className="grid gap-3">
            {isWin ? (
               <Button onClick={nextLevel} className="h-14 rounded-xl text-lg font-black uppercase tracking-widest shadow-lg">Next Level <ArrowRight className="ml-2 w-5 h-5" /></Button>
            ) : (
               <Button onClick={() => { setRound(1); setScore(0); setStatus('idle'); }} className="h-14 rounded-xl text-lg font-black uppercase tracking-widest shadow-lg"><RotateCcw className="mr-2 w-5 h-5" /> Retry Level</Button>
            )}
            <Button variant="ghost" onClick={() => router.push('/game')} className="font-bold uppercase tracking-widest text-xs h-12">Back to Game Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center px-4">
         <div className="space-y-1">
            <h1 className="text-2xl font-black uppercase tracking-tight text-slate-800">Memory Flash</h1>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-600 text-white border-none font-black text-[10px]">LEVEL {level}</Badge>
              <Badge variant="outline" className="font-black text-[10px]">ROUND {round}/{ROUNDS_PER_LEVEL}</Badge>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</p>
            <p className="text-2xl font-black text-blue-600">{Math.round((score / Math.max(1, round - 1)) * 100)}%</p>
         </div>
      </div>

      <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden min-h-[450px] flex flex-col">
        <div className="bg-slate-900 p-4 shrink-0">
          <Progress value={(round / ROUNDS_PER_LEVEL) * 100} className="h-1 bg-white/10" />
        </div>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/20 pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {status === 'showing' && (
              <div className="animate-in zoom-in-50 duration-300 w-full">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-8">Memorize this Value</p>
                <div className="flex justify-center">
                  <BeadDisplay value={targetValue} rodCount={dynamicRodCount} hideLabels />
                </div>
              </div>
            )}

            {status === 'input' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                  <Timer className="w-4 h-4 animate-pulse" /> What was the value?
                </div>
                <Input 
                  ref={inputRef}
                  type="number"
                  placeholder="???"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAnswer()}
                  className="h-24 text-center text-6xl font-black rounded-3xl border-4 shadow-inner focus:ring-blue-500"
                />
                <Button onClick={handleAnswer} className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl">
                  Recall Answer
                </Button>
              </div>
            )}

            {status === 'feedback' && (
               <div className="space-y-6 animate-in zoom-in-95">
                  <div className="mx-auto p-6 rounded-full bg-white shadow-xl mb-4">
                    {isCorrect ? (
                      <CheckCircle2 className="w-16 h-16 text-green-500 animate-bounce" />
                    ) : (
                      <XCircle className="w-16 h-16 text-red-500" />
                    )}
                  </div>
                  <h3 className={cn("text-4xl font-black uppercase italic", isCorrect ? "text-green-600" : "text-red-600")}>
                    {isCorrect ? 'PERFECT!' : 'OOPS!'}
                  </h3>
                  <div className="flex gap-4 justify-center">
                    <div className="text-center p-3 bg-muted rounded-xl min-w-[100px]">
                      <p className="text-[10px] font-bold uppercase opacity-50">Target</p>
                      <p className="text-xl font-black">{targetValue}</p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-xl min-w-[100px]">
                      <p className="text-[10px] font-bold uppercase opacity-50">Your Answer</p>
                      <p className={cn("text-xl font-black", isCorrect ? "text-green-600" : "text-red-600")}>{inputValue || 'None'}</p>
                    </div>
                  </div>
               </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 p-6 border-t flex justify-between items-center">
           <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visualization Training Mode</span>
           </div>
           <Badge variant="secondary" className="font-bold">Accuracy Req: 80%</Badge>
        </CardFooter>
      </Card>
    </div>
  );
}
