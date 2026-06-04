
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Timer, CheckCircle2 } from 'lucide-react';
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

  const answersRef = useRef<(number | null)[]>([]);
  const timeLeftRef = useRef<number>(0);
  const isFinishedRef = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    const fetchApplication = async () => {
      try {
        const scheduleSnap = await getDoc(doc(db, "stats", "examSchedule"));
        if (scheduleSnap.exists()) {
          const data = scheduleSnap.data();
          if (data.date && data.endTime) {
            const endTime = new Date(`${data.date}T${data.endTime}:00`);
            if (!isNaN(endTime.getTime()) && new Date() > endTime) {
              toast({ title: "Exam Period Ended", description: "The official exam period has ended.", variant: "destructive" });
              router.push('/exams');
              return;
            }
          }
        }

        const q = query(collection(db, "examApplications"), where("userId", "==", user.uid), where("status", "==", "approved"), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) {
          toast({ title: "Not Eligible", description: "Approved application required.", variant: "destructive" });
          router.push('/exams');
          return;
        }
        const app = { id: snap.docs[0].id, ...snap.docs[0].data() } as ExamApplication;

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

  const finishExam = useCallback(async () => {
    if (isFinishedRef.current || !user || !application || questions.length === 0) return;
    
    isFinishedRef.current = true;
    setIsFinished(true);
    setIsSubmitting(true);

    const currentAnswers = answersRef.current;
    // Fix build error: Explicitly type acc as number
    const finalScore = currentAnswers.reduce((acc: number, ans, i) => {
        if (questions[i] && ans !== null && ans === questions[i].answer) {
            return acc + 1;
        }
        return acc;
    }, 0);

    const accuracy = (finalScore / questions.length) * 100;

    const payload = {
      userId: user.uid,
      paperId,
      group: application.group,
      score: finalScore,
      totalQuestions: questions.length,
      accuracy,
      isFinal: paperId === 'final',
      resultDeclared: paperId !== 'final',
      submittedAt: serverTimestamp(),
    };

    addDoc(collection(getFirestore(firebaseApp), "examResults"), payload)
      .then(() => {
        toast({ title: "Submission successful!" });
        router.push('/exams');
      })
      .catch((e) => {
        setIsSubmitting(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examResults', operation: 'create' }));
      });
  }, [user, application, questions, paperId, router, toast]);

  useEffect(() => {
    if (loading || isFinished) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        timeLeftRef.current = next;

        if (next <= 0) {
          clearInterval(interval);
          finishExam();
          return 0;
        }

        if (next === 60) playSound('timerWarning');
        else if (next <= 10) playSound('timerUrgent');

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, isFinished, playSound, finishExam]);

  const handleSelectOption = (val: number) => {
    if (isFinished) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = val;
    setAnswers(newAnswers);
    setTimeout(() => {
      if (currentIdx < questions.length - 1) setCurrentIdx(prev => prev + 1);
    }, 300);
  };

  const getQuestionFontSize = (text: string) => {
    const len = text.length;
    if (len > 30) return "text-lg sm:text-2xl";
    if (len > 22) return "text-xl sm:text-3xl";
    if (len > 14) return "text-3xl sm:text-5xl";
    return "text-4xl sm:text-7xl";
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /><p className="mt-4 font-bold uppercase">Entering Arena...</p></div>;

  return (
    <div className="max-w-4xl mx-auto py-4">
      <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-slate-900 text-white p-6 border-b shrink-0">
          <div className="flex justify-between items-center">
             <div>
               <CardTitle className="text-xl font-black uppercase">{paperId === 'final' ? 'Official Final Exam' : `Practice #${paperId.split('-')[1]}`}</CardTitle>
               <CardDescription className="text-indigo-300 font-bold">Group {application?.group} Arena</CardDescription>
             </div>
             <div className={cn("flex items-center gap-2 text-2xl font-black bg-white/10 px-4 py-2 rounded-2xl", timeLeft < 60 && "text-red-400 animate-pulse")}>
               <Timer className="w-6 h-6" /> {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}
             </div>
          </div>
          <ScrollArea className="w-full whitespace-nowrap mt-6 bg-white/5 p-2 rounded-xl border border-white/10">
            <div className="flex w-max space-x-2">
                {questions.map((_, i) => (
                    <Button key={i} onClick={() => setCurrentIdx(i)} variant={currentIdx === i ? 'default' : 'ghost'} className={cn("w-10 h-10 text-xs font-black", currentIdx === i ? "bg-primary" : "text-slate-400", answers[i] !== null && "text-green-400")}>
                        {i + 1}
                    </Button>
                ))}
            </div>
          </ScrollArea>
        </CardHeader>
        <CardContent className="p-8 text-center flex-grow flex flex-col justify-center overflow-hidden">
          <div className="space-y-6">
            <div className="py-4 bg-muted/30 rounded-[2rem] border-2 border-dashed flex flex-col items-center min-h-[140px] justify-center">
                {questions[currentIdx].questionType === 'identify' ? (
                  <div className="w-full max-w-md"><BeadDisplay value={questions[currentIdx].answer} rodCount={dynamicRodCount} /></div>
                ) : (
                  <div className="w-full overflow-hidden">
                    <p className={cn("font-black tracking-tight whitespace-nowrap", getQuestionFontSize(questions[currentIdx].text || ""))}>
                      {questions[currentIdx].text} = ?
                    </p>
                  </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {questions[currentIdx].options.map((opt, i) => (
                <Button key={i} variant={answers[currentIdx] === opt ? 'default' : 'outline'} className="h-16 text-xl font-black rounded-2xl" onClick={() => handleSelectOption(opt)}>{opt}</Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-8 flex justify-end">
          <Button disabled={isSubmitting} className="h-16 px-10 text-xl font-black bg-green-600 hover:bg-green-700 rounded-2xl" onClick={() => finishExam()}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="mr-2" />} End Exam
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
