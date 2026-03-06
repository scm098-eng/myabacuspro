
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Check, Trophy, Zap, ChevronRight, Bell, Loader2, Star, Flame, CalendarDays, ShieldAlert, MailCheck, TrendingUp, ArrowUpTrendUp, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ProfileData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMessaging, getToken } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import AchievementModal from '@/components/AchievementModal';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RANK_CRITERIA } from '@/lib/constants';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useSound } from '@/hooks/useSound';
import Link from 'next/link';

const PointsAnimation = ({ points }: { points: number }) => (
  <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex items-center gap-1 text-green-600 font-black text-2xl drop-shadow-md pointer-events-none z-50">
    <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-600" /> +{points}
  </div>
);

const motivationalQuotes = [
  "Precision is the pride of a Human Calculator.",
  "Every bead moved is a step closer to Grandmaster status.",
  "Speed comes from practice, mastery comes from consistency.",
  "Visualize the beads, conquer the numbers.",
  "Your brain is the world's most powerful computer."
];

export default function StudentDashboardPage() {
  usePageBackground('');
  const { profile, user, isLoading, getStudentTitle, updateUserProfile, sendVerificationEmail, isTrialActive, trialDaysRemaining } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useSound();
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState<any>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);
  const lastPointsRef = useRef<number>(0);
  const quoteRef = useRef<string>(motivationalQuotes[0]);

  useEffect(() => {
    setMounted(true);
    quoteRef.current = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (profile && profile.totalPoints !== undefined) {
      if (lastPointsRef.current !== 0 && profile.totalPoints > lastPointsRef.current) {
        const diff = profile.totalPoints - lastPointsRef.current;
        setPointsEarned(diff);
        playSound('points');
        setTimeout(() => setPointsEarned(null), 2500);
      }
      lastPointsRef.current = profile.totalPoints;
    }
  }, [profile?.totalPoints, playSound]);

  useEffect(() => {
    if (mounted && user) {
      const db = getFirestore(firebaseApp);
      const q = query(collection(db, "users"), where("role", "==", "student"), orderBy(leaderboardTab, "desc"), limit(10));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const ud = doc.data() as ProfileData;
          return { uid: doc.id, name: `${ud.firstName} ${ud.surname}`, photo: ud.profilePhoto, points: ud[leaderboardTab as keyof ProfileData] || 0, title: getStudentTitle(ud.totalDaysPracticed || 0, ud.totalPoints || 0) };
        });
        setLeaderboard(data);
      }, (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/users', operation: 'list' })));
      return () => unsubscribe();
    }
  }, [mounted, user, getStudentTitle, leaderboardTab]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setIsRequestingNotifications(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, { vapidKey: 'BF27zRYbNBqLyR0w1XZVSCWK0YNgG7M9DymtcLAPr6A0gUoT0OlIn-q7fpPhgYgOwcj91lmXUL7KvTV4o0Yd7J8' });
        if (token) await updateDoc(doc(getFirestore(firebaseApp), "users", user.uid), { fcmToken: token });
      }
    } catch (e) { console.error(e); } finally { setIsRequestingNotifications(false); }
  };

  if (isLoading || !mounted) return <div className="space-y-8 p-8"><Skeleton className="h-[200px] w-full" /><div className="grid grid-cols-3 gap-6"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div></div>;
  if (!user || !profile) return null;

  const currentPoints = profile.totalPoints || 0;
  const currentDays = profile.totalDaysPracticed || 0;
  const currentRank = getStudentTitle(currentDays, currentPoints);
  const nextRank = RANK_CRITERIA.slice().reverse().find(r => currentDays < r.daysReq || currentPoints < r.pointsReq) || RANK_CRITERIA[0];
  const progress = Math.min(100, ((currentPoints / (nextRank.pointsReq || 1)) + (currentDays / (nextRank.daysReq || 1))) * 50);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {showAchievement && achievementData && <AchievementModal studentName={`${profile.firstName} ${profile.surname}`} title={achievementData.name} icon={achievementData.icon} color={achievementData.color} totalPoints={currentPoints} totalDays={currentDays} onClose={() => setShowAchievement(false)} />}
      
      {!user.emailVerified && !/test|temp/i.test(user.email!) && (
        <Alert variant="destructive"><ShieldAlert className="h-4 w-4" /><AlertTitle>Verify Email</AlertTitle><AlertDescription className="flex justify-between items-center">Verify your email to unlock all features.<Button size="sm" onClick={() => sendVerificationEmail()} disabled={isSendingVerification} variant="outline">Resend Link</Button></AlertDescription></Alert>
      )}

      <Card className="relative overflow-hidden border-none shadow-xl bg-slate-900 text-white min-h-[220px] rounded-3xl flex items-center">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/abacus/1200/400')" }} />
        <CardContent className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black font-headline uppercase">Road to Mastery</h1>
            <div className="flex gap-2 justify-center md:justify-start">
              <Badge className="bg-yellow-400 text-slate-900 font-bold px-4 py-1.5 rounded-full">RANK: {currentRank.name}</Badge>
              <Badge variant="outline" className="text-white border-white/20 px-4 py-1.5 rounded-full">NEXT: {nextRank.name}</Badge>
            </div>
          </div>
          <div className="w-full md:w-80 space-y-3 bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-blue-300"><span>Progress to {nextRank.name}</span><span>{Math.floor(progress)}%</span></div>
            <div className="h-3 w-full bg-white/10 rounded-full p-0.5"><div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-border/50"><CardContent className="p-6 flex items-center gap-4"><div className="bg-orange-100 p-3 rounded-2xl"><Flame className="text-orange-600" /></div><div><p className="text-3xl font-black">{profile.currentStreak || 0}</p><p className="text-[10px] font-bold text-muted-foreground uppercase">Streak</p></div></CardContent></Card>
        <Card className="bg-card/50 border-border/50"><CardContent className="p-6 flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-2xl"><CalendarDays className="text-blue-600" /></div><div><p className="text-3xl font-black">{currentDays}</p><p className="text-[10px] font-bold text-muted-foreground uppercase">Practice Days</p></div></CardContent></Card>
        <Card className={cn("lg:col-span-2 relative overflow-hidden transition-all", pointsEarned && "ring-2 ring-green-500 bg-green-50/10")}>
          <CardContent className="p-6 relative">
            {pointsEarned && <PointsAnimation points={pointsEarned} />}
            <div className="grid grid-cols-3 divide-x divide-border/50 text-center">
              <div className="px-2"><p className="text-2xl font-black text-primary">{(profile.totalPoints || 0).toLocaleString()}</p><p className="text-[9px] font-black uppercase text-muted-foreground">Total Pts</p></div>
              <div className="px-2"><p className="text-2xl font-black">{(profile.weeklyPoints || 0).toLocaleString()}</p><p className="text-[9px] font-black uppercase text-muted-foreground">Weekly</p></div>
              <div className="px-2"><p className="text-2xl font-black">{(profile.monthlyPoints || 0).toLocaleString()}</p><p className="text-[9px] font-black uppercase text-muted-foreground">Monthly</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3"><CalendarDays className="text-primary" /> Consistency Challenge</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(w => {
              const startDay = (w - 1) * 7;
              const wp = Math.max(0, Math.min(7, currentDays - startDay));
              return (
                <Card key={w} className="overflow-hidden border-border rounded-2xl">
                  <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                    <span className="font-black text-sm uppercase">Week {w}</span>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{wp}/7 Days</span>
                  </CardHeader>
                  <CardContent className="p-6 flex justify-between gap-1">
                    {[1, 2, 3, 4, 5, 6].map(d => (
                      <div key={d} className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center aspect-square shrink-0 transition-all", currentDays >= (startDay + d) ? "bg-primary border-primary text-white" : "bg-muted border-border text-muted-foreground")}>
                        {currentDays >= (startDay + d) ? <Check className="w-4 h-4" /> : <span className="text-xs font-black">{d}</span>}
                      </div>
                    ))}
                    <div className={cn("w-8 h-8 rounded-xl border-2 flex items-center justify-center aspect-square shrink-0 transition-all", currentDays >= (startDay + 7) ? "bg-yellow-400 border-yellow-500 text-slate-900 scale-110 shadow-lg" : "bg-muted border-border opacity-50 grayscale")}>
                      <Trophy className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button onClick={() => router.push('/tests')} className="w-full h-24 bg-primary hover:bg-primary/90 rounded-3xl shadow-xl transition-transform hover:scale-[1.01]">
            <span className="text-2xl font-black uppercase tracking-widest">Start Practice</span>
            <ChevronRight className="w-10 h-10 ml-4 stroke-[4px]" />
          </Button>
        </div>

        <div className="space-y-8">
          {!profile.fcmToken && (
            <Card className="bg-primary/5 rounded-2xl"><CardHeader><CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight"><Bell className="w-5 h-5 text-primary" /> Training Alerts</CardTitle></CardHeader><CardContent><Button onClick={handleEnableNotifications} disabled={isRequestingNotifications} className="w-full rounded-xl h-12 font-black uppercase text-xs">Enable Alerts</Button></CardContent></Card>
          )}
          <Card className="rounded-2xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-0"><CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame</CardTitle>
              <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full"><TabsList className="grid grid-cols-3 bg-slate-200/50 mb-2"><TabsTrigger value="weeklyPoints" className="text-[9px] font-black uppercase">Weekly</TabsTrigger><TabsTrigger value="monthlyPoints" className="text-[9px] font-black uppercase">Monthly</TabsTrigger><TabsTrigger value="totalPoints" className="text-[9px] font-black uppercase">Global</TabsTrigger></TabsList></Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {leaderboard.length > 0 ? leaderboard.map((s, i) => (
                  <div key={s.uid} className={cn("flex items-center justify-between p-4", s.uid === profile.uid ? "bg-primary/5" : "hover:bg-muted/30")}>
                    <div className="flex items-center gap-4"><span className={cn("w-6 text-sm font-black", i === 0 ? "text-yellow-500" : "text-muted-foreground")}>#{i + 1}</span><Avatar className="h-10 w-10"><AvatarImage src={s.photo}/><AvatarFallback className="font-bold">{s.name?.charAt(0)}</AvatarFallback></Avatar><div><p className="text-sm font-bold truncate max-w-[100px]">{s.name}</p><span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span></div></div>
                    <div className="text-right"><p className="text-sm font-black text-primary">{s.points.toLocaleString()}</p><p className="text-[8px] font-black text-muted-foreground uppercase">Points</p></div>
                  </div>
                )) : <div className="py-24 text-center text-muted-foreground uppercase font-black tracking-widest animate-pulse">Summoning Champions...</div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
