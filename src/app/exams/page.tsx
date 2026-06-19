'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Lock, ShieldAlert, Trophy, FileEdit, Award, Loader2, Timer, HelpCircle, CheckCircle2, ChevronRight, Download, Medal, ScrollText, Brain, MonitorOff, Calculator, Zap, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, query, where, onSnapshot, doc, orderBy, getDocs, limit } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult, ExamGroup } from '@/types';
import { format, parseISO, isSameDay, isBefore, isAfter } from 'date-fns';
import { isFinalExamAvailable, getExamTimeLimit, calculateAge } from '@/lib/exam-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import AchievementModal, { AchievementType } from '@/components/AchievementModal';

interface GroupConfig {
    title: string;
    description: string;
    focusAreas: string[];
    toolAllowed: boolean;
    icon: React.ReactNode;
}

const EXAM_GROUPS: Record<ExamGroup, GroupConfig> = {
  'A': { 
    title: 'Direct Mastery', 
    description: 'Foundation level using direct bead movements.',
    focusAreas: ['1 & 2 Digit Basic Add & Sub', 'Visual Beads Identification'],
    toolAllowed: true,
    icon: <Brain className="w-6 h-6" /> 
  },
  'B': { 
    title: 'Formula Champion', 
    description: 'Comprehensive test of all primary formulas.',
    focusAreas: ['All Formulas (S.S, B.B, Combination)', '1 & 2 Digit Arithmetic'],
    toolAllowed: true,
    icon: <Calculator className="w-6 h-6" /> 
  },
  'C': { 
    title: 'Anzan Expert', 
    description: 'Advanced mental arithmetic without aids.',
    focusAreas: ['Mentally perform 1, 2 & 3 Digit Arithmetic', 'Without using any tool'],
    toolAllowed: false,
    icon: <Zap className="w-6 h-6" /> 
  },
  'D': { 
    title: 'Elite Grandmaster', 
    description: 'The ultimate assessment of speed.',
    focusAreas: ['Fast multi-digit calculation', 'Multiplication & Division mastery'],
    toolAllowed: false,
    icon: <Trophy className="w-6 h-6" /> 
  },
  'E': { 
    title: 'Mental Math Legend', 
    description: 'The summit of human calculation ability.',
    focusAreas: ['Advanced 1, 2 & 3 Digit Mental Arithmetic', 'Advanced Multiplication & Division', 'Powers (Square, Cube)'],
    toolAllowed: false,
    icon: <Sparkles className="w-6 h-6" /> 
  }
};

