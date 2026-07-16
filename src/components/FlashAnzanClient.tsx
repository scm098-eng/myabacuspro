
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings, ProfileData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, Check, PlayCircle, Zap, ShieldCheck, ChevronRight, Swords, Users, User, Share2 } from 'lucide-react';
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
import { startMatchmaking, getRecentOpponents } from '@/lib/matchmaking';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function FlashAnzanClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  const { toast } = useToast();
  
  const [appState, setAppState] = useState<'lobby' | 'rules' | 'playing'>('lobby');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [recentOpponents, setRecentOpponents] = useState<{uid: string, name: string, photo: string}[]>([]);
  const [isMatchmaking, setIsMatchmaking] = useState(false);

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
    if (user) getRecentOpponents(user.uid).then(setRecentOpponents);
  }, [user]);

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
    if (skip) setAppState('playing');
    else setAppState('lobby');
  }, [testId, difficulty, searchParams]);

  const handleStartDuel = async () => {
    if (!user || !profile) return;
    setIsMatchmaking(true);
    try {
      const duelId = await startMatchmaking(user.uid, profile, 'flash', difficulty);
      router.push(`/game/duels/${duelId}`);
    } catch (e) {
      toast({ title: "Matchmaking failed", variant: "destructive" });
    } finally {
      setIsMatchmaking(false);
    }
  };

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
      setTimeout(() => setActiveNumber(null), delay * 0.8);
      idx++;
      setSequenceIdx(idx);
    }, delay);

    return () => clearInterval(interval);
  }, [questions, currentIdx, playSound]);

  useEffect(() => {
    if (appState === 'playing' && !isFinished && !isFlashing && !isReadyForInput) {
      startFlashing();
    }
  }, [appState, isFinished, isFlashing, isReadyForInput, startFlashing]);

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

    const score = finalAnswers.reduce<number>((acc, ans, i) => (ans !== null && questions[i] && ans === questions[i].answer ? acc + 1 : acc), 0);
    const answeredCount = finalAnswers.filter(a => a !== null).length;
    let earnedPointsTotal = 0;

    if (user) {
      const db = getFirestore(firebaseApp);
      const { earnedPoints } = calculatePoints({
        correct: score, total: questions.length, answered: answeredCount, 
        timeInSeconds: 0, targetTime: 0,
        level: difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3),
        isGame: false
      });
      
      earnedPointsTotal = earnedPoints;
      addDoc(collection(db, 'testResults'), {
        userId: user.uid, testId, difficulty, score, totalQuestions: questions.length,
        accuracy: (score/questions.length)*100, earnedPoints: earnedPointsTotal, createdAt: serverTimestamp()
      });
      recordDailyPractice(user.uid);
      addPoints(user.uid, earnedPointsTotal);
    }
    
    sessionStorage.setItem('testResults', JSON.stringify({
      questions: questions.map(q => ({ ...q, text: q.sequence?.join(' ') || '' })),
      userAnswers: finalAnswers,
    }));

    router.replace(`/results?score=${score}&total=${questions.length}&time=0&points=${earnedPointsTotal}`);
  }, [questions, router, user, testId, difficulty, recordDailyPractice, addPoints]);

  if (questions.length === 0) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  if (appState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500 mt-10 px-4">
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black uppercase text-xs tracking-widest">Anzan Mission</Badge>
          <h1 className="text-4xl sm:text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">
            Flash <span className="text-primary italic">Anzan</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Master mental arithmetic with sequential flashing numbers. Challenge your precision against the global community.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setAppState('playing')}>
              <CardHeader className="p-8 text-center bg-teal-50 rounded-t-[2.5rem] border-b">
                 <div className="mx-auto bg-teal-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><User className="w-8 h-8 text-teal-600" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight">Train Alone</CardTitle>
                 <CardDescription className="font-bold">Standard solo practice session.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center"><Button variant="ghost" className="font-black text-teal-600">Start Session <ChevronRight className="ml-1 w-4 h-4"/></Button></CardContent>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={handleStartDuel}>
              <CardHeader className="p-8 text-center bg-white/5 rounded-t-[2.5rem] border-b border-white/10">
                 <div className="mx-auto bg-primary/20 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Swords className="w-8 h-8 text-primary" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Find Duel</CardTitle>
                 <CardDescription className="text-slate-400 font-bold">Real-time Anzan race.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center"><Button variant="ghost" className="font-black text-primary">Join Matchmaking <ChevronRight className="ml-1 w-4 h-4"/></Button></CardContent>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all group overflow-hidden">
              <CardHeader className="p-8 text-center bg-indigo-50 border-b">
                 <div className="mx-auto bg-indigo-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Users className="w-8 h-8 text-indigo-600" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight">Play Friend</CardTitle>
                 <CardDescription className="font-bold">Challenge a teammate.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {recentOpponents.length > 0 ? (
                   <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Recent Rivals</p>
                     {recentOpponents.map(opp => (
                       <Button key={opp.uid} variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={handleStartDuel}>
                         <Avatar className="h-6 w-6"><AvatarImage src={opp.photo}/><AvatarFallback>{opp.name[0]}</AvatarFallback></Avatar>
                         <span className="font-bold text-xs truncate">{opp.name}</span>
                       </Button>
                     ))}
                   </div>
                 ) : (
                   <p className="text-xs text-muted-foreground font-medium italic py-4 text-center">Challenge a friend to start a rivalry!</p>
                 )}
                 <Button onClick={handleStartDuel} className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest"><Share2 className="w-4 h-4 mr-2"/> Private Link</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto px-4 mt-6">
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
            <div className="w-full max-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
