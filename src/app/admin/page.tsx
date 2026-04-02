
'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData, BlogPost } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Briefcase, Crown, Trophy, GraduationCap, Search, Settings, RefreshCw, Zap, Check, Plus, Edit, Trash2, Loader2, Send, UserPlus, Users, ShieldCheck, Mail, UserCheck, Paperclip, FileText, Code, X, ShieldAlert, UserX, Image as ImageIcon, Type, Layout, Eye as EyeIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getFirestore, doc, onSnapshot, query, collection, where, orderBy, limit, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { parseISO, isValid, format, formatDistanceToNow } from 'date-fns';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

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

/**
 * Robust date normalization helper for display
 */
function normalizeDateDisplay(val: any): string {
  if (!val) return 'Just now';
  
  let date: Date;
  if (val && typeof val.toDate === 'function') {
    date = val.toDate();
  } else if (typeof val === 'string') {
    date = parseISO(val);
  } else if (val instanceof Date) {
    date = val;
  } else if (val && typeof val.seconds === 'number') {
    date = new Date(val.seconds * 1000);
  } else {
    return 'Just now';
  }

  return isValid(date) ? format(date, 'PPp') : 'Just now';
}

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

const plainTextToHtml = (text: string) => {
  if (!text) return '';
  return text
    .split('\n')
    .filter(p => p.trim() !== '')
    .map(p => `<p>${p.trim()}</p>`)
    .join('\n\n');
};

