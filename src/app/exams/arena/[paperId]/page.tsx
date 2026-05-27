'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Timer, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { generateExamQuestions } from '@/lib/exam-utils';
import type { ExamApplication, Question } from '@/types';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, limit, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import BeadDisplay from '@/components/BeadDisplay';
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

export default function ExamArenaPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/test_wrapper_bg.jpg?alt=media');
  const { paperId } = useParams() as { paperId: string };
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useSound();

  const [application, setApplication] = useState<ExamApplication | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background refs for stable interval tracking
  const answersRef = useRef<(number | null)[]>([]);
  const timeLeftRef = useRef<number>(0);
  const isFinishedRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  
  const isFinal = paperId === 'final';

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    const fetchApplication = async () => {
      try {
        // 1. Fetch Schedule first to see if exam is ended
        const scheduleSnap = await getDoc(doc(db, "stats", "examSchedule"));
        if (scheduleSnap.exists()) {
          const data = scheduleSnap.data();
          if (data.date && data.endTime) {
            const endTime = new Date(`${data.date}T${data.endTime}:00`);
            if (!isNaN(endTime.getTime()) && new Date() > endTime) {
              toast({ title: "Exam Period Ended", description: "The official exam period for this cycle has ended. All papers are locked.", variant: "destructive" });
              router.push('/exams');
              return;
            }
          }
        }

        // 2. Fetch Application
        const q = query(collection(db, "examApplications"), where("userId", "==", user.uid), where("status", "==", "approved"), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          toast({ title: "Not Eligible", description: "You need an approved exam application.", variant: "destructive" });
          router.push('/exams');
          return;
        }
        const app = { id: snap.docs[0].id, ...snap.docs[0].data() } as ExamApplication;

        // 3. Fetch Results to see if they completed the final exam for this application cycle
        const resultsQuery = query(collection(db, "examResults"), where("userId", "==", user.uid), where("isFinal", "==", true));
        const resultsSnap = await getDocs(resultsQuery);
        const appliedTime = app.appliedAt?.seconds || 0;
        const hasFinishedFinal = resultsSnap.docs.some(d => {
          const r = d.data();
          return (r.submittedAt?.seconds || 0) > appliedTime;
        });

        if (hasFinishedFinal) {
          toast({ title: "Cycle Complete", description: "You have already completed the final exam for this cycle.", variant: "destructive" });
          router.push('/exams');
          return;
        }

        setApplication(app);
        const generated = generateExamQuestions(app.group);
        setQuestions(generated);
        const initialAnswers = new Array(generated.length).fill(null);
        setAnswers(initialAnswers);
        answersRef.current = initialAnswers;
        setTimeLeft(app.timeLimit);
        timeLeftRef.current = app.timeLimit;
        setLoading(false);
      } catch (error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examApplications', operation: 'list' }));
      }
    };
    fetchApplication();
  }, [user, router, toast]);

  useEffect(() => {
    if (questionButtonRefs.current[currentIdx]) {
      questionButtonRefs.current[currentIdx]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIdx]);

  const finishExam = useCallback(async (forcedTimeLeft?: number) => {
    if (isFinishedRef.current || !user || !application || questions.length === 0) return;
    
    isFinishedRef.current = true;
    setIsFinished(true);
    setIsSubmitting(true);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const currentAnswers = answersRef.current;
    const currentTimeLeft = forcedTimeLeft ?? timeLeftRef.current;

    const score = currentAnswers.reduce((acc: number, ans, i) => {
      if (ans !== null && questions[i] && ans === questions[i].answer) {
        return acc + 1;
      }
      return acc;
    }, 0);

    const accuracy = (score / questions.length) * 100;
    const answeredCount = currentAnswers.filter(a => a !== null).length;

    const payload = {
      userId: user.uid,
      paperId,
      group: application.group,
      score,
      totalQuestions: questions.length,
      accuracy,
      isFinal,
      resultDeclared: !isFinal, 
      timeLeft: currentTimeLeft, 
      answeredCount,
      submittedAt: serverTimestamp(),
      details: questions.map((q, i) => ({
        text: q.text || `Identify Beads (Answer: ${q.answer})`,
        correct: q.answer,
        student: currentAnswers[i]
      }))
    };

    const db = getFirestore(firebaseApp);
    
    addDoc(collection(db, "examResults"), payload)
      .then(() => {
        if (isFinal) {
          toast({ title: "Official Exam Submitted", description: "Submission successful! Results will be visible after Admin Audit." });
        } else {
          toast({ title: "Practice Paper Complete", description: `Result: ${score}/${questions.length}` });
        }
        router.push('/exams');
      })
      .catch((serverError) => {
        setIsSubmitting(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: 'examResults', 
          operation: 'create',
          requestResourceData: payload
        }));
      });
  }, [user, application, questions, isFinal, paperId, router, toast]);

  useEffect(() => {
    if (loading || isFinished) return;
    
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;
            finishExam(0);
            return 0;
          }

          const nextTime = prev - 1;
          timeLeftRef.current = nextTime;
          
          if (nextTime === 60) {
            playSound('timerWarning');
          } else if (nextTime <= 10 && nextTime > 0) {
            playSound('timerUrgent');
          } else if (nextTime <= 5) {
             playSound('timerTick');
          }

          return nextTime;
        });
      }, 1000);
    }

    return () => {
      if (isFinishedRef.current && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loading, isFinished, finishExam, playSound]);

  const handleSelectOption = (val: number) => {
    if (isFinished) return;
    
    const newAnswers = [...answers];
    newAnswers[currentIdx] = val;
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx(prev => prev + 1);
      }
    }, 300);
  };

  const jumpTo = (i: number) => {
    setCurrentIdx(i);
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /><p className="mt-4 font-bold uppercase tracking-widest">Entering Arena...</p></div>;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const currentQ = questions[currentIdx];
  const selectedAnswer = answers[currentIdx];

  return (
    <div className="max-w-4xl mx-auto py-4">
      <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-slate-900 text-white p-6 border-b border-white/10 shrink-0">
          <div className="flex justify-between items-center">
             <div>
               <CardTitle className="text-xl font-black uppercase tracking-tight">{isFinal ? 'Official Final Exam' : `Practice Paper #${paperId.split('-')[1]}`}</CardTitle>
               <CardDescription className="text-indigo-300 font-bold">Group {application?.group} Arena</CardDescription>
             </div>
             <div className={cn("flex items-center gap-2 text-2xl font-black bg-white/10 px-4 py-2 rounded-2xl", timeLeft < 60 && "text-red-400 animate-pulse")}>
               <Timer className="w-6 h-6" /> {mins}:{secs.toString().padStart(2, '0')}
             </div>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap mt-6 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="flex w-max space-x-2">
                {questions.map((_, index) => (
                    <Button
                        key={index}
                        ref={(el) => { questionButtonRefs.current[index] = el; }}
                        onClick={() => jumpTo(index)}
                        variant={currentIdx === index ? 'default' : 'ghost'}
                        className={cn("w-10 h-10 text-xs font-black rounded-lg", currentIdx === index ? "bg-primary text-white" : "text-slate-400 hover:text-white", answers[index] !== null && currentIdx !== index && "text-green-400")}
                    >
                        {index + 1}
                    </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardHeader>
        
        <CardContent className="p-8 text-center flex-grow flex flex-col justify-center">
          <div className="space-y-6">
            <div className="py-4 bg-muted/30 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center min-h-[140px] justify-center">
                {currentQ.questionType === 'identify' ? (
                  <div className="w-full max-w-md">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Identify Abacus Value</p>
                    <BeadDisplay value={currentQ.answer} rodCount={currentQ.answer > 999 ? 4 : 3} />
                  </div>
                ) : (
                  <p className="text-xl sm:text-3xl md:text-5xl font-black tracking-tight text-slate-800 leading-tight px-4">
                    {currentQ.text} = ?
                  </p>
                )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {currentQ.options.map((opt, i) => (
                <Button 
                  key={i}
                  variant={selectedAnswer === opt ? 'default' : 'outline'}
                  className={cn(
                    "h-14 sm:h-16 text-xl sm:text-2xl font-black rounded-2xl border-2 transition-all",
                    selectedAnswer === opt ? "bg-primary text-white scale-105 shadow-lg" : "hover:border-primary/50"
                  )}
                  onClick={() => handleSelectOption(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-8 pt-0 flex flex-wrap gap-4 shrink-0">
          <div className="flex-1" />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={isSubmitting} className="w-full sm:w-auto h-16 px-10 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl bg-green-600 hover:bg-green-700">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="mr-2 w-6 h-6" />}
                End Exam
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl font-black uppercase tracking-tight">Finish and Submit?</AlertDialogTitle>
                <AlertDialogDescription className="text-lg font-medium">
                  {answers.filter(a => a === null).length > 0 
                    ? `Warning: You still have ${answers.filter(a => a === null).length} unanswered questions. End now?`
                    : "Great job! Would you like to submit your exam now?"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl h-12 font-bold">Review Answers</AlertDialogCancel>
                <AlertDialogAction onClick={() => finishExam()} className="rounded-xl h-12 bg-green-600 hover:bg-green-700 font-black uppercase tracking-widest">
                  Submit Now
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
}