export default function ExamDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [application, setApplication] = useState<ExamApplication | null>(null);
  const [results, setExamResults] = useState<ExamResult[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [schedule, setSchedule] = useState<any | null>(null);

  const [showCertificate, setShowCertificate] = useState(false);
  const [certData, setCertData] = useState<{ 
    type: AchievementType, 
    title: string, 
    score: string, 
    date: string, 
    rank?: number,
    groupName?: string 
  } | null>(null);

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
    
    const unsubSchedule = onSnapshot(doc(db, "stats", "leaderboard"), (snap) => {
        if (snap.exists()) {
          // data loaded
        }
      }, async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'stats/leaderboard', operation: 'get' }));
      }
    );

    const unsubExamSchedule = onSnapshot(doc(db, "stats", "examSchedule"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.date) {
           const dateString = data.date;
           setSchedule({
             ...data,
             start: new Date(`${dateString}T${data.startTime || '12:30'}:00`),
             end: new Date(`${dateString}T${data.endTime || '16:00'}:00`),
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

    return () => { unsubSchedule(); unsubExamSchedule(); unsubscribeApp(); unsubscribeResults(); };
  }, [user]);

  const finalAttempt = useMemo(() => {
    if (results.length === 0) return null;
    return results.find(r => r.isFinal === true) || null;
  }, [results]);

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

  const handleGetCertificate = (res: ExamResult, isRankCert: boolean) => {
    const groupInfo = EXAM_GROUPS[res.group];
    const groupDisplay = `Group ${res.group}: ${groupInfo?.title || ''}`;

    setCertData({
      type: isRankCert ? 'exam_winner' : 'exam_participation',
      title: isRankCert ? `RANK ${res.rank} ACHIEVER` : groupDisplay,
      score: `${res.score}/${res.totalQuestions} (${res.accuracy.toFixed(1)}%)`,
      date: format(res.submittedAt?.toDate ? res.submittedAt.toDate() : new Date(), 'MMMM do, yyyy'),
      rank: isRankCert ? res.rank : undefined,
      groupName: res.group
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
    if (!schedule || isNaN(schedule.end?.getTime())) return false;
    if (schedule.isActive === false) return true;
    return new Date() > schedule.end;
  }, [schedule]);

  const examOpen = useMemo(() => {
    if (!schedule || isNaN(schedule.start?.getTime()) || isNaN(schedule.end?.getTime())) return false;
    if (schedule.isActive === false) return false;
    return isFinalExamAvailable(schedule.start, schedule.end);
  }, [schedule]);

  const openingMessage = useMemo(() => {
    if (!schedule || schedule.isActive === false) return 'EXAM CLOSED';
    if (isSameDay(new Date(), parseISO(schedule.date))) return `OPENS TODAY AT ${format(schedule.start, 'p')}`;
    return `OPENS ON ${format(parseISO(schedule.date), 'MMMM do')} AT ${format(schedule.start, 'p')}`;
  }, [schedule]);

  const timeLimitDisplay = useMemo(() => {
    if (!profile) return "9 Minutes";
    const age = calculateAge(profile.dob);
    const seconds = getExamTimeLimit(age);
    return `${Math.floor(seconds / 60)} Minutes`;
  }, [profile]);

  const showApplyDeadline = useMemo(() => {
    if (!schedule?.lastApplyDate) return false;
    // Hide if student is already approved for a group
    if (application && application.status === 'approved') return false;
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return todayStr <= schedule.lastApplyDate;
  }, [schedule, application]);

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
          rank={certData.rank}
          groupName={certData.groupName}
          onClose={() => setShowCertificate(false)}
        />
      )}

      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl sm:text-5xl font-black font-headline uppercase tracking-tight text-slate-900 leading-none">IDENTIFY YOUR <span className="text-primary italic">MASTERY GROUP</span></h1>
        <p className="text-muted-foreground font-bold text-lg">
          {application ? "Group Selected" : "Select the level that matches your current training progress."}
        </p>
        
        {showApplyDeadline && schedule?.lastApplyDate && (
          <div className="mt-8">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 px-10 py-3 rounded-2xl border-2 border-blue-100 font-bold gap-2 text-base">
              ⌛ Last date to apply: {format(parseISO(schedule.lastApplyDate), 'MMMM do, yyyy')}
            </Badge>
          </div>
        )}
      </div>

      {schedule?.resultsDeclared && finalAttempt && (
        <Card className="bg-indigo-600 border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700">
           <CardContent className="p-8 flex flex-col lg:flex-row items-center justify-between gap-8 text-white">
              <div className="flex items-center gap-6">
                <div className="bg-white/20 p-5 rounded-full shadow-lg"><Award className="w-12 h-12 text-yellow-300 drop-shadow-sm" /></div>
                <div className="space-y-1 text-center md:text-left">
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter italic leading-none">Official Certification Ready!</h2>
                  <p className="font-bold opacity-80 text-lg mt-2">
                    { (finalAttempt.rank !== undefined) ? `Outstanding achievement! You secured Rank ${finalAttempt.rank}.` : "Your results are official. Claim your professional award now." }
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto justify-center lg:justify-end">
                {finalAttempt.rank !== undefined && (
                  <Button onClick={() => handleGetCertificate(finalAttempt!, true)} className={cn("font-black h-14 px-8 rounded-2xl text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 border-none uppercase tracking-widest min-w-[220px]", (finalAttempt.rank === 1) ? "bg-yellow-400 text-indigo-950 hover:bg-yellow-500" : "bg-white text-indigo-900 hover:bg-slate-50")}><Medal className="w-5 h-5 mr-2 text-indigo-600" />RANK ACHIEVER CERTIFICATE</Button>
                )}
                <Button onClick={() => handleGetCertificate(finalAttempt!, false)} variant="outline" className="bg-white/10 text-white hover:bg-white/20 font-black h-14 px-8 rounded-2xl text-xs sm:text-sm shadow-xl transition-transform hover:scale-105 border-2 border-white/20 uppercase tracking-widest min-w-[220px]"><Download className="w-5 h-5 mr-2" />PARTICIPATION CERTIFICATE</Button>
              </div>
           </CardContent>
        </Card>
      )}

      {!application ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pb-12">
          {(Object.entries(EXAM_GROUPS) as [ExamGroup, GroupConfig][]).map(([id, g]) => (
            <Card key={id} className="relative group overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-white transition-all hover:scale-[1.01] hover:shadow-orange-200/50">
              <CardHeader className="p-8">
                <div className="flex items-start gap-5 min-w-0">
                  <div className="p-5 bg-muted/50 rounded-[1.5rem] group-hover:scale-110 transition-transform text-primary shadow-inner shrink-0">
                    {g.icon}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                        Group {id}: {g.title}
                    </CardTitle>
                    <p className="text-muted-foreground font-medium text-base sm:text-lg leading-snug">{g.description}</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 space-y-8">
                <div className="bg-slate-100/50 p-4 rounded-2xl flex items-center justify-center gap-3 border border-slate-200">
                    {g.toolAllowed ? <Calculator className="w-4 h-4 text-slate-500" /> : <MonitorOff className="w-4 h-4 text-slate-500" />}
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{g.toolAllowed ? 'Abacus Tool Allowed' : 'No Tool Allowed'}</span>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Focus Areas:</p>
                    <div className="grid gap-3">
                        {g.focusAreas.map((area, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                                <span>{area}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <Button onClick={() => handleApply(id as ExamGroup)} disabled={isApplying} className="w-full h-20 text-xl font-black uppercase tracking-widest rounded-3xl shadow-xl shadow-orange-200 transition-all active:scale-95">
                  Apply for Group {id}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isApproved && (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-slate-900 leading-none">
                    <Trophy className="text-yellow-500 w-7 h-7" /> Practice Papers (Group {application.group})
                  </h2>
                  <Badge className="bg-green-500 py-1.5 px-4 font-black border-none text-white">APPROVED</Badge>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <Button key={i} variant="outline" disabled={examOpen || !!schedule?.resultsDeclared} className={cn("h-24 rounded-2xl flex flex-col gap-2 font-black transition-all", (!examOpen && !schedule?.resultsDeclared) ? "hover:scale-105" : "opacity-50 grayscale bg-muted/50")} onClick={() => router.push(`/exams/arena/paper-${i + 1}`)}>
                      {(examOpen || schedule?.resultsDeclared) ? <Lock className="w-5 h-5 text-muted-foreground" /> : <><span className="text-[10px] uppercase opacity-60">Practice</span><span className="text-2xl">#{i + 1}</span></>}
                    </Button>
                  ))}
                </div>

                <div className="pt-8">
                   <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 mb-6 text-slate-900 leading-none">
                     <ShieldAlert className="text-red-500 w-7 h-7" /> Final Official Exam
                   </h2>
                   <Card className={cn("rounded-[2.5rem] border-4 overflow-hidden shadow-2xl transition-all", (examOpen && !finalAttempt) ? "border-orange-500" : "border-slate-200 grayscale opacity-60")}>
                    <CardHeader className="bg-slate-900 text-white p-8">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-3xl font-black uppercase italic tracking-tighter truncate">Grand Final 2026</CardTitle>
                          <div className="text-slate-400 font-bold mt-1 flex items-center flex-wrap gap-2 text-xs sm:text-sm">
                             Group {application.group} Certification
                             <Separator orientation="vertical" className="h-3 bg-white/20 hidden sm:block" />
                             <span className="flex items-center gap-1 text-orange-400"><HelpCircle className="w-3 h-3" /> 150 Questions</span>
                             <Separator orientation="vertical" className="h-3 bg-white/20 hidden sm:block" />
                             <span className="flex items-center gap-1 text-sky-400"><Timer className="w-3 h-3" /> {timeLimitDisplay}</span>
                          </div>
                        </div>
                        <Lock className="w-10 h-10 text-slate-500 shrink-0 ml-4" />
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
            {application.status === 'pending' && <Card className="bg-orange-50 border-orange-200 p-10 rounded-[2.5rem] text-center shadow-lg"><CardTitle className="text-2xl font-black uppercase text-orange-900 leading-none">Application Pending</CardTitle><p className="text-orange-700 font-bold mt-4">We are reviewing your Group {application.group} application.</p></Card>}
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
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {r.isFinal ? <ShieldAlert className="w-3 h-3 text-orange-500" /> : <FileEdit className="w-3 h-3 text-slate-400" />}
                              <p className="text-xs font-black uppercase tracking-tight truncate">{r.paperId === 'final' ? 'FINAL EXAM' : `Practice ${r.paperId.split('-')[1]}`}</p>
                            </div>
                            <p className="text-[10px] text-indigo-600 font-black uppercase flex items-center gap-1.5 tracking-wider">
                              <Timer className="w-3 h-3" />
                              Time Left: {Math.floor((r.timeLeft || 0)/60)}:{((r.timeLeft || 0) % 60).toString().padStart(2,'0')}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
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
