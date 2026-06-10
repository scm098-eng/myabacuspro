
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lock, ShieldAlert, Trophy, FileEdit, Award, Loader2, Timer, HelpCircle, CheckCircle2, ChevronRight, Download, Medal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, onSnapshot, doc, orderBy, getDocs, limit } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult, ExamGroup } from '@/types';
import { format, parseISO, isSameDay } from 'date-fns';
import { isFinalExamAvailable, getExamTimeLimit, calculateAge } from '@/lib/exam-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import AchievementModal, { AchievementType } from '@/components/AchievementModal';

export default function ExamDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [application, setApplication] = useState<ExamApplication | null>(null);
  const [results, setExamResults] = useState<ExamResult[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isWinner, setIsWinner] = useState(false);
  
  const [schedule, setSchedule] = useState<{ date: string, start: Date, end: Date, lastApplyDate?: string, isActive?: boolean, resultsDeclared?: boolean } | null>(null);

  const [showCertificate, setShowCertificate] = useState(false);
  const [certData, setCertData] = useState<{ type: AchievementType, title: string, score: string, date: string } | null>(null);

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
    
    const unsubSchedule = onSnapshot(doc(db, "stats", "examSchedule"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.date) {
           const dateString = data.date;
           setSchedule({
             date: dateString,
             start: new Date(`${dateString}T${data.startTime || '12:30'}:00`),
             end: new Date(`${dateString}T${data.endTime || '16:00'}:00`),
             lastApplyDate: data.lastApplyDate,
             isActive: data.isActive !== false,
             resultsDeclared: data.resultsDeclared === true
           });
        }
      }
    }, async (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'stats/examSchedule', operation: 'get' }));
    });
    
    const appRef = doc(db, "examApplications", user.uid);
    const unsubscribeApp = onSnapshot(appRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const rawGroup = data.group || data.masteryGroup || data.masteryLevel || '?';
          const normalizedStatus = (data.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected';
          setApplication({ id: snap.id, ...data, group: String(rawGroup).toUpperCase() as ExamGroup, status: normalizedStatus } as ExamApplication);
        } else { setApplication(null); }
        setLoading(false);
      },
      async (serverError) => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `examApplications/${user.uid}`, operation: 'get' })); }
    );

    const resultsQuery = query(collection(db, "examResults"), where("userId", "==", user.uid), orderBy("submittedAt", "desc"));
    const unsubscribeResults = onSnapshot(resultsQuery, (snap) => {
        setExamResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
      },
      async (serverError) => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examResults', operation: 'list' })); }
    );

    return () => { unsubSchedule(); unsubscribeApp(); unsubscribeResults(); };
  }, [user]);

  const finalAttempt = useMemo(() => {
    if (!application || results.length === 0) return null;
    return results.find(r => r.isFinal === true);
  }, [application, results]);

  useEffect(() => {
    if (schedule?.resultsDeclared && finalAttempt) {
      const checkWinnerStatus = async () => {
        const db = getFirestore(firebaseApp);
        const q = query(
          collection(db, "examResults"),
          where("group", "==", finalAttempt.group),
          where("isFinal", "==", true),
          orderBy("score", "desc"),
          orderBy("timeLeft", "desc"),
          limit(1)
        );
        try {
          const snap = await getDocs(q);
          if (!snap.empty && snap.docs[0].id === finalAttempt.id) {
            setIsWinner(true);
          } else {
            setIsWinner(false);
          }
        } catch (e) {
          console.warn("Winner check failed:", e);
        }
      };
      checkWinnerStatus();
    } else {
      setIsWinner(false);
    }
  }, [schedule?.resultsDeclared, finalAttempt]);

  const handleApply = async (group: ExamGroup) => {
    if (!user || !profile) return;
    setIsApplying(true);
    const applyFn = httpsCallable(getFunctions(firebaseApp), 'applyToExam');
    applyFn({ masteryGroup: group }).then(() => {
        toast({ title: "Application Submitted" });
        setIsApplying(false);
      }).catch((e) => {
        setIsApplying(false);
        toast({ title: "Application Failed", description: e.message, variant: "destructive" });
      });
  };

  const handleGetCertificate = (res: ExamResult, forWinner: boolean) => {
    setCertData({
      type: forWinner ? 'exam_winner' : 'exam_participation',
      title: forWinner ? `GROUP ${res.group} 1st RANK ACHIEVER` : `GROUP ${res.group} PARTICIPANT`,
      score: `${res.score}/${res.totalQuestions} (${res.accuracy.toFixed(1)}%)`,
      date: format(res.submittedAt?.toDate ? res.submittedAt.toDate() : new Date(), 'MMMM do, yyyy')
    });
    setShowCertificate(true);
  };

  const isApproved = useMemo(() => application?.status === 'approved', [application]);

  const displayedResults = useMemo(() => {
    if (schedule?.resultsDeclared) {
        return results.filter(r => r.isFinal);
    }
    return results;
  }, [results, schedule?.resultsDeclared]);

  const examEnded = useMemo(() => {
    if (!schedule || isNaN(schedule.end.getTime())) return false;
    if (schedule.isActive === false) return true;
    return new Date() > schedule.end;
  }, [schedule]);

  const examOpen = useMemo(() => {
    if (!schedule || isNaN(schedule.start.getTime()) || isNaN(schedule.end.getTime())) return false;
    if (schedule.isActive === false) return false;
    return isFinalExamAvailable(schedule.start, schedule.end);
  }, [schedule]);

  const openingMessage = useMemo(() => {
    if (!schedule || schedule.isActive === false) return 'EXAM CLOSED';
    if (isSameDay(new Date(), parseISO(schedule.date))) return `OPENS TODAY AT ${format(schedule.start, 'p')}`;
    return `OPENS ON ${format(parseISO(schedule.date), 'MMMM do')} AT ${format(schedule.start, 'p')}`;
  }, [schedule]);

  const timeLimitDisplay = useMemo(() => {
    if (!profile) return "10 Minutes";
    const age = calculateAge(profile.dob);
    const seconds = getExamTimeLimit(age);
    return `${Math.floor(seconds / 60)} Minutes`;
  }, [profile]);

  if (loading || authLoading) return <div className="p-8 max-w-6xl mx-auto"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {showCertificate && certData && (
        <AchievementModal 
          type={certData.type}
          studentName={`${profile?.firstName || ''} ${profile?.surname || ''}`}
          title={certData.title}
          score={certData.score}
          date={certData.date}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white overflow-hidden rounded-[2.5rem]">
        <CardHeader className="p-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter italic">Online Exam <span className="text-orange-400">Arena</span></h1>
              <p className="text-indigo-200 text-lg font-medium">Official certification and competitive assessment hub.</p>
            </div>
            <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-md text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Next Final Exam</p>
              <p className="text-2xl font-black">{(schedule && !schedule.resultsDeclared) ? format(parseISO(schedule.date), 'MMMM do, yyyy') : 'Stay Tuned'}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {schedule?.resultsDeclared && finalAttempt && (
        <Card className="bg-indigo-600 border-none shadow-2xl rounded-[2rem] overflow-hidden animate-in zoom-in-95 duration-700">
           <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-5 rounded-full shadow-lg"><Award className="w-12 h-12 text-yellow-300 drop-shadow-sm" /></div>
                <div className="space-y-1 text-center md:text-left">
                  <h2 className="text-3xl font-black uppercase tracking-tighter italic">Official Certification Ready!</h2>
                  <p className="font-bold opacity-80 text-lg">
                    {isWinner ? "Incredible! You secured the 1st Rank. Claim your honors below." : "Your Group results are official. Claim your prestigious award now."}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0 w-full md:w-auto justify-center md:justify-end p-2">
                {isWinner && (
                  <Button 
                    onClick={() => handleGetCertificate(finalAttempt, true)}
                    className="bg-yellow-400 text-indigo-950 hover:bg-yellow-500 font-black h-12 sm:h-14 px-5 sm:px-8 rounded-2xl text-xs sm:text-base shadow-xl transition-transform hover:scale-105 border-none uppercase tracking-widest flex-1 md:flex-none"
                  >
                    <Medal className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Rank 1 Cert
                  </Button>
                )}
                <Button 
                  onClick={() => handleGetCertificate(finalAttempt, false)}
                  variant="outline"
                  className="bg-white/10 text-white hover:bg-white/20 font-black h-12 sm:h-14 px-5 sm:px-8 rounded-2xl text-xs sm:text-base shadow-xl transition-transform hover:scale-105 border-2 border-white/20 uppercase tracking-widest flex-1 md:flex-none"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Participation
                </Button>
              </div>
           </CardContent>
        </Card>
      )}

      {!application ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="text-center">
             <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">Identify Your <span className="text-primary">Mastery Group</span></h2>
             <p className="text-muted-foreground font-medium mt-2">Select the level that matches your current training progress.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[{id:'A',t:'Direct Mastery',i:<ShieldAlert/>},{id:'B',t:'Formula Champion',i:<ShieldAlert/>},{id:'C',t:'Anzan Expert',i:<ShieldAlert/>},{id:'D',t:'Elite Grandmaster',i:<Trophy/>}].map((g) => (
              <Card key={g.id} className="relative group overflow-hidden border-2 hover:border-primary transition-all rounded-[2rem] shadow-lg bg-white/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform text-primary">{g.i}</div>
                    <div><CardTitle className="text-2xl font-black">Group {g.id}: {g.t}</CardTitle></div>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button onClick={() => handleApply(g.id as ExamGroup)} disabled={isApplying} className="w-full font-black uppercase tracking-widest h-14 rounded-2xl shadow-xl">
                    Apply for Group {g.id}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isApproved && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2"><Trophy className="text-yellow-500 w-7 h-7" /> Practice Papers (Group {application.group})</h2>
                  <Badge className="bg-green-500 py-1.5 px-4 font-black border-none">APPROVED</Badge>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Button 
                      key={i} 
                      variant="outline" 
                      disabled={examOpen || !!schedule?.resultsDeclared}
                      className={cn(
                        "h-24 rounded-2xl flex flex-col gap-2 font-black transition-all",
                        (!examOpen && !schedule?.resultsDeclared) ? "hover:scale-105" : "opacity-50 cursor-not-allowed grayscale bg-muted/50"
                      )} 
                      onClick={() => router.push(`/exams/arena/paper-${i + 1}`)}
                    >
                      {(examOpen || schedule?.resultsDeclared) ? (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <>
                          <span className="text-[10px] uppercase opacity-60">Practice</span>
                          <span className="text-2xl">#{i + 1}</span>
                        </>
                      )}
                    </Button>
                  ))}
                </div>

                <div className="pt-8">
                   <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 mb-6"><ShieldAlert className="text-red-500 w-7 h-7" /> Final Official Exam</h2>
                   <Card className={cn("rounded-[2.5rem] border-4 overflow-hidden shadow-2xl transition-all", (examOpen && !finalAttempt) ? "border-orange-500" : "border-slate-200 grayscale opacity-60")}>
                    <CardHeader className="bg-slate-900 text-white p-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter">Grand Final 2026</CardTitle>
                          <div className="text-slate-400 font-bold mt-1 flex items-center gap-2">
                             Group {application.group} Certification
                             <Separator orientation="vertical" className="h-3 bg-white/20" />
                             <span className="flex items-center gap-1 text-orange-400"><HelpCircle className="w-3 h-3" /> 150 Questions</span>
                             <Separator orientation="vertical" className="h-3 bg-white/20" />
                             <span className="flex items-center gap-1 text-sky-400"><Timer className="w-3 h-3" /> {timeLimitDisplay}</span>
                          </div>
                        </div>
                        <Lock className="w-10 h-10 text-slate-500" />
                      </div>
                    </CardHeader>
                    <CardFooter className="p-10 bg-slate-50 border-t">
                      <Button size="lg" className="w-full h-20 text-2xl font-black uppercase tracking-widest rounded-[1.5rem] shadow-2xl transition-transform hover:scale-[1.02] active:scale-95" disabled={!examOpen || !!finalAttempt} onClick={() => router.push('/exams/arena/final')}>
                        {finalAttempt ? 'ATTEMPTED' : examOpen ? 'START FINAL EXAM' : examEnded ? 'EXAM CLOSED' : openingMessage}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}
            {application.status === 'pending' && <Card className="bg-orange-50 border-orange-200 p-10 rounded-[2.5rem] text-center shadow-lg"><CardTitle className="text-2xl font-black uppercase text-orange-900">Application Pending</CardTitle><p className="text-orange-700 font-bold mt-4">We are reviewing your Group {application.group} application.</p></Card>}
          </div>

          <div className="space-y-8">
             <Card className="rounded-[2rem] shadow-lg border-none">
                <CardHeader><CardTitle className="text-xl font-black uppercase tracking-tight">My Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {displayedResults.length > 0 ? displayedResults.map(r => {
                    const hideResult = r.isFinal && !schedule?.resultsDeclared;
                    return (
                      <div key={r.id} className="flex flex-col gap-3 p-4 bg-muted/50 rounded-2xl border border-muted group transition-all hover:bg-muted">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {r.isFinal ? <ShieldAlert className="w-3 h-3 text-orange-500" /> : <FileEdit className="w-3 h-3 text-slate-400" />}
                              <p className="text-xs font-black uppercase tracking-tight">{r.paperId === 'final' ? 'FINAL EXAM' : `Practice ${r.paperId.split('-')[1]}`}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-bold">{format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'MMM d, h:mm a')}</p>
                          </div>
                          <div className="text-right">
                            {hideResult ? (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 font-black text-[9px]">AWAITING RESULT</Badge>
                            ) : (
                              <>
                                <p className="text-2xl font-black text-primary leading-none">{r.score}/{r.totalQuestions}</p>
                                <p className="text-[8px] font-black uppercase text-muted-foreground mt-1 tracking-widest">Acc: {r.accuracy.toFixed(1)}%</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }) : <div className="text-center py-10 opacity-30 italic font-bold uppercase text-xs">No attempts recorded</div>}
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