const htmlToPlainText = (html: string) => {
  if (!html) return '';
  return html
    .replace(/<\/p>/g, '\n')
    .replace(/<p>/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    .trim();
};

export default function AdminDashboardPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, getAllUsers, isLoading: authLoading, getStudentTitle, markUserAsRead, approveTeacher, toggleUserSuspension } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");
  const [recentJoins, setRecentJoins] = useState<ProfileData[]>([]);
  const [winnersData, setWinnersData] = useState<any>(null);
  const [isResetting, setIsResetting] = useState<'weekly' | 'monthly' | 'force' | 'blast' | 'suspension' | null>(null);
  
  const [forceWinnerDialog, setForceWinnerDialog] = useState<{ open: boolean, user: ProfileData | null }>({ open: false, user: null });

  // Blog State
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [blogDialogMode, setBlogDialogMode] = useState<'edit' | 'preview'>('edit');
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [draftContent, setDraftContent] = useState('');

  // Marketing State
  const [marketingForm, setMarketingForm] = useState({
    subject: '',
    message: '',
    targetAudience: 'all',
    selectedStudentId: '',
    messageMode: 'standard' as 'standard' | 'html',
    isTest: true,
    testEmail: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentWeekKey = useMemo(() => getUTCMondayKey(), []);
  const currentMonthKey = useMemo(() => getUTCMonthKey(), []);

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
    if (!profile) return;
    
    const db = getFirestore(firebaseApp);
    const unsubscribers: (() => void)[] = [];

    if (profile.role === 'admin') {
      const blogUnsub = onSnapshot(
        query(collection(db, "blogs"), orderBy("createdAt", "desc")), 
        (snap) => {
          setBlogs(snap.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            createdAt: doc.data().createdAt 
          } as BlogPost)));
        }
      );
      unsubscribers.push(blogUnsub);

      const winnerUnsub = onSnapshot(doc(db, "stats", "leaderboard"), (snap) => {
        if (snap.exists()) setWinnersData(snap.data());
      });
      unsubscribers.push(winnerUnsub);

      const joinsUnsub = onSnapshot(
        query(
          collection(db, "users"), 
          where("role", "==", "student"),
          where("isAdminRead", "==", false),
          orderBy("createdAt", "desc"), 
          limit(10)
        ),
        (snap) => {
          setRecentJoins(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as ProfileData)));
        }
      );
      unsubscribers.push(joinsUnsub);
    }

    if (profile.role === 'admin' || profile.role === 'teacher') {
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

      const leaderboardUnsub = onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map(doc => {
            const ud = doc.data() as ProfileData;
            return { 
              uid: doc.id, 
              name: `${ud.firstName} ${ud.surname}`, 
              photo: ud.profilePhoto, 
              points: (ud as any)[leaderboardTab] || 0, 
              title: getStudentTitle(ud.totalDaysPracticed || 0, ud.totalPoints || 0) 
            };
          });
          setLeaderboard(data);
      });
      unsubscribers.push(leaderboardUnsub);
    }

    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile, leaderboardTab, getStudentTitle, currentWeekKey, currentMonthKey]);

  const handleManualReset = async (type: 'weekly' | 'monthly') => {
    setIsResetting(type);
    try {
      const functions = getFunctions(firebaseApp, 'us-central1');
      const resetFn = httpsCallable(functions, type === 'weekly' ? 'manualResetWeekly' : 'manualResetMonthly');
      const result: any = await resetFn();
      
      toast({ 
        title: "Reset Successful", 
        description: `Winner declared and reports sent to ${result.data.count || 0} students.` 
      });
    } catch (e: any) {
      toast({ title: "Reset Failed", description: e.message || "Error processing the reset.", variant: "destructive" });
    } finally {
      setIsResetting(null);
    }
  };

  const handleForceDeclareWinner = async (type: 'weekly' | 'monthly') => {
    if (!forceWinnerDialog.user) return;
    setIsResetting('force');
    try {
      const functions = getFunctions(firebaseApp, 'us-central1');
      const forceFn = httpsCallable(functions, 'forceDeclareWinner');
      const result: any = await forceFn({ uid: forceWinnerDialog.user.uid, type });
      
      if (result.data.status === 'success') {
        toast({ title: "Success", description: result.data.message });
        setForceWinnerDialog({ open: false, user: null });
      } else {
        throw new Error(result.data.message || "Manual declaration failed.");
      }
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || "Unexpected error.", variant: "destructive" });
    } finally {
      setIsResetting(null);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, uid: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markUserAsRead(uid);
      toast({ title: "Member Acknowledged", description: "Moved to student directory." });
    } catch (err) {
      toast({ title: "Failed to update member status.", variant: "destructive" });
    }
  };

  const handleApproveTeacher = async (uid: string) => {
    try {
      await approveTeacher(uid);
      toast({ title: "Teacher Approved", description: "Account is now active." });
      fetchData();
    } catch (err) {
      toast({ title: "Approval Failed", variant: "destructive" });
    }
  };

  const handleToggleUserSuspension = async (uid: string, currentStatus: boolean) => {
    setIsResetting('suspension');
    try {
      await toggleUserSuspension(uid, !currentStatus);
      toast({ title: !currentStatus ? "User Suspended" : "User Restored" });
      fetchData();
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    } finally {
      setIsResetting(null);
    }
  };

  const handleBlastEmails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting('blast');
    try {
      const formData = new FormData();
      formData.append('subject', marketingForm.subject);
      
      const finalMessage = marketingForm.messageMode === 'standard' 
        ? plainTextToHtml(marketingForm.message) 
        : marketingForm.message;
      
      formData.append('message', finalMessage);
      formData.append('targetAudience', marketingForm.targetAudience);
      formData.append('isTest', String(marketingForm.isTest));
      formData.append('testEmail', marketingForm.testEmail);
      
      if (marketingForm.targetAudience === 'single' && marketingForm.selectedStudentId) {
        formData.append('studentId', marketingForm.selectedStudentId);
      }

      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const res = await fetch('/api/admin/blast', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Blast Complete", description: `Sent to ${data.count} recipients.` });
        setAttachments([]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast({ title: "Blast Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsResetting(null);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog?.title || !editingBlog?.content || !editingBlog?.slug) return;
    setIsSavingBlog(true);
    const db = getFirestore(firebaseApp);
    const id = editingBlog.id || editingBlog.slug;
    
    const blogData = {
      ...editingBlog,
      author: editingBlog.author || `${profile?.firstName} ${profile?.surname}`,
      createdAt: editingBlog.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    try {
      await setDoc(doc(db, "blogs", id), blogData, { merge: true });
      toast({ title: "Blog Updated" });
      setIsBlogDialogOpen(false);
      setEditingBlog(null);
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsSavingBlog(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const db = getFirestore(firebaseApp);
    try {
      await deleteDoc(doc(db, "blogs", id));
      toast({ title: "Article Deleted" });
    } catch (e: any) {
      toast({ title: "Deletion Failed", variant: "destructive" });
    }
  };

  const processedData = useMemo(() => {
    const sl = searchTerm.toLowerCase();
    const matches = (u: ProfileData) => (u.firstName?.toLowerCase().includes(sl) || u.surname?.toLowerCase().includes(sl) || u.email?.toLowerCase().includes(sl));
    
    const allStaff = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
    const allStudents = allUsers.filter(u => u.role === 'student');
    
    return { 
        filteredStaff: allStaff.filter(matches).map(s => {
          const students = allStudents.filter(stu => stu.teacherId === s.uid);
          return {
            ...s,
            proCount: students.filter(stu => stu.subscriptionStatus === 'pro').length,
            freeCount: students.filter(stu => stu.subscriptionStatus !== 'pro').length
          };
        }),
        filteredStudents: allStudents
            .filter(u => profile?.role === 'admin' ? u.isAdminRead !== false : true)
            .filter(u => (profile?.role === 'admin' || u.teacherId === profile?.uid))
            .filter(matches),
        pendingTeachers: allUsers.filter(u => u.role === 'teacher' && u.status === 'pending'),
        moderationList: allUsers.filter(u => u.isSuspended || u.emailVerified === false),
        summaryStats: { 
            totalTeachers: allStaff.length, 
            totalStudents: allStudents.length, 
            proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length 
        }
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
                <StatCard title="Total Students" value={processedData.summaryStats.totalStudents} icon={GraduationCap} />
                <StatCard title="Pro Accounts" value={processedData.summaryStats.proUsers} icon={Crown} />
                <StatCard title="Active Staff" value={processedData.summaryStats.totalTeachers} icon={Briefcase} />
            </div>
            <div className="relative group max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10 h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Tabs defaultValue="students" className="w-full">
                <TabsList className="bg-muted p-1 mb-8 overflow-x-auto justify-start h-auto flex-wrap">
                    <TabsTrigger value="students" className="h-10">Students</TabsTrigger>
                    {profile?.role === 'admin' && <TabsTrigger value="staff" className="h-10">Staff List</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="blogs" className="h-10">Blogs</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="moderation" className="h-10">Moderation</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="marketing" className="h-10">Marketing</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="system" className="h-10">System</TabsTrigger>}
                </TabsList>

                <TabsContent value="students">
                    <Card>
                        <CardHeader><CardTitle className="font-headline">Student Directory</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {processedData.filteredStudents.length > 0 ? processedData.filteredStudents.map((s) => (
                                        <TableRow key={s.uid}>
                                            <TableCell>
                                              <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8"><AvatarImage src={s.profilePhoto}/></Avatar>
                                                <div>
                                                  <p className="text-sm font-bold">{s.firstName} {s.surname}</p>
                                                  <p className="text-[10px] text-muted-foreground">{s.email}</p>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell><Badge variant={s.subscriptionStatus === 'pro' ? 'default' : 'outline'}>{s.subscriptionStatus}</Badge></TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex justify-end gap-2">
                                                {profile?.role === 'admin' && (
                                                  <Button variant="ghost" size="sm" onClick={() => setForceWinnerDialog({ open: true, user: s })}>
                                                    <Trophy className="w-4 h-4 text-yellow-600" />
                                                  </Button>
                                                )}
                                                <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                              </div>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={3} className="text-center py-8">No acknowledged students found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff">
                    <Card>
                        <CardHeader><CardTitle>Staff Breakdown</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Students (Pro/Free)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {processedData.filteredStaff.map(s => (
                                        <TableRow key={s.uid}>
                                            <TableCell>
                                                <div className="font-bold">{s.firstName} {s.surname}</div>
                                                <div className="text-[10px] text-muted-foreground">{s.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Badge className="bg-green-500/10 text-green-700 border-green-200">Pro: {s.proCount}</Badge>
                                                    <Badge variant="outline">Free: {s.freeCount}</Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell><Badge className={s.role === 'admin' ? "bg-blue-600" : "bg-orange-500"}>{s.status || s.role}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="moderation">
                    <div className="space-y-8">
                        <Card className="border-orange-200 bg-orange-50/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <ShieldAlert className="w-5 h-5" /> Pending Teacher Approvals
                                </CardTitle>
                                <CardDescription>Verify credentials before granting platform access.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Institute</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {processedData.pendingTeachers.length > 0 ? processedData.pendingTeachers.map(t => (
                                            <TableRow key={t.uid}>
                                                <TableCell>
                                                    <div className="font-bold">{t.firstName} {t.surname}</div>
                                                    <div className="text-[10px] text-muted-foreground">{t.email}</div>
                                                </TableCell>
                                                <TableCell className="text-sm font-medium">{t.instituteName || 'N/A'}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleApproveTeacher(t.uid)}><UserCheck className="w-4 h-4 mr-2" /> Approve</Button>
                                                        <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${t.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={3} className="text-center py-8">No pending staff accounts.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <Card className="border-red-200 bg-red-50/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <UserX className="w-5 h-5" /> Account Moderation
                                </CardTitle>
                                <CardDescription>Review flagged, potential fake, or unverified student accounts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>User</TableHead>
                                            <TableHead>Issue</TableHead>
                                            <TableHead className="text-right">Management</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {processedData.moderationList.length > 0 ? processedData.moderationList.map(u => (
                                            <TableRow key={u.uid}>
                                                <TableCell>
                                                    <div className="font-bold">{u.firstName} {u.surname}</div>
                                                    <div className="text-[10px] text-muted-foreground">{u.email}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-2">
                                                        {u.isSuspended && <Badge variant="destructive">Suspended</Badge>}
                                                        {!u.emailVerified && <Badge variant="outline" className="text-orange-600 border-orange-200">Email Unverified</Badge>}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm" 
                                                            className={u.isSuspended ? "text-green-600 border-green-200" : "text-red-600 border-red-200"}
                                                            onClick={() => handleToggleUserSuspension(u.uid, u.isSuspended || false)}
                                                            disabled={isResetting === 'suspension'}
                                                        >
                                                            {u.isSuspended ? "Restore" : "Suspend"}
                                                        </Button>
                                                        <Button asChild variant="ghost" size="sm"><Link href={`/admin/user/${u.uid}`}><Eye className="w-4 h-4" /></Link></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : <TableRow><TableCell colSpan={3} className="text-center py-8">System clear. No suspicious accounts found.</TableCell></TableRow>}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="marketing">
                    <Card className="border-primary/10 shadow-lg">
                        <CardHeader className="bg-muted/30 border-b">
                            <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                                <Mail className="w-6 h-6 text-primary" /> Marketing Hub
                            </CardTitle>
                            <CardDescription>Blast tailored emails to segments or specific students.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleBlastEmails} className="space-y-8">
                                <div className="space-y-4">
                                    <Label className="text-base font-bold">Target Audience</Label>
                                    <Select 
                                        value={marketingForm.targetAudience} 
                                        onValueChange={(val) => setMarketingForm(p => ({ ...p, targetAudience: val }))}
                                    >
                                        <SelectTrigger className="h-14 text-lg border-2 border-primary/20 focus:border-primary">
                                            <SelectValue placeholder="Select Audience" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Every Student</SelectItem>
                                            <SelectItem value="pro">Pro Only</SelectItem>
                                            <SelectItem value="free">Free Only</SelectItem>
                                            <SelectItem value="teachers">Teachers Only</SelectItem>
                                            <SelectItem value="single">Particular Student</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {marketingForm.targetAudience === 'single' && (
                                        <div className="animate-in fade-in slide-in-from-top-2">
                                            <Select 
                                                value={marketingForm.selectedStudentId} 
                                                onValueChange={(val) => setMarketingForm(p => ({ ...p, selectedStudentId: val }))}
                                            >
                                                <SelectTrigger className="h-12">
                                                    <SelectValue placeholder="Pick a student..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {allUsers.filter(u => u.role === 'student').map(s => (
                                                        <SelectItem key={s.uid} value={s.uid}>{s.firstName} {s.surname} ({s.email})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-base font-bold">Email Subject</Label>
                                    <Input 
                                        value={marketingForm.subject} 
                                        onChange={e => setMarketingForm(p => ({ ...p, subject: e.target.value }))} 
                                        placeholder="Enter subject line..." 
                                        className="h-12 bg-muted/20"
                                        required 
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-base font-bold">Email Message</Label>
                                        <div className="flex bg-muted p-1 rounded-lg">
                                            <Button 
                                                type="button" 
                                                variant={marketingForm.messageMode === 'standard' ? 'secondary' : 'ghost'} 
                                                size="sm" 
                                                className="h-8 rounded-md gap-2"
                                                onClick={() => setMarketingForm(p => ({ ...p, messageMode: 'standard' }))}
                                            >
                                                <FileText className="w-3 h-3" /> Standard
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant={marketingForm.messageMode === 'html' ? 'secondary' : 'ghost'} 
                                                size="sm" 
                                                className="h-8 rounded-md gap-2"
                                                onClick={() => setMarketingForm(p => ({ ...p, messageMode: 'html' }))}
                                            >
                                                <Code className="w-3 h-3" /> HTML Source
                                            </Button>
                                        </div>
                                    </div>
                                    <Textarea 
                                        value={marketingForm.message} 
                                        onChange={e => setMarketingForm(p => ({ ...p, message: e.target.value }))} 
                                        rows={10} 
                                        className="bg-muted/10 border-2 text-lg focus:border-primary"
                                        placeholder={marketingForm.messageMode === 'standard' ? "Write your content here. Paragraphs will be added automatically." : "Enter raw HTML content here..."}
                                        required 
                                    />
                                </div>

                                <div className="p-6 bg-muted/30 rounded-2xl border-2 border-dashed border-primary/20 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Paperclip className="w-5 h-5 text-primary" />
                                            <span className="font-bold">Attachments</span>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Files
                                        </Button>
                                        <input 
                                            type="file" 
                                            multiple 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
                                                }
                                            }}
                                        />
                                    </div>
                                    {attachments.length > 0 && (
                                        <div className="flex flex-wrap gap-3">
                                            {attachments.map((file, idx) => (
                                                <Badge key={idx} className="bg-primary/10 text-primary hover:bg-primary/20 cursor-default px-3 py-1.5 gap-2 border-primary/20">
                                                    <FileText className="w-3 h-3" />
                                                    {file.name}
                                                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))} />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-6 p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <Checkbox 
                                            id="test-mode"
                                            checked={marketingForm.isTest} 
                                            onCheckedChange={(val) => setMarketingForm(p => ({ ...p, isTest: !!val }))} 
                                        />
                                        <Label htmlFor="test-mode" className="font-black text-primary uppercase tracking-widest text-xs cursor-pointer">Test Send Only</Label>
                                    </div>
                                    {marketingForm.isTest && (
                                        <Input className="flex-1 bg-white border-primary/20" placeholder="Enter recipient for test email..." value={marketingForm.testEmail} onChange={e => setMarketingForm(p => ({ ...p, testEmail: e.target.value }))} />
                                    )}
                                </div>

                                <Button type="submit" className="w-full h-16 text-xl font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.01] transition-transform" disabled={isResetting !== null}>
                                    {isResetting === 'blast' ? <Loader2 className="animate-spin mr-3" /> : <Send className="mr-3 h-6 w-6" />}
                                    Launch Marketing Campaign
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blogs">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-headline">Blog Management</h2>
                        <Button onClick={() => { setEditingBlog({ title: '', content: '', excerpt: '', category: 'News', slug: '', layout: 'standard', fontFamily: 'serif', lineSpacing: 'relaxed', dropCap: true, headlineWeight: 'black', headlineCase: 'normal', headlineSpacing: 'normal', imagePosition: 'top', imageFit: 'cover' }); setDraftContent(''); setBlogDialogMode('edit'); setIsBlogDialogOpen(true); }}>
                            <Plus className="mr-2 h-4 w-4" /> New Article
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {blogs.map(blog => (
                            <Card key={blog.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div><CardTitle className="text-lg">{blog.title}</CardTitle><CardDescription>{blog.category} • {blog.author}</CardDescription></div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingBlog(blog); setDraftContent(htmlToPlainText(blog.content)); setBlogDialogMode('edit'); setIsBlogDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteBlog(blog.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent><p className="text-xs text-muted-foreground line-clamp-2">{blog.excerpt}</p></CardContent>
                                <CardFooter className="text-[10px] text-muted-foreground italic">
                                    Last Updated: {normalizeDateDisplay(blog.createdAt)}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="system">
                    <div className="space-y-8">
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-primary" />System Maintenance</CardTitle>
                                <CardDescription>Trigger performance cycles and declare winners manually.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-background rounded-2xl border border-border space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg"><RefreshCw className="w-5 h-5 text-blue-600" /></div>
                                        <div><h4 className="font-bold">Weekly Cycle</h4><p className="text-xs text-muted-foreground">Monday 00:00 UTC</p></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Resets weekly points and declares champ.</p>
                                    <Button onClick={() => handleManualReset('weekly')} variant="outline" className="w-full" disabled={isResetting !== null}>
                                        {isResetting === 'weekly' ? <Loader2 className="animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
                                        Run Weekly Reset
                                    </Button>
                                </div>
                                <div className="p-6 bg-background rounded-2xl border border-border space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-100 p-2 rounded-lg"><Crown className="w-5 h-5 text-purple-600" /></div>
                                        <div><h4 className="font-bold">Monthly Cycle</h4><p className="text-xs text-muted-foreground">1st Day 00:00 UTC</p></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Resets monthly points and notifies students.</p>
                                    <Button onClick={() => handleManualReset('monthly')} className="w-full bg-purple-600" disabled={isResetting !== null}>
                                        {isResetting === 'monthly' ? <Loader2 className="animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                                        Declare Monthly Winner
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" />Live Winner Status</CardTitle></CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Weekly Champ</Label>
                                        <div className="p-4 bg-muted rounded-xl border flex items-center gap-4">
                                            {winnersData?.lastWeeklyWinner ? (
                                                <><Avatar className="h-10 w-10"><AvatarImage src={winnersData.lastWeeklyWinner.photo}/></Avatar>
                                                <div><p className="font-bold text-sm">{winnersData.lastWeeklyWinner.name}</p><p className="text-[10px]">{winnersData.lastWeeklyWinner.points} PTS</p></div></>
                                            ) : <p className="text-xs italic">No weekly winner declared.</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Monthly Master</Label>
                                        <div className="p-4 bg-muted rounded-xl border flex items-center gap-4">
                                            {winnersData?.lastMonthlyWinner ? (
                                                <><Avatar className="h-10 w-10"><AvatarImage src={winnersData.lastMonthlyWinner.photo}/></Avatar>
                                                <div><p className="font-bold text-sm">{winnersData.lastMonthlyWinner.name}</p><p className="text-[10px]">{winnersData.lastMonthlyWinner.points} PTS</p></div></>
                                            ) : <p className="text-xs italic">No monthly winner declared.</p>}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-8">
            {profile?.role === 'admin' && recentJoins.length > 0 && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-black flex items-center gap-2 text-orange-700">
                    <UserPlus className="w-5 h-5" /> New Members
                  </CardTitle>
                  <Badge className="bg-orange-600">{recentJoins.length}</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-orange-100">
                    {recentJoins.map((u) => (
                      <div key={u.uid} className="group relative flex items-center gap-3 p-4 hover:bg-orange-100/50">
                        <Link href={`/admin/user/${u.uid}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 border-2 border-white"><AvatarImage src={u.profilePhoto} /></Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate">{u.firstName} {u.surname}</p>
                            <p className="text-[9px] uppercase font-black text-orange-600">Joined {u.createdAt?.toDate ? formatDistanceToNow(u.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</p>
                          </div>
                        </Link>
                        <Button 
                          onClick={(e) => handleMarkAsRead(e, u.uid)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full bg-white/50 text-orange-600 hover:bg-orange-600 hover:text-white"
                          title="Acknowledge and move to regular list"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            <Card className="rounded-2xl overflow-hidden shadow-sm">
                <CardHeader className="bg-muted/30 border-b pb-0">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 uppercase mb-4"><Trophy className="text-yellow-500 w-6 h-6" /> Top Performers</CardTitle>
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
                                    <span className={cn("w-6 text-sm font-bold", idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : "text-muted-foreground")}>#{idx + 1}</span>
                                    <Avatar className="h-10 w-10"><AvatarImage src={s.photo} /></Avatar>
                                    <div className="flex flex-col"><span className="text-sm font-bold">{s.name}</span><span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span></div>
                                </div>
                                <div className="text-right"><span className="text-sm font-bold text-primary block">{s.points.toLocaleString()}</span><span className="text-[8px] font-bold text-muted-foreground uppercase">Points</span></div>
                            </div>
                        )) : <div className="p-8 text-center text-muted-foreground text-xs uppercase font-bold tracking-widest">Fresh Period</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <Dialog open={forceWinnerDialog.open} onOpenChange={(val) => !val && setForceWinnerDialog({ open: false, user: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Declare Champion</DialogTitle>
          <DialogDescription>Name <strong>{forceWinnerDialog.user?.firstName}</strong> as the winner.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button onClick={() => handleForceDeclareWinner('weekly')} variant="outline" disabled={isResetting !== null}>Weekly Champion</Button>
            <Button onClick={() => handleForceDeclareWinner('monthly')} variant="outline" disabled={isResetting !== null}>Monthly Master</Button>
          </div>
          <DialogFooter><Button variant="ghost" onClick={() => setForceWinnerDialog({ open: false, user: null })}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 rounded-[2rem] border-none shadow-2xl flex flex-col">
          <DialogHeader className="p-6 bg-muted/30 border-b shrink-0 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-headline">{editingBlog?.id ? 'Manage Article' : 'Create Article'}</DialogTitle>
              <DialogDescription>Draft and refine your content before publishing.</DialogDescription>
            </div>
            <div className="flex bg-muted p-1 rounded-xl gap-1">
              <Button 
                variant={blogDialogMode === 'edit' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setBlogDialogMode('edit')}
                className="rounded-lg h-9 px-4"
              >
                <Edit className="w-4 h-4 mr-2" /> Editor
              </Button>
              <Button 
                variant={blogDialogMode === 'preview' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setBlogDialogMode('preview')}
                className="rounded-lg h-9 px-4"
              >
                <EyeIcon className="w-4 h-4 mr-2" /> Preview
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {blogDialogMode === 'edit' ? (
              <form id="blog-save-form" onSubmit={handleSaveBlog} className="p-8 space-y-10">
                {/* --- BASIC INFO --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold">Title</Label>
                    <Input 
                      value={editingBlog?.title || ''} 
                      onChange={e => setEditingBlog(prev => ({ ...prev, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))} 
                      required 
                      placeholder="The Future of Soroban"
                      className="h-12 text-lg border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">URL Slug</Label>
                    <Input 
                      value={editingBlog?.slug || ''} 
                      onChange={e => setEditingBlog(prev => ({ ...prev, slug: e.target.value }))} 
                      required 
                      placeholder="future-of-soroban"
                      className="h-12 bg-muted/20 border-2"
                    />
                  </div>
                </div>

                {/* --- LAYOUT SETTINGS --- */}
                <div className="bg-orange-50/30 p-8 rounded-3xl border-2 border-orange-100 space-y-8">
                  <div className="flex items-center gap-2 text-orange-700 font-bold uppercase tracking-tight text-xs">
                    <Layout className="w-4 h-4" /> Visual & Layout Engine
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Article Layout</Label>
                      <Select 
                        value={editingBlog?.layout || 'standard'} 
                        onValueChange={(val: any) => setEditingBlog(p => ({ ...p, layout: val }))}
                      >
                        <SelectTrigger className="h-12 border-2 bg-white">
                          <SelectValue placeholder="Pick Layout" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard (Traditional)</SelectItem>
                          <SelectItem value="centered">Centered (Focused)</SelectItem>
                          <SelectItem value="magazine">Magazine (Wide Hero)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Typography Style</Label>
                      <Select 
                        value={editingBlog?.fontFamily || 'serif'} 
                        onValueChange={(val: any) => setEditingBlog(p => ({ ...p, fontFamily: val }))}
                      >
                        <SelectTrigger className="h-12 border-2 bg-white">
                          <SelectValue placeholder="Pick Font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serif">Merriweather (Classic Serif)</SelectItem>
                          <SelectItem value="sans">Inter (Modern Sans)</SelectItem>
                          <SelectItem value="modern">Space Grotesk (Tech Modern)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Content Spacing</Label>
                      <Select 
                        value={editingBlog?.lineSpacing || 'relaxed'} 
                        onValueChange={(val: any) => setEditingBlog(p => ({ ...p, lineSpacing: val }))}
                      >
                        <SelectTrigger className="h-12 border-2 bg-white">
                          <SelectValue placeholder="Pick Spacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal (1.4)</SelectItem>
                          <SelectItem value="relaxed">Relaxed (1.6)</SelectItem>
                          <SelectItem value="wide">Wide (1.8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/50 p-4 rounded-2xl border-2 border-orange-100/50 w-fit">
                    <Switch 
                      id="drop-cap"
                      checked={editingBlog?.dropCap ?? true} 
                      onCheckedChange={(val) => setEditingBlog(p => ({ ...p, dropCap: val }))} 
                    />
                    <Label htmlFor="drop-cap" className="font-bold cursor-pointer">Enable Drop-Cap Feature</Label>
                  </div>
                </div>

                {/* --- HEADLINE IDENTITY --- */}
                <div className="bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 space-y-8">
                  <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-xs">
                    <Type className="w-4 h-4" /> Headline Identity
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Boldness</Label>
                      <Select 
                        value={editingBlog?.headlineWeight || 'black'} 
                        onValueChange={(val: any) => setEditingBlog(p => ({ ...p, headlineWeight: val }))}
                      >
                        <SelectTrigger className="h-12 border-2 bg-white">
                          <SelectValue placeholder="Pick Weight" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bold">Bold (700)</SelectItem>
                          <SelectItem value="black">Extra Black (900)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Casing</Label>
                      <Select 
                        value={editingBlog?.headlineCase || 'normal'} 
                        onValueChange={(val: any) => setEditingBlog(p => ({ ...p, headlineCase: val }))}
                      >
                        <SelectTrigger className="h-12 border-2 bg-white">
                          <SelectValue placeholder="Pick Casing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Sentence Case</SelectItem>
                          <SelectItem value="uppercase">All Caps (Impact)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Letter Spacing</Label>
                      <Select 
                        value={editingBlog?.headlineSpacing || 'normal'} 
                        onValueChange={(val: any) => setEditingBlog(p => ({ ...p, headlineSpacing: val }))}
                      >
                        <SelectTrigger className="h-12 border-2 bg-white">
                          <SelectValue placeholder="Pick Spacing" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tight">Tight (-0.05em)</SelectItem>
                          <SelectItem value="normal">Standard</SelectItem>
                          <SelectItem value="wide">Wide (0.1em)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* --- IMAGE SETTINGS --- */}
                <div className="bg-indigo-50/30 p-8 rounded-3xl border-2 border-indigo-100 space-y-8">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-tight text-xs">
                    <ImageIcon className="w-4 h-4" /> Image Adjustment Settings
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Image Alignment</Label>
                        <Select 
                          value={editingBlog?.imagePosition || 'top'} 
                          onValueChange={(val: any) => setEditingBlog(p => ({ ...p, imagePosition: val }))}
                        >
                          <SelectTrigger className="h-12 border-2 bg-white">
                            <SelectValue placeholder="Select Position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top">Full Width Top</SelectItem>
                            <SelectItem value="left">Left Side</SelectItem>
                            <SelectItem value="right">Right Side</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Image Fit Mode</Label>
                        <Select 
                          value={editingBlog?.imageFit || 'cover'} 
                          onValueChange={(val: any) => setEditingBlog(p => ({ ...p, imageFit: val }))}
                        >
                          <SelectTrigger className="h-12 border-2 bg-white">
                            <SelectValue placeholder="Select Fit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cover">Cover (Fills Area)</SelectItem>
                            <SelectItem value="contain">Contain (Shows Full Image)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Image URL (600x400 recommended)</Label>
                      <Input 
                        value={editingBlog?.image || ''} 
                        onChange={e => setEditingBlog(prev => ({ ...prev, image: e.target.value }))} 
                        placeholder="https://..."
                        className="h-12 border-2"
                      />
                      {editingBlog?.image && (
                        <div className="mt-4 relative aspect-[3/2] rounded-xl overflow-hidden border-2 bg-slate-100">
                          <img 
                            src={editingBlog.image} 
                            alt="Editor Preview" 
                            className={cn(
                              "w-full h-full", 
                              editingBlog.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                            )} 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* --- CONTENT --- */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold">Category</Label>
                      <Input value={editingBlog?.category || ''} onChange={e => setEditingBlog(prev => ({ ...prev, category: e.target.value }))} required className="h-12 border-2" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold">Author Override</Label>
                      <Input value={editingBlog?.author || ''} onChange={e => setEditingBlog(prev => ({ ...prev, author: e.target.value }))} className="h-12 border-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold">Excerpt (Social Share Summary)</Label>
                    <Textarea value={editingBlog?.excerpt || ''} onChange={e => setEditingBlog(p => ({ ...p, excerpt: e.target.value })) as any} rows={2} required className="border-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-bold">Main Story (HTML Tags Supported)</Label>
                      <Badge variant="outline" className="font-bold text-[10px] uppercase">Paragraph Injection ON</Badge>
                    </div>
                    <Textarea 
                      value={draftContent} 
                      onChange={e => { 
                        setDraftContent(e.target.value); 
                        setEditingBlog(prev => ({ ...prev, content: plainTextToHtml(e.target.value) })); 
                      }} 
                      rows={12} 
                      required 
                      placeholder="Write your story here..."
                      className="border-2 text-lg leading-relaxed focus:ring-primary font-serif p-6"
                    />
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-8 max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <Badge className="bg-primary text-white uppercase font-black text-[10px] px-4 py-1.5 rounded-full">{editingBlog?.category}</Badge>
                  <h1 
                    className={cn(
                      "text-4xl md:text-6xl text-slate-900 leading-tight",
                      editingBlog?.headlineWeight === 'black' ? "font-black" : "font-bold",
                      editingBlog?.headlineCase === 'uppercase' && "uppercase",
                      editingBlog?.headlineSpacing === 'tight' ? "tracking-tighter" : editingBlog?.headlineSpacing === 'wide' ? "tracking-widest" : "tracking-normal"
                    )}
                  >
                    {editingBlog?.title || 'Article Headline Preview'}
                  </h1>
                  <p className="text-muted-foreground font-medium">By {editingBlog?.author || 'Author'} • Just Now</p>
                </div>

                <div className={cn(
                  "grid grid-cols-1 gap-8",
                  editingBlog?.imagePosition !== 'top' && "md:grid-cols-2 items-start"
                )}>
                  {editingBlog?.image && (
                    <div className={cn(
                      "relative aspect-[3/2] rounded-[2rem] overflow-hidden shadow-2xl border bg-slate-50",
                      editingBlog.imagePosition === 'right' && "md:order-last"
                    )}>
                      <img 
                        src={editingBlog.image} 
                        alt="Preview" 
                        className={cn(
                          "w-full h-full",
                          editingBlog.imageFit === 'contain' ? 'object-contain' : 'object-cover'
                        )}
                      />
                    </div>
                  )}
                  
                  <div 
                    className={cn(
                      "prose lg:prose-xl max-w-none james-clear-style",
                      editingBlog?.fontFamily === 'serif' ? "font-serif" : editingBlog?.fontFamily === 'modern' ? "font-headline" : "font-sans",
                      editingBlog?.lineSpacing === 'relaxed' ? "leading-relaxed" : editingBlog?.lineSpacing === 'wide' ? "leading-loose" : "leading-normal",
                      editingBlog?.dropCap && "drop-cap-enabled"
                    )}
                    dangerouslySetInnerHTML={{ __html: editingBlog?.content || '<p>Content preview will appear here...</p>' }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 border-t bg-muted/10 shrink-0">
            <Button type="button" variant="ghost" onClick={() => setIsBlogDialogOpen(false)} className="font-bold">Cancel</Button>
            <Button 
              form="blog-save-form"
              type="submit" 
              disabled={isSavingBlog} 
              className="h-12 px-10 font-black uppercase tracking-widest shadow-xl transition-transform hover:scale-[1.02]"
            >
              {isSavingBlog ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />} 
              {editingBlog?.id ? 'Update Article' : 'Publish Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
