
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Trophy, ChevronRight, Bell, Loader2, Star, Flame, CalendarDays, TrendingUp, Clock, Zap, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ProfileData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMessaging, getToken } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RANK_CRITERIA } from '@/lib/constants';
import confetti from 'canvas-confetti';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

/**
 * UTC standard Monday calculation (YYYY-MM-DD)
 */
function getUTCMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1); 
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

/**
 * UTC standard Month calculation (YYYY-MM)
 */
function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export default function StudentDashboardPage() {
  usePageBackground('');
  const { profile, user, isLoading, getStudentTitle, isTrialActive, trialDaysRemaining } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);
  const [lastWinner, setLastWinner] = useState<any>(null);

  const currentWeekKey = useMemo(() => getUTCMondayKey(), []);
  const currentMonthKey = useMemo(() => getUTCMonthKey(), []);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (mounted && profile?.totalDaysPracticed) {
      const days = profile.totalDaysPracticed;
      if (days > 0 && days % 7 === 0) {
        const lastCelebrated = localStorage.getItem(`celebrated_day_${days}`);
        if (!lastCelebrated) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f97316', '#ffffff']
          });
          localStorage.setItem(`celebrated_day_${days}`, 'true');
        }
      }
    }
  }, [mounted, profile?.totalDaysPracticed]);

  useEffect(() => {
    if (!mounted) return;

    const db = getFirestore(firebaseApp);
    const unsub = onSnapshot(doc(db, "stats", "leaderboard"), 
      (snapshot) => {
        if (snapshot.exists()) {
          setLastWinner(snapshot.data().lastWeeklyWinner);
        }
      },
      async (error) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'stats/leaderboard',
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      }
    );
    return () => unsub();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !user) return;

    const db = getFirestore(firebaseApp);
    let q;
    
    if (leaderboardTab === 'weeklyPoints') {
      q = query(
        collection(db, "users"), 
        where("role", "==", "student"), 
        where("lastWeeklyReset", "==", currentWeekKey),
        orderBy("weeklyPoints", "desc"), 
        limit(10)
      );
    } else if (leaderboardTab === 'monthlyPoints') {
      q = query(
        collection(db, "users"), 
        where("role", "==", "student"), 
        where("lastMonthlyReset", "==", currentMonthKey),
        orderBy("monthlyPoints", "desc"), 
        limit(10)
      );
    } else {
      q = query(
        collection(db, "users"), 
        where("role", "==", "student"), 
        orderBy("totalPoints", "desc"), 
        limit(10)
      );
    }
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const data = snapshot.docs
          .map(doc => {
            const ud = doc.data() as ProfileData;
            return { 
              uid: doc.id, 
              name: `${ud.firstName} ${ud.surname}`, 
              photo: ud.profilePhoto, 
              points: ud[leaderboardTab as keyof ProfileData] || 0, 
              title: getStudentTitle(ud.totalDaysPracticed || 0, ud.totalPoints || 0) 
            };
          })
          .filter(s => s.points > 0);
        setLeaderboard(data);
      },
      async (error) => {
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'users',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      }
    );
    return () => unsubscribe();
  }, [mounted, user, getStudentTitle, leaderboardTab, currentWeekKey, currentMonthKey]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setIsRequestingNotifications(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, { vapidKey: 'BF27zRYbNBqLyR0w1XZVSCWK0YNgG7M9DymtcLAPr6A0gUoT0OlIn-q7fpPhgYgOwcj91lmXUL7KvTV4o0Yd7J8' });
        if (token) await updateDoc(doc(getFirestore(firebaseApp), "users", user.uid), { fcmToken: token });
        toast({ title: "Reminders Active!", description: "Check in every evening at 7 PM IST. 🔥" });
      }
    } catch (e) { 
      console.error("FCM failed", e);
      toast({ title: "Setup Failed", description: "Notifications could not be enabled.", variant: "destructive" });
    } finally { setIsRequestingNotifications(false); }
  };

  const trialTimeRemainingText = useMemo(() => {
    if (trialDaysRemaining >= 1) {
      const days = Math.floor(trialDaysRemaining);
      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
    } else {
      const hours = Math.floor(trialDaysRemaining * 24);
      return `${Math.max(1, hours)} ${hours === 1 ? 'Hour' : 'Hours'}`;
    }
  }, [trialDaysRemaining]);

  if (isLoading || !mounted) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-8">
        <Skeleton className="h-[120px] w-full rounded-2xl" />
        <Skeleton className="h-[220px] w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const currentPoints = profile.totalPoints || 0;
  const currentDays = profile.totalDaysPracticed || 0;
  const currentRank = getStudentTitle(currentDays, currentPoints);
  
  const currentIndex = RANK_CRITERIA.findIndex(r => r.name === currentRank.name);
  const nextRank = currentIndex > 0 ? RANK_CRITERIA[currentIndex - 1] : RANK_CRITERIA[0];
  
  const daysNeeded = Math.max(0, nextRank.daysReq - currentDays);
  const pointsNeeded = Math.max(0, nextRank.pointsReq - currentPoints);
  
  const pointsProg = Math.min(1, currentPoints / (nextRank.pointsReq || 1));
  const daysProg = Math.min(1, currentDays / (nextRank.daysReq || 1));
  const progress = ((pointsProg + daysProg) / 2) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {lastWinner && (
        <Card className="bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 border-none shadow-xl rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-700">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center">
              <div className="bg-black/10 p-6 flex items-center justify-center">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-white shadow-2xl">
                    <AvatarImage src={lastWinner.photo} />
                    <AvatarFallback className="bg-yellow-100 text-yellow-700 font-black">{lastWinner.name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow-lg">
                    <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-bounce" />
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 text-center md:text-left text-yellow-950">
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
                  <Badge className="bg-black/20 text-yellow-950 border-none font-black text-[10px] tracking-widest uppercase">Weekly Champion</Badge>
                  <span className="text-[10px] font-bold opacity-70">RACE HAS RESET!</span>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Hail {lastWinner.name}!</h2>
                <p className="text-sm font-bold opacity-90 leading-relaxed max-w-lg">
                  They took the crown with <span className="underline decoration-2">{lastWinner.points.toLocaleString()} Points</span> last week. 
                  The leaderboard is fresh—can you reach #1 this week?
                </p>
              </div>
              <div className="p-6">
                <Button onClick={() => router.push('/tests')} className="bg-yellow-950 text-yellow-400 hover:bg-black font-black rounded-xl px-8 h-12 shadow-2xl transition-transform hover:scale-105">
                  CHALLENGE NOW
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isTrialActive && profile.subscriptionStatus !== 'pro' && (
        <Card className="bg-orange-500 text-white border-none shadow-lg rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="font-black uppercase tracking-tight text-sm">Free Trial Ending Soon</p>
                <p className="text-xs opacity-90 font-bold">You have <span className="underline decoration-2">{trialTimeRemainingText}</span> left. Upgrade to keep your progress!</p>
              </div>
            </div>
            <Button onClick={() => router.push('/pricing')} className="bg-white text-orange-600 hover:bg-orange-50 font-black rounded-xl px-6 h-10 shadow-lg shrink-0">
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="relative overflow-hidden border-none shadow-xl bg-slate-900 text-white min-h-[220px] rounded-3xl flex items-center">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/abacus_hero.webp?alt=media')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <CardContent className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black font-headline uppercase leading-none">Road to Mastery</h1>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge className="bg-yellow-400 text-slate-900 font-bold px-4 py-1.5 rounded-full border-none shadow-md">RANK: {currentRank.name}</Badge>
              <Badge variant="outline" className="text-white border-white/20 px-4 py-1.5 rounded-full font-bold bg-white/5 backdrop-blur-sm">GOAL: {nextRank.name}</Badge>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-[10px] font-black uppercase tracking-widest text-slate-400 pt-2">
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                <CalendarDays className={cn("w-3 h-3", daysNeeded === 0 ? "text-green-400" : "text-blue-400")} />
                {daysNeeded === 0 ? "Days Requirement Met" : `${daysNeeded} More Day${daysNeeded === 1 ? '' : 's'} Needed`}
              </div>
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                <Star className={cn("w-3 h-3", pointsNeeded === 0 ? "text-green-400" : "text-yellow-400")} />
                {pointsNeeded === 0 ? "Points Requirement Met" : `${pointsNeeded.toLocaleString()} Pts Needed`}
              </div>
            </div>
          </div>
          <div className="w-full md:w-80 space-y-3 bg-black/20 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between text-[10px] font-black uppercase text-blue-300">
              <span>Goal: {nextRank.name}</span>
              <span>{Math.floor(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-white/10 rounded-full p-0.5 shadow-inner">
              <div className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(56,189,248,0.5)]" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[8px] font-bold text-center text-slate-500 italic tracking-wide">Meet both requirements to unlock rank</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card/50 border-border/50 shadow-sm"><CardContent className="p-6 flex items-center gap-4"><div className="bg-orange-100 p-3 rounded-2xl shrink-0"><Flame className="text-orange-600 w-6 h-6" /></div><div><p className="text-3xl font-black leading-none">{profile.currentStreak || 0}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Streak</p></div></CardContent></Card>
        <Card className="bg-card/50 border-border/50 shadow-sm"><CardContent className="p-6 flex items-center gap-4"><div className="bg-blue-100 p-3 rounded-2xl shrink-0"><CalendarDays className="text-blue-600 w-6 h-6" /></div><div><p className="text-3xl font-black leading-none">{currentDays}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Practice Days</p></div></CardContent></Card>
        <Card className="lg:col-span-2 shadow-md bg-white border-slate-100 border-2"><CardContent className="p-6 h-full flex flex-col justify-center">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Weekly</p>
                <p className="text-base sm:text-2xl font-black text-foreground">{(profile.weeklyPoints || 0).toLocaleString()}</p>
                <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight">Points</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Monthly</p>
                <p className="text-base sm:text-2xl font-black text-foreground">{(profile.monthlyPoints || 0).toLocaleString()}</p>
                <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight">Points</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100">
                <p className="text-[8px] font-black uppercase text-muted-foreground mb-1">Total</p>
                <p className="text-base sm:text-2xl font-black text-primary">{(profile.totalPoints || 0).toLocaleString()}</p>
                <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-tight">Mastery Points</p>
              </div>
            </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-3"><CalendarDays className="text-primary w-7 h-7" /> Training Milestone</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(w => {
              const startDay = (w - 1) * 7;
              const wp = Math.max(0, Math.min(7, currentDays - startDay));
              const isWeekCompleted = currentDays >= (startDay + 7);

              return (
                <Card key={w} className="overflow-hidden border-border rounded-2xl shadow-sm bg-card/30">
                  <CardHeader className="bg-muted/30 border-b p-4 flex flex-row items-center justify-between">
                    <span className="font-black text-sm uppercase">Week {w}</span>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{wp}/7 Days</span>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 overflow-x-auto scrollbar-none">
                    <div className="flex justify-start items-center gap-2.5 flex-nowrap min-w-max">
                      {[1, 2, 3, 4, 5, 6].map(d => (
                        <div key={d} className={cn("w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 flex items-center justify-center shrink-0 aspect-square", currentDays >= (startDay + d) ? "bg-primary border-primary text-white shadow-md" : "bg-muted border-border text-muted-foreground")}>
                          {currentDays >= (startDay + d) ? <Check className="w-5 h-5 stroke-[4px]" /> : <span className="text-[10px] sm:text-sm font-black">{d}</span>}
                        </div>
                      ))}
                      <div className={cn(
                        "w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 flex items-center justify-center shrink-0 aspect-square transition-all duration-500", 
                        isWeekCompleted ? "bg-yellow-400 border-yellow-500 text-slate-900 scale-110 shadow-lg animate-trophy-pop" : "bg-muted border-border opacity-50 grayscale"
                      )}>
                        <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button onClick={() => router.push('/tests')} className="w-full h-24 bg-primary hover:bg-primary/90 rounded-3xl shadow-xl flex items-center justify-center gap-4 group">
            <span className="text-2xl font-black uppercase tracking-widest leading-none">Start Training</span>
            <ChevronRight className="w-10 h-10 group-hover:translate-x-2 transition-transform stroke-[4px]" />
          </Button>
        </div>

        <div className="space-y-8">
          {!profile.fcmToken && (
            <Card className="bg-primary/5 rounded-2xl border-primary/20 border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-black flex items-center gap-2 uppercase tracking-tight text-primary"><Bell className="w-5 h-5" /> Push Alerts</CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground">Get daily reminders at 7 PM IST.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleEnableNotifications} disabled={isRequestingNotifications} className="w-full rounded-xl h-12 font-black uppercase text-xs">
                  {isRequestingNotifications ? <Loader2 className="animate-spin" /> : "Allow Notifications"}
                </Button>
              </CardContent>
            </Card>
          )}
          <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b pb-0">
              <CardTitle className="text-xl font-black flex items-center gap-2 uppercase tracking-tight mb-4 text-foreground"><Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame</CardTitle>
              <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                <TabsList className="grid grid-cols-3 bg-slate-200/50 mb-2 h-10 p-1">
                  <TabsTrigger value="weeklyPoints" className="text-[9px] font-black uppercase">Weekly</TabsTrigger>
                  <TabsTrigger value="monthlyPoints" className="text-[9px] font-black uppercase">Monthly</TabsTrigger>
                  <TabsTrigger value="totalPoints" className="text-[9px] font-black uppercase">Global</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {leaderboard.length > 0 ? leaderboard.map((s, i) => (
                  <div key={s.uid} className={cn("flex items-center justify-between p-4", s.uid === profile.uid ? "bg-primary/5" : "hover:bg-muted/30")}>
                    <div className="flex items-center gap-4 min-w-0">
                      <span className={cn("w-6 text-sm font-black shrink-0", i === 0 ? "text-yellow-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-600" : "text-muted-foreground")}>#{i + 1}</span>
                      <Avatar className="h-10 w-10 border-2 border-white shrink-0"><AvatarImage src={s.photo}/><AvatarFallback className="font-bold">{s.name?.charAt(0)}</AvatarFallback></Avatar>
                      <div className="min-w-0 overflow-hidden">
                        <p className="text-sm font-bold truncate">{s.name}</p>
                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase inline-block truncate max-w-full" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2"><p className="text-sm font-black text-primary">{s.points.toLocaleString()}</p><p className="text-[8px] font-black text-muted-foreground uppercase">Points</p></div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-muted-foreground space-y-2">
                    <Clock className="w-8 h-8 mx-auto opacity-20" />
                    <p className="text-xs font-bold uppercase tracking-widest">Fresh Period</p>
                    <p className="text-[10px] opacity-60">Practice now to be #1 this week!</p>
                  </div>
                )}
              </div>
              <div className="bg-primary/5 p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">Your Performance</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">Keep practicing to climb the global ranks!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
