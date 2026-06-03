
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Lock, ShieldAlert, Trophy, AlertTriangle, Brain, Calculator, Zap, Target, RefreshCcw, XCircle, FileEdit, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, onSnapshot, doc, deleteDoc, orderBy, getDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult, ExamGroup } from '@/types';
import { format, parseISO, isSameDay } from 'date-fns';
import { isFinalExamAvailable } from '@/lib/exam-utils';
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [schedule, setSchedule] = useState<{ date: string, start: Date, end: Date, lastApplyDate?: string } | null>(null);

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
    
    const fetchSchedule = async () => {
      try {
        const snap = await getDoc(doc(db, "stats", "examSchedule"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.date) {
             const dateString = data.date;
             setSchedule({
               date: dateString,
               start: new Date(`${dateString}T${data.startTime || '12:30'}:00`),
               end: new Date(`${dateString}T${data.endTime || '16:00'}:00`),
               lastApplyDate: data.lastApplyDate
             });
          }
        }
      } catch (error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: 'stats/examSchedule', 
          operation: 'get' 
        }));
      }
    };
    fetchSchedule();
    
    const appQuery = query(collection(db, "examApplications"), where("userId", "==", user.uid));
    const unsubscribeApp = onSnapshot(appQuery, 
      (snap) => {
        if (!snap.empty) {
          setApplication({ id: snap.docs[0].id, ...snap.docs[0].data() } as ExamApplication);
        } else {
          setApplication(null);
        }
        setLoading(false);
      },
      async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examApplications', operation: 'list' }));
      }
    );

    const resultsQuery = query(collection(db, "examResults"), where("userId", "==", user.uid), orderBy("submittedAt", "desc"));
    const unsubscribeResults = onSnapshot(resultsQuery, 
      (snap) => {
        setExamResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
      },
      async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examResults', operation: 'list' }));
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
    
    const applyFn = httpsCallable(getFunctions(firebaseApp), 'applyToExam');
    applyFn({ masteryGroup: group })
      .then(() => {
        toast({ title: "Application Submitted", description: "Admin will review your form soon." });
        setIsApplying(false);
      })
      .catch((e) => {
        setIsApplying(false);
        toast({ title: "Application Failed", description: e.message, variant: "destructive" });
      });
  };

  const handleReapply = async () => {
    if (!application || !user) return;
    setIsDeleting(true);
    const db = getFirestore(firebaseApp);
    deleteDoc(doc(db, "examApplications", application.id))
      .then(() => {
        toast({ title: "Ready to re-apply", description: "Choose your group and submit again." });
        setIsDeleting(false);
      })
      .catch(async (serverError) => {
        setIsDeleting(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `examApplications/${application.id}`,
          operation: 'delete',
        }));
      });
  };

  const isApproved = application?.status === 'approved';
  const isRejected = application?.status === 'rejected';

  const hasFinishedFinal = useMemo(() => {
    if (!application || results.length === 0) return false;
    const appliedTime = application.appliedAt?.seconds || 0;
    return results.some(r => r.isFinal && (r.submittedAt?.seconds || 0) > appliedTime);
  }, [application, results]);

  const examEnded = useMemo(() => {
    if (!schedule || isNaN(schedule.end.getTime())) return false;
    return new Date() > schedule.end;
  }, [schedule]);

  const examOpen = useMemo(() => {
    if (!schedule || isNaN(schedule.start.getTime()) || isNaN(schedule.end.getTime())) return false;
    return isFinalExamAvailable(schedule.start, schedule.end);
  }, [schedule]);

  const startTimeStr = useMemo(() => {
    if (!schedule || isNaN(schedule.start.getTime())) return '';
    return schedule.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, [schedule]);

  const isTodayDate = useMemo(() => {
    if (!schedule) return false;
    return isSameDay(new Date(), parseISO(schedule.date));
  }, [schedule]);

  const openingMessage = useMemo(() => {
    if (!schedule) return 'EXAM CLOSED';
    if (!startTimeStr) return 'OPENS TODAY';
    
    if (isTodayDate) {
      return `OPENS TODAY AT ${startTimeStr}`;
    } else {
      try {
        const formattedDate = format(parseISO(schedule.date), 'MMMM do');
        return `OPENS ON ${formattedDate} AT ${startTimeStr}`;
      } catch {
        return `OPENS AT ${startTimeStr}`;
      }
    }
  }, [schedule, isTodayDate, startTimeStr]);

  const isRegistrationClosed = useMemo(() => {
    if (!schedule?.lastApplyDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return today > schedule.lastApplyDate;
  }, [schedule]);

  if (loading || authLoading) {
    return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  }

  const groupDetails = [
    { id: 'A' as ExamGroup, title: 'Group A: Direct Mastery', desc: 'Foundation level using direct bead movements.', focus: ['1 & 2 Digit Basic Add & Sub', 'Visual Beads Identification'], tools: 'Abacus Tool Allowed', icon: <Brain className="w-8 h-8 text-blue-500" /> },
    { id: 'B' as ExamGroup, title: 'Group B: Formula Champion', desc: 'Comprehensive test of all primary formulas.', focus: ['All Formulas (S.S, B.B, Combination)', '1 & 2 Digit Arithmetic'], tools: 'Abacus Tool Allowed', icon: <Calculator className="w-8 h-8 text-green-500" /> },
    { id: 'C' as ExamGroup, title: 'Group C: Anzan Expert', desc: 'Advanced mental arithmetic without aids.', focus: ['1, 2 & 3 Digit Mental Math', 'Pure Visual Anzan Mastery'], tools: 'MENTAL ONLY (No Tool)', icon: <Zap className="w-8 h-8 text-orange-500" /> },
    { id: 'D' as ExamGroup, title: 'Group D: Elite Grandmaster', desc: 'The ultimate assessment of speed.', focus: ['Advanced Mental Add & Sub', 'Mental Multiplication', 'Mental Division'], tools: 'MENTAL ONLY (No Tool)', icon: <Trophy className="w-8 h-8 text-purple-500" /> }
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
              <p className="text-2xl font-black">{schedule ? format(parseISO(schedule.date), 'MMMM do, yyyy') : 'Stay Tuned'}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!application ? (
        <div className="space-y-8">
          <div className="text-center">
             <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">Identify Your <span className="text-primary">Mastery Group</span></h2>
             <p className="text-muted-foreground font-medium mt-2">Select the level that matches your current training progress.</p>
          </div>

          {schedule?.lastApplyDate && (
            <div className={cn(
              "max-w-md mx-auto p-4 rounded-2xl text-center font-bold text-sm shadow-sm border-2",
              isRegistrationClosed ? "bg-red-50 border-red-100 text-red-700" : "bg-blue-50 border-blue-100 text-blue-700"
            )}>
              {isRegistrationClosed ? "⚠️ Registration closed." : `⏳ Last date to apply: ${format(parseISO(schedule.lastApplyDate), 'PPP')}`}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {groupDetails.map((g) => (
              <Card key={g.id} className="relative group overflow-hidden border-2 hover:border-primary transition-all rounded-[2rem] shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform">{g.icon}</div>
                    <div><CardTitle className="text-2xl font-black">{g.title}</CardTitle><CardDescription className="font-medium">{g.desc}</CardDescription></div>
                  </div>
                  <Badge variant={g.id === 'C' || g.id === 'D' ? "destructive" : "secondary"} className="w-full justify-center py-2 uppercase text-[10px] font-black tracking-widest rounded-xl">
                    <ShieldAlert className="w-3 h-3 mr-2" /> {g.tools}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Focus Areas:</p>
                    <ul className="grid gap-2">
                        {g.focus.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm font-bold text-slate-700">
                                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /> {f}
                            </li>
                        ))}
                    </ul>
                  </div>
                  <Button 
                    onClick={() => handleApply(g.id)} 
                    disabled={isApplying || isRegistrationClosed} 
                    className="w-full font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl transition-transform hover:scale-[1.02]"
                  >
                    {isRegistrationClosed ? 'Registration Closed' : `Apply for Group ${g.id}`}
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
                  <div className="mx-auto bg-orange-100 p-6 rounded-full w-fit mb-6"><Clock className="w-12 h-12 text-orange-600 animate-pulse" /></div>
                  <CardTitle className="text-3xl font-black text-orange-900 uppercase tracking-tight">Application Under Review</CardTitle>
                  <CardDescription className="text-orange-700 font-bold text-lg mt-4 max-w-md mx-auto">
                    You have applied for **Group {application.group}**. The administrator is currently verifying your details.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {isRejected && (
              <Card className="bg-red-50 border-red-200 rounded-[2.5rem] shadow-lg border-2">
                <CardHeader className="text-center p-10">
                  <div className="mx-auto bg-red-100 p-6 rounded-full w-fit mb-6"><XCircle className="w-12 h-12 text-red-600" /></div>
                  <CardTitle className="text-3xl font-black text-red-900 uppercase tracking-tight">Application Rejected</CardTitle>
                  <div className="mt-8 pt-8 border-t border-red-100 flex flex-col items-center gap-4">
                     <Button onClick={handleReapply} disabled={isDeleting} className="bg-red-600 hover:bg-red-700 h-14 px-10 font-black uppercase tracking-widest rounded-2xl shadow-lg">
                        {isDeleting ? <Loader2 className="animate-spin mr-2" /> : <RefreshCcw className="mr-2" />} Re-apply
                     </Button>
                  </div>
                </CardHeader>
              </Card>
            )}

            {isApproved && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><Trophy className="text-yellow-500 w-7 h-7" /> Practice Papers (Group {application.group})</h2>
                  <Badge className={cn("py-1.5 px-4 font-black", (hasFinishedFinal || examEnded) ? "bg-slate-400" : "bg-green-500")}>
                    {hasFinishedFinal ? 'CYCLE COMPLETE' : examEnded ? 'EXAM CLOSED' : 'APPROVED'}
                  </Badge>
                </div>
                
                {(hasFinishedFinal || examEnded) && (
                  <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-3xl flex items-start gap-4">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-1" />
                    <div>
                      <p className="text-amber-900 font-black uppercase tracking-tight text-sm">Practice Papers Locked</p>
                      <p className="text-amber-700 text-xs font-bold leading-relaxed">
                        Practice papers are disabled for this cycle.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const paperId = `paper-${i + 1}`;
                    const isDone = results.some(r => r.paperId === paperId && !r.isFinal);
                    const isLocked = hasFinishedFinal || examEnded || !schedule;

                    return (
                      <Button 
                        key={paperId} 
                        variant={isDone ? "secondary" : "outline"} 
                        disabled={isLocked}
                        className={cn(
                          "h-24 rounded-2xl flex flex-col gap-2 font-black transition-all relative", 
                          !isLocked && "hover:scale-105",
                          isLocked && "opacity-50 bg-slate-100 cursor-not-allowed border-slate-200 text-slate-400",
                          (isDone && !isLocked) && "border-green-500 bg-green-50 text-green-700"
                        )} 
                        onClick={() => !isLocked && router.push(`/exams/arena/${paperId}`)}
                      >
                        <span className="text-[10px] uppercase opacity-60">Practice</span>
                        <span className="text-2xl">#{i + 1}</span>
                        {isDone && !isLocked && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {isLocked && <Lock className="w-4 h-4 text-slate-400 mt-1" />}
                      </Button>
                    );
                  })}
                </div>

                <div className="pt-8">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 mb-6"><ShieldAlert className="text-red-500 w-7 h-7" /> Final Official Exam</h2>
                  <Card className={cn("rounded-[2.5rem] border-4 overflow-hidden shadow-2xl transition-all", examOpen && !hasFinishedFinal ? "border-orange-500" : "border-slate-200 grayscale opacity-60")}>
                    <CardHeader className="bg-slate-900 text-white p-8">
                      <div className="flex justify-between items-center">
                        <div><CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Grand Final 2026</CardTitle><CardDescription className="text-slate-400 font-bold">Group {application.group} Certification</CardDescription></div>
                        {!examOpen && !hasFinishedFinal && <Lock className="w-8 h-8 text-slate-500" />}
                        {hasFinishedFinal && <CheckCircle2 className="w-10 h-10 text-green-400" />}
                      </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted p-4 rounded-2xl text-center"><p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Time Limit</p><p className="text-xl font-bold">{application.timeLimit / 60} Mins</p></div>
                        <div className="bg-muted p-4 rounded-2xl text-center"><p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Questions</p><p className="text-xl font-bold">150 Questions</p></div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0">
                      <Button 
                        size="lg" 
                        className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl" 
                        disabled={!examOpen || hasFinishedFinal} 
                        onClick={() => router.push('/exams/arena/final')}
                      >
                        {hasFinishedFinal ? 'ATTEMPTED' : examOpen ? 'START FINAL EXAM' : examEnded ? 'EXAM CLOSED' : openingMessage}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
             <Card className="rounded-[2rem] shadow-lg border-none">
                <CardHeader><CardTitle className="text-xl font-black uppercase tracking-tight">My Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {results.length > 0 ? results.map(r => (
                    <div key={r.id} className="flex flex-col gap-3 p-4 bg-muted/50 rounded-2xl border border-muted transition-all hover:bg-muted/80">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2"><FileEdit className="w-3 h-3 text-indigo-500" /><p className="text-xs font-black uppercase tracking-tight">{r.paperId === 'final' ? 'FINAL EXAM' : `Practice ${r.paperId.split('-')[1]}`}</p></div>
                          <p className="text-[10px] text-muted-foreground font-bold">{format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'MMM d, h:mm a')}</p>
                        </div>
                        <div className="text-right">
                          {r.isFinal && !r.resultDeclared ? <Badge className="bg-orange-500 text-[10px] font-black py-1 px-3">AUDIT PENDING</Badge> : <div className="flex flex-col items-end"><p className="text-2xl font-black text-primary leading-none">{r.score}/{r.totalQuestions}</p><p className="text-[8px] font-black uppercase text-muted-foreground mt-1 tracking-widest">Accuracy: {r.accuracy.toFixed(1)}%</p></div>}
                        </div>
                      </div>
                    </div>
                  )) : <div className="text-center py-10"><Target className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" /><p className="text-muted-foreground font-bold text-xs uppercase italic">No attempts recorded</p></div>}
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
