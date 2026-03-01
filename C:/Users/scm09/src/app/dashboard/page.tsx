
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Check, Trophy, Zap, ChevronRight, Bell, Loader2, Star, Flame, CalendarDays, Info, ArrowUpTrendUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc, getCountFromServer } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ProfileData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMessaging, getToken } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AchievementModal from '@/components/AchievementModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentDashboardPage() {
  usePageBackground('');
  const { profile, user, isLoading, getStudentTitle, updateUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementData, setAchievementData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Leaderboard Sync
  useEffect(() => {
    if (mounted) {
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
      });

      return () => unsubscribe();
    }
  }, [mounted, getStudentTitle, leaderboardTab]);

  // Global Rank Calculation
  useEffect(() => {
    if (mounted && profile && !isLoading) {
      const calculateRank = async () => {
        const db = getFirestore(firebaseApp);
        const myPoints = (profile[leaderboardTab as keyof ProfileData] as number) || 0;
        
        const rankQuery = query(
          collection(db, "users"),
          where("role", "==", "student"),
          where(leaderboardTab, ">", myPoints)
        );
        
        try {
          const snapshot = await getCountFromServer(rankQuery);
          setUserRank(snapshot.data().count + 1);
        } catch (e) {
          console.error("Rank calculation failed", e);
        }
      };
      calculateRank();
    }
  }, [mounted, profile, leaderboardTab, isLoading]);

  // Achievement Detection
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
          toast({ title: "Notifications Enabled!", description: "Daily practice reminders active at 7 PM IST. 🔥" });
        }
      }
    } catch (error: any) {
      toast({ title: "Setup Failed", description: "Could not enable reminders.", variant: "destructive" });
    } finally {
      setIsRequestingNotifications(false);
    }
  };

  const getMotivationalMessage = () => {
    if (!userRank) return "Calculate your potential today!";
    if (userRank === 1) return "👑 You are the absolute Champion!";
    if (userRank <= 10) return "🔥 You're in the Top 10! Can you reach #1?";
    if (userRank <= 50) return "🚀 Amazing! You're racing toward the Top 10!";
    return "💡 Practice daily to climb into the Hall of Fame!";
  };

  if (isLoading || !mounted) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-[100px] rounded-xl" />
          <Skeleton className="h-[100px] rounded-xl" />
          <Skeleton className="h-[100px] rounded-xl" />
          <Skeleton className="h-[100px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const currentPoints = profile.totalPoints || 0;
  const currentDays = profile.totalDaysPracticed || 0;
  const currentRank = getStudentTitle(currentDays, currentPoints);
  const daysInMonthLeft = 30 - new Date().getDate();
  
  const nextTitle = [
    { name: "Apprentice", days: 30, points: 2500 },
    { name: "Speed Runner", days: 90, points: 10000 },
    { name: "Math Ninja", days: 180, points: 25000 },
    { name: "Grandmaster", days: 270, points: 50000 },
    { name: "Human Calculator", days: 365, points: 100000 }
  ].find(t => currentDays < t.days || currentPoints < t.points) || { name: "Max Rank", days: 365, points: 100000 };

  const pointsProg = Math.min(100, (currentPoints / nextTitle.points) * 100);
  const daysProg = Math.min(100, (currentDays / nextTitle.days) * 100);
  const totalProg = (pointsProg + daysProg) / 2;

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

      {/* Hero Header */}
      <Card className="relative overflow-hidden border-none shadow-xl bg-slate-900 text-white min-h-[220px] flex flex-col justify-center rounded-2xl">
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/abacus/1200/400')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent" />
        <CardContent className="relative z-10 p-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 text-center md:text-left max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Road to Mastery</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Badge className="bg-yellow-400 text-slate-900 font-semibold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-lg border-none">
                {currentRank.icon} Rank: {currentRank.name}
              </Badge>
              <Badge variant="outline" className="text-white border-white/20 px-4 py-1.5 rounded-full text-xs tracking-wide font-bold">
                <Zap className="w-3 h-3 mr-1 text-yellow-400 fill-yellow-400" /> {daysInMonthLeft} Days Left This Month
              </Badge>
            </div>
          </div>
          <div className="w-full md:w-80 space-y-3">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300">
              <span>Goal: {nextTitle.name}</span>
              <span>{Math.floor(totalProg)}% Complete</span>
            </div>
            <div className="h-4 w-full bg-white/10 rounded-full p-1 border border-white/10">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.6)] transition-all duration-1000" style={{ width: `${totalProg}%` }} />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 uppercase">
              <span>{currentPoints.toLocaleString()} / {nextTitle.points.toLocaleString()} PTS</span>
              <span>{currentDays} / {nextTitle.days} DAYS</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-orange-100 p-3 rounded-2xl"><Flame className="w-6 h-6 text-orange-600" /></div>
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">{profile.currentStreak || 0}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl"><CalendarDays className="w-6 h-6 text-blue-600" /></div>
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">{currentDays}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Practice Days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-card/50 border-border/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-yellow-100 p-3 rounded-2xl"><Star className="w-6 h-6 text-yellow-600 fill-yellow-600" /></div>
            <div>
              <p className="text-3xl font-bold text-foreground leading-none">{currentPoints.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Mastery Points</p>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-primary/10 border-primary/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-primary/20 p-3 rounded-2xl"><Trophy className="w-6 h-6 text-primary" /></div>
            <div>
              <p className="text-3xl font-bold text-primary leading-none">#{userRank || '--'}</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Current Position</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground font-headline flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-primary" />
              28 Day Practice Challenge
            </h2>
            <Button variant="link" onClick={() => router.push('/progress')} className="font-bold text-primary p-0 uppercase tracking-tight text-xs">
              View History <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((weekNum) => {
              const startDay = (weekNum - 1) * 7;
              const weekProgress = Math.max(0, Math.min(7, currentDays - startDay));
              return (
                <Card key={weekNum} className="overflow-hidden border-border/50 shadow-sm hover:border-primary/20 transition-all rounded-xl">
                  <CardHeader className="bg-muted/30 border-b border-border/50 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground p-1 rounded"><Check className="w-3 h-3 stroke-[3px]" /></div>
                        <span className="font-bold text-foreground uppercase tracking-tight text-sm">Week {weekNum}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">{weekProgress}/7 Days</span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center relative gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((dayOffset) => {
                        const absoluteDay = startDay + dayOffset;
                        const isCompleted = currentDays >= absoluteDay;
                        const isCurrent = currentDays + 1 === absoluteDay;
                        return (
                          <div key={dayOffset} className={cn("w-10 h-10 aspect-square rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-500 min-w-[36px]",
                              isCompleted ? "bg-primary border-primary text-primary-foreground scale-105" : isCurrent ? "border-primary bg-background text-primary animate-pulse ring-4 ring-primary/5" : "bg-muted/50 border-border text-muted-foreground")}>
                            {isCompleted ? <Check className="w-5 h-5 stroke-[3px]" /> : <span className="text-xs font-bold">{dayOffset}</span>}
                          </div>
                        );
                      })}
                      <div className={cn("w-10 h-10 aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all min-w-[36px]", weekProgress === 7 ? "bg-yellow-50 border-yellow-400 text-yellow-600 scale-110 shadow-md shadow-yellow-100" : "bg-muted/50 border-border/50 grayscale opacity-50")}>
                        <Trophy className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button onClick={() => router.push('/tests')} className="w-full h-20 bg-primary hover:bg-primary/90 text-2xl font-bold rounded-2xl shadow-xl uppercase tracking-widest">
            Start Practice <ChevronRight className="w-8 h-8 ml-4 stroke-[3px]" />
          </Button>
        </div>

        <div className="space-y-8">
          <Card className="border-border/50 shadow-sm bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-primary flex items-center gap-2 font-headline uppercase tracking-tight"><Bell className="w-5 h-5" /> Daily Reminders</CardTitle>
              <CardDescription className="text-xs text-muted-foreground font-medium">Receive motivational nudges at 7 PM IST.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleEnableNotifications} disabled={isRequestingNotifications || !!profile.fcmToken} variant={profile.fcmToken ? "ghost" : "default"} className={cn("w-full rounded-xl h-12 font-bold uppercase text-xs", profile.fcmToken ? "text-green-600 bg-green-50/50 cursor-default" : "shadow-md")}>
                {isRequestingNotifications ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : profile.fcmToken ? <><Check className="w-4 h-4 mr-2 stroke-[3px]" /> Reminders Active</> : "Enable Notifications"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm overflow-hidden rounded-xl">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-0">
              <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-headline uppercase tracking-tight mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame</CardTitle>
              <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-200/50">
                  <TabsTrigger value="weeklyPoints" className="text-[10px] font-bold uppercase py-2">Weekly</TabsTrigger>
                  <TabsTrigger value="monthlyPoints" className="text-[10px] font-bold uppercase py-2">Monthly</TabsTrigger>
                  <TabsTrigger value="totalPoints" className="text-[10px] font-bold uppercase py-2">Global</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
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
                    <div className="text-right">
                      <span className="text-base font-bold text-primary block">{student.points.toLocaleString()}</span>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase">Points</span>
                    </div>
                  </div>
                )) : <div className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Loading Champions...</div>}
              </div>
              <div className="bg-primary/5 p-4 border-t border-border/50">
                <div className="flex items-center gap-3 mb-2">
                  <ArrowUpTrendUp className="w-4 h-4 text-primary" />
                  <p className="text-[11px] font-bold text-foreground uppercase tracking-tight">Your Performance</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">{getMotivationalMessage()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
