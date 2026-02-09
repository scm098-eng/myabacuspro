
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer, AlertTriangle, Loader2 } from 'lucide-react';
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

export default function TestPageClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(settings.timeLimit);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const generatedQuestions = generateTest(testId, difficulty);
    setQuestions(generatedQuestions);
    setUserAnswers(new Array(generatedQuestions.length).fill(null));
    setStartTime(Date.now());
    questionButtonRefs.current = new Array(generatedQuestions.length);
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

  const finishTest = useCallback(async () => {
    if (isFinished) return;
    setIsFinished(true);

    const score = userAnswers.reduce((acc: number, answer, index) => {
        if (answer !== null && questions.length > 0 && answer === questions[index].answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    if (user) {
      const accuracy = questions.length > 0 ? (score / questions.length) * 100 : 0;
      const timeSpent = settings.timeLimit - timeLeft;
      const db = getFirestore(firebaseApp);
      
      const resultData = {
        userId: user.uid,
        testId,
        difficulty,
        score,
        totalQuestions: questions.length,
        accuracy,
        timeSpent,
        timeLeft,
        createdAt: serverTimestamp(),
      };
      
      try {
        await addDoc(collection(db, 'testResults'), resultData);
      } catch (error) {
        console.error("Error saving test results: ", error);
      }
    }
    
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const resultsToStore = {
        questions: questions,
        userAnswers: userAnswers,
      };
      sessionStorage.setItem('testResults', JSON.stringify(resultsToStore));
    }

    router.replace(`/results?score=${score}&total=${questions.length}&time=${timeLeft}`);
  }, [userAnswers, questions, router, timeLeft, user, testId, difficulty, settings.timeLimit, isFinished]);

  useEffect(() => {
    if (questions.length === 0 || !startTime) return;
    
    if (timeLeft <= 0) {
      finishTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, finishTest, questions.length, startTime]);

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

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-full">
      <Card className="shadow-2xl relative overflow-hidden flex flex-col flex-grow">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-headline">{settings.title}</CardTitle>
            <div className={cn("flex items-center gap-2 font-semibold text-lg p-2 rounded-md", timeLeft < 60 && 'text-destructive-foreground bg-destructive/80')}>
              <Timer className="h-6 w-6" />
              <span>{minutes}:{seconds.toString().padStart(2, '0')}</span>
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
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-foreground whitespace-pre-wrap">
              {currentQuestion.text}
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider text-foreground whitespace-pre-wrap mt-4">
              = ?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = option === currentQuestion.answer;
              const isSelected = selectedOption === option;
              
              return (
                <Button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={cn(
                    "h-20 text-3xl font-bold transition-all duration-300 transform hover:scale-105",
                    isAnswered && isSelected && !isCorrect && "bg-destructive hover:bg-destructive/90",
                    isAnswered && isCorrect && "bg-green-500 hover:bg-green-500/90",
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
            <Button variant="destructive">
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
