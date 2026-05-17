
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, FileText, CheckCircle2, Clock, Lock, ShieldAlert, PlayCircle, Trophy, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult, ExamGroup } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { getExamTimeLimit, EXAM_DATE, isFinalExamAvailable } from '@/lib/exam-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

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
    const unsubscribeApp = onSnapshot(appQuery, (snap) => {
      if (!snap.empty) {
        setApplication({ id: snap.docs[0].id, ...snap.docs[0].data() } as ExamApplication);
      }
      setLoading(false);
    });

    // Listen for results
    const resultsQuery = query(collection(db, "examResults"), where("userId", "==", user.uid));
    const unsubscribeResults = onSnapshot(resultsQuery, (snap) => {
      setExamResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
    });

    return () => {
      unsubscribeApp();
      unsubscribeResults();
    };
  }, [user]);

  const handleApply = async (group: ExamGroup) => {
    if (!user || !profile) return;
    setIsApplying(true);
    
    try {
      const db = getFirestore(firebaseApp);
      const age = differenceInYears(new Date(), new Date(profile.dob));
      const timeLimit = getExamTimeLimit(age);

      await addDoc(collection(db, "examApplications"), {
        userId: user.uid,
        studentName: `${profile.firstName} ${profile.surname}`,
        group,
        status: 'pending',
        appliedAt: serverTimestamp(),
        age,
        timeLimit
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
        <Card className="rounded-[2.5rem] shadow-xl border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
              <FileText className="text-primary w-6 h-6" /> Choose Your Exam Group
            </CardTitle>
            <CardDescription>Select the group matching your current mastery level.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { id: 'A', title: 'Group A', desc: 'Beads & Basic moves. Single digits.', tools: 'Abacus Tool allowed' },
              { id: 'B', title: 'Group B', desc: 'All Formulas. S/D digits.', tools: 'Abacus Tool allowed' },
              { id: 'C', title: 'Group C', desc: 'All Formulas. S/D/T digits.', tools: 'No Abacus Tool' },
              { id: 'D', title: 'Group D', desc: 'Mixed Math + Mult & Div.', tools: 'No Abacus Tool' }
            ].map((g) => (
              <Card key={g.id} className="relative group overflow-hidden border-2 hover:border-primary transition-all">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">{g.title}</CardTitle>
                  <CardDescription className="text-xs">{g.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Badge variant="secondary" className="w-full justify-center py-1 uppercase text-[10px] font-black">{g.tools}</Badge>
                  <Button 
                    onClick={() => handleApply(g.id as ExamGroup)} 
                    disabled={isApplying} 
                    className="w-full font-bold h-10"
                  >
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {application.status === 'pending' && (
              <Card className="bg-orange-50 border-orange-200 rounded-3xl">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-orange-100 p-4 rounded-full w-fit mb-4">
                    <Clock className="w-8 h-8 text-orange-600 animate-pulse" />
                  </div>
                  <CardTitle className="text-orange-900">Application Pending Approval</CardTitle>
                  <CardDescription className="text-orange-700 font-medium">
                    You applied for <strong>Group {application.group}</strong>. The administrator will review your eligibility shortly.
                  </CardDescription>
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
                  <Card className={cn("rounded-3xl border-4 overflow-hidden shadow-2xl", isFinalExamAvailable() ? "border-orange-500" : "border-slate-200 grayscale")}>
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
                          <p className="text-xl font-bold">30 Steps</p>
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
             <Card className="rounded-3xl shadow-lg border-none bg-indigo-50/50">
               <CardHeader><CardTitle className="text-xl font-bold flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-600" /> Exam Rules</CardTitle></CardHeader>
               <CardContent className="space-y-4 text-sm font-medium text-indigo-900 leading-relaxed">
                  <p>• Group A & B students must use a physical abacus tool or our digital tool.</p>
                  <p>• Group C & D must calculate mentally (Anzan) without any visual aids.</p>
                  <p>• Practice papers can be retaken unlimited times to improve your speed.</p>
                  <p>• The Final Exam is timed based on your age: <strong>{application.timeLimit / 60} minutes</strong> for you.</p>
               </CardContent>
             </Card>

             <Card className="rounded-3xl shadow-lg border-none">
                <CardHeader><CardTitle className="text-xl font-bold">My Performance</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {results.length > 0 ? results.map(r => (
                    <div key={r.id} className="flex justify-between items-center p-3 bg-muted rounded-xl">
                      <div>
                        <p className="text-xs font-black uppercase tracking-tight">{r.paperId === 'final' ? 'FINAL EXAM' : `Practice ${r.paperId.split('-')[1]}`}</p>
                        <p className="text-[10px] text-muted-foreground">{format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'MMM d, h:mm a')}</p>
                      </div>
                      <div className="text-right">
                        {r.isFinal ? (
                           <Badge className="bg-slate-900">SUBMITTED</Badge>
                        ) : (
                          <p className="text-lg font-black text-primary">{r.score}/{r.totalQuestions}</p>
                        )}
                      </div>
                    </div>
                  )) : <p className="text-center text-muted-foreground py-10 font-medium italic">No attempts yet.</p>}
                </CardContent>
             </Card>
          </div>
        </div>
      )}
    </div>
  );
}
