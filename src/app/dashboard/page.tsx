
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Trophy, ChevronRight, Loader2, Star, Flame, CalendarDays, Download, Award, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ProfileData } from '@/types';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RANK_CRITERIA, ADMIN_EMAILS } from '@/lib/constants';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import MilestoneCelebration from '@/components/MilestoneCelebration';
import AchievementModal, { AchievementType } from '@/components/AchievementModal';

function getUTCMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1); 
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default function StudentDashboardPage() {
  usePageBackground('');
  const { profile, user, isLoading, getStudentTitle } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");
  const [lastWinner, setLastWinner] = useState<any>(null);
  const [monthlyWinner, setMonthlyWinner] = useState<any>(null);
  const [globalWinner, setGlobalWinner] = useState<any>(null);
  
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneDays, setMilestoneDays] = useState(0);

  const [showCertificate, setShowCertificate] = useState(false);
  const [certData, setCertData] = useState<{ type: AchievementType, title: string, score?: string } | null>(null);

  const currentWeekKey = useMemo(() => getUTCMondayKey(), []);
  const currentMonthKey = useMemo(() => getUTCMonthKey(), []);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!mounted) return;
    const db = getFirestore(firebaseApp);
    const unsub = onSnapshot(doc(db, "stats", "leaderboard"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setLastWinner(data.lastWeeklyWinner);
          setMonthlyWinner(data.lastMonthlyWinner);
          setGlobalWinner(data.lastGlobalWinner);
        }
      }, async (err) => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'stats/leaderboard', operation: 'get' })); }
    );
    return () => unsub();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !user) return;
    const db = getFirestore(firebaseApp);
    let q;
    if (leaderboardTab === 'weeklyPoints') q = query(collection(db, "users"), where("role", "==", "student"), where("lastWeeklyReset", "==", currentWeekKey), orderBy("weeklyPoints", "desc"), limit(20));
    else if (leaderboardTab === 'monthlyPoints') q = query(collection(db, "users"), where("role", "==", "student"), where("lastMonthlyReset", "==", currentMonthKey), orderBy("monthlyPoints", "desc"), limit(20));
    else q = query(collection(db, "users"), where("role", "==", "student"), orderBy("totalPoints", "desc"), limit(20));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
            const ud = doc.data() as ProfileData;
            return { uid: doc.id, email: ud.email?.toLowerCase(), name: `${ud.firstName} ${ud.surname}`, photo: ud.profilePhoto, points: (ud as any)[leaderboardTab] || 0, title: getStudentTitle(ud.totalDaysPracticed || 0, ud.totalPoints || 0) };
          }).filter(s => s.points > 0 && !ADMIN_EMAILS.includes(s.email)).slice(0, 10);
        setLeaderboard(data);
      }, async (err) => { errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'users', operation: 'list' })); }
    );
    return () => unsubscribe();
  }, [mounted, user, getStudentTitle, leaderboardTab, currentWeekKey, currentMonthKey]);

  const handleDownloadRankCert = () => {
    if (!profile) return;
    setCertData({
      type: 'rank',
      title: getStudentTitle(profile.totalDaysPracticed || 0, profile.totalPoints || 0).name,
      score: `${(profile.totalPoints || 0).toLocaleString()} Global Mastery Points`
    });
    setShowCertificate(true);
  };

  const handleDownloadWinnerCert = (type: 'weekly_winner' | 'monthly_winner' | 'global_winner', points: number) => {
    setCertData({
      type,
      title: type === 'weekly_winner' ? 'Weekly Champion' : (type === 'monthly_winner' ? 'Monthly Master' : 'Global Legend'),
      score: `${points.toLocaleString()} Mastery Points`
    });
    setShowCertificate(true);
  };

  if (isLoading || !mounted) return <div className="space-y-8 max-w-6xl mx-auto p-8"><Skeleton className="h-[120px] w-full rounded-2xl" /><Skeleton className="h-[220px] w-full rounded-3xl" /></div>;
  if (!user || !profile) return null;

  const currentPoints = profile.totalPoints || 0;
  const currentDays = profile.totalDaysPracticed || 0;
  const currentRank = getStudentTitle(currentDays, currentPoints);
  const nextRankIdx = RANK_CRITERIA.findIndex(r => r.name === currentRank.name) - 1;
  const nextRank = nextRankIdx >= 0 ? RANK_CRITERIA[nextRankIdx] : currentRank;
  const progress = (((Math.min(1, currentPoints/(nextRank.pointsReq || 1))) + (Math.min(1, currentDays/(nextRank.daysReq || 1)))) / 2) * 100;

  const amIWeeklyWinner = lastWinner?.uid === user.uid;
  const amIMonthlyWinner = monthlyWinner?.uid === user.uid;
  const amIGlobalWinner = globalWinner?.uid === user.uid;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {showCertificate && certData && (
        <AchievementModal 
          type={certData.type}
          studentName={`${profile.firstName} ${profile.surname}`}
          title={certData.title}
          score={certData.score}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {showMilestone && <MilestoneCelebration days={milestoneDays} onClose={() => setShowMilestone(false)} />}

      <Card className="relative overflow-hidden border-none shadow-xl bg-slate-900 text-white min-h-[220px] rounded-3xl flex items-center">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/abacus_hero.webp?alt=media')" }} />
        <CardContent className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black font-headline uppercase leading-none">Road to Mastery</h1>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className="bg-yellow-400 text-slate-900 font-bold px-4 py-1.5 rounded-full border-none shadow-md">RANK: {currentRank.name}</Badge>
              <Button onClick={handleDownloadRankCert} variant="ghost" size="sm" className="text-white hover:bg-white/10 font-black uppercase text-[10px] gap-2 rounded-full border border-white/20">
                <Download className="w-3 h-3" /> Get Rank Certificate
              </Button>
            </div>
          </div>
          <div className="w-full md:w-80 space-y-3 bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-blue-300"><span>Goal: {nextRank.name}</span><span>{Math.floor(progress)}%</span></div>
            <div className="h-3 w-full bg-white/10 rounded-full p-0.5 shadow-inner"><div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} /></div>
          </div>
        </CardContent>
      </Card>

      {(amIWeeklyWinner || amIMonthlyWinner || amIGlobalWinner) && (
        <Card className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 border-none shadow-xl rounded-2xl animate-in zoom-in-95 duration-700">
           <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 text-yellow-950">
              <div className="flex items-center gap-4">
                <div className="bg-white/30 p-4 rounded-full shadow-lg"><Trophy className="w-10 h-10 animate-bounce" /></div>
                <div><h2 className="text-2xl font-black uppercase italic tracking-tighter">You Are a Champion!</h2><p className="font-bold opacity-80">You've secured the top spot on our leaderboards.</p></div>
              </div>
              <div className="flex gap-2">
                {amIWeeklyWinner && <Button onClick={() => handleDownloadWinnerCert('weekly_winner', lastWinner.points)} className="bg-slate-900 text-white hover:bg-black font-black uppercase text-xs rounded-xl h-12 shadow-lg"><Award className="w-4 h-4 mr-2" /> Weekly Trophy</Button>}
                {amIMonthlyWinner && <Button onClick={() => handleDownloadWinnerCert('monthly_winner', monthlyWinner.points)} className="bg-slate-900 text-white hover:bg-black font-black uppercase text-xs rounded-xl h-12 shadow-lg"><Award className="w-4 h-4 mr-2" /> Monthly Trophy</Button>}
                {amIGlobalWinner && <Button onClick={() => handleDownloadWinnerCert('global_winner', globalWinner.points)} className="bg-slate-900 text-white hover:bg-black font-black uppercase text-xs rounded-xl h-12 shadow-lg"><Award className="w-4 h-4 mr-2" /> Global Legend</Button>}
              </div>
           </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-border/50 shadow-sm"><CardContent className="p-6 flex items-center gap-4"><div className="bg-orange-100 p-3 rounded-2xl shrink-0"><Flame className="text-orange-600 w-6 h-6" /></div><div><p className="text-3xl font-black leading-none">{profile.currentStreak || 0}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Streak</p></div></CardContent></Card>
        <Card className="bg-card/50 border-border/50 shadow-sm"><CardContent className="p-6 flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-2xl shrink-0"><CalendarDays className="text-blue-600 w-6 h-6" /></div><div><p className="text-3xl font-black leading-none">{currentDays}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Practice Days</p></div></CardContent></Card>
        <Card className="lg:col-span-2 shadow-md bg-white border-slate-100 border-2"><CardContent className="p-6 h-full flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100"><p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Weekly</p><p className="text-base sm:text-2xl font-black text-foreground">{(profile.weeklyPoints || 0).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100"><p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Monthly</p><p className="text-base sm:text-2xl font-black text-foreground">{(profile.monthlyPoints || 0).toLocaleString()}</p></div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100"><p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Total</p><p className="text-base sm:text-2xl font-black text-primary">{(profile.totalPoints || 0).toLocaleString()}</p></div>
            </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-black flex items-center gap-3"><CalendarDays className="text-primary w-7 h-7" /> Training Milestone</h2><Badge className="bg-muted text-primary border font-black uppercase text-[10px] py-1.5 px-4 rounded-full">Cycle Days {Math.floor(currentDays/28)*28 + 1}-{Math.floor(currentDays/28)*28 + 28}</Badge></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(w => (
              <Card key={w} className="overflow-hidden border-border rounded-2xl shadow-sm bg-card/30 relative">
                <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between"><span className="font-black text-sm uppercase">Week {Math.floor(currentDays/28)*4 + w}</span><Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">{Math.min(7, Math.max(0, currentDays - (Math.floor(currentDays/28)*28 + (w-1)*7)))}/7</Badge></CardHeader>
                <CardContent className="p-6 flex justify-start items-center gap-2.5 overflow-x-auto scrollbar-none">
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <div key={d} className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0", currentDays >= (Math.floor(currentDays/28)*28 + (w-1)*7 + d) ? "bg-primary border-primary text-white shadow-md" : "bg-muted border-border text-muted-foreground")}><Check className="w-5 h-5 stroke-[4px]" /></div>
                  ))}
                  <div className={cn("w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-lg", currentDays >= (Math.floor(currentDays/28)*28 + (w-1)*7 + 7) ? "bg-yellow-400 border-yellow-500 text-slate-900" : "bg-muted border-border opacity-50")}><Trophy className="w-6 h-6" /></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button onClick={() => router.push('/tests')} className="w-full h-24 bg-primary hover:bg-primary/90 rounded-3xl shadow-xl flex items-center justify-center gap-4 group"><span className="text-2xl font-black uppercase tracking-widest leading-none">Start Training</span><ChevronRight className="w-10 h-10 group-hover:translate-x-2 transition-transform stroke-[4px]" /></Button>
        </div>

        <div className="space-y-8">
          <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-0">
              <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight mb-4 text-foreground"><Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame</CardTitle>
              <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full"><TabsList className="grid grid-cols-3 bg-slate-200/50 mb-2 h-10 p-1"><TabsTrigger value="weeklyPoints" className="text-[9px] font-black uppercase">Weekly</TabsTrigger><TabsTrigger value="monthlyPoints" className="text-[9px] font-black uppercase">Monthly</TabsTrigger><TabsTrigger value="totalPoints" className="text-[9px] font-black uppercase">Global</TabsTrigger></TabsList></Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {leaderboard.map((s, i) => (
                  <div key={s.uid} className={cn("flex items-center justify-between p-4", s.uid === profile.uid ? "bg-primary/5" : "hover:bg-muted/30")}>
                    <div className="flex items-center gap-4 min-w-0"><span className={cn("w-6 text-sm font-black shrink-0", i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600")}>#{i + 1}</span><Avatar className="h-10 w-10 border-2 border-white shrink-0"><AvatarImage src={s.photo}/></Avatar><div className="min-w-0 overflow-hidden"><p className="text-sm font-bold truncate">{s.name}</p><span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase truncate inline-block max-w-full" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span></div></div>
                    <div className="text-right shrink-0 ml-2"><p className="text-sm font-black text-primary">{s.points.toLocaleString()}</p></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
