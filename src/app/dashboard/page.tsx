
'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Check, Trophy, Zap, ChevronRight, Bell, BellOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ProfileData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMessaging, getToken } from 'firebase/messaging';
import { useToast } from '@/hooks/use-toast';

export default function StudentDashboardPage() {
  usePageBackground('');
  const { profile, user, isLoading, getStudentTitle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isRequestingNotifications, setIsRequestingNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (mounted) {
      const db = getFirestore(firebaseApp);
      const q = query(
        collection(db, "users"),
        where("role", "==", "student"),
        orderBy("totalDaysPracticed", "desc"),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const userData = doc.data() as ProfileData;
          const title = getStudentTitle(userData.totalDaysPracticed || 0);
          return {
            uid: doc.id,
            name: `${userData.firstName} ${userData.surname}`,
            photo: userData.profilePhoto,
            days: userData.totalDaysPracticed || 0,
            title: title
          };
        });
        setLeaderboard(data);
      });

      return () => unsubscribe();
    }
  }, [mounted, getStudentTitle]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    setIsRequestingNotifications(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const messaging = getMessaging(firebaseApp);
        const token = await getToken(messaging, { 
          vapidKey: 'BM_placeholder_vapid_key_setup_via_console' // USER MUST REPLACE THIS IN PRODUCTION
        });
        
        if (token) {
          const db = getFirestore(firebaseApp);
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { fcmToken: token });
          toast({
            title: "Notifications Enabled!",
            description: "You'll receive daily practice reminders at 7 PM IST. 🔥",
          });
        } else {
          throw new Error("No registration token available. Request permission to generate one.");
        }
      } else {
        toast({
          title: "Permission Denied",
          description: "You won't receive practice reminders. You can enable them in browser settings.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("FCM Error:", error);
      toast({
        title: "Setup Failed",
        description: "Could not enable reminders. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingNotifications(false);
    }
  };

  if (isLoading || !mounted) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Skeleton className="h-[220px] w-full rounded-b-[30px]" />
        <Skeleton className="h-[150px] w-full rounded-[20px]" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-[20px]" />
          <Skeleton className="h-24 w-full rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const currentRank = getStudentTitle(profile.totalDaysPracticed || 0);
  const daysInMonthLeft = 30 - new Date().getDate();
  const progressToNextBadge = Math.min(100, Math.floor(((profile.totalDaysPracticed || 0) % 30) / 30 * 100));

  return (
    <div className="flex justify-center w-full bg-[#f4f7f9] -m-4 sm:-m-6 lg:-m-8 pb-32 relative font-sans rounded-2xl overflow-hidden min-h-screen">
      {/* Centered Wrapper */}
      <div className="w-full max-w-[450px] min-h-screen flex flex-col bg-white shadow-2xl">
        {/* Header Card */}
        <div className="relative h-[240px] rounded-b-[35px] overflow-hidden shadow-xl shadow-blue-900/10 flex-shrink-0">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"
            style={{ backgroundImage: "url('https://picsum.photos/seed/math/800/600')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-start text-white">
            <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic drop-shadow-md">Road to Mastery</h2>
            
            <div 
              className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-fit shadow-lg border border-white/20"
              style={{ backgroundColor: currentRank.color, color: '#000' }}
            >
              <span>{currentRank.icon}</span>
              <span>Current Rank: {currentRank.name}</span>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5 text-blue-100">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {daysInMonthLeft} Days left in Month</span>
                <span>{progressToNextBadge}% to next Badge</span>
              </div>
              <div className="h-3 w-full bg-white/20 rounded-full p-0.5 backdrop-blur-sm">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000" style={{ width: `${progressToNextBadge}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Section - 4 Weeks */}
        <div className="px-4 -mt-8 relative z-10 space-y-4">
          {[1, 2, 3, 4].map((weekNum) => {
            const startDay = (weekNum - 1) * 7;
            const weekProgress = Math.max(0, Math.min(7, (profile.totalDaysPracticed || 0) - startDay));
            
            return (
              <div key={weekNum} className="bg-white p-6 rounded-[25px] shadow-xl shadow-blue-900/5 border border-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-200">
                      <Check className="w-4 h-4 text-white stroke-[4px]" />
                    </div>
                    <h3 className="text-lg font-black text-slate-800 tracking-tight">Week {weekNum}</h3>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                      Progress: {weekProgress}/7 Days
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between relative h-12">
                  <div className="absolute top-1/2 left-4 right-12 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${(weekProgress / 7) * 100}%` }} />
                  </div>

                  <div className="flex justify-between w-full relative z-10">
                    {[1, 2, 3, 4, 5, 6, 7].map((dayOffset) => {
                      const absoluteDay = startDay + dayOffset;
                      const isCompleted = (profile.totalDaysPracticed || 0) >= absoluteDay;
                      const isCurrent = (profile.totalDaysPracticed || 0) + 1 === absoluteDay;

                      return (
                        <div 
                          key={dayOffset} 
                          className={cn(
                            "w-9 h-9 min-w-[36px] min-h-[36px] rounded-full flex items-center justify-center border-2 border-white shadow-lg flex-shrink-0 aspect-square",
                            isCompleted ? "bg-blue-600 text-white shadow-blue-200" : isCurrent ? "border-blue-600 bg-white text-blue-600 animate-pulse" : "bg-slate-100 text-slate-400"
                          )}
                        >
                          {isCompleted ? <Check className="w-4 h-4 stroke-[4px]" /> : <span className="text-[10px] font-black">{dayOffset}</span>}
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-center pl-2">
                      <div className={cn(
                        "p-2 rounded-xl border-2 border-dashed flex-shrink-0",
                        weekProgress === 7 ? "bg-yellow-50 border-yellow-400 text-yellow-600" : "bg-slate-50 border-slate-200 grayscale opacity-50"
                      )}>
                        <Trophy className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Reminders Toggle */}
        <div className="px-4 mt-6">
          <Card className="rounded-[25px] border-none shadow-xl shadow-blue-900/5 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-black text-blue-800 flex items-center gap-2">
                <Bell className="w-5 h-5" /> Daily Reminders
              </CardTitle>
              <CardDescription className="text-xs text-blue-600 font-medium">
                Get a motivational nudge every evening at 7 PM.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleEnableNotifications}
                disabled={isRequestingNotifications || !!profile.fcmToken}
                variant={profile.fcmToken ? "ghost" : "default"}
                className={cn(
                  "w-full rounded-xl h-12 font-bold",
                  profile.fcmToken ? "text-green-600 cursor-default hover:bg-transparent" : "bg-blue-600"
                )}
              >
                {isRequestingNotifications ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : profile.fcmToken ? (
                  <><Check className="w-4 h-4 mr-2" /> Reminders Active</>
                ) : (
                  "Enable Notifications"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-2 gap-4 px-4 mt-6">
          <div className="bg-white p-5 rounded-[25px] shadow-sm border border-white flex flex-col items-center justify-center gap-1 group hover:shadow-md transition-shadow cursor-default">
            <span className="text-3xl font-black text-blue-600 tracking-tighter group-hover:scale-110 transition-transform">
              {profile.currentStreak || 0}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">Current<br/>Streak</span>
          </div>
          <div className="bg-white p-5 rounded-[25px] shadow-sm border border-white flex flex-col items-center justify-center gap-1 group hover:shadow-md transition-shadow cursor-default">
            <span className="text-3xl font-black text-blue-600 tracking-tighter group-hover:scale-110 transition-transform">
              {profile.totalDaysPracticed || 0}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">Total<br/>Days</span>
          </div>
        </div>

        {/* Hall of Fame Leaderboard */}
        <div className="px-4 mt-8 pb-12">
          <Card className="rounded-[25px] border-none shadow-xl shadow-blue-900/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.length > 0 ? leaderboard.map((student, idx) => (
                  <div key={student.uid} className={cn(
                    "flex items-center justify-between p-3 rounded-2xl transition-all",
                    student.uid === profile.uid ? "bg-blue-50 border border-blue-100" : "hover:bg-slate-50"
                  )}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-sm font-black text-slate-400">#{idx + 1}</span>
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                        <AvatarImage src={student.photo} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">
                          {student.name ? student.name.charAt(0) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800 truncate max-w-[120px]">{student.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: student.title.color + '20', color: student.title.color }}>
                            {student.title.icon} {student.title.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-blue-600">{student.days}</span>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Days</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-center text-slate-400 py-4 text-sm font-medium">Be the first to join the leaderboard!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report Link */}
        <div className="mt-4 px-4 pb-24">
          <Button 
            onClick={() => router.push('/progress')}
            variant="outline"
            className="w-full h-14 rounded-[20px] border-2 border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all shadow-sm flex items-center justify-between px-6"
          >
            Detailed Progress Report
            <ChevronRight className="w-5 h-5 opacity-50" />
          </Button>
        </div>

        {/* Fixed Action Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-6 z-50">
          <Button 
            onClick={() => router.push('/tests')}
            className="w-full h-18 py-8 rounded-full bg-blue-600 hover:bg-blue-700 text-2xl font-black shadow-[0_15px_30px_rgba(37,99,235,0.4)] uppercase tracking-widest flex items-center justify-center gap-3 group transition-all active:scale-95 text-white"
          >
            GO
            <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
              <ChevronRight className="w-6 h-6 text-white stroke-[4px]" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
