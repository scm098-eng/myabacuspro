
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, AlertTriangle, HelpCircle, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageBackground } from '@/hooks/usePageBackground';
import type { Question } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn, parseCalculationSteps } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BeadDisplay from '@/components/BeadDisplay';
import { useSound } from '@/hooks/useSound';

interface ResultsData {
  questions: Question[];
  userAnswers: (number | null)[];
}

interface Step {
  operation: string;
  value: number;
  explanation?: string;
  atRodFromRight?: number;
}

function ResultsComponent() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/results_bg.jpg?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9');
  const searchParams = useSearchParams();
  const router = useRouter();
  const { playSound } = useSound();

  const [resultsData, setResultsData] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [modalQuestion, setModalQuestion] = useState<Question | null>(null);
  const [calculationSteps, setCalculationSteps] = useState<Step[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const score = Number(searchParams.get('score') || 0);
  const total = Number(searchParams.get('total') || 0);
  const time = Number(searchParams.get('time') || 0);
  const earnedPoints = Number(searchParams.get('points') || 0);
  
  useEffect(() => {
    const data = sessionStorage.getItem('testResults');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setResultsData(parsed);
      } catch (e) {
        console.error("Failed to parse test results from session storage", e);
      }
    }
    setLoading(false);
    playSound('success');
  }, [playSound]);

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
        setCalculationSteps([{ operation: 'Final Answer', value: question.answer, explanation: 'The target value is shown on the abacus.' }]);
    } else {
        const steps = parseCalculationSteps(question.text);
        setCalculationSteps(steps);
    }
    setCurrentStepIndex(0);
    setIsDialogOpen(true);
  };

  const currentStep = calculationSteps[currentStepIndex];
  const abacusValue = currentStep?.value ?? 0;
  const activeRodIndex = currentStep?.atRodFromRight ? 7 - currentStep.atRodFromRight : -1;

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
               "h-full flex flex-col transition-all hover:border-primary/50",
               isUnanswered && "border-yellow-500/50",
               !isUnanswered && !isCorrect && "border-destructive/50"
           )}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Question {index + 1}</CardTitle>
                  {statusIcon}
              </CardHeader>
              <CardContent className="flex-grow">
                  <p className="text-xl font-bold tracking-tight">{q.text || (q.questionType === 'set' ? `Set ${q.answer}` : 'Identify Beads')}</p>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                      <p className="flex justify-between">Correct: <span className="font-bold text-primary">{q.answer}</span></p>
                      <p className="flex justify-between">Yours: 
                        <span className={cn(
                          "font-bold",
                          isUnanswered && "text-muted-foreground",
                          !isUnanswered && isCorrect && "text-green-600",
                          !isUnanswered && !isCorrect && "text-destructive"
                        )}>
                          {isUnanswered ? 'Skipped' : userAnswer}
                        </span>
                      </p>
                  </div>
              </CardContent>
               <CardFooter className="pt-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5" onClick={() => handleOpenDialog(q)}>
                      <Lightbulb className="mr-2 h-3 w-3" /> Solution
                  </Button>
               </CardFooter>
           </Card>
        </div>
      );
    });
  }, [resultsData]);

  if (loading) {
    return <ResultsSkeleton />;
  }
  
  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-xl border-none bg-gradient-to-br from-card to-muted/20 overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-4xl font-headline font-black uppercase tracking-tighter">Test Complete!</CardTitle>
            <CardDescription className="text-lg font-medium">{getPerformanceMessage()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Mastery Points Earned</p>
                    <p className="text-7xl font-black text-primary drop-shadow-sm">{earnedPoints}</p>
                </div>
                <div className="text-center md:border-l md:pl-8">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2">Overall Score</p>
                    <p className="text-5xl font-black text-foreground">{score}<span className="text-2xl text-muted-foreground/50">/{total}</span></p>
                    <div className="max-w-xs mx-auto mt-4">
                        <div className="flex justify-between text-xs font-bold uppercase mb-1">
                            <span>Accuracy</span>
                            <span>{accuracy.toFixed(1)}%</span>
                        </div>
                        <Progress value={accuracy} className="h-2" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-background/50 rounded-2xl border-2 border-green-100 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-xl font-black leading-none">{score}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Correct</p>
              </div>
              <div className="p-4 bg-background/50 rounded-2xl border-2 border-red-100 text-center">
                <XCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="text-xl font-black leading-none">{incorrect}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Incorrect</p>
              </div>
               <div className="p-4 bg-background/50 rounded-2xl border-2 border-yellow-100 text-center">
                <HelpCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="text-xl font-black leading-none">{unanswered}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Skipped</p>
              </div>
              <div className="p-4 bg-background/50 rounded-2xl border-2 border-blue-100 text-center">
                <Clock className="h-6 w-6 text-secondary mx-auto mb-2" />
                <p className="text-xl font-black leading-none">{timeDisplay}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Time</p>
              </div>
            </div>
          </CardContent>
           <CardFooter className="flex-col sm:flex-row gap-4 p-8 bg-muted/30 border-t">
              <Button onClick={() => router.push('/tests')} className="flex-1 h-12 text-base font-bold">New Test</Button>
              <Button onClick={() => router.push('/progress')} variant="secondary" className="flex-1 h-12 text-base font-bold">History</Button>
              <Button onClick={() => router.push('/')} variant="outline" className="flex-1 h-12 text-base font-bold">Home</Button>
          </CardFooter>
        </Card>
        
        {resultsData && (
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-black uppercase tracking-tight">Step-by-Step Review</CardTitle>
              <CardDescription>Click 'Solution' on any question to see the visual abacus breakdown.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex w-max space-x-4 p-6">
                    {questionCards}
                  </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
       <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-3xl shadow-2xl flex flex-col h-[90vh] sm:h-auto max-h-[90vh]">
          <DialogHeader className="p-6 bg-primary text-primary-foreground shrink-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-center">
                Solution Breakdown
            </DialogTitle>
             <DialogDescription className="text-primary-foreground/80 font-bold text-center">
              Question: <span className="text-white text-2xl font-mono ml-2">{modalQuestion?.text || modalQuestion?.answer}</span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-6 sm:p-8 space-y-6 flex flex-col items-center pb-24">
              <div className="w-full bg-muted/50 rounded-2xl p-4 border border-muted-foreground/10 text-center animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Step {currentStepIndex + 1} of {calculationSteps.length}</p>
                  <p className="text-lg sm:text-xl font-black text-primary">{currentStep?.operation}</p>
                  {currentStep?.explanation && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium leading-relaxed italic">{currentStep.explanation}</p>
                  )}
              </div>

              {/* Horizontal Scrollable Abacus Container - Fixed with min-w-max */}
              <div className="w-full overflow-x-auto py-6">
                  <div className="flex justify-start sm:justify-center min-w-max px-6 mx-auto">
                      <BeadDisplay 
                          value={abacusValue} 
                          rodCount={7} 
                          activeRodIndex={activeRodIndex}
                      />
                  </div>
              </div>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>

          {/* Sticky Footer Navigation */}
          <div className="shrink-0 p-4 sm:p-6 bg-muted/30 border-t flex justify-between items-center bg-background/95 backdrop-blur-sm mt-auto">
              <Button 
                  onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentStepIndex === 0}
                  variant="outline"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-sm"
              >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              
              <div className="text-center px-2">
                {currentStepIndex === calculationSteps.length - 1 ? (
                  <div className="bg-green-100 text-green-700 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full font-black text-base animate-in zoom-in-95">
                    FINAL: {modalQuestion?.answer}
                  </div>
                ) : (
                  <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest">
                      Press Next to Continue
                  </span>
                )}
              </div>

               <Button 
                  onClick={() => setCurrentStepIndex(prev => Math.min(calculationSteps.length - 1, prev + 1))}
                  disabled={currentStepIndex === calculationSteps.length - 1}
                  variant="outline"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl shadow-sm"
              >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
          </div>
      </DialogContent>
    </Dialog>
    </>
  );
}


function ResultsSkeleton() {
    return (
        <div className="max-w-2xl mx-auto space-y-8">
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
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                        <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                </CardContent>
                <CardFooter className="flex gap-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardFooter>
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
