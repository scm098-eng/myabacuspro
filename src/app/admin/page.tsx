
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, UserCheck, Briefcase, Crown, Mail, TrendingUp, Send, Loader2, Trophy, ShieldAlert, GraduationCap, Search, X, Ban, ShieldCheck } from 'lucide-react';
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

export default function AdminDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, getAllUsers, approveTeacher, isLoading: authLoading, getStudentTitle, toggleUserSuspension } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketingStats, setMarketingStats] = useState({ emailsSent: 0, conversions: 0 });
  
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
    if (profile?.role === 'admin') {
      const db = getFirestore(firebaseApp);
      const statsRef = doc(db, "stats", "marketing");
      return onSnapshot(statsRef, (doc) => {
        if (doc.exists()) setMarketingStats(doc.data() as any);
      });
    }
  }, [profile]);

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

  const { filteredTeachers, filteredStudents, summaryStats, filteredSuspicious } = useMemo(() => {
    const sl = searchTerm.toLowerCase();
    const matches = (u: ProfileData) => (u.firstName?.toLowerCase().includes(sl) || u.surname?.toLowerCase().includes(sl) || u.email?.toLowerCase().includes(sl));
    const allTeachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
    const allStudents = allUsers.filter(u => u.role === 'student');
    
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
    const suspicious = allUsers.filter(u => (u.totalPoints || 0) > 100000 || u.isSuspended);
    
    return { 
        filteredTeachers: teachersWithStats.filter(matches), 
        filteredStudents: allStudents.filter(u => (profile?.role === 'admin' || u.teacherId === profile?.uid)).filter(matches),
        summaryStats: { 
            totalTeachers: allTeachers.filter(t => t.status === 'approved' || t.role === 'admin').length, 
            totalStudents: allStudents.length, 
            proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length 
        },
        filteredSuspicious: suspicious.filter(matches)
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
                <StatCard title="Students" value={summaryStats.totalStudents} icon={GraduationCap} />
                <StatCard title="Pro Accounts" value={summaryStats.proUsers} icon={Crown} />
                <StatCard title="Staff" value={summaryStats.totalTeachers} icon={Briefcase} />
            </div>
            <div className="relative group max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10 h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-muted p-1 mb-8 overflow-x-auto justify-start h-auto flex-wrap">
            <TabsTrigger value="students" className="h-10">Students</TabsTrigger>
            {profile?.role === 'admin' && <TabsTrigger value="teachers" className="h-10">Staff</TabsTrigger>}
            {profile?.role === 'admin' && <TabsTrigger value="moderation" className="h-10">Moderation</TabsTrigger>}
            {profile?.role === 'admin' && <TabsTrigger value="marketing" className="h-10">Marketing</TabsTrigger>}
            <TabsTrigger value="leaderboard" className="h-10">Leaderboard</TabsTrigger>
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
                <CardHeader><CardTitle className="font-headline">Teacher Staff</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Students Breakdown</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredTeachers.length > 0 ? filteredTeachers.map((t) => (
                                <TableRow key={t.uid}>
                                    <TableCell><p className="text-sm font-bold">{t.firstName} {t.surname}</p><p className="text-[10px] text-muted-foreground">{t.email}</p></TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-xs font-bold">{t.stats.total} Total</span>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="h-5 text-[9px] bg-green-50 text-green-700 border-green-200">Pro: {t.stats.pro}</Badge>
                                                <Badge variant="outline" className="h-5 text-[9px] bg-slate-50 text-slate-600">Free: {t.stats.free}</Badge>
                                            </div>
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

        <TabsContent value="moderation" className="space-y-8">
            <Card className="border-red-200">
                <CardHeader><CardTitle className="text-red-700">Flagged Accounts</CardTitle><CardDescription>Users with exceptionally high points or active suspensions.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Points</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSuspicious.length > 0 ? filteredSuspicious.map((u) => (
                                <TableRow key={u.uid}>
                                    <TableCell><p className="text-sm font-bold">{u.firstName} {u.surname}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></TableCell>
                                    <TableCell className="font-mono text-xs">{u.totalPoints?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant={u.isSuspended ? "outline" : "destructive"} onClick={() => handleToggleSuspension(u.uid, !!u.isSuspended)}>
                                                {u.isSuspended ? "Restore" : "Suspend"}
                                            </Button>
                                            <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${u.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <ShieldCheck className="h-8 w-8 text-green-500 opacity-20" />
                                            <p className="text-sm font-medium">No flagged accounts found.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="marketing">
            <Card>
                <CardHeader><CardTitle>Campaign Manager</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2"><Label>Audience</Label><Select value={targetAudience} onValueChange={setTargetAudience}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Users</SelectItem><SelectItem value="pro">Pro Only</SelectItem><SelectItem value="free">Free Only</SelectItem><SelectItem value="teachers">Staff Only</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label>Subject</Label><Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Message (HTML allowed)</Label><Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} className="min-h-[200px]" /></div>
                    <div className="flex gap-4"><Button onClick={() => handleSendPromo(true)} variant="outline" disabled={isSendingPromo}>Send Test Email</Button><Button onClick={() => handleSendPromo(false)} className="flex-1" disabled={isSendingPromo}>Launch Campaign</Button></div>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="leaderboard">
            <Card className="max-w-4xl mx-auto overflow-hidden">
                <CardHeader className="bg-muted/30 pb-0">
                    <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="weeklyPoints">Weekly</TabsTrigger>
                            <TabsTrigger value="monthlyPoints">Monthly</TabsTrigger>
                            <TabsTrigger value="totalPoints">Global</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {leaderboard.length > 0 ? leaderboard.map((s, idx) => (
                            <div key={s.uid} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                                    <Avatar className="h-10 w-10"><AvatarImage src={s.photo} /></Avatar>
                                    <div className="flex flex-col"><span className="text-sm font-bold">{s.name}</span><span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span></div>
                                </div>
                                <div className="text-right"><span className="text-sm font-bold text-primary block">{s.points.toLocaleString()}</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Points</span></div>
                            </div>
                        )) : <div className="p-8 text-center text-muted-foreground">Loading leaderboard...</div>}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
