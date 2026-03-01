
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, UserCheck, Users, Briefcase, Crown, User, CheckCircle, Mail, MousePointer2, TrendingUp, Send, Loader2, MessageSquare, Trophy, ShieldAlert, GraduationCap, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getFirestore, doc, onSnapshot, query, collection, where, orderBy, limit } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const { profile, getAllUsers, approveTeacher, isLoading: authLoading, getStudentTitle } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketingStats, setMarketingStats] = useState({ emailsSent: 0, linkClicks: 0, conversions: 0 });
  
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
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
            isTest,
            testEmail: profile?.email
        });
        toast({ 
            title: isTest ? "Test Sent" : "Campaign Finished", 
            description: isTest ? "Check your inbox." : `Emailed all students.`
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

  const { filteredTeachers, filteredStudents, pendingTeachers, summaryStats, filteredSuspicious } = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = (u: ProfileData) => {
        return (
            u.firstName?.toLowerCase().includes(searchLower) ||
            u.surname?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower) ||
            u.uid?.toLowerCase().includes(searchLower)
        );
    };

    const allTeachers = allUsers.filter(u => u.role === 'teacher');
    const allStudents = allUsers.filter(u => u.role === 'student');
    const pending = allTeachers.filter(t => t.status === 'pending');
    
    // Map of teacherId to student breakdowns
    const teacherMap = allStudents.reduce((acc, student) => {
        if (student.teacherId) {
            if (!acc[student.teacherId]) {
                acc[student.teacherId] = { total: 0, pro: 0, free: 0 };
            }
            acc[student.teacherId].total++;
            if (student.subscriptionStatus === 'pro') {
                acc[student.teacherId].pro++;
            } else {
                acc[student.teacherId].free++;
            }
        }
        return acc;
    }, {} as Record<string, { total: number, pro: number, free: number }>);

    const teachersWithStats = allTeachers.map(t => ({
        ...t,
        stats: teacherMap[t.uid] || { total: 0, pro: 0, free: 0 }
    }));

    const stats = {
        totalTeachers: allTeachers.length,
        totalStudents: allStudents.length,
        proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length,
        freeUsers: allStudents.filter(s => s.subscriptionStatus !== 'pro').length,
    };

    const flagged = allUsers.filter(u => {
      const isExtremePoints = (u.totalPoints || 0) > 100000;
      const hasSuspiciousEmail = /temp|test|dummy|fake|asdf/i.test(u.email);
      return isExtremePoints || hasSuspiciousEmail || u.isSuspended;
    });

    return { 
        filteredTeachers: teachersWithStats.filter(matchesSearch), 
        filteredStudents: allStudents.filter(u => (profile?.role === 'admin' || u.teacherId === profile?.uid)).filter(matchesSearch),
        pendingTeachers: pending, 
        summaryStats: stats, 
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
                <StatCard title="Verified Teachers" value={summaryStats.totalTeachers} icon={Briefcase} />
                <StatCard title="Global Conversion" value={`${((summaryStats.proUsers / (summaryStats.totalStudents || 1)) * 100).toFixed(1)}%`} icon={TrendingUp} />
            </div>

            <div className="relative group max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                    placeholder="Search by name, email or User ID..." 
                    className="pl-10 h-12 text-lg rounded-xl border-2 focus:ring-primary shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setSearchTerm('')}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="students" className="w-full">
        <TabsList className="bg-muted p-1 mb-8">
            <TabsTrigger value="students"><GraduationCap className="w-4 h-4 mr-2" />Students</TabsTrigger>
            {profile?.role === 'admin' && <TabsTrigger value="teachers"><Briefcase className="w-4 h-4 mr-2" />Teachers</TabsTrigger>}
            {profile?.role === 'admin' && <TabsTrigger value="moderation"><ShieldAlert className="w-4 h-4 mr-2 text-red-500" />Moderation</TabsTrigger>}
            {profile?.role === 'admin' && <TabsTrigger value="marketing"><Mail className="w-4 h-4 mr-2" />Email Center</TabsTrigger>}
            <TabsTrigger value="leaderboard"><Trophy className="w-4 h-4 mr-2" />Hall of Fame</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Student Directory {searchTerm && <span className="text-muted-foreground font-normal text-sm">(Filtered)</span>}</CardTitle>
                    <CardDescription>
                        {searchTerm 
                            ? `Showing ${filteredStudents.length} results for "${searchTerm}"`
                            : 'All students currently registered in the system.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">User ID</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.map((s) => (
                                <TableRow key={s.uid} className={s.isSuspended ? "opacity-50 grayscale" : ""}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8"><AvatarImage src={s.profilePhoto}/><AvatarFallback>{s.firstName?.[0]}</AvatarFallback></Avatar>
                                            <div>
                                              <p className="text-sm font-bold leading-none">{s.firstName} {s.surname} {s.isSuspended && <Badge variant="destructive" className="ml-2 scale-75 uppercase">Suspended</Badge>}</p>
                                              <p className="text-[10px] text-muted-foreground">{s.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant={s.subscriptionStatus === 'pro' ? 'default' : 'outline'} className={s.subscriptionStatus === 'pro' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>{s.subscriptionStatus}</Badge></TableCell>
                                    <TableCell className="hidden md:table-cell font-mono text-[10px] text-muted-foreground">{s.uid}</TableCell>
                                    <TableCell className="text-right"><Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4" /></Link></Button></TableCell>
                                </TableRow>
                            ))}
                            {filteredStudents.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground font-medium">No students found matching your search.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="teachers">
            <div className="space-y-8">
                {pendingTeachers.length > 0 && (
                    <Card className="border-orange-200 bg-orange-50/10">
                        <CardHeader><CardTitle className="text-orange-700 flex items-center gap-2"><ShieldAlert /> Pending Approvals</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableBody>
                                    {pendingTeachers.map((t) => (
                                        <TableRow key={t.uid}>
                                            <TableCell className="font-bold">{t.firstName} {t.surname}</TableCell>
                                            <TableCell className="text-right"><Button size="sm" onClick={() => approveTeacher(t.uid)}>Approve Access</Button></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Teacher Statistics</CardTitle>
                        <CardDescription>Detailed breakdown of student enrollment and conversion per teacher.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Total Students</TableHead>
                                    <TableHead className="text-center">Pro Members</TableHead>
                                    <TableHead className="text-center">Free Users</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.map((t) => (
                                    <TableRow key={t.uid}>
                                        <TableCell>
                                            <div>
                                                <p className="font-bold">{t.firstName} {t.surname}</p>
                                                <p className="text-[10px] text-muted-foreground">{t.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={t.status === 'approved' ? 'default' : 'secondary'} className={t.status === 'approved' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>
                                                {t.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-bold">{t.stats.total}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">{t.stats.pro}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-muted-foreground">{t.stats.free}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${t.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTeachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No teachers found matching your search.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>

        <TabsContent value="moderation">
            <Card className="border-red-100 bg-red-50/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-700"><ShieldAlert /> Flagged Accounts</CardTitle>
                    <CardDescription>Accounts flagged for suspicious activity or banned by administrators.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Reason / Status</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSuspicious.map((u) => (
                                <TableRow key={u.uid} className={u.isSuspended ? "bg-red-50/50" : ""}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8"><AvatarFallback>{u.firstName?.[0]}</AvatarFallback></Avatar>
                                            <div className="grid gap-0.5">
                                                <span className="text-sm font-bold">{u.firstName} {u.surname}</span>
                                                <span className="text-[10px] text-muted-foreground">{u.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {u.isSuspended ? <Badge variant="destructive">SUSPENDED</Badge> : (
                                            <div className="flex flex-col gap-1">
                                                {(u.totalPoints || 0) > 100000 && <Badge variant="outline" className="text-red-600 border-red-200">Abnormal Points</Badge>}
                                                {/temp|test|fake/i.test(u.email) && <Badge variant="outline" className="text-orange-600 border-orange-200">Suspicious Email</Badge>}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{u.totalPoints?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm"><Link href={`/admin/user/${u.uid}`}><Eye className="mr-2 h-4 w-4" />Review</Link></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredSuspicious.length === 0 && (
                                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No matching suspicious users identified.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="marketing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Mail className="text-primary" /> Create Campaign</CardTitle>
                        <CardDescription>Send a custom email to all students.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email Subject</Label>
                            <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="e.g. New Feature: Bubble Game Levels!" />
                        </div>
                        <div className="space-y-2">
                            <Label>HTML Message Body</Label>
                            <Textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} placeholder="Write your message here. HTML tags are supported." className="min-h-[200px]" />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button onClick={() => handleSendPromo(true)} variant="outline" className="flex-1" disabled={isSendingPromo}>
                                {isSendingPromo ? <Loader2 className="animate-spin w-4 h-4" /> : <Eye className="w-4 h-4 mr-2" />}
                                Send Test to Me
                            </Button>
                            <Button onClick={() => handleSendPromo(false)} className="flex-1" disabled={isSendingPromo}>
                                {isSendingPromo ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4 mr-2" />}
                                Launch Campaign
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="font-headline">Live Tracking</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <StatCard title="Emails Sent" value={marketingStats.emailsSent || 0} icon={Mail} subValue="Automated weekly batch" />
                            <StatCard title="Total Clicks" value={marketingStats.linkClicks || 0} icon={MousePointer2} subValue={`${((marketingStats.linkClicks / (marketingStats.emailsSent || 1)) * 100).toFixed(1)}% click rate`} />
                            <StatCard title="Conversions" value={marketingStats.conversions || 0} icon={CheckCircle} subValue="Actual Pro upgrades" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </TabsContent>

        <TabsContent value="leaderboard">
            <Card className="border-border/50 shadow-sm overflow-hidden rounded-xl max-w-4xl mx-auto">
                <CardHeader className="bg-muted/30 border-b border-border/50 pb-0">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 font-headline uppercase tracking-tight mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Top Performers</CardTitle>
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
                        )) : <div className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">Loading Champions...</div>}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
