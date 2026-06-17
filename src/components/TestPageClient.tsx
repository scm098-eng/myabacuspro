
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, AlertTriangle, Loader2, PlayCircle, Check, ChevronRight } from 'lucide-react';
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
import { calculatePoints } from '@/lib/scoring';
import { useSound } from '@/hooks/useSound';
import { PAGE_GUIDES, FORMULA_GUIDES } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function TestPageClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const { user, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [inputValue, setInputValue] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const answersRef = useRef<(number | null)[]>([]);
  const timeLeftRef = useRef<number>(settings.timeLimit);
  const isFinishedRef = useRef(false);
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isInputMode = useMemo(() => testId.includes('-input'), [testId]);

  useEffect(() => {
    answersRef.current = userAnswers;
  }, [userAnswers]);

  useEffect(() => {
    const generated = generateTest(testId, difficulty);
    setQuestions(generated);
    const initial = new Array(generated.length).fill(null);
    setUserAnswers(initial);
    answersRef.current = initial;
    questionButtonRefs.current = new Array(generated.length).fill(null);

    if (localStorage.getItem('skip_rules_timed_test') === 'true') setHasStarted(true);
  }, [testId, difficulty]);
  
  useEffect(() => {
    if (questionButtonRefs.current[currentIdx]) {
        questionButtonRefs.current[currentIdx]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    if (hasStarted && isInputMode && inputRef.current) inputRef.current.focus();
  }, [currentIdx, hasStarted, isInputMode]);

  const finishTest = useCallback(async (forcedAnswers?: (number | null)[]) => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    setIsFinished(true);

    const finalAnswers = forcedAnswers || answersRef.current;
    const finalTimeLeft = timeLeftRef.current;

    const score = finalAnswers.reduce((acc: number, ans, i) => (ans !== null && ans === questions[i].answer ? acc + 1 : acc), 0);
    const answered = finalAnswers.filter(a => a !== null).length;
    let earnedPoints = 0;

    if (user) {
      const timeSpent = settings.timeLimit - finalTimeLeft;
      const ptsRes = calculatePoints({
        correct: score, total: questions.length, answered, 
        timeInSeconds: timeSpent, targetTime: settings.timeLimit,
        level: difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3), isGame: false
      });
      earnedPoints = ptsRes.earnedPoints;

      addDoc(collection(getFirestore(firebaseApp), 'testResults'), {
        userId: user.uid, testId, difficulty, score, totalQuestions: questions.length,
        accuracy: (score/questions.length)*100, timeSpent, earnedPoints, createdAt: serverTimestamp()
      });
      recordDailyPractice(user.uid);
      addPoints(user.uid, earnedPoints);
    }
    
    sessionStorage.setItem('testResults', JSON.stringify({ questions, userAnswers: finalAnswers }));
    router.replace(`/results?score=${score}&total=${questions.length}&time=${finalTimeLeft}&points=${earnedPoints}`);
  }, [questions, router, user, testId, difficulty, settings.timeLimit, recordDailyPractice, addPoints]);

  const finishTestRef = useRef(finishTest);
  useEffect(() => { finishTestRef.current = finishTest; }, [finishTest]);

  useEffect(() => {
    if (!hasStarted || isFinished || settings.timeLimit <= 0) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;

        if (next <= 0) {
          clearInterval(interval);
          finishTestRef.current();
          return 0;
        }

        if (next === 60) playSound('timerWarning');
        else if (next <= 10) playSound('timerUrgent');

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, isFinished, settings.timeLimit, playSound]);

  const handleAnswer = (answer: number | null) => {
    if (isAnswered) return;
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = answer;
    setIsAnswered(true);
    setSelectedOption(answer);
    setUserAnswers(newAnswers);
    playSound(answer === questions[currentIdx].answer ? 'correct' : 'wrong');

    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
        setInputValue('');
        setIsAnswered(false);
        setSelectedOption(null);
      } else {
        finishTest(newAnswers);
      }
    }, 700);
  };

  const getQuestionFontSize = (text: string) => {
    const len = text.length;
    if (len > 30) return "text-xl sm:text-2xl";
    if (len > 22) return "text-2xl sm:text-3xl";
    return "text-2xl sm:text-4xl";
  };

  if (!hasStarted) {
    const guide = FORMULA_GUIDES[testId] || PAGE_GUIDES.timed_test;
    return (
      <div className="max-w-xl mx-auto px-4">
        <Card className="shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className={cn("text-white text-center py-6", FORMULA_GUIDES[testId] ? "bg-orange-600" : "bg-primary")}>
            <CardTitle className="text-2xl font-black uppercase">{guide.title}</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {guide.steps.map((s, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-black shrink-0 aspect-square shadow-sm">{i+1}</div>
                <p className="font-medium text-slate-700 leading-tight pt-1">{s}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="p-8 flex flex-col gap-4 border-t">
            <div className="flex items-center gap-2"><Checkbox id="skip" checked={dontShowAgain} onCheckedChange={v => { setDontShowAgain(!!v); if(!!v) localStorage.setItem('skip_rules_timed_test', 'true'); }} /><Label htmlFor="skip">Don't show rules again</Label></div>
            <Button onClick={() => { setHasStarted(true); playSound('points'); }} className="w-full h-16 text-xl font-black rounded-2xl shadow-xl transition-transform hover:scale-[1.01]">START PRACTICE</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 flex flex-col min-h-[600px]">
      <Card className="shadow-2xl flex-1 flex flex-col rounded-[2.5rem]">
        <CardHeader className="bg-muted/10 pb-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-lg sm:text-xl font-headline">{settings.title}</CardTitle>
            {settings.timeLimit > 0 && <div className={cn("flex items-center gap-2 font-black p-2 rounded-lg text-sm sm:text-base", timeLeft < 60 && "bg-destructive text-white animate-pulse")}><Timer className="w-5 h-5" /> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</div>}
          </div>
          <ScrollArea className="w-full whitespace-nowrap bg-white/50 p-2 rounded-xl border border-muted-foreground/10 mb-4 shadow-inner">
            <div className="flex w-max space-x-2">
                {questions.map((_, i) => (
                    <Button 
                      key={i} 
                      ref={el => { questionButtonRefs.current[i] = el; }}
                      onClick={() => !isAnswered && setCurrentIdx(i)} 
                      variant={currentIdx === i ? 'default' : 'ghost'} 
                      className={cn("w-10 h-10 text-xs font-black shrink-0 aspect-square rounded-full", currentIdx === i ? "bg-primary shadow-md" : "text-muted-foreground", userAnswers[i] !== null && "text-green-600 bg-green-50")}
                    >
                        {i + 1}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-1" />
          </ScrollArea>
          <Progress value={(currentIdx/questions.length)*100} className="h-2 rounded-full" />
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-3 text-center">Progress: {currentIdx + 1} of {questions.length}</p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center text-center p-8 overflow-hidden">
            <div className="w-full overflow-hidden bg-muted/20 py-10 rounded-[2rem] border-2 border-dashed px-4">
              <p className={cn("font-black tracking-tight whitespace-normal break-words", getQuestionFontSize(questions[currentIdx].text))}>
                {questions[currentIdx].text} = ?
              </p>
            </div>
            <div className="mt-12">
              {isInputMode ? (
                <form onSubmit={e => { e.preventDefault(); handleAnswer(parseInt(inputValue)); }} className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                  <Input 
                    ref={inputRef} 
                    type="number" 
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)} 
                    disabled={isAnswered} 
                    placeholder="Result"
                    className={cn(
                      "h-20 text-2xl sm:text-4xl text-center font-black rounded-2xl border-4 transition-all duration-300 shadow-inner",
                      isAnswered && parseInt(inputValue) === questions[currentIdx].answer && "border-green-500 bg-green-50 text-green-700",
                      isAnswered && parseInt(inputValue) !== questions[currentIdx].answer && "border-red-500 bg-red-50 text-red-700"
                    )} 
                  />
                  <Button type="submit" disabled={isAnswered || !inputValue} className="h-16 w-full text-xl font-black rounded-2xl shadow-lg">SUBMIT</Button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                  {questions[currentIdx].options.map(opt => (
                    <Button 
                      key={opt} 
                      onClick={() => handleAnswer(opt)} 
                      disabled={isAnswered} 
                      className={cn(
                        "h-20 text-2xl sm:text-4xl font-black rounded-2xl transition-all duration-200 shadow-sm",
                        isAnswered && opt === questions[currentIdx].answer && "bg-green-600 hover:bg-green-600 border-green-700 text-white scale-105 shadow-lg shadow-green-200",
                        isAnswered && opt === selectedOption && opt !== questions[currentIdx].answer && "bg-red-600 hover:bg-red-600 border-red-700 text-white",
                        isAnswered && opt !== selectedOption && opt !== questions[currentIdx].answer && "opacity-50 grayscale scale-95"
                      )} 
                      variant="outline"
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              )}
            </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild><Button variant="destructive" size="sm" className="font-bold rounded-xl shadow-md h-10 px-6">End Practice</Button></AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl"><AlertDialogHeader><AlertDialogTitle className="font-black uppercase tracking-tight">End Session?</AlertDialogTitle><AlertDialogDescription className="font-medium text-slate-600">Your current progress will be recorded and you will be taken to the performance summary.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="mt-4"><AlertDialogCancel className="rounded-xl h-11">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => finishTest()} className="rounded-xl h-11 bg-destructive hover:bg-destructive/90 text-white border-none shadow-lg">Yes, end test</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
