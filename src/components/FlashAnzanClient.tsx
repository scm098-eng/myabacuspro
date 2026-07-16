'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, Check, PlayCircle, Zap, ShieldCheck, ChevronRight, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Input } from './ui/input';
import { calculatePoints } from '@/lib/scoring';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { PAGE_GUIDES } from '@/lib/constants';
import { useSound } from '@/hooks/useSound';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function FlashAnzanClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Flashing State
  const [isFlashing, setIsFlashing] = useState(false);
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [sequenceIdx, setSequenceIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isReadyForInput, setIsReadyForInput] = useState(false);
  
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    let generated: Question[] = [];
    if (difficulty === 'custom') {
      const d = parseInt(searchParams.get('d') || '2', 10);
      const r = parseInt(searchParams.get('r') || '10', 10);
      const s = parseInt(searchParams.get('s') || '1000', 10);
      generated = generateTest(testId, 'custom', { digits: d, rows: r, delay: s });
    } else {
      generated = generateTest(testId, difficulty);
    }
    
    setQuestions(generated);
    setUserAnswers(new Array(generated.length).fill(null));
    questionButtonRefs.current = new Array(generated.length).fill(null);

    const skip = localStorage.getItem('skip_rules_flash_anzan') === 'true';
    if (skip) setHasStarted(true);
  }, [testId, difficulty, searchParams]);
  
  useEffect(() => {
    if (questionButtonRefs.current[currentIdx]) {
      questionButtonRefs.current[currentIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIdx]);

  const startFlashing = useCallback(() => {
    if (!questions[currentIdx]?.sequence) return;
    setIsFlashing(true);
    setIsReadyForInput(false);
    setActiveNumber(null);
    setSequenceIdx(0);
    setInputValue('');

    const sequence = questions[currentIdx].sequence!;
    const delay = questions[currentIdx].delay || 1000;
    
    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFlashing(false);
          setIsReadyForInput(true);
          setActiveNumber(null);
          if (inputRef.current) inputRef.current.focus();
        }, 500);
        return;
      }
      
      const num = sequence[idx];
      setActiveNumber(num);
      playSound('timerTick');
      
      // Hide number briefly between flashes
      setTimeout(() => {
        setActiveNumber(null);
      }, delay * 0.8);

      idx++;
      setSequenceIdx(idx);
    }, delay);

    return () => clearInterval(interval);
  }, [questions, currentIdx, playSound]);

  useEffect(() => {
    if (hasStarted && !isFinished && !isFlashing && !isReadyForInput) {
      startFlashing();
    }
  }, [hasStarted, isFinished, isFlashing, isReadyForInput, startFlashing]);

  const handleAnswerSubmit = () => {
    const val = parseInt(inputValue, 10);
    const answer = isNaN(val) ? null : val;
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = answer;
    setUserAnswers(newAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(p => p + 1);
      setIsReadyForInput(false);
      setInputValue('');
    } else {
      finishTest(newAnswers);
    }
  };

  const finishTest = useCallback(async (finalAnswers: (number | null)[]) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);

    // Explicit type annotation for accumulator to avoid build error
    const score = finalAnswers.reduce<number>((acc, ans, i) => (ans !== null && ans === questions[i].answer ? acc + 1 : acc), 0);
    const answeredCount = finalAnswers.filter(a => a !== null).length;
    let earnedPointsTotal = 0;

    if (user) {
      const accuracy = (score / (questions.length || 1)) * 100;
      const db = getFirestore(firebaseApp);
      
      const { earnedPoints } = calculatePoints({
        correct: score,
        total: questions.length,
        answered: answeredCount,
        timeInSeconds: 0,
        targetTime: 0,
        level: difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3),
        isGame: false
      });
      
      earnedPointsTotal = earnedPoints;

      const resultData = {
        userId: user.uid,
        testId,
        difficulty: difficulty === 'custom' ? `Custom (${searchParams.get('d')}d, ${searchParams.get('r')}r)` : difficulty,
        score,
        totalQuestions: questions.length,
        accuracy,
        timeSpent: 0,
        timeLeft: 0,
        earnedPoints: earnedPointsTotal,
        createdAt: serverTimestamp(),
      };
      
      addDoc(collection(db, 'testResults'), resultData).catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'testResults', operation: 'create' }));
      });

      recordDailyPractice(user.uid);
      addPoints(user.uid, earnedPointsTotal);
    }
    
    sessionStorage.setItem('testResults', JSON.stringify({
      questions: questions.map(q => ({ ...q, text: q.sequence?.join(' ') || '' })),
      userAnswers: finalAnswers,
    }));

    router.replace(`/results?score=${score}&total=${questions.length}&time=0&points=${earnedPointsTotal}`);
  }, [questions, router, user, testId, difficulty, searchParams, recordDailyPractice, addPoints]);

  if (questions.length === 0) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  if (!hasStarted) {
    return (
      <div className="flex flex-col max-w-xl mx-auto px-4">
        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-card animate-in zoom-in-95 duration-500">
          <CardHeader className="bg-primary text-white text-center py-6">
            <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tighter font-headline">Flash Anzan</CardTitle>
            <CardDescription className="text-white/80 font-bold">Mental Arithmetic Challenge</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {PAGE_GUIDES.flash_anzan.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-black shadow-md">{i + 1}</div>
                <p className="text-sm font-medium text-slate-700 leading-tight pt-1.5">{step}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-8 pt-0 flex flex-col gap-4 border-t">
            <div className="flex items-center space-x-2 py-2">
              <Checkbox id="skip" checked={dontShowAgain} onCheckedChange={(val) => {
                setDontShowAgain(!!val);
                if (val) localStorage.setItem('skip_rules_flash_anzan', 'true');
              }} />
              <Label htmlFor="skip" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Do not show rules again</Label>
            </div>
            <Button onClick={() => setHasStarted(true)} className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl bg-primary hover:bg-primary/90">
              <PlayCircle className="mr-3 h-8 w-8" /> Start Practice
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4">
      <Card className="shadow-2xl relative overflow-hidden flex flex-col flex-grow rounded-[2.5rem]">
        <CardHeader className="p-6 bg-muted/10">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Flash Card Anzan
            </CardTitle>
            <Badge className="bg-primary font-black uppercase text-[10px] tracking-widest">
              {difficulty === 'custom' ? 'CUSTOM LAB' : difficulty.toUpperCase()}
            </Badge>
          </div>
          <ScrollArea className="w-full whitespace-nowrap bg-white/50 p-2 rounded-xl border border-muted-foreground/10 mb-4 shadow-inner">
            <div className="flex w-max space-x-2">
                {questions.map((_, i) => (
                    <Button 
                      key={i} 
                      ref={el => { questionButtonRefs.current[i] = el; }}
                      variant={currentIdx === i ? 'default' : 'ghost'} 
                      className={cn("w-10 h-10 text-xs font-black rounded-full shrink-0 aspect-square", currentIdx === i ? "bg-primary shadow-md" : "text-muted-foreground", userAnswers[i] !== null && "text-green-600 bg-green-50")}
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1" />
          </ScrollArea>
          <Progress value={(currentIdx / questions.length) * 100} className="w-full h-2 rounded-full" />
        </CardHeader>
        
        <CardContent className="flex flex-col flex-grow p-8 items-center justify-center min-h-[300px]">
          {isFlashing ? (
            <div className="text-center animate-in zoom-in-95 duration-200">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-10">Row {sequenceIdx} of {questions[currentIdx].sequence?.length}</p>
               <div className={cn(
                 "text-7xl sm:text-9xl font-black tracking-tighter drop-shadow-xl transition-all",
                 activeNumber && activeNumber < 0 ? "text-red-500" : "text-slate-900"
               )}>
                 {activeNumber !== null ? (activeNumber > 0 ? `+${activeNumber}` : activeNumber) : ''}
               </div>
            </div>
          ) : isReadyForInput ? (
            <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Sequence Complete</h3>
                  <p className="text-muted-foreground font-medium mt-1">What is the final total?</p>
               </div>
               <div className="flex gap-4">
                  <Input 
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswerSubmit()}
                    className="h-16 text-center text-4xl font-black rounded-2xl border-4 shadow-inner"
                    placeholder="???"
                  />
                  <Button onClick={handleAnswerSubmit} className="h-16 px-8 rounded-2xl shadow-xl bg-primary hover:bg-primary/90">
                    <ChevronRight className="w-8 h-8" />
                  </Button>
               </div>
            </div>
          ) : (
            <Button onClick={startFlashing} className="h-20 px-12 rounded-3xl text-2xl font-black uppercase tracking-widest bg-slate-900 shadow-2xl">
              Next Sequence
            </Button>
          )}
        </CardContent>
        
        <CardFooter className="p-8 border-t bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-30">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Mastery Session Active</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="font-bold text-destructive hover:bg-destructive/10 rounded-xl px-6 h-10">End Practice</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-black uppercase tracking-tight">End Session?</AlertDialogTitle>
                  <AlertDialogDescription className="font-medium text-slate-600">
                    Your current progress will be recorded.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4">
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => finishTest(userAnswers)} className="rounded-xl bg-destructive hover:bg-destructive/90 text-white border-none shadow-lg h-12">Confirm End</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
