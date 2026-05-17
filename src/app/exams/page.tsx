'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileText, CheckCircle2, Clock, Lock, ShieldAlert, PlayCircle, Trophy, AlertTriangle, Brain, Calculator, Zap, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult, ExamGroup } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { getExamTimeLimit, EXAM_DATE, isFinalExamAvailable } from '@/lib/exam-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { cn } from '@/lib/utils';

export default function ExamDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [application, setApplication] = useState<ExamApplication | null>(null);
  const [results, setExamResults] = useState<ExamResult[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && profile && profile.subscriptionStatus !== 'pro' && profile.role !== 'admin') {
      toast({ title: "Pro Access Required", description: "Online exams are exclusively for Pro members.", variant: "destructive" });
      router.push('/pricing');
    }
  }, [user, profile, authLoading, router, toast]);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    
    // Listen for application
    const appQuery = query(collection(db, "examApplications"), where("userId", "==", user.uid));
    const unsubscribeApp = onSnapshot(appQuery, 
      (snap) => {
        if (!snap.empty) {
          setApplication({ id: snap.docs[0].id, ...snap.docs[0].data() } as ExamApplication);
        }
        setLoading(false);
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'examApplications',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    // Listen for results
    const resultsQuery = query(collection(db, "examResults"), where("userId", "==", user.uid));
    const unsubscribeResults = onSnapshot(resultsQuery, 
      (snap) => {
        setExamResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'examResults',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => {
      unsubscribeApp();
      unsubscribeResults();
    };
  }, [user]);

  const handleApply = async (group: ExamGroup) => {
    if (!user || !profile) return;
    setIsApplying(true);
    
    const age = differenceInYears(new Date(), new Date(profile.dob));
    const payload = {
      userId: user.uid,
      studentName: `${profile.firstName} ${profile.surname}`,
      group,
      status: 'pending',
      appliedAt: serverTimestamp(),
      age: age,
      timeLimit: getExamTimeLimit(age)
    };

    try {
      const db = getFirestore(firebaseApp);
      addDoc(collection(db, "examApplications"), payload)
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: 'examApplications',
            operation: 'create',
            requestResourceData: payload,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      toast({ title: "Application Submitted", description: "Admin will review your form soon." });
    } catch (e: any) {
      toast({ title: "Submission Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsApplying(false);
    }
  };

  if (loading || authLoading) {
    return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-[600px] w-full" /></div>;
  }

  const isApproved = application?.status === 'approved';

  const groupDetails = [
    { 
      id: 'A', 
      title: 'Group A: Direct Mastery', 
      desc: 'Foundation level using direct bead movements without formulas.', 
      focus: ['Single & Double Digit Basic Add & Sub', 'Visual Beads Identification'],
      tools: 'Abacus Tool Allowed',
      icon: <Brain className="w-8 h-8 text-blue-500" />
    },
    { 
      id: 'B', 
      title: 'Group B: Formula Champion', 
      desc: 'Comprehensive test of all primary abacus formulas.', 
      focus: ['Small Sister & Big Brother Formulas', 'Combination Formulas Mastery', 'Single & Double Digit Arithmetic'],
      tools: 'Abacus Tool Allowed',
      icon: <Calculator className="w-8 h-8 text-green-500" />
    },
    { 
      id: 'C', 
      title: 'Group C: Anzan Expert', 
      desc: 'Advanced mental arithmetic without using any physical aids.', 
      focus: ['Single, Double & Triple Digit Mental Math', 'Pure Visual Anzan Mastery'],
      tools: 'MENTAL ONLY (No Tool)',
      icon: <Zap className="w-8 h-8 text-orange-500" />
    },
    { 
      id: 'D', 
      title: 'Group D: Elite Grandmaster', 
      desc: 'The ultimate assessment of speed and complex calculations.', 
      focus: ['Advanced Mental Add & Sub', 'Mental Multiplication', 'Mental Division'],
      tools: 'MENTAL ONLY (No Tool)',
      icon: <Trophy className="w-8 h-8 text-purple-500" />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="p-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter italic">Online Exam <span className="text-orange-400">Arena</span></h1>
              <p className="text-indigo-200 text-lg font-medium">Official certification and competitive assessment hub.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Next Final Exam</p>
              <p className="text-2xl font-black">{format(EXAM_DATE, 'MMMM do, yyyy')}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!application ? (
        <div className="space-y-8">
          <div className="text-center">
             <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">Identify Your <span className="text-primary">Mastery Group</span></h2>
             <p className="text-muted-foreground font-medium mt-2">Select the level that matches your current training progress. Review carefully before applying.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groupDetails.map((g) => (
              <Card key={g.id} className="relative group overflow-hidden border-2 hover:border-primary transition-all rounded-[2rem] shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform">
                        {g.icon}
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black">{g.title}</CardTitle>
                        <CardDescription className="font-medium">{g.desc}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={g.id === 'C' || g.id === 'D' ? "destructive" : "secondary"} className="w-full justify-center py-2 uppercase text-[10px] font-black tracking-widest rounded-xl">
                    <ShieldAlert className="w-3 h-3 mr-2" /> {g.tools}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Exam Focus Areas:</p>
                    <ul className="grid gap-2">
                        {g.focus.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                                {f}
                            </li>
                        ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={() => handleApply(g.id as ExamGroup)} 
                    disabled={isApplying} 
                    className="w-full font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl transition-transform hover:scale-[1.02]"
                  >
                    Apply for Group {g.id}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {application.status === 'pending' && (
              <Card className="bg-orange-50 border-orange-200 rounded-[2.5rem] shadow-lg border-2">
                <CardHeader className="text-center p-10">
                  <div className="mx-auto bg-orange-100 p-6 rounded-full w-fit mb-6">
                    <Clock className="w-12 h-12 text-orange-600 animate-pulse" />
                  </div>
                  <CardTitle className="text-3xl font-black text-orange-900 uppercase tracking-tight">Application Under Review</CardTitle>
                  <CardDescription className="text-orange-700 font-bold text-lg mt-4 max-w-md mx-auto">
                    You have applied for **Group {application.group}**. The administrator is currently verifying your details and mastery level.
                  </CardDescription>
                  <div className="mt-8 pt-8 border-t border-orange-100">
                     <p className="text-xs font-black uppercase text-orange-400 tracking-[0.2em]">What happens next?</p>
                     <p className="text-sm text-orange-800 mt-2">Once approved, 20 practice papers and the final arena will unlock on this page.</p>
                  </div>
                </CardHeader>
              </Card>
            )}

            {isApproved && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                    <Trophy className="text-yellow-500 w-7 h-7" /> Practice Papers (Group {application.group})
                  </h2>
                  <Badge className="bg-green-500 py-1.5 px-4 font-black">APPROVED</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const paperId = `paper-${i + 1}`;
                    const isDone = results.some(r => r.paperId === paperId && !r.isFinal);
                    return (
                      <Button 
                        key={paperId} 
                        variant={isDone ? "secondary" : "outline"} 
                        className={cn("h-24 rounded-2xl flex flex-col gap-2 font-black transition-all hover:scale-105", isDone ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200")}
                        onClick={() => router.push(`/exams/arena/${paperId}`)}
                      >
                        <span className="text-[10px] uppercase opacity-60">Practice</span>
                        <span className="text-2xl">#{i + 1}</span>
                        {isDone && <CheckCircle2 className="w-4 h-4" />}
                      </Button>
                    );
                  })}
                </div>

                <div className="pt-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 mb-6">
                    <ShieldAlert className="text-red-500 w-7 h-7" /> Final Official Exam
                  </h2>
                  <Card className={cn("rounded-[2.5rem] border-4 overflow-hidden shadow-2xl transition-all", isFinalExamAvailable() ? "border-orange-500" : "border-slate-200 grayscale opacity-60")}>
                    <CardHeader className="bg-slate-900 text-white p-8">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Grand Final 2026</CardTitle>
                          <CardDescription className="text-slate-400 font-bold">Group {application.group} Certification</CardDescription>
                        </div>
                        {!isFinalExamAvailable() && <Lock className="w-8 h-8 text-slate-500" />}
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Time Limit</p>
                          <p className="text-xl font-bold">{application.timeLimit / 60} Minutes</p>
                        </div>
                        <div className="bg-muted p-4 rounded-2xl text-center">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Questions</p>
                          <p className="text-xl font-bold">150 Questions</p>
                        </div>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="text-orange-600 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-orange-800 leading-relaxed">
                          <strong>Official Rule:</strong> Final Exam results will only be visible to the Admin. One attempt only. Ensure your connection is stable before starting.
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                      <Button 
                        size="lg" 
                        className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl"
                        disabled={!isFinalExamAvailable() || results.some(r => r.isFinal)}
                        onClick={() => router.push('/exams/arena/final')}
                      >
                        {results.some(r => r.isFinal) ? 'ALREADY ATTEMPTED' : (isFinalExamAvailable() ? 'START FINAL EXAM' : 'OPENS JULY 4TH')}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
             <Card className="rounded-[2rem] shadow-lg border-none bg-indigo-50/50">
               <CardHeader><CardTitle className="text-xl font-black uppercase flex items-center gap-2 tracking-tight"><Clock className="w-5 h-5 text-indigo-600" /> Exam Rules</CardTitle></CardHeader>
               <CardContent className="space-y-6 text-sm font-bold text-indigo-900 leading-relaxed">
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-indigo-400 tracking-widest">Timing Policy</p>
                    <ul className="space-y-1">
                        <li className="flex justify-between"><span>6-8 Years:</span> <span>9 Mins</span></li>
                        <li className="flex justify-between"><span>9-11 Years:</span> <span>8 Mins</span></li>
                        <li className="flex justify-between"><span>12-14 Years:</span> <span>7 Mins</span></li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase text-indigo-400 tracking-widest">Tool Usage</p>
                    <p>• Group A & B students must use a physical abacus tool or our digital tool.</p>
                    <p>• Group C & D must calculate mentally (Anzan) without any visual aids.</p>
                  </div>
                  <p>• Practice papers can be retaken unlimited times to improve your speed.</p>
               </CardContent>
             </Card>

             <Card className="rounded-[2rem] shadow-lg border-none">
                <CardHeader><CardTitle className="text-xl font-black uppercase tracking-tight">My Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {results.length > 0 ? results.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-4 bg-muted/50 rounded-2xl border border-muted">
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{r.paperId === 'final' ? 'FINAL EXAM' : `Practice ${r.paperId.split('-')[1]}`}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">{format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'MMM d, h:mm a')}</p>
                      </div>
                      <div className="text-right">
                        {r.isFinal ? (
                           <Badge className="bg-slate-900 text-[10px] font-black">SUBMITTED</Badge>
                        ) : (
                          <p className="text-lg font-black text-primary">{r.score}/{r.totalQuestions}</p>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                        <Target className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-bold text-xs uppercase italic">No attempts recorded</p>
                    </div>
                  )}
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
