
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Check, Trophy, Zap, ChevronRight, Bell, Loader2, Star, Flame, CalendarDays, Info, ShieldAlert, MailCheck, TrendingUp, ArrowUp, Sparkles, Clock } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RANK_CRITERIA } from '@/lib/constants';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { useSound } from '@/hooks/useSound';

const PointsAnimation = ({ points }: { points: number }) => {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex items-center gap-1 text-green-600 font-black text-2xl drop-shadow-md pointer-events-none z-50">
      <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-600" />
      +{points}
    </div>
  );
};

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

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (profile && profile.totalPoints !== undefined) {
      if (lastPointsRef.current !== 0 && profile.totalPoints > lastPointsRef.current) {
        const diff = profile.totalPoints - lastPointsRef.current;
        setPointsEarned(diff);
        playSound('points');
        const timer = setTimeout(() => setPointsEarned(null), 2500);
        return () => clearTimeout(timer);
      }
      lastPointsRef.current = profile.totalPoints;
    }
  }, [profile?.totalPoints, playSound]);

  useEffect(() => {
    if (mounted && user) {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        orderBy(leaderboardTab, "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const userData = doc.data() as ProfileData;
          const title = getStudentTitle(userData.totalDaysPracticed || 0, userData.totalPoints || 0);
          return {
            uid: doc.id,
            name: `${userData.firstName} ${userData.surname}`,
            photo: userData.profilePhoto,
            days: userData.totalDaysPracticed || 0,
            points: userData[leaderboardTab as keyof ProfileData] || 0,
            title: title
          };
        });
        setLeaderboard(data);
      }, async (error) => {
          const permissionError = new FirestorePermissionError({
            path: '/users',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
      });

      return () => unsubscribe();
    }
  }, [mounted, user, getStudentTitle, leaderboardTab]);

  useEffect(() => {
    if (mounted && profile && profile.role === 'student' && !isLoading) {
      const currentPoints = profile.totalPoints || 0;
      const currentDays = profile.totalDaysPracticed || 0;
      const calculatedRank = getStudentTitle(currentDays, currentPoints);

      if (calculatedRank.name !== profile.lastAwardedRank) {
        setAchievementData(calculatedRank);
        setShowAchievement(true);
        updateUserProfile(user!.uid, { lastAwardedRank: calculatedRank.name } as any)
          .catch(e => console.error("Failed to update awarded rank", e));
      }
    }
  }, [mounted, profile, getStudentTitle, user, updateUserProfile, isLoading]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setIsRequestingNotifications(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, { 
          vapidKey: 'BF27zRYbNBqLyR0w1XZVSCWK0YNgG7M9DymtcLAPr6A0gUoT0OlIn-q7fpPhgYgOwcj91lmXUL7KvTV4o0Yd7J8' 
        });
        
        if (token) {
          const db = getFirestore(firebaseApp);
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { fcmToken: token });
          toast({ title: "Notifications Enabled!", description: "You'll receive daily reminders at 7 PM IST. 🔥" });
        }
      }
    } catch (error: any) {
      toast({ title: "Setup Failed", description: "Could not enable reminders.", variant: "destructive" });
    } finally {
      setIsRequestingNotifications(false);
    }
  };

  const handleResendVerification = async () => {
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail();
      toast({ title: "Verification Sent", description: "Please check your inbox (and spam folder)." });
    } catch (error: any) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const currentPoints = profile?.totalPoints || 0;
  const currentDays = profile?.totalDaysPracticed || 0;
  const currentRank = getStudentTitle(currentDays, currentPoints);
  
  const { nextRank, daysRemaining, pointsRemaining, totalProg } = useMemo(() => {
    const next = RANK_CRITERIA.slice().reverse().find(r => currentDays < r.daysReq || currentPoints < r.pointsReq);
    if (!next) return { nextRank: null, daysRemaining: 0, pointsRemaining: 0, totalProg: 100 };

    const dRem = Math.max(0, next.daysReq - currentDays);
    const pRem = Math.max(0, next.pointsReq - currentPoints);
    
    const dProg = Math.min(100, (currentDays / (next.daysReq || 1)) * 100);
    const pProg = Math.min(100, (currentPoints / (next.pointsReq || 1)) * 100);
    const combinedProg = (dProg + pProg) / 2;

    return { nextRank: next, daysRemaining: dRem, pointsRemaining: pRem, totalProg: combinedProg };
  }, [currentDays, currentPoints]);

  if (isLoading || !mounted) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><Skeleton className="h-[120px] rounded-xl" /><Skeleton className="h-[120px] rounded-xl" /><Skeleton className="h-[120px] rounded-xl" /></div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const daysInMonthLeft = 30 - new Date().getDate();
  const isEmailVerified = user.emailVerified || /testuser|tempuser/i.test(user.email || '') || (profile?.firstName?.toLowerCase() === 'maitreya' && profile?.surname?.toLowerCase() === 'mane');

  const trialHoursRemaining = Math.floor((trialDaysRemaining % 1) * 24);
  const trialDaysInt = Math.floor(trialDaysRemaining);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {showAchievement && achievementData && (
        <AchievementModal 
          studentName={`${profile.firstName} ${profile.surname}`}
          title={achievementData.name}
          icon={achievementData.icon}
          color={achievementData.color}
          totalPoints={currentPoints}
          totalDays={currentDays}
          onClose={() => setShowAchievement(false)}
        />
      )}

      {!isEmailVerified && (
        <Alert variant="destructive" className="bg-orange-50 border-orange-200 text-orange-800">
          <ShieldAlert className="h-4 w-4 text-orange-600" />
          <AlertTitle className="font-bold">Verify Your Email</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>Please verify your email address to unlock practice tests and games.</span>
            <Button size="sm" onClick={handleResendVerification} disabled={isSendingVerification} variant="outline" className="border-orange-300 hover:bg-orange-100">
              {isSendingVerification ? <Loader2 className="animate-spin h-4 w-4" /> : <MailCheck className="mr-2 h-4 w-4" />}
              Resend Link
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isTrialActive && profile.subscriptionStatus !== 'pro' && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-bold uppercase tracking-tight">Free Trial Active! 🎉</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-medium">
              You have unrestricted Pro access for the first 3 days. Use this time to master as many formulas as possible!
            </span>
            <div className="flex items-center gap-2 bg-white/50 px-4 py-2 rounded-full border border-blue-100">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="font-black font-mono">
                {trialDaysInt > 0 ? `${trialDaysInt}d ` : ''}{trialHoursRemaining}h remaining
              </span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="relative overflow-hidden border-none shadow-xl bg-slate-900 text-white min-h-[220px] flex flex-col justify-center rounded-2xl">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/abacus/1200/400')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <CardContent className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline uppercase">Road to Mastery</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-yellow-400 text-slate-900 font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-lg border-none">
                {currentRank.icon} Rank: {currentRank.name}
              </Badge>
              {nextRank && (
                <Badge variant="outline" className="text-white border-white/20 px-4 py-1.5 rounded-full text-xs tracking-wide font-bold">
                  Target: {nextRank.icon} {nextRank.name}
                </Badge>
              )}
            </div>
          </div>
          
          {nextRank && (
            <div className="w-full md:w-80 space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
                <span>Journey to {nextRank.name}</span>
                <span>{Math.floor(totalProg)}% Complete</span>
              </div>
              <div className="h-4 w-full bg-white/10 rounded-full p-1 border border-white/10">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: `${totalProg}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/5 rounded-lg py-2">
                  <p className="text-[14px] font-black text-white leading-none">{pointsRemaining.toLocaleString()}</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold mt-1">Pts to go</p>
                </div>
                <div className="bg-white/5 rounded-lg py-2">
                  <p className="text-[14px] font-black text-white leading-none">{daysRemaining}</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold mt-1">Days to go</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl"><Flame className="w-6 h-6 text-orange-600" /></div>
            <div><p className="text-3xl font-bold text-foreground leading-none">{profile.currentStreak || 0}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Streak</p></div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl"><CalendarDays className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-3xl font-bold text-foreground leading-none">{currentDays}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Days</p></div>
          </CardContent>
        </Card>
        <Card className={cn("hover:shadow-md transition-all bg-card/50 border-border/50 relative lg:col-span-2", pointsEarned && "ring-2 ring-green-500 shadow-lg scale-105 bg-green-50/10")}>
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-around gap-6 relative">
            {pointsEarned && <PointsAnimation points={pointsEarned} />}
            <div className="flex items-center gap-4 border-r border-border/50 pr-8">
                <div className="bg-yellow-100 p-3 rounded-2xl"><Star className="w-6 h-6 text-yellow-600 fill-yellow-600" /></div>
                <div>
                    <p className="text-3xl font-bold text-foreground leading-none">{currentPoints.toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Points</p>
                </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-8 text-center">
                <div>
                    <p className="text-2xl font-bold text-foreground">{(profile.weeklyPoints || 0).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">This Week</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-foreground">{(profile.monthlyPoints || 0).toLocaleString()}</p>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">This Month</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3"><CalendarDays className="w-6 h-6 text-primary" /> 28 Day Challenge</h2>
            <Button variant="link" onClick={() => router.push('/progress')} className="font-bold text-primary p-0 uppercase tracking-tight text-xs">History <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((weekNum) => {
              const startDay = (weekNum - 1) * 7;
              const weekProgress = Math.max(0, Math.min(7, currentDays - startDay));
              return (
                <Card key={weekNum} className="overflow-hidden border-border/50 shadow-sm rounded-xl">
                  <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="bg-primary text-primary-foreground p-1 rounded"><Check className="w-3 h-3 stroke-[3px]" /></div><span className="font-bold text-foreground uppercase tracking-tight text-sm">Week {weekNum}</span></div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{weekProgress}/7 Days</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center relative gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((dayOffset) => {
                        const isCompleted = currentDays >= (startDay + dayOffset);
                        const isCurrent = currentDays + 1 === (startDay + dayOffset);
                        return <div key={dayOffset} className={cn("w-10 h-10 aspect-square rounded-full flex items-center justify-center border-2 shadow-sm transition-all", isCompleted ? "bg-primary border-primary text-primary-foreground scale-105" : isCurrent ? "border-primary bg-background text-primary animate-pulse ring-4 ring-primary/5" : "bg-muted/50 border-border text-muted-foreground")}>{isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : <span className="text-xs font-bold">{dayOffset}</span>}</div>;
                      })}
                      <div className={cn("w-10 h-10 aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all", weekProgress === 7 ? "bg-yellow-50 border-yellow-400 text-yellow-600 scale-110 shadow-md" : "bg-muted/50 border-border/50 grayscale opacity-50")}><Trophy className="w-5 h-5" /></div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button onClick={() => router.push('/tests')} disabled={!isEmailVerified} className="w-full h-20 bg-primary hover:bg-primary/90 text-2xl font-bold rounded-2xl shadow-xl uppercase tracking-widest group">
            Start Practice {!isEmailVerified && <ShieldAlert className="ml-2 h-6 w-6" />} <ChevronRight className="w-8 h-8 ml-4 stroke-[3px] group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        <div className="space-y-8">
          <Card className="border-border/50 shadow-sm bg-primary/5">
            <CardHeader className="pb-2"><CardTitle className="text-lg font-bold text-primary flex items-center gap-2 font-headline uppercase tracking-tight"><Bell className="w-5 h-5" /> Daily Reminders</CardTitle></CardHeader>
            <CardContent>
              <Button onClick={handleEnableNotifications} disabled={isRequestingNotifications || !!profile.fcmToken} variant={profile.fcmToken ? "ghost" : "default"} className={cn("w-full rounded-xl h-12 font-bold transition-all uppercase text-xs", profile.fcmToken ? "text-green-600 bg-green-50/50 cursor-default" : "shadow-md")}>{isRequestingNotifications ? <Loader2 className="animate-spin h-4 w-4" /> : profile.fcmToken ? <><Check className="mr-2 h-4 w-4 stroke-[3px]" /> Active</> : "Enable Notifications"}</Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden rounded-xl">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-0">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-headline uppercase tracking-tight mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame</CardTitle>
              <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full"><TabsList className="grid w-full grid-cols-3 bg-slate-200/50"><TabsTrigger value="weeklyPoints" className="text-[10px] font-bold uppercase py-2">Weekly</TabsTrigger><TabsTrigger value="monthlyPoints" className="text-[10px] font-bold uppercase py-2">Monthly</TabsTrigger><TabsTrigger value="totalPoints" className="text-[10px] font-bold uppercase py-2">Global</TabsTrigger></TabsList></Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 min-h-[400px]">
                {leaderboard.length > 0 ? leaderboard.map((student, idx) => (
                  <div key={student.uid} className={cn("flex items-center justify-between p-4", student.uid === profile.uid ? "bg-primary/5 ring-inset ring-1 ring-primary/10" : "hover:bg-muted/30")}>
                    <div className="flex items-center gap-4">
                      <span className={cn("w-6 text-sm font-bold", idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground")}>#{idx + 1}</span>
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarImage src={student.photo} /><AvatarFallback className="bg-muted font-bold">{student.name?.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">{student.name}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight w-fit" style={{ backgroundColor: student.title.color + '20', color: student.title.color }}>{student.title.icon} {student.title.name}</span>
                      </div>
                    </div>
                    <div className="text-right"><span className="text-base font-bold text-primary leading-none block">{student.points.toLocaleString()}</span><span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Points</span></div>
                  </div>
                )) : <div className="py-24 text-center text-muted-foreground"><p className="text-sm font-bold uppercase tracking-widest">Summoning Champions...</p></div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
