
'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Loader2, Timer, CheckCircle2, ShieldAlert, AlertTriangle, Send } from 'lucide-react';
import { generateExamQuestions } from '@/lib/exam-utils';
import type { ExamApplication, Question } from '@/types';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { cn } from '@/lib/utils';

export default function ExamArenaPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/test_wrapper_bg.jpg?alt=media');
  const { paperId } = useParams() as { paperId: string };
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useSound();

  const [application, setApplication] = useState<ExamApplication | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  const isFinal = paperId === 'final';

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    const fetchApplication = async () => {
      const q = query(collection(db, "examApplications"), where("userId", "==", user.uid), where("status", "==", "approved"), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) {
        toast({ title: "Not Eligible", description: "You need an approved exam application.", variant: "destructive" });
        router.push('/exams');
        return;
      }
      const app = { id: snap.docs[0].id, ...snap.docs[0].data() } as ExamApplication;
      setApplication(app);
      setQuestions(generateExamQuestions(app.group));
      setTimeLeft(app.timeLimit);
      setLoading(false);
    };
    fetchApplication();
  }, [user, router, toast]);

  const finishExam = useCallback(async (finalAnswers: (number | null)[]) => {
    if (isFinished || !user || !application) return;
    setIsFinished(true);

    const score = finalAnswers.reduce((acc, ans, i) => (ans === questions[i].answer ? acc + 1 : acc), 0);
    const accuracy = (score / questions.length) * 100;

    try {
      const db = getFirestore(firebaseApp);
      await addDoc(collection(db, "examResults"), {
        userId: user.uid,
        paperId,
        group: application.group,
        score,
        totalQuestions: questions.length,
        accuracy,
        isFinal,
        submittedAt: serverTimestamp()
      });

      if (isFinal) {
        toast({ title: "Final Exam Submitted", description: "Your results have been sent to the Admin." });
      } else {
        toast({ title: "Practice Paper Complete", description: `You scored ${score}/${questions.length}.` });
      }
      router.push('/exams');
    } catch (e: any) {
      toast({ title: "Error Saving Results", description: e.message, variant: "destructive" });
    }
  }, [isFinished, user, application, questions, isFinal, paperId, router, toast]);

  useEffect(() => {
    if (loading || isFinished || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          finishExam(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, isFinished, timeLeft, finishExam, answers]);

  const handleNext = () => {
    const val = inputValue === '' ? null : parseInt(inputValue, 10);
    const newAnswers = [...answers];
    newAnswers[currentIdx] = val;
    setAnswers(newAnswers);
    setInputValue('');
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishExam(newAnswers);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /><p className="mt-4 font-bold">Preparing Exam Arena...</p></div>;

  const progress = (currentIdx / questions.length) * 100;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
             <div>
               <CardTitle className="text-xl font-black uppercase tracking-tight">{isFinal ? 'Official Final Exam' : `Practice Paper #${paperId.split('-')[1]}`}</CardTitle>
               <CardDescription className="text-indigo-300 font-bold">Group {application?.group} Arena</CardDescription>
             </div>
             <div className={cn("flex items-center gap-2 text-2xl font-black bg-white/10 px-4 py-2 rounded-2xl", timeLeft < 60 && "text-red-400 animate-pulse")}>
               <Timer className="w-6 h-6" /> {mins}:{secs.toString().padStart(2, '0')}
             </div>
          </div>
          <div className="mt-6">
            <Progress value={progress} className="h-2 bg-white/10" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mt-2">Question {currentIdx + 1} of {questions.length}</p>
          </div>
        </CardHeader>
        <CardContent className="p-10 text-center space-y-10">
          <div className="py-12 bg-muted/30 rounded-[3rem] border-2 border-dashed border-slate-200">
             <p className="text-5xl md:text-7xl font-black tracking-tight text-slate-800">{questions[currentIdx]?.text} = ?</p>
          </div>
          
          <div className="max-w-xs mx-auto">
            <Input 
              type="number" 
              value={inputValue} 
              onChange={e => setInputValue(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && handleNext()}
              className="h-20 text-4xl text-center font-black rounded-2xl border-4 focus:ring-primary shadow-inner"
              autoFocus
              placeholder="..."
            />
          </div>
        </CardContent>
        <CardFooter className="p-10 pt-0">
          <Button onClick={handleNext} className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl transition-transform hover:scale-[1.02]">
            {currentIdx === questions.length - 1 ? 'Finish Exam' : 'Next Step'} <Send className="ml-2 w-6 h-6" />
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 flex justify-center gap-4">
        <div className="flex items-center gap-2 px-6 py-2 bg-white rounded-full shadow-sm border text-xs font-bold text-muted-foreground uppercase">
           <ShieldAlert className="w-4 h-4 text-orange-500" /> Secure Exam Session Active
        </div>
      </div>
    </div>
  );
}
