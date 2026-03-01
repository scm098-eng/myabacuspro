
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData, UserRole } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, UserCheck, Users, Briefcase, Crown, User, CheckCircle, Cake, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { isWithinInterval, add, parseISO, getDay, getMonth } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
);

const isBirthdaySoon = (dob: string) => {
    if (!dob) return false;
    const today = new Date();
    const birthday = parseISO(dob);
    const nextBirthday = new Date(today.getFullYear(), getMonth(birthday), getDay(birthday));
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    return isWithinInterval(nextBirthday, { start: today, end: add(today, { days: 7 }) });
};

const isBirthdayToday = (dob: string) => {
    if (!dob) return false;
    const today = new Date();
    const birthday = parseISO(dob);
    return getMonth(today) === getMonth(birthday) && getDay(today) === getDay(birthday);
}

export default function AdminDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9');
  const { user, profile, getAllUsers, approveTeacher, isLoading: authLoading, getStudentTitle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        if (profile?.role === 'admin' || profile?.role === 'teacher') {
            const users = await getAllUsers();
            setAllUsers(users);
        }
    } catch(e) {
        console.error("Failed to fetch users", e)
    } finally {
        setIsLoading(false);
    }
  }, [getAllUsers, profile]);

  useEffect(() => {
    if (!authLoading) {
      if (!profile || (profile.role !== 'admin' && profile.role !== 'teacher')) {
        router.push('/');
        return;
      }
      if (profile.role === 'teacher' && profile.status !== 'approved') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [authLoading, profile, router, fetchData]);

  // Leaderboard Listener for Admin/Teacher
  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'teacher') {
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
            points: userData[leaderboardTab as keyof ProfileData] || 0,
            title: title
          };
        });
        setLeaderboard(data);
      });
      return () => unsubscribe();
    }
  }, [profile, leaderboardTab, getStudentTitle]);

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      await approveTeacher(teacherId);
      toast({ title: 'Teacher Approved', description: 'Access granted. List will refresh.' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not approve teacher.', variant: 'destructive' });
    }
  };

  const { teachers, students, pendingTeachers, summaryStats, upcomingBirthdays } = useMemo(() => {
    const allTeachers = allUsers.filter(u => u.role === 'teacher');
    const allStudents = allUsers.filter(u => u.role === 'student');
    const birthdays = allUsers.filter(u => isBirthdaySoon(u.dob)).sort((a,b) => (parseISO(a.dob).getMonth()*31 + parseISO(a.dob).getDate()) - (parseISO(b.dob).getMonth()*31 + parseISO(b.dob).getDate()));
    const pending = allTeachers.filter(t => t.status === 'pending');
    
    let dashboardStudents: ProfileData[];
    if(profile?.role === 'admin') {
      dashboardStudents = allStudents;
    } else {
      dashboardStudents = allUsers.filter(u => u.teacherId === user?.uid);
    }
    
    const teacherStudentMap = allStudents.reduce((acc, student) => {
        if(student.teacherId) {
            if(!acc[student.teacherId]) acc[student.teacherId] = { pro: 0, free: 0, total: 0 };
            if(student.subscriptionStatus === 'pro') acc[student.teacherId].pro++; else acc[student.teacherId].free++;
            acc[student.teacherId].total++;
        }
        return acc;
    }, {} as Record<string, { pro: number, free: number, total: number }>);

    const teachersWithCounts = allTeachers.map(t => ({
        ...t, 
        studentCounts: teacherStudentMap[t.uid] || { pro: 0, free: 0, total: 0 }
    }));
    
    const studentsWithTeacherNames = dashboardStudents.map(student => {
        const teacher = allTeachers.find(t => t.uid === student.teacherId);
        return { ...student, teacherName: teacher ? `${teacher.firstName} ${teacher.surname}` : 'N/A' }
    });

    const stats = {
        totalTeachers: allTeachers.length,
        totalStudents: allStudents.length,
        proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length,
        freeUsers: allStudents.filter(s => s.subscriptionStatus !== 'pro').length,
    }

    return { teachers: teachersWithCounts, students: studentsWithTeacherNames, pendingTeachers: pending, summaryStats: stats, upcomingBirthdays: birthdays };
  }, [allUsers, profile, user]);


  if (isLoading || authLoading) {
    return <div className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-[400px] w-full" /></div>;
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">{profile?.role === 'admin' ? 'Admin' : 'Teacher'} Dashboard</CardTitle>
          <CardDescription>{profile?.role === 'admin' ? 'System-wide overview.' : 'Your registered students.'}</CardDescription>
        </CardHeader>
        {profile?.role === 'admin' && (
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Teachers" value={summaryStats.totalTeachers} icon={Briefcase} />
                <StatCard title="Total Students" value={summaryStats.totalStudents} icon={Users} />
                <StatCard title="Pro Users" value={summaryStats.proUsers} icon={Crown} />
                <StatCard title="Free Users" value={summaryStats.freeUsers} icon={User} />
            </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {profile?.role === 'admin' && upcomingBirthdays.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><Cake className="text-pink-500"/> Upcoming Birthdays</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Birthday</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {upcomingBirthdays.map((u) => (
                                    <TableRow key={u.uid}>
                                        <TableCell>{u.firstName} {u.surname}</TableCell>
                                        <TableCell className="capitalize">{u.role}</TableCell>
                                        <TableCell>{isBirthdayToday(u.dob) ? <Badge className="bg-pink-500/20 text-pink-700 border-pink-400">Today!</Badge> : new Date(u.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
            
            {profile?.role === 'admin' && pendingTeachers.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="font-headline">Pending Teacher Approvals</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Email</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {pendingTeachers.map((teacher) => (
                                    <TableRow key={teacher.uid}>
                                        <TableCell><div className="font-medium">{`${teacher.firstName} ${teacher.surname}`}</div></TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell className="text-right"><Button onClick={() => handleApproveTeacher(teacher.uid)} size="sm"><UserCheck className="mr-2 h-4 w-4" /> Approve</Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {profile?.role === 'admin' && (
                <Card>
                    <CardHeader><CardTitle className="font-headline">Teachers</CardTitle></CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Status</TableHead><TableHead>Students</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {teachers.map((t) => (
                                    <TableRow key={t.uid}>
                                        <TableCell><div className="font-medium">{t.firstName} {t.surname}</div><div className="text-xs text-muted-foreground">{t.email}</div></TableCell>
                                        <TableCell><Badge variant={t.status === 'approved' ? 'default' : 'secondary'} className={t.status === 'approved' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>{t.status}</Badge></TableCell>
                                        <TableCell>{t.studentCounts.total}</TableCell>
                                        <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={`/admin/user/${t.uid}`}><Eye className="mr-2 h-4 w-4" /> View</Link></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle className="font-headline">Students</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Subscription</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {students.map((s) => (
                                <TableRow key={s.uid}>
                                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={s.profilePhoto} /><AvatarFallback>{s.firstName?.[0]}</AvatarFallback></Avatar><div><p className="font-medium">{s.firstName} {s.surname}</p><p className="text-xs text-muted-foreground">{s.email}</p></div></div></TableCell>
                                    <TableCell><Badge variant={s.subscriptionStatus === 'pro' ? 'default' : 'secondary'} className={s.subscriptionStatus === 'pro' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>{s.subscriptionStatus || 'free'}</Badge></TableCell>
                                    <TableCell className="text-right"><Button asChild variant="outline" size="sm"><Link href={`/admin/user/${s.uid}`}><Eye className="mr-2 h-4 w-4" /> View</Link></Button></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
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
                            <div key={student.uid} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <span className={cn("w-6 text-sm font-bold", idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground")}>#{idx + 1}</span>
                                    <Avatar className="h-10 w-10 border-2 border-white shadow-sm"><AvatarImage src={student.photo} /><AvatarFallback className="bg-muted font-bold text-xs">{student.name?.charAt(0)}</AvatarFallback></Avatar>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-bold text-foreground truncate">{student.name}</span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight w-fit" style={{ backgroundColor: student.title.color + '20', color: student.title.color }}>{student.title.icon} {student.title.name}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm font-bold text-primary block">{student.points.toLocaleString()}</span>
                                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Points</span>
                                </div>
                            </div>
                        )) : <div className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Loading Top Performers...</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
