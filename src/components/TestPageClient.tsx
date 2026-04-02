'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, AlertTriangle, Loader2, PlayCircle, CheckCircle2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog"
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { doc, collection, addDoc, serverTimestamp, getFirestore } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { calculatePoints } from '@/lib/scoring';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useSound } from '@/hooks/useSound';
import { PAGE_GUIDES } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function TestPageClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const { user, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  
  const [hasStarted, setHasStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const generatedQuestions = generateTest(testId, difficulty);
    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(null));
    questionButtonRefs.current = new Array(generatedQuestions.length);

    // Check if user has opted to skip rules
    const skip = localStorage.getItem('skip_rules_timed_test') === 'true';
    if (skip) {
      setHasStarted(true);
      setStartTime(Date.now());
    }
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

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('skip_rules_timed_test', 'true');
    }
    setHasStarted(true);
    setStartTime(Date.now());
    playSound('points');
  };

  const finishTest = useCallback(async () => {
    if (isFinished) return;
    setIsFinished(true);

    const score = userAnswers.reduce((acc: number, answer, index) => {
        if (answer !== null && questions.length > 0 && answer === questions[index].answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    const answeredCount = userAnswers.filter(a => a !== null).length;
    let earnedPointsTotal = 0;

    if (user) {
      const accuracy = questions.length > 0 ? (score / questions.length) * 100 : 0;
      const timeSpent = settings.timeLimit > 0 ? settings.timeLimit - timeLeft : 0;
      const db = getFirestore(firebaseApp);
      
      const difficultyLevel = difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3);
      const pointsCalculation = calculatePoints({
        correct: score,
        total: questions.length,
        answered: answeredCount,
        timeInSeconds: timeSpent,
        targetTime: settings.timeLimit,
        level: difficultyLevel,
        isGame: false
      });
      
      earnedPointsTotal = pointsCalculation.earnedPoints;

      const resultData = {
        userId: user.uid,
        testId,
        difficulty,
        score,
        totalQuestions: questions.length,
        accuracy,
        timeSpent,
        timeLeft,
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
        questions: questions,
        userAnswers: userAnswers,
      };
      sessionStorage.setItem('testResults', JSON.stringify(resultsToStore));
    }

    router.replace(`/results?score=${score}&total=${questions.length}&time=${timeLeft}&points=${earnedPointsTotal}`);
  }, [userAnswers, questions, router, timeLeft, user, testId, difficulty, settings.timeLimit, isFinished, recordDailyPractice, addPoints]);

  useEffect(() => {
    if (!hasStarted || questions.length === 0 || !startTime || isFinished || settings.timeLimit === 0) return;
    
    if (timeLeft <= 0) {
      finishTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        
        if (nextTime === 60) {
          playSound('timerWarning');
          setTimeout(() => playSound('timerWarning'), 200);
          setTimeout(() => playSound('timerWarning'), 400);
        } else if (nextTime <= 10 && nextTime > 0) {
          playSound('timerUrgent');
        } else if (nextTime > 60 && nextTime % 60 === 0) {
          playSound('timerTick');
        }

        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, finishTest, questions.length, startTime, isFinished, playSound, settings.timeLimit, hasStarted]);

   useEffect(() => {
    if (!isFinished && questions.length > 0 && userAnswers.length === questions.length && !userAnswers.includes(null)) {
        finishTest();
    }
   }, [userAnswers, finishTest, isFinished, questions.length]);
  
  const jumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setSelectedOption(null);
    setIsAnswered(false);
  }

  const handleAnswer = (answer: number) => {
    if (isAnswered) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    
    setIsAnswered(true);
    setSelectedOption(answer);
    setUserAnswers(newAnswers);

    const isCorrect = answer === currentQuestion.answer;
    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        jumpToQuestion(currentQuestionIndex + 1);
      }
    }, 700);
  };
  
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const progress = (currentQuestionIndex / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Generating your test...</p>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="flex flex-col max-w-xl mx-auto h-full px-4">
        <Card className="shadow-2xl border-none rounded-[2rem] overflow-hidden bg-card animate-in zoom-in-95 duration-500 max-h-[90vh] flex flex-col">
          <CardHeader className="bg-primary text-primary-foreground text-center py-6 shrink-0">
            <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tighter font-headline">Test Rules</CardTitle>
            <CardDescription className="text-primary-foreground/80 font-bold text-sm sm:text-lg">Follow these to score high!</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 overflow-y-auto flex-1 scrollbar-none">
            <div className="space-y-4">
              {PAGE_GUIDES.timed_test.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-muted-foreground/5 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white text-xs font-black shadow-md">
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
                id="dont-show" 
                checked={dontShowAgain} 
                onCheckedChange={(val) => setDontShowAgain(!!val)} 
              />
              <Label htmlFor="dont-show" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Do not show rules again</Label>
            </div>
            <Button onClick={handleStart} className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-black uppercase tracking-widest rounded-2xl shadow-xl transition-transform hover:scale-[1.02]">
              <PlayCircle className="mr-3 h-6 w-6 sm:h-8 sm:w-8" /> Start Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-full px-4">
      <Card className="shadow-2xl relative overflow-hidden flex flex-col flex-grow">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl font-headline">{settings.title}</CardTitle>
            </div>
            {settings.timeLimit > 0 && (
              <div className={cn("flex items-center gap-2 font-semibold text-base sm:text-lg p-2 rounded-md transition-colors", timeLeft < 60 ? 'text-destructive-foreground bg-destructive animate-pulse' : 'text-foreground')}>
                <Timer className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
              </div>
            )}
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
                        ref={(el) => { questionButtonRefs.current[index] = el; }}
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
        
          <div className="text-center my-auto transition-opacity duration-300" key={currentQuestionIndex}>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold tracking-wider text-foreground whitespace-pre-wrap">
              {currentQuestion.text}
            </p>
            <p className="text-xl sm:text-3xl md:text-4xl font-bold tracking-wider text-foreground whitespace-pre-wrap mt-4">
              = ?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto pt-6">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.answer;
              const isSelected = selectedOption === option;
              
              return (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={cn(
                    "h-16 sm:h-20 text-2xl sm:text-3xl font-bold transition-all duration-300 transform hover:scale-105",
                    isAnswered && isSelected && !isCorrect && "bg-destructive hover:bg-destructive/90",
                    isAnswered && isCorrect && "bg-green-50 hover:bg-green-50 text-green-700 border-green-500 border-2",
                  )}
                  variant="outline"
                >
                  {option}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="sm:size-default">
                <AlertTriangle className="mr-2 h-4 w-4" />
                End Test
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to end the test?</AlertDialogTitle>
              <AlertDialogDescription>
                Your progress will be saved and you will be taken to the results page. You cannot undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={finishTest}>Yes, end test</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
