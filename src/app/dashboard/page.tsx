
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Check, Trophy, Zap, ChevronRight, Bell, Loader2, Star, Flame, CalendarDays, Info, ShieldAlert, MailCheck, TrendingUp, ArrowUp, Sparkles, Clock, Crown, Rocket, Lightbulb, Target, Timer as TimerIcon } from 'lucide-react';
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
import Link from 'next/link';

const PointsAnimation = ({ points }: { points: number }) => {
  return (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-10 duration-1000 flex items-center gap-1 text-green-600 font-black text-2xl drop-shadow-md pointer-events-none z-50">
      <Star className="w-5 h-5 fill-yellow-400 stroke-yellow-600" />
      +{points}
    </div>
  );
};

const motivationalQuotes = [
  "Precision is the pride of a Human Calculator.",
  "Every bead moved is a step closer to Grandmaster status.",
  "Speed comes from practice, mastery comes from consistency.",
  "Visualize the beads, conquer the numbers.",
  "Your brain is the world's most powerful computer. Train it!"
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
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Auto-activate notifications on login
  useEffect(() => {
    if (mounted && user && profile && !profile.fcmToken && !isRequestingNotifications) {
      handleEnableNotifications(true);
    }
  }, [mounted, user, profile]);

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

  const handleEnableNotifications = async (isAuto = false) => {
    if (!user || typeof Notification === 'undefined') return;
    
    if (Notification.permission === 'denied') {
      if (!isAuto) toast({ title: "Setup Blocked", description: "Enable notifications in browser settings.", variant: "destructive" });
      return;
    }

    if (!isAuto) setIsRequestingNotifications(true);
    
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
          if (!isAuto) {
            toast({ title: "Training Alerts Active!", description: "Daily math nudges enabled at 7 PM IST. 🔥" });
          }
        }
      }
    } catch (error: any) {
      console.error("Notification setup error:", error);
    } finally {
      if (!isAuto) setIsRequestingNotifications(false);
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
  const ultimateGoal = RANK_CRITERIA[0]; 
  
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

  const isEmailVerified = user.emailVerified || /testuser|tempuser/i.test(user.email || '');
  const trialHoursRemaining = Math.floor((trialDaysRemaining % 1) * 24);
  const trialDaysInt = Math.floor(trialDaysRemaining);
  const trialExpired = !isTrialActive && profile.subscriptionStatus === 'free';

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

      {/* Verification Alert */}
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

      {/* Trial Status */}
      {trialExpired && (
        <Alert className="bg-slate-900 border-none text-white shadow-2xl">
          <Crown className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          <AlertTitle className="text-xl font-black uppercase tracking-tight">Free Trial Has Ended</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
            <span className="font-medium text-slate-300">
              Continue your journey to becoming a <strong>Human Calculator</strong>. Upgrade to Pro now to unlock all 50+ levels!
            </span>
            <Button asChild className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 font-black uppercase tracking-widest px-8 h-12 shrink-0">
              <Link href="/pricing">Get Pro Access</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isTrialActive && profile.subscriptionStatus !== 'pro' && (
        <Alert className="bg-gradient-to-r from-blue-600 to-indigo-700 border-none text-white shadow-xl py-6 overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex gap-4 items-start">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm"><Crown className="h-8 w-8 text-yellow-300 fill-yellow-300" /></div>
                <div className="space-y-1">
                    <AlertTitle className="text-2xl font-black uppercase tracking-tight">Free Trial Active! 🎉</AlertTitle>
                    <AlertDescription className="text-blue-100 font-medium max-w-lg">
                        You have unrestricted Pro access! Reach for the top before the clock runs out.
                    </AlertDescription>
                </div>
            </div>
            <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3 bg-black/20 px-6 py-3 rounded-2xl border border-white/10">
                    <Clock className="h-5 w-5 text-yellow-300 animate-pulse" />
                    <span className="font-black font-mono text-xl">
                        {trialDaysInt > 0 ? `${trialDaysInt}d ` : ''}{trialHoursRemaining}h left
                    </span>
                </div>
                <Button asChild variant="secondary" className="bg-white text-blue-700 hover:bg-blue-50 font-black uppercase tracking-widest w-full">
                    <Link href="/pricing">Lock in Pro</Link>
                </Button>
            </div>
          </div>
        </Alert>
      )}

      {/* Hero Header */}
      <Card className="relative overflow-hidden border-none shadow-xl bg-slate-900 text-white min-h-[240px] flex flex-col justify-center rounded-3xl">
        <div className="absolute inset-0 opacity-30 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/abacus/1200/400')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <CardContent className="relative z-10 p-8 flex flex-col lg:flex-row justify-between items-center gap-10">
          <div className="space-y-6 text-center lg:text-left max-w-xl">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight font-headline uppercase leading-none">The Path to Power</h1>
                <p className="text-blue-300 font-bold uppercase tracking-[0.2em] text-xs">Mission: Become a {ultimateGoal.name}</p>
            </div>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Badge className="bg-yellow-400 text-slate-900 font-black px-4 py-2 rounded-full text-xs tracking-wider shadow-lg border-none">
                {currentRank.icon} RANK: {currentRank.name}
              </Badge>
              {nextRank && (
                <Badge variant="outline" className="text-white border-white/20 px-4 py-2 rounded-full text-xs tracking-wider font-bold">
                  NEXT: {nextRank.icon} {nextRank.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm italic font-medium bg-white/5 py-2 px-4 rounded-xl w-fit mx-auto lg:mx-0">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                "{quoteRef.current}"
            </div>
          </div>
          
          <div className="w-full max-w-sm space-y-6 bg-black/20 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
            {nextRank ? (
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-blue-300">
                  <span>Progress to {nextRank.name}</span>
                  <span>{Math.floor(totalProg)}%</span>
                </div>
                <div className="h-3 w-full bg-white/10 rounded-full p-0.5 border border-white/5">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: `${totalProg}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
                    <p className="text-lg font-black text-white leading-none">{pointsRemaining.toLocaleString()}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black mt-1">Pts Remaining</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl py-3 border border-white/5">
                    <p className="text-lg font-black text-white leading-none">{daysRemaining}</p>
                    <p className="text-[8px] text-slate-400 uppercase font-black mt-1">Days to Go</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="font-black uppercase tracking-tighter text-xl">Maximum Rank Reached!</p>
                <p className="text-slate-400 text-xs mt-1">You are a True Human Calculator.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Grid - Mastery Points Layout Fixed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl"><Flame className="w-6 h-6 text-orange-600" /></div>
            <div><p className="text-3xl font-bold text-foreground leading-none">{profile.currentStreak || 0}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Day Streak</p></div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl"><CalendarDays className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-3xl font-bold text-foreground leading-none">{currentDays}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Days</p></div>
          </CardContent>
        </Card>
        <Card className={cn("hover:shadow-md transition-all bg-card border-border relative lg:col-span-2 overflow-hidden", pointsEarned && "ring-2 ring-green-500 shadow-lg scale-105 bg-green-50/10")}>
          <CardContent className="p-6 relative">
            {pointsEarned && <PointsAnimation points={pointsEarned} />}
            <div className="grid grid-cols-3 items-center gap-2 divide-x divide-border/50 h-full text-center">
                <div className="px-2">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 shrink-0" />
                            <span className="text-xl md:text-2xl font-black text-foreground truncate">{currentPoints.toLocaleString()}</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total Pts</p>
                    </div>
                </div>
                <div className="px-2 flex flex-col items-center">
                    <p className="text-lg md:text-xl font-black text-foreground truncate">{(profile.weeklyPoints || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Weekly</p>
                </div>
                <div className="px-2 flex flex-col items-center">
                    <p className="text-lg md:text-xl font-black text-foreground truncate">{(profile.monthlyPoints || 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Monthly</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3"><CalendarDays className="w-6 h-6 text-primary" /> Consistency Challenge</h2>
            <Button variant="link" onClick={() => router.push('/progress')} className="font-bold text-primary p-0 uppercase tracking-tight text-xs">History <ChevronRight className="w-4 h-4 ml-1" /></Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((weekNum) => {
              const startDay = (weekNum - 1) * 7;
              const weekProgress = Math.max(0, Math.min(7, currentDays - startDay));
              return (
                <Card key={weekNum} className="overflow-hidden border-border shadow-sm rounded-2xl">
                  <CardHeader className="bg-muted/30 border-b border-border py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1 rounded"><Check className="w-3 h-3 stroke-[3px]" /></div>
                        <span className="font-bold text-foreground uppercase tracking-tight text-sm">Week {weekNum}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{weekProgress}/7 Days</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-start items-center relative gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5, 6].map((dayOffset) => {
                        const isCompleted = currentDays >= (startDay + dayOffset);
                        const isCurrent = currentDays + 1 === (startDay + dayOffset);
                        return (
                          <div 
                            key={dayOffset} 
                            className={cn(
                              "w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 shadow-sm transition-all aspect-square shrink-0", 
                              isCompleted ? "bg-primary border-primary text-primary-foreground scale-105" : isCurrent ? "border-primary bg-background text-primary animate-pulse ring-4 ring-primary/5" : "bg-muted/50 border-border text-muted-foreground"
                            )}
                          >
                            {isCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3px]" /> : <span className="text-[9px] sm:text-xs font-black">{dayOffset}</span>}
                          </div>
                        );
                      })}
                      {(() => {
                        const isCompleted = currentDays >= (startDay + 7);
                        return (
                          <div className={cn(
                            "w-7 h-7 sm:w-9 sm:h-9 rounded-xl border-2 flex items-center justify-center transition-all aspect-square shrink-0", 
                            isCompleted ? "bg-yellow-400 border-yellow-500 text-slate-900 scale-110 shadow-lg" : "bg-muted/50 border-border/50 grayscale opacity-50"
                          )}>
                            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button 
            onClick={() => router.push('/tests')} 
            disabled={!isEmailVerified} 
            className="w-full h-24 bg-primary hover:bg-primary/90 rounded-3xl shadow-xl uppercase tracking-wider group relative overflow-hidden px-4"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex flex-col sm:flex-row items-center justify-center text-center gap-2">
                <span className="text-xl sm:text-2xl md:text-3xl font-black">
                    START PRACTICE {!isEmailVerified && <ShieldAlert className="inline ml-2 h-6 w-6" />}
                </span>
                <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 stroke-[4px] group-hover:translate-x-2 transition-transform shrink-0" />
            </span>
          </Button>
        </div>

        <div className="space-y-8">
          {!profile.fcmToken && (
            <Card className="border-border shadow-sm bg-primary/5 rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 border-b border-primary/10">
                  <CardTitle className="text-lg font-bold text-primary flex items-center gap-2 font-headline uppercase tracking-tight">
                      <Bell className="w-5 h-5" /> Training Alerts
                  </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Button onClick={() => handleEnableNotifications()} disabled={isRequestingNotifications} className="w-full rounded-xl h-12 font-bold transition-all uppercase text-xs shadow-md">
                  {isRequestingNotifications ? <Loader2 className="animate-spin h-4 w-4" /> : "Enable Alerts"}
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-sm overflow-hidden rounded-2xl">
            <CardHeader className="bg-muted/30 border-b border-border pb-0">
              <CardTitle className="text-xl font-black flex items-center gap-2 font-headline uppercase tracking-tight mb-4">
                <Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame
              </CardTitle>
              <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-200/50 mb-2">
                    <TabsTrigger value="weeklyPoints" className="text-[9px] font-black uppercase py-2">Weekly</TabsTrigger>
                    <TabsTrigger value="monthlyPoints" className="text-[9px] font-black uppercase py-2">Monthly</TabsTrigger>
                    <TabsTrigger value="totalPoints" className="text-[9px] font-black uppercase py-2">Global</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50 min-h-[400px]">
                {leaderboard.length > 0 ? leaderboard.map((student, idx) => (
                  <div key={student.uid} className={cn("flex items-center justify-between p-4", student.uid === profile.uid ? "bg-primary/5 ring-inset ring-1 ring-primary/10" : "hover:bg-muted/30 transition-colors")}>
                    <div className="flex items-center gap-4">
                      <span className={cn("w-6 text-sm font-black", idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground")}>#{idx + 1}</span>
                      <Avatar className="h-12 w-12 border-2 border-white shadow-sm shrink-0"><AvatarImage src={student.photo} /><AvatarFallback className="bg-muted font-bold">{student.name?.charAt(0)}</AvatarFallback></Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">{student.name}</span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit" style={{ backgroundColor: student.title.color + '20', color: student.title.color }}>{student.title.icon} {student.title.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                        <span className="text-base font-black text-primary leading-none block">{student.points.toLocaleString()}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Points</span>
                    </div>
                  </div>
                )) : <div className="py-24 text-center text-muted-foreground"><p className="text-sm font-bold uppercase tracking-widest animate-pulse">Summoning Champions...</p></div>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
