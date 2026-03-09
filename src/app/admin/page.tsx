
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, UserCheck, Briefcase, Crown, Mail, Send, Loader2, Trophy, ShieldAlert, GraduationCap, Search, X, Ban, ShieldCheck, AlertCircle, Cake } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getFirestore, doc, onSnapshot, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isWithinInterval, add, parseISO, getDate, getMonth } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, subValue }: { title: string, value: string | number, icon: React.ElementType, subValue?: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="w-5 h-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
        </CardContent>
    </Card>
);

const isBirthdaySoon = (dob: string) => {
    if (!dob) return false;
    const today = new Date();
    const birthday = parseISO(dob);
    const nextBirthday = new Date(today.getFullYear(), getMonth(birthday), getDate(birthday));
    if (nextBirthday < today) nextBirthday.setFullYear(today.getFullYear() + 1);
    return isWithinInterval(nextBirthday, { start: today, end: add(today, { days: 7 }) });
};

const isBirthdayToday = (dob: string) => {
    if (!dob) return false;
    const today = new Date();
    const birthday = parseISO(dob);
    return getMonth(today) === getMonth(birthday) && getDate(today) === getDate(birthday);
}

export default function AdminDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, getAllUsers, approveTeacher, isLoading: authLoading, getStudentTitle, toggleUserSuspension } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isSendingPromo, setIsSendingPromo] = useState(false);

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
      fetchData();
    }
  }, [authLoading, profile, router, fetchData]);

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'teacher') {
      const db = getFirestore(firebaseApp);
      const q = query(collection(db, "users"), where("role", "==", "student"), orderBy(leaderboardTab, "desc"), limit(10));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => {
          const ud = doc.data() as ProfileData;
          return { uid: doc.id, name: `${ud.firstName} ${ud.surname}`, photo: ud.profilePhoto, points: ud[leaderboardTab as keyof ProfileData] || 0, title: getStudentTitle(ud.totalDaysPracticed || 0, ud.totalPoints || 0) };
        });
        setLeaderboard(data);
      });
    }
  }, [profile, leaderboardTab, getStudentTitle]);

  const handleSendPromo = async (isTest = false) => {
    if (!emailSubject || !emailMessage) {
        toast({ title: "Error", description: "Subject and message required.", variant: "destructive" });
        return;
    }
    setIsSendingPromo(true);
    try {
        const functions = getFunctions(firebaseApp);
        const sendPromo = httpsCallable(functions, 'sendCustomPromotionalEmail');
        await sendPromo({ subject: emailSubject, message: emailMessage, targetAudience: isTest ? 'none' : targetAudience, isTest, testEmail: profile?.email });
        toast({ title: isTest ? "Test Sent" : "Success", description: "Campaign processed successfully." });
        if (!isTest) { setEmailSubject(''); setEmailMessage(''); }
    } catch (error: any) {
        toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally { setIsSendingPromo(false); }
  };

  const handleApprove = async (tid: string) => {
    try {
      await approveTeacher(tid);
      toast({ title: "Teacher Approved" });
      fetchData();
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleSuspension = async (uid: string, current: boolean) => {
    try {
      await toggleUserSuspension(uid, !current);
      toast({ title: !current ? "User Suspended" : "User Restored" });
      fetchData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const { filteredTeachers, filteredStudents, summaryStats, filteredSuspicious, upcomingBirthdays } = useMemo(() => {
    const sl = searchTerm.toLowerCase();
    const matches = (u: ProfileData) => (u.firstName?.toLowerCase().includes(sl) || u.surname?.toLowerCase().includes(sl) || u.email?.toLowerCase().includes(sl));
    const allTeachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
    const allStudents = allUsers.filter(u => u.role === 'student');
    const birthdays = allUsers.filter(u => isBirthdaySoon(u.dob)).sort((a,b) => (parseISO(a.dob).getMonth()*31 + getDate(parseISO(a.dob))) - (parseISO(b.dob).getMonth()*31 + getDate(parseISO(b.dob))));
    
    const teacherMap = allStudents.reduce((acc, s) => {
        if (s.teacherId) {
            if (!acc[s.teacherId]) acc[s.teacherId] = { total: 0, pro: 0, free: 0 };
            acc[s.teacherId].total++;
            if (s.subscriptionStatus === 'pro') acc[s.teacherId].pro++;
            else acc[s.teacherId].free++;
        }
        return acc;
    }, {} as Record<string, { total: number, pro: number, free: number }>);

    const teachersWithStats = allTeachers.map(t => ({ ...t, stats: teacherMap[t.uid] || { total: 0, pro: 0, free: 0 } }));
    
    const suspicious = allUsers.map(u => {
        let reasons = [];
        if (u.isSuspended) reasons.push("Account Suspended");
        if ((u.totalPoints || 0) > 100000) reasons.push("High Point Total");
        if (u.emailVerified === false) reasons.push("Email Unverified");
        return { ...u, flagReasons: reasons };
    }).filter(u => u.flagReasons.length > 0);
    
    return { 
        filteredTeachers: teachersWithStats.filter(matches), 
        filteredStudents: allStudents.filter(u => (profile?.role === 'admin' || u.teacherId === profile?.uid)).filter(matches),
        summaryStats: { 
            totalTeachers: allTeachers.filter(t => t.status === 'approved' || t.role === 'admin').length, 
            totalStudents: allStudents.length, 
            proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length 
        },
        filteredSuspicious: suspicious.filter(matches),
        upcomingBirthdays: birthdays
    };
  }, [allUsers, searchTerm, profile]);

  if (isLoading || authLoading) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{profile?.role === 'admin' ? 'Admin Center' : 'Teacher Dashboard'}</CardTitle>
          <CardDescription>System monitoring and user management.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Students" value={summaryStats.totalStudents} icon={GraduationCap} />
                <StatCard title="Pro Accounts" value={summaryStats.proUsers} icon={Crown} />
                <StatCard title="Active Staff" value={summaryStats.totalTeachers} icon={Briefcase} />
            </div>
            <div className="relative group max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search users by name or email..." className="pl-10 h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="students" className="w-full">
                <TabsList className="bg-muted p-1 mb-8 overflow-x-auto justify-start h-auto flex-wrap">
                    <TabsTrigger value="students" className="h-10">Students</TabsTrigger>
                    {profile?.role === 'admin' && <TabsTrigger value="teachers" className="h-10">Staff List</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="moderation" className="h-10">Moderation</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="marketing" className="h-10">Marketing</TabsTrigger>}
                </TabsList>

                <TabsContent value="students">
                    <Card>
                        <CardHeader><CardTitle className="font-headline">Student Directory</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                                        <TableRow key={s.uid} className={s.isSuspended ? "opacity-50" : ""}>
                                            <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={s.profilePhoto}/></Avatar><div><p className="text-sm font-bold">{s.firstName} {s.surname}</p><p className="text-[10px] text-muted-foreground">{s.email}</p></div></div></TableCell>
                                            <TableCell><Badge variant={s.subscriptionStatus === 'pro' ? 'default' : 'outline'}>{s.subscriptionStatus}</Badge></TableCell>
                                            <TableCell className="text-right"><Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4" /></Link></Button></TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No students found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="teachers">
                    <Card>
                        <CardHeader><CardTitle className="font-headline">Staff Breakdown</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Students (Pro/Free)</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredTeachers.length > 0 ? filteredTeachers.map((t) => (
                                        <TableRow key={t.uid}>
                                            <TableCell><p className="text-sm font-bold">{t.firstName} {t.surname}</p><p className="text-[10px] text-muted-foreground">{t.email}</p></TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="h-6 font-bold bg-green-50 text-green-700 border-green-200">Pro: {t.stats.pro}</Badge>
                                                    <Badge variant="outline" className="h-6 font-bold bg-slate-50 text-slate-600">Free: {t.stats.free}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge variant={t.status === 'approved' || t.role === 'admin' ? 'default' : 'secondary'}>{t.status || 'Active'}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {t.status === 'pending' && <Button size="sm" onClick={() => handleApprove(t.uid)}><UserCheck className="w-4 h-4" /></Button>}
                                                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${t.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No staff members found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="moderation">
                    <Card className="border-red-200">
                        <CardHeader><CardTitle className="text-red-700">Flagged Accounts</CardTitle><CardDescription>Potential fake accounts or unverified users.</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Reason</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredSuspicious.length > 0 ? filteredSuspicious.map((u) => (
                                        <TableRow key={u.uid}>
                                            <TableCell><p className="text-sm font-bold">{u.firstName} {u.surname}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {u.flagReasons.map(r => (
                                                        <Badge key={r} variant="outline" className="text-[9px] border-red-200 bg-red-50 text-red-700">{r}</Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant={u.isSuspended ? "outline" : "destructive"} onClick={() => handleToggleSuspension(u.uid, !!u.isSuspended)}>
                                                        {u.isSuspended ? "Restore" : "Suspend"}
                                                    </Button>
                                                    <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${u.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground">No flagged accounts found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="marketing">
                    <Card>
                        <CardHeader><CardTitle>Communication Hub</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2"><Label>Target Audience</Label><Select value={targetAudience} onValueChange={setTargetAudience}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Every Student</SelectItem><SelectItem value="pro">Pro Members Only</SelectItem><SelectItem value="free">Free Members Only</SelectItem><SelectItem value="teachers">Teaching Staff Only</SelectItem></SelectContent></Select></div>
                            <div className="space-y-2"><Label>Email Subject</Label><Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
                            <div className="space-y-2"><Label>HTML Content</Label><Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} className="min-h-[200px]" /></div>
                            <div className="flex gap-4"><Button onClick={() => handleSendPromo(true)} variant="outline" disabled={isSendingPromo}>Send Test</Button><Button onClick={() => handleSendPromo(false)} className="flex-1" disabled={isSendingPromo}>Blast Campaign</Button></div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-8">
            {profile?.role === 'admin' && upcomingBirthdays.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 font-headline"><Cake className="text-pink-500 w-5 h-5"/> Upcoming Birthdays</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {upcomingBirthdays.map((u) => (
                                <div key={u.uid} className="flex items-center justify-between p-4 hover:bg-muted/30">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold truncate">{u.firstName} {u.surname}</p>
                                        <p className="text-[10px] text-muted-foreground capitalize">{u.role}</p>
                                    </div>
                                    {isBirthdayToday(u.dob) ? <Badge className="bg-pink-500/20 text-pink-700 border-pink-400">Today!</Badge> : <p className="text-xs font-medium text-muted-foreground">{new Date(u.dob).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="rounded-2xl overflow-hidden border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-0">
                    <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-headline uppercase tracking-tight mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Top Performers</CardTitle>
                    <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                        <TabsList className="grid grid-cols-3 bg-slate-200/50 mb-2 h-10">
                            <TabsTrigger value="weeklyPoints" className="text-[10px] font-bold">Weekly</TabsTrigger>
                            <TabsTrigger value="monthlyPoints" className="text-[10px] font-bold">Monthly</TabsTrigger>
                            <TabsTrigger value="totalPoints" className="text-[10px] font-bold">Global</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {leaderboard.length > 0 ? leaderboard.map((s, idx) => (
                            <div key={s.uid} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                                    <Avatar className="h-10 w-10"><AvatarImage src={s.photo} /></Avatar>
                                    <div className="flex flex-col"><span className="text-sm font-bold">{s.name}</span><span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span></div>
                                </div>
                                <div className="text-right"><span className="text-sm font-bold text-primary block">{s.points.toLocaleString()}</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Points</span></div>
                            </div>
                        )) : <div className="p-8 text-center text-muted-foreground">Updating records...</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
