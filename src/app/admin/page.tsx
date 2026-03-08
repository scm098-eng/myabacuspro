'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, UserCheck, Users, Briefcase, Crown, User, CheckCircle, Mail, TrendingUp, Send, Loader2, Trophy, ShieldAlert, GraduationCap, Search, X, Ban, ShieldCheck, ArrowRightLeft } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

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
  const { profile, getAllUsers, approveTeacher, isLoading: authLoading, getStudentTitle, toggleUserSuspension, migrateStudents } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketingStats, setMarketingStats] = useState({ emailsSent: 0, linkClicks: 0, conversions: 0 });
  
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [isSendingPromo, setIsSendingPromo] = useState(false);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");

  const [migrationFrom, setMigrationFrom] = useState('testteacher1@example.com');
  const [migrationTo, setMigrationTo] = useState('pallavib202@gmail.com');
  const [isMigrating, setIsMigrating] = useState(false);

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
      const unsubscribe = onSnapshot(statsRef, (doc) => {
        if (doc.exists()) {
          setMarketingStats(doc.data() as any);
        }
      }, async (error) => {
          const permissionError = new FirestorePermissionError({
            path: statsRef.path,
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
      });
      return () => unsubscribe();
    }
  }, [profile]);

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
      }, async (error) => {
          const permissionError = new FirestorePermissionError({
            path: '/users',
            operation: 'list',
          });
          errorEmitter.emit('permission-error', permissionError);
      });
      return () => unsubscribe();
    }
  }, [profile, leaderboardTab, getStudentTitle]);

  const handleSendPromo = async (isTest = false) => {
    if (!emailSubject || !emailMessage) {
        toast({ title: "Validation Error", description: "Subject and message are required.", variant: "destructive" });
        return;
    }
    setIsSendingPromo(true);
    try {
        const functions = getFunctions(firebaseApp);
        const sendPromo = httpsCallable(functions, 'sendCustomPromotionalEmail');
        await sendPromo({
            subject: emailSubject,
            message: emailMessage,
            targetAudience: isTest ? 'none' : targetAudience,
            isTest,
            testEmail: profile?.email
        });
        toast({ 
            title: isTest ? "Test Sent" : "Campaign Finished", 
            description: isTest ? "Check your inbox." : `Email sent to ${targetAudience} audience.`
        });
        if (!isTest) {
            setEmailSubject('');
            setEmailMessage('');
        }
    } catch (error: any) {
        toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } finally {
        setIsSendingPromo(false);
    }
  };

  const handleApprove = async (tid: string) => {
    try {
      await approveTeacher(tid);
      toast({ title: "Teacher Approved", description: "Access granted successfully." });
      fetchData();
    } catch (e: any) {
      toast({ title: "Approval Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleToggleSuspension = async (uid: string, current: boolean) => {
    try {
      await toggleUserSuspension(uid, !current);
      toast({ title: !current ? "User Suspended" : "User Unsuspended", variant: !current ? "destructive" : "default" });
      fetchData();
    } catch (e: any) {
      toast({ title: "Action Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleMigration = async () => {
    if (!migrationFrom || !migrationTo) return;
    setIsMigrating(true);
    try {
      const res = await migrateStudents(migrationFrom, migrationTo);
      toast({ title: "Migration Successful", description: `${res.count} students moved to ${migrationTo}.` });
      fetchData();
    } catch (e: any) {
      toast({ title: "Migration Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsMigrating(false);
    }
  };

  const { filteredTeachers, filteredStudents, pendingTeachers, summaryStats, filteredSuspicious } = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (u: ProfileData) => (
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.surname?.toLowerCase().includes(searchLower) ||
        u.email?.toLowerCase().includes(searchLower) ||
        u.uid?.toLowerCase().includes(searchLower)
    );

    const allTeachers = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
    const allStudents = allUsers.filter(u => u.role === 'student');
    const pending = allTeachers.filter(t => t.status === 'pending');
    
    const teacherMap = allStudents.reduce((acc, student) => {
        if (student.teacherId) {
            if (!acc[student.teacherId]) acc[student.teacherId] = { total: 0, pro: 0, free: 0 };
            acc[student.teacherId].total++;
            if (student.subscriptionStatus === 'pro') acc[student.teacherId].pro++; else acc[student.teacherId].free++;
        }
        return acc;
    }, {} as Record<string, { total: number, pro: number, free: number }>);

    const teachersWithStats = allTeachers.map(t => ({
        ...t,
        stats: teacherMap[t.uid] || { total: 0, pro: 0, free: 0 }
    }));

    const flagged = allUsers.filter(u => (u.totalPoints || 0) > 100000 || /temp|test|fake/i.test(u.email) || u.isSuspended);

    return { 
        filteredTeachers: teachersWithStats.filter(matchesSearch), 
        filteredStudents: allStudents.filter(u => (profile?.role === 'admin' || u.teacherId === profile?.uid)).filter(matchesSearch),
        pendingTeachers: pending, 
        summaryStats: {
            totalTeachers: allTeachers.filter(t => t.status === 'approved' || t.role === 'admin').length,
            totalStudents: allStudents.length,
            proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length,
            freeUsers: allStudents.filter(s => s.subscriptionStatus !== 'pro').length,
        },
        filteredSuspicious: flagged.filter(matchesSearch)
    };
  }, [allUsers, searchTerm, profile]);

  if (isLoading || authLoading) return <div className="p-8"><Skeleton className="h-[600px] w-full" /></div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">{profile?.role === 'admin' ? 'Admin Control Center' : 'Teacher Dashboard'}</CardTitle>
          <CardDescription>Manage staff, track student growth, and monitor system performance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={summaryStats.totalStudents} icon={GraduationCap} />
                <StatCard title="Active Pro" value={summaryStats.proUsers} icon={Crown} />
                <StatCard title="Verified Staff" value={summaryStats.totalTeachers} icon={Briefcase} />
                <StatCard title="Global Conversion" value={`${((summaryStats.proUsers / (summaryStats.totalStudents || 1)) * 100).toFixed(1)}%`} icon={TrendingUp} />
            </div>
            <div className="relative group max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search by name, email or User ID..." className="pl-10 h-12 rounded-xl border-2" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                {searchTerm && <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchTerm('')}><X className="h-4 w-4" /></Button>}
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-muted p-1 mb-8 overflow-x-auto justify-start h-auto flex-wrap">
            <TabsTrigger value="students" className="h-10"><GraduationCap className="w-4 h-4 mr-2" />Students</TabsTrigger>
            {profile?.role === 'admin' && <TabsTrigger value="teachers" className="h-10"><Briefcase className="w-4 h-4 mr-2" />Staff</TabsTrigger>}
            {profile?.role === 'admin' && <TabsTrigger value="moderation" className="h-10"><ShieldAlert className="w-4 h-4 mr-2 text-red-500" />Moderation</TabsTrigger>}
            {profile?.role === 'admin' && <TabsTrigger value="marketing" className="h-10"><Mail className="w-4 h-4 mr-2" />Email Center</TabsTrigger>}
            <TabsTrigger value="leaderboard" className="h-10"><Trophy className="w-4 h-4 mr-2" />Hall of Fame</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
            <Card>
                <CardHeader><CardTitle className="font-headline">Student Directory</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                                <TableRow key={s.uid} className={s.isSuspended ? "opacity-50" : ""}>
                                    <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarImage src={s.profilePhoto}/></Avatar><div><p className="text-sm font-bold">{s.firstName} {s.surname}</p><p className="text-[10px] text-muted-foreground">{s.email}</p></div></div></TableCell>
                                    <TableCell><Badge variant={s.subscriptionStatus === 'pro' ? 'default' : 'outline'} className={s.subscriptionStatus === 'pro' ? 'bg-green-500/20 text-green-700' : ''}>{s.subscriptionStatus}</Badge></TableCell>
                                    <TableCell className="text-right"><Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4" /></Link></Button></TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No students found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="teachers">
            <Card>
                <CardHeader><CardTitle className="font-headline">Staff Directory</CardTitle><CardDescription>Admins and approved teachers managing students.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead>Students</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableHeader>
                        <TableBody>
                            {filteredTeachers.length > 0 ? filteredTeachers.map((t) => (
                                <TableRow key={t.uid}>
                                    <TableCell><p className="text-sm font-bold">{t.firstName} {t.surname}</p><p className="text-[10px] text-muted-foreground">{t.email}</p></TableCell>
                                    <TableCell><Badge variant="outline" className="capitalize">{t.role}</Badge></TableCell>
                                    <TableCell><p className="text-xs font-medium">{t.stats.total} Total</p><p className="text-[10px] text-green-600">{t.stats.pro} Pro</p></TableCell>
                                    <TableCell><Badge variant={t.status === 'approved' || t.role === 'admin' ? 'default' : 'secondary'}>{t.status || 'Active'}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {t.status === 'pending' && <Button size="sm" onClick={() => handleApprove(t.uid)}><UserCheck className="w-4 h-4" /></Button>}
                                            <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${t.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No staff members found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-8">
            <Card className="border-red-200">
                <CardHeader><CardTitle className="text-red-700 flex items-center gap-2"><ShieldAlert /> Suspicious Accounts</CardTitle><CardDescription>Users with high scores or restricted status.</CardDescription></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Points</TableHead><TableHead>Issue</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {filteredSuspicious.map((u) => (
                                <TableRow key={u.uid} className={u.isSuspended ? "bg-red-50/50" : ""}>
                                    <TableCell><p className="text-sm font-bold">{u.firstName} {u.surname}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></TableCell>
                                    <TableCell className="font-mono text-xs">{u.totalPoints?.toLocaleString()}</TableCell>
                                    <TableCell><Badge variant="outline">{u.isSuspended ? "Suspended" : (u.totalPoints || 0) > 100000 ? "Unusual Points" : "Manual Flag"}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant={u.isSuspended ? "outline" : "destructive"} onClick={() => handleToggleSuspension(u.uid, !!u.isSuspended)}>
                                            {u.isSuspended ? <ShieldCheck className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                                            {u.isSuspended ? "Restore" : "Suspend"}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="border-blue-200">
                <CardHeader><CardTitle className="text-blue-700 flex items-center gap-2"><ArrowRightLeft /> Student Migration Tool</CardTitle><CardDescription>Move all students from one teacher to another.</CardDescription></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>From Teacher Email</Label>
                        <Input value={migrationFrom} onChange={(e) => setMigrationFrom(e.target.value)} placeholder="testteacher1@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label>To Teacher/Admin Email</Label>
                        <Input value={migrationTo} onChange={(e) => setMigrationTo(e.target.value)} placeholder="pallavib202@gmail.com" />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleMigration} disabled={isMigrating} className="w-full">
                        {isMigrating ? <Loader2 className="animate-spin mr-2" /> : <ArrowRightLeft className="w-4 h-4 mr-2" />}
                        Confirm Migration
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>

        <TabsContent value="marketing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Mail className="text-primary" /> Create Campaign</CardTitle>
                        <CardDescription>Send a custom email to your selected audience.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Target Audience</Label>
                            <Select value={targetAudience} onValueChange={setTargetAudience}>
                                <SelectTrigger><SelectValue placeholder="Select who receives this" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Students</SelectItem>
                                    <SelectItem value="pro">Pro Members Only</SelectItem>
                                    <SelectItem value="free">Free Users Only</SelectItem>
                                    <SelectItem value="teachers">Approved Staff Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="e.g. New Feature Launch!" />
                        </div>
                        <div className="space-y-2">
                            <Label>HTML Message Body</Label>
                            <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Message here. HTML supported." className="min-h-[200px]" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button onClick={() => handleSendPromo(true)} variant="outline" className="flex-1" disabled={isSendingPromo}>
                                {isSendingPromo ? <Loader2 className="animate-spin" /> : <Eye className="w-4 h-4 mr-2" />} Test to Me
                            </Button>
                            <Button onClick={() => handleSendPromo(false)} className="flex-1" disabled={isSendingPromo}>
                                {isSendingPromo ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Launch Campaign
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <div className="space-y-8">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader><CardTitle className="font-headline">Email Performance</CardTitle></CardHeader>
                        <CardContent className="grid gap-4">
                            <StatCard title="Total Sent" value={marketingStats.emailsSent || 0} icon={Mail} />
                            <StatCard title="Conversions" value={marketingStats.conversions || 0} icon={CheckCircle} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="leaderboard">
            <Card className="max-w-4xl mx-auto overflow-hidden rounded-xl">
                <CardHeader className="bg-muted/30 border-b pb-0">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 font-headline uppercase tracking-tight mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Hall of Fame</CardTitle>
                    <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-200/50">
                            <TabsTrigger value="weeklyPoints" className="text-[10px] font-bold uppercase">Weekly</TabsTrigger>
                            <TabsTrigger value="monthlyPoints" className="text-[10px] font-bold uppercase">Monthly</TabsTrigger>
                            <TabsTrigger value="totalPoints" className="text-[10px] font-bold uppercase">Global</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/50">
                        {leaderboard.map((s, idx) => (
                            <div key={s.uid} className="flex items-center justify-between p-4 hover:bg-muted/30">
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-sm font-bold text-muted-foreground">#{idx + 1}</span>
                                    <Avatar className="h-10 w-10 border-2 border-white"><AvatarImage src={s.photo} /></Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold">{s.name}</span>
                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span>
                                    </div>
                                </div>
                                <div className="text-right"><span className="text-sm font-bold text-primary block">{s.points.toLocaleString()}</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Points</span></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}