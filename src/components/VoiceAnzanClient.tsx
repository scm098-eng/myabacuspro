'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, PlayCircle, Megaphone, Volume2, ShieldCheck, ChevronRight, User, XCircle } from 'lucide-react';
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
import { useSound } from '@/hooks/useSound';

export default function VoiceAnzanClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  
  const [appState, setAppState] = useState<'lobby' | 'playing'>('lobby');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isReadyForInput, setIsReadyForInput] = useState(false);
  const [speakingStatus, setSpeakingStatus] = useState('');
  
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    let generated: Question[] = [];
    if (difficulty === 'custom') {
      const d = parseInt(searchParams.get('d') || '1', 10);
      const r = parseInt(searchParams.get('r') || '8', 10);
      const s = parseFloat(searchParams.get('s') || '1.0');
      generated = generateTest(testId, 'custom', { digits: d, rows: r });
      generated = generated.map(q => ({ ...q, delay: s }));
    } else {
      generated = generateTest(testId, difficulty);
      generated = generated.map(q => ({ ...q, delay: 1.0 }));
    }
    
    setQuestions(generated);
    setUserAnswers(new Array(generated.length).fill(null));
    questionButtonRefs.current = new Array(generated.length).fill(null);
    
    // Tiers automatically start playing
    if (difficulty !== 'custom') {
      setAppState('playing');
    } else {
      setAppState('lobby');
    }
  }, [testId, difficulty, searchParams]);

  const speakSequence = useCallback(async () => {
    if (!questions[currentIdx]?.sequence) return;
    
    setIsSpeaking(true);
    setIsReadyForInput(false);
    setInputValue('');
    setSpeakingStatus('Listening...');

    const sequence = questions[currentIdx].sequence!;
    const rate = questions[currentIdx].delay || 1.0;
    const voiceName = searchParams.get('v');
    const voices = window.speechSynthesis.getVoices();
    const selectedVoice = voices.find(v => v.name === voiceName) || voices[0];

    const speak = (text: string) => {
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) utterance.voice = selectedVoice;
        utterance.rate = rate;
        utterance.pitch = 1.0;
        utterance.onend = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    };

    // Sequential Dictation Loop
    for (let i = 0; i < sequence.length; i++) {
      const num = sequence[i];
      const prefix = i === 0 ? "" : (num > 0 ? "Add " : "Less ");
      const text = `${prefix} ${Math.abs(num)}`;
      // Update speakingStatus for speech engine but don't show specific numbers in UI for true "Blind" training
      setSpeakingStatus(text); 
      await speak(text);
    }

    // Final "That is" Prompt
    setSpeakingStatus("That is...");
    await speak("That is");

    setIsSpeaking(false);
    setIsReadyForInput(true);
    if (inputRef.current) inputRef.current.focus();
  }, [questions, currentIdx, searchParams]);

  useEffect(() => {
    if (appState === 'playing' && !isFinished && !isSpeaking && !isReadyForInput) {
      speakSequence();
    }
  }, [appState, isFinished, isSpeaking, isReadyForInput, speakSequence]);

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

    const score = finalAnswers.reduce<number>((acc: number, ans, i) => {
        if (ans !== null && questions[i] && ans === questions[i].answer) return acc + 1;
        return acc;
    }, 0);
    
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
      questions: questions.map(q => ({ ...q, text: q.sequence?.map((n, i) => (i === 0 ? '' : (n > 0 ? '+ ' : '- ')) + Math.abs(n)).join(' ') || '' })),
      userAnswers: finalAnswers,
    }));

    router.replace(`/results?score=${score}&total=${questions.length}&time=0&points=${earnedPointsTotal}`);
  }, [questions, router, user, testId, difficulty, recordDailyPractice, addPoints]);

  if (questions.length === 0) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  if (appState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500 mt-10 px-4">
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black uppercase text-xs tracking-widest">Auditory Hub</Badge>
          <h1 className="text-4xl sm:text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none italic">
            Voice <span className="text-primary italic whitespace-nowrap">Anzan</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Master mental arithmetic with verbal sequences. Reconstruct the beads in your mental vision purely from sound.</p>
        </div>

        <div className="flex justify-center px-4">
           <Card className="max-w-sm w-full rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setAppState('playing')}>
              <CardHeader className="p-8 text-center bg-indigo-50 rounded-t-[2.5rem] border-b">
                 <div className="mx-auto bg-indigo-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Megaphone className="w-8 h-8 text-indigo-600" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight">Enter Lab</CardTitle>
                 <CardDescription className="font-bold">Standard auditory mastery session.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center"><Button className="w-full h-12 rounded-xl font-black bg-indigo-600 hover:bg-indigo-700 text-white">Start Dictation <ChevronRight className="ml-1 w-4 h-4"/></Button></CardContent>
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
              <Megaphone className="w-5 h-5 text-primary" /> Voice Based Anzan
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
                      className={cn("w-10 h-10 text-xs font-black rounded-full shrink-0 aspect-square", currentIdx === i ? "bg-primary shadow-md" : "text-muted-foreground", userAnswers[i] !== null && "text-primary bg-primary/10")}
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1" />
          </ScrollArea>
          <Progress value={(currentIdx / questions.length) * 100} className="h-2 rounded-full" />
        </CardHeader>
        
        <CardContent className="flex flex-col flex-grow p-8 items-center justify-center min-h-[350px]">
          {isSpeaking ? (
            <div className="text-center space-y-10 animate-in zoom-in-95 duration-200">
               <div className="mx-auto bg-primary/10 p-8 rounded-full w-fit animate-pulse border-4 border-primary/20 shadow-2xl">
                  <Volume2 className="w-16 h-16 text-primary" />
               </div>
               <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Auditory Session In Progress</p>
                 <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter">Visualizing...</h2>
                 <p className="text-sm font-bold text-slate-400">Numbers are hidden for blind training</p>
               </div>
            </div>
          ) : isReadyForInput ? (
            <div className="w-full max-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="text-center">
                  <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Dictation Finished</h3>
                  <p className="text-muted-foreground font-medium mt-1">What was the final result?</p>
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
            <div className="text-center space-y-6">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic">Take a deep breath. Focus on your mental abacus.</p>
              <Button onClick={speakSequence} className="h-20 px-12 rounded-3xl text-2xl font-black uppercase tracking-widest bg-slate-900 shadow-2xl">
                Ready to Hear
              </Button>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-8 border-t bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 opacity-30">
              <ShieldCheck className="w-4 h-4" />
              <p className="text-[9px] font-black uppercase tracking-widest">Auditory Session Active</p>
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
