'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Loader2, Check, PlayCircle, CheckCircle2 } from 'lucide-react';
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
import BeadDisplay from './BeadDisplay';
import { Input } from './ui/input';
import { calculatePoints } from '@/lib/scoring';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { PAGE_GUIDES } from '@/lib/constants';
import { useSound } from '@/hooks/useSound';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function BeadsTestPageClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const { user, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [abacusValue, setAbacusValue] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const setQuestionButtonRef = (index: number) => (el: HTMLButtonElement | null) => {
    questionButtonRefs.current[index] = el;
  };

  useEffect(() => {
    const generatedQuestions = generateTest(testId, difficulty);
    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(null));
    questionButtonRefs.current = new Array(generatedQuestions.length);

    // Check skip preference
    const skip = localStorage.getItem('skip_rules_beads_test') === 'true';
    if (skip) setHasStarted(true);
  }, [testId, difficulty]);
  
  useEffect(() => {
    if (questionButtonRefs.current[currentQuestionIndex]) {
        questionButtonRefs.current[currentQuestionIndex]?.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
  }, [currentQuestionIndex]);
  
   useEffect(() => {
    if (hasStarted && testId === 'beads-identify' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, testId, hasStarted]);

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('skip_rules_beads_test', 'true');
    }
    setHasStarted(true);
    playSound('points');
  };

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const dynamicRodCount = useMemo(() => {
    if (!currentQuestion) return 3;
    const ans = currentQuestion.answer;
    if (ans < 100) return 3;
    if (ans < 1000) return 4;
    if (ans < 10000) return 5;
    return 7;
  }, [currentQuestion]);

  const finishTest = useCallback(async (finalAnswers: (number | null)[]) => {
    if (isFinished) return;
    setIsFinished(true);

    const score = finalAnswers.reduce((acc: number, answer, index) => {
        if (answer !== null && questions.length > 0 && answer === questions[index].answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    const answeredCount = finalAnswers.filter(a => a !== null).length;
    let earnedPointsTotal = 0;

    if (user) {
      const accuracy = questions.length > 0 ? (score / questions.length) * 100 : 0;
      const db = getFirestore(firebaseApp);
      
      const { earnedPoints } = calculatePoints({
        correct: score,
        total: questions.length,
        answered: answeredCount,
        timeInSeconds: 0,
        targetTime: 0,
        level: 1, 
        isGame: false
      });
      
      earnedPointsTotal = earnedPoints;

      const resultData = {
        userId: user.uid, testId, difficulty, score,
        totalQuestions: questions.length, accuracy, timeSpent: 0, timeLeft: 0,
        earnedPoints: earnedPointsTotal,
        createdAt: serverTimestamp(),
      };
      
      addDoc(collection(db, 'testResults'), resultData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: '/testResults',
              operation: 'create',
              requestResourceData: resultData,
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      recordDailyPractice(user.uid);
      addPoints(user.uid, earnedPointsTotal);
    }
    
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const resultsToStore = {
        questions: questions.map(q => ({ ...q, text: `${q.questionType === 'set' ? 'Set Value:' : 'Identify Value:'} ${q.answer}` })),
        userAnswers: finalAnswers,
      };
      sessionStorage.setItem('testResults', JSON.stringify(resultsToStore));
    }

    router.replace(`/results?score=${score}&total=${questions.length}&time=0&points=${earnedPointsTotal}`);
  }, [questions, router, user, testId, difficulty, isFinished, recordDailyPractice, addPoints]);

  const goToNextQuestion = (updatedAnswers: (number | null)[]) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setInputValue('');
      setAbacusValue(0);
    } else {
      finishTest(updatedAnswers);
    }
  };

  const handleAnswerSubmit = () => {
    let answer: number | null = null;
    if (currentQuestion.questionType === 'identify') {
      answer = inputValue === '' ? null : parseInt(inputValue, 10);
    } else if (currentQuestion.questionType === 'set') {
      answer = abacusValue;
    }

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    setTimeout(() => {
      goToNextQuestion(newAnswers);
    }, 200);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAnswerSubmit();
    }
  };

  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setInputValue('');
    setAbacusValue(0);
  }

  const progress = (currentQuestionIndex / questions.length) * 100;
  
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Generating your practice questions...</p>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col max-w-xl mx-auto h-full px-4">
        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-card animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
          <CardHeader className="bg-indigo-600 text-white text-center py-6 shrink-0">
            <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tighter font-headline">Beads Mastery</CardTitle>
            <CardDescription className="text-white/80 font-bold text-sm sm:text-lg">Rules of Visualization</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 overflow-y-auto flex-1 scrollbar-none">
            <div className="space-y-4">
              {PAGE_GUIDES.bead_test.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-muted-foreground/5 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-black shadow-md">
                    {i + 1}
                  </div>
                  <p className="text-sm sm:text-base font-medium text-slate-700 leading-tight pt-1.5">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-6 sm:p-8 pt-0 flex flex-col gap-4 bg-white/50 border-t shrink-0">
            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="dont-show-beads" 
                checked={dontShowAgain} 
                onCheckedChange={(val) => setDontShowAgain(!!val)} 
              />
              <Label htmlFor="dont-show-beads" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Do not show rules again</Label>
            </div>
            <Button onClick={handleStart} className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-black uppercase tracking-widest rounded-2xl shadow-xl transition-transform hover:scale-[1.02] bg-indigo-600 hover:bg-indigo-700">
              <PlayCircle className="mr-3 h-6 w-6 sm:h-8 sm:w-8" /> Start Training
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const renderQuestion = () => {
    if (currentQuestion.questionType === 'identify') {
      return (
        <div className="flex flex-col items-center w-full">
            <p className="mb-4 text-base sm:text-lg font-semibold">What is the value shown?</p>
            <div className="w-full max-w-full overflow-x-auto">
                <BeadDisplay value={currentQuestion.answer} rodCount={dynamicRodCount} />
            </div>
            <Input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter answer"
                className="mt-6 w-full max-w-[200px] text-center text-xl h-14"
            />
        </div>
      );
    }
    if (currentQuestion.questionType === 'set') {
      return (
        <div className="flex flex-col items-center w-full">
            <p className="mb-4 text-base sm:text-lg font-semibold">Set this value:</p>
            <p className="text-4xl sm:text-6xl font-black mb-6 text-primary">{currentQuestion.answer}</p>
            <div className="w-full max-w-full overflow-x-auto">
                <BeadDisplay value={abacusValue} onChange={setAbacusValue} rodCount={dynamicRodCount} />
            </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-full px-4">
      <Card className="shadow-2xl relative overflow-hidden flex flex-col flex-grow">
        <CardHeader>
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-headline">{settings.title}</CardTitle>
            </div>
          </div>
          <CardDescription>Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
          <Progress value={progress} className="w-full mt-2" />
        </CardHeader>
        <CardContent className="flex flex-col flex-grow">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border my-4">
            <div className="flex w-max space-x-2 p-2">
                {questions.map((_, index) => (
                    <Button
                        key={index}
                        ref={setQuestionButtonRef(index)}
                        onClick={() => jumpToQuestion(index)}
                        variant={currentQuestionIndex === index ? 'default' : 'outline'}
                        className={cn("w-10 h-10", userAnswers[index] !== null && "bg-green-200 border-green-400 text-green-800 hover:bg-green-300")}
                    >
                        {index + 1}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        
          <div className="text-center my-auto transition-opacity duration-300 grid grid-cols-1 gap-8 items-center" key={currentQuestionIndex}>
            {renderQuestion()}
          </div>

          <div className="flex items-center justify-center gap-4 mt-auto pt-8">
            <Button onClick={handleAnswerSubmit} className="h-14 sm:h-16 text-lg sm:text-xl font-bold px-8 w-full sm:w-auto rounded-2xl shadow-lg">
              <Check className="mr-2 h-5 w-5 sm:h-6 sm:w-6"/>
              Next Question
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                End Practice
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to end the practice session?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be saved and you will be taken to the results page. You cannot undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => finishTest(userAnswers)}>Yes, end practice</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
