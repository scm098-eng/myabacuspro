
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { generateTest } from '@/lib/questions';
import type { Question, Difficulty, TestType, TestSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Loader2, Check } from 'lucide-react';
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

export default function BeadsTestPageClient({ testId, difficulty, settings }: { testId: TestType; difficulty: Difficulty, settings: TestSettings }) {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [abacusValue, setAbacusValue] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
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
    if (testId === 'beads-identify' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestionIndex, testId]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  const finishTest = useCallback(async (finalAnswers: (number | null)[]) => {
    if (isFinished) return;
    setIsFinished(true);

    const score = finalAnswers.reduce((acc: number, answer, index) => {
        if (answer !== null && questions.length > 0 && answer === questions[index].answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    const timeSpent = 0; // Not timed
    const timeLeft = 0; // Not timed

    if (user) {
      const accuracy = questions.length > 0 ? (score / questions.length) * 100 : 0;
      const db = getFirestore(firebaseApp);
      
      const resultData = {
        userId: user.uid, testId, difficulty, score,
        totalQuestions: questions.length, accuracy, timeSpent, timeLeft,
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
        questions: questions.map(q => ({ ...q, text: `${q.questionType === 'set' ? 'Set Value:' : 'Identify Value:'} ${q.answer}` })),
        userAnswers: finalAnswers,
      };
      sessionStorage.setItem('testResults', JSON.stringify(resultsToStore));
    }

    router.replace(`/results?score=${score}&total=${questions.length}&time=${timeLeft}`);
  }, [questions, router, user, testId, difficulty, isFinished]);

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

  const renderQuestion = () => {
    if (currentQuestion.questionType === 'identify') {
      return (
        <div className="flex flex-col items-center">
            <p className="mb-4 text-lg font-semibold">What is the value shown?</p>
            <BeadDisplay value={currentQuestion.answer} />
            <Input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your answer"
                className="mt-6 w-48 text-center text-xl h-12"
            />
        </div>
      );
    }
    if (currentQuestion.questionType === 'set') {
      return (
        <div className="flex flex-col items-center">
            <p className="mb-4 text-lg font-semibold">Set this value on the abacus:</p>
            <p className="text-4xl font-bold mb-4">{currentQuestion.answer}</p>
            <BeadDisplay value={abacusValue} onChange={setAbacusValue} />
        </div>
      );
    }
    return null;
  }

  return (
    <div className="flex flex-col max-w-3xl mx-auto h-full">
      <Card className="shadow-2xl relative overflow-hidden flex flex-col flex-grow">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-2xl font-headline">{settings.title}</CardTitle>
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

          <div className="flex items-center justify-center gap-4 mt-auto">
            <Button onClick={handleAnswerSubmit} className="h-14 text-lg px-8">
              <Check className="mr-2 h-5 w-5"/>
              Submit and Next
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6 flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
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
