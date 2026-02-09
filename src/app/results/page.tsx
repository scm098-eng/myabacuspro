
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertTriangle, HelpCircle, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageBackground } from '@/hooks/usePageBackground';
import type { Question } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BeadDisplay from '@/components/BeadDisplay';
import { parseCalculationSteps } from '@/lib/utils';

interface ResultsData {
  questions: Question[];
  userAnswers: (number | null)[];
}

interface Step {
  operation: string;
  value: number;
}

function ResultsComponent() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/results_bg.jpg?alt=media');
  const searchParams = useSearchParams();
  const router = useRouter();

  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for the dialog
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [calculationSteps, setCalculationSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const score = Number(searchParams.get('score') || 0);
  const total = Number(searchParams.get('total') || 0);
  const time = Number(searchParams.get('time') || 0);
  
  useEffect(() => {
    const data = sessionStorage.getItem('testResults');
    if (data) {
      setResultsData(JSON.parse(data));
    }
    setLoading(false);
  }, []);

  const accuracy = total > 0 ? (score / total) * 100 : 0;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  
  const unanswered = resultsData ? resultsData.userAnswers.filter(a => a === null).length : 0;
  const incorrect = total - score - unanswered;

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return "Excellent work! You're a true Abacus Pro!";
    if (accuracy >= 75) return "Great job! Keep practicing to reach perfection.";
    if (accuracy >= 50) return "Good effort! Consistency is key to improvement.";
    return "Keep trying! Every attempt is a step forward.";
  };

  const handleOpenDialog = (question: Question) => {
    setModalQuestion(question);
    if (question.questionType === 'identify' || question.questionType === 'set') {
        setCalculationSteps([{ operation: 'Final Answer', value: question.answer }]);
    } else {
        const steps = parseCalculationSteps(question.text);
        setCalculationSteps(steps);
    }
    setCurrentStepIndex(0);
    setIsDialogOpen(true);
  };

  const abacusValue = calculationSteps[currentStepIndex]?.value ?? 0;

  const questionCards = useMemo(() => {
    if (!resultsData) return null;

    return resultsData.questions.map((q, index) => {
      const userAnswer = resultsData.userAnswers[index];
      const isCorrect = userAnswer === q.answer;
      const isUnanswered = userAnswer === null;
      const statusIcon = isUnanswered 
        ? <HelpCircle className="h-5 w-5 text-yellow-500" />
        : isCorrect 
          ? <CheckCircle className="h-5 w-5 text-green-500" /> 
          : <XCircle className="h-5 w-5 text-destructive" />;

      return (
        <div key={index} className="w-64">
           <Card className={cn(
               "h-full flex flex-col",
               isUnanswered && "border-yellow-500/50",
               !isUnanswered && !isCorrect && "border-destructive/50"
           )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Question {index + 1}</CardTitle>
                  {statusIcon}
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-xl font-bold">{q.text}</p>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                      <p>Correct Answer: <span className="font-semibold text-primary">{q.answer}</span></p>
                      <p>Your Answer: 
                        <span className={cn(
                          "font-semibold",
                          isUnanswered && "text-muted-foreground",
                          !isUnanswered && isCorrect && "text-green-500",
                          !isUnanswered && !isCorrect && "text-destructive"
                        )}>
                          {isUnanswered ? 'Unanswered' : userAnswer}
                        </span>
                      </p>
                  </div>
              </CardContent>
               {!isCorrect && (
                  <CardFooter className="pt-4">
                      <Button variant="link" size="sm" className="w-full" onClick={() => handleOpenDialog(q)}>
                          <GraduationCap className="mr-2 h-4 w-4" /> Check Answer
                      </Button>
                  </CardFooter>
               )}
           </Card>
        </div>
      );
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resultsData]);

  if (loading) {
    return <ResultsSkeleton />;
  }
  
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Test Complete!</CardTitle>
            <CardDescription>{getPerformanceMessage()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">Your Score</p>
              <p className="text-6xl font-bold text-primary">{score}
                <span className="text-3xl text-muted-foreground">/{total}</span>
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Accuracy: {accuracy.toFixed(1)}%</p>
              <Progress value={accuracy} className="w-full" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-background rounded-lg border">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{score}</p>
                <p className="text-sm text-muted-foreground">Correct</p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold">{incorrect}</p>
                <p className="text-sm text-muted-foreground">Incorrect</p>
              </div>
               <div className="p-4 bg-background rounded-lg border">
                <HelpCircle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold">{unanswered}</p>
                <p className="text-sm text-muted-foreground">Unanswered</p>
              </div>
              <div className="p-4 bg-background rounded-lg border">
                <Clock className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold">{timeDisplay}</p>
                <p className="text-sm text-muted-foreground">Time Left</p>
              </div>
            </div>
          </CardContent>
           <CardFooter className="flex-col sm:flex-row gap-4 pt-4">
              <Button onClick={() => router.push('/tests')} className="flex-1">Play Again</Button>
              <Button onClick={() => router.push('/progress')} variant="secondary" className="flex-1">View Progress</Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1">Back to Home</Button>
          </CardFooter>
        </Card>
        
        {resultsData && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Review</CardTitle>
              <CardDescription>Review each question and your answer.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex w-max space-x-4 p-4">
                    {questionCards}
                  </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {!resultsData && !loading && (
           <Card className="border-destructive/50">
            <CardHeader className="flex flex-row items-center gap-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Review Not Available</CardTitle>
                <CardDescription>Detailed results could not be loaded. This might happen if you refresh the page or are viewing a very old test.</CardDescription>
              </div>
            </CardHeader>
          </Card>
        )}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
       <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to solve: <span className="font-mono text-primary">{modalQuestion?.text}</span></DialogTitle>
             <DialogDescription>
              Step {currentStepIndex + 1} of {calculationSteps.length}: <span className="font-bold text-primary">{calculationSteps[currentStepIndex]?.operation}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <BeadDisplay value={abacusValue} />
          </div>
          <div className="flex justify-between items-center">
            <Button 
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                variant="outline"
                size="icon"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                  Step {currentStepIndex + 1} / {calculationSteps.length}
              </span>
              {currentStepIndex === calculationSteps.length - 1 && modalQuestion && (
                <p className="font-bold text-lg mt-1">
                  Final Answer: <span className="text-primary">{modalQuestion.answer}</span>
                </p>
              )}
            </div>
             <Button 
                onClick={() => setCurrentStepIndex(prev => Math.min(calculationSteps.length - 1, prev + 1))}
                disabled={currentStepIndex === calculationSteps.length - 1}
                variant="outline"
                size="icon"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
      </DialogContent>
    </Dialog>
    </>
  );
}


function ResultsSkeleton() {
    return (
        <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl">
                <CardHeader className="text-center space-y-2">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <Skeleton className="h-6 w-32 mx-auto" />
                        <Skeleton className="h-16 w-40 mx-auto" />
                    </div>
                    <div>
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                        <Skeleton className="h-28 w-full rounded-lg" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={<ResultsSkeleton />}>
            <ResultsComponent />
        </Suspense>
    )
}
