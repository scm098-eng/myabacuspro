
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import type { ProfileData, BlogPost, Coupon } from '@/types';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Briefcase, Crown, Trophy, GraduationCap, Search, Settings, Zap, Plus, Edit, Trash2, Loader2, Send, ShieldAlert, UserX, Image as ImageIcon, Mail, UserCheck, Upload, CheckCircle2, Ticket, Copy, Check, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getFirestore, doc, onSnapshot, query, collection, where, orderBy, limit, setDoc, deleteDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ADMIN_EMAILS } from '@/lib/constants';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';
import { format } from 'date-fns';

function getUTCMondayKey() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = (day === 0 ? 6 : day - 1); 
    const monday = new Date(now);
    monday.setUTCDate(now.getUTCDate() - diff);
    monday.setUTCHours(0, 0, 0, 0);
    return monday.toISOString().split('T')[0];
}

function getUTCMonthKey() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

const generateRandomCode = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Readable Alphanumeric
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

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
  if (text.trim().startsWith('<') && text.trim().endsWith('>')) {
    return text;
  }
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
  const { profile, getAllUsers, isLoading: authLoading, getStudentTitle, approveTeacher, toggleUserSuspension, markUserAsRead } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState("totalPoints");
  const [isResetting, setIsResetting] = useState<'weekly' | 'monthly' | 'force' | 'blast' | 'suspension' | 'markRead' | 'coupon' | null>(null);

  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
  const [blogDialogMode, setBlogDialogMode] = useState<'edit' | 'preview'>('edit');
  const [isSavingBlog, setIsSavingBlog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Partial<BlogPost> | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    durationDays: 30,
    expireInDays: 7
  });

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
        console.error("Failed to fetch users", e);
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
          setBlogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
        },
        async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'blogs',
            operation: 'list',
          } satisfies SecurityRuleContext));
        }
      );
      unsubscribers.push(blogUnsub);

      const couponUnsub = onSnapshot(
        query(collection(db, "coupons"), orderBy("createdAt", "desc")),
        (snap) => {
          setCoupons(snap.docs.map(doc => ({ ...doc.data() } as Coupon)));
        },
        async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'coupons',
            operation: 'list',
          } satisfies SecurityRuleContext));
        }
      );
      unsubscribers.push(couponUnsub);
    }

    if (profile.role === 'admin' || profile.role === 'teacher') {
      let q;
      if (leaderboardTab === 'weeklyPoints') q = query(collection(db, "users"), where("role", "==", "student"), where("lastWeeklyReset", "==", currentWeekKey), orderBy("weeklyPoints", "desc"), limit(20));
      else if (leaderboardTab === 'monthlyPoints') q = query(collection(db, "users"), where("role", "==", "student"), where("lastMonthlyReset", "==", currentMonthKey), orderBy("monthlyPoints", "desc"), limit(20));
      else q = query(collection(db, "users"), where("role", "==", "student"), orderBy("totalPoints", "desc"), limit(20));

      const leaderboardUnsub = onSnapshot(
        q, 
        (snapshot) => {
          const filtered = snapshot.docs.map(doc => {
              const ud = doc.data() as ProfileData;
              return { uid: doc.id, email: ud.email?.toLowerCase(), name: `${ud.firstName} ${ud.surname}`, photo: ud.profilePhoto, points: (ud as any)[leaderboardTab] || 0, title: getStudentTitle(ud.totalDaysPracticed || 0, ud.totalPoints || 0) };
          }).filter(s => !ADMIN_EMAILS.includes(s.email)).slice(0, 10);
          setLeaderboard(filtered);
        },
        async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: 'users',
            operation: 'list',
          } satisfies SecurityRuleContext));
        }
      );
      unsubscribers.push(leaderboardUnsub);
    }
    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile, leaderboardTab, getStudentTitle, currentWeekKey, currentMonthKey]);

  const handleGenerateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting('coupon');
    try {
      const generatedCode = generateRandomCode();
      const functions = getFunctions(firebaseApp, 'us-central1');
      const generateFn = httpsCallable(functions, 'generateCoupon');
      
      await generateFn({ 
        code: generatedCode,
        durationDays: couponForm.durationDays,
        expireInDays: couponForm.expireInDays
      });
      
      toast({ title: "Coupon Generated", description: `Code ${generatedCode} is now active.` });
    } catch (e: any) {
      toast({ title: "Failed to Generate", description: e.message || "An internal error occurred.", variant: "destructive" });
    } finally {
      setIsResetting(null);
    }
  };

  const handleManualReset = async (type: 'weekly' | 'monthly') => {
    setIsResetting(type);
    try {
      const functions = getFunctions(firebaseApp, 'us-central1');
      const resetFn = httpsCallable(functions, type === 'weekly' ? 'manualResetWeekly' : 'manualResetMonthly');
      const result: any = await resetFn();
      toast({ title: "Reset Successful", description: `Reports sent to ${result.data.count || 0} students.` });
    } catch (e: any) {
      toast({ title: "Reset Failed", description: e.message, variant: "destructive" });
    } finally { setIsResetting(null); }
  };

  const handleApproveTeacher = async (uid: string) => {
    try { 
      await approveTeacher(uid); 
      toast({ title: "Teacher Approved" }); 
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

  const handleMarkAsRead = async (uid: string) => {
    setIsResetting('markRead');
    try {
      await markUserAsRead(uid);
      toast({ title: "Signup Acknowledged" });
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
      formData.append('message', marketingForm.messageMode === 'standard' ? plainTextToHtml(marketingForm.message) : marketingForm.message);
      formData.append('targetAudience', marketingForm.targetAudience);
      formData.append('isTest', String(marketingForm.isTest));
      formData.append('testEmail', marketingForm.testEmail);
      if (marketingForm.selectedStudentId) formData.append('studentId', marketingForm.selectedStudentId);
      attachments.forEach(file => formData.append('attachments', file));
      const res = await fetch('/api/admin/blast', { method: 'POST', body: formData });
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
    const id = editingBlog.id || editingBlog.slug;
    let finalImageUrl = editingBlog.image || '';

    if (blogImageFile) {
      try {
        const storageRef = ref(getStorage(firebaseApp), `blog_images/${id}_${Date.now()}`);
        const uploadResult = await uploadBytes(storageRef, blogImageFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      } catch (err) {
        toast({ title: "Image Upload Failed", variant: "destructive" });
        setIsSavingBlog(false); 
        return; 
      }
    }

    const blogData = { 
      ...editingBlog, 
      image: finalImageUrl, 
      author: editingBlog.author || `${profile?.firstName} ${profile?.surname}`, 
      createdAt: editingBlog.createdAt || serverTimestamp(), 
      updatedAt: serverTimestamp() 
    };
    
    setDoc(doc(getFirestore(firebaseApp), "blogs", id), blogData, { merge: true })
      .then(() => {
        toast({ title: "Blog Article Saved" }); 
        setIsBlogDialogOpen(false); 
        setEditingBlog(null); 
      })
      .catch(async (err: any) => { 
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `blogs/${id}`,
          operation: 'update',
          requestResourceData: blogData,
        } satisfies SecurityRuleContext));
      })
      .finally(() => setIsSavingBlog(false));
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    deleteDoc(doc(getFirestore(firebaseApp), "blogs", id))
      .then(() => {
        toast({ title: "Article Deleted" });
      })
      .catch(async (e: any) => { 
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `blogs/${id}`,
          operation: 'delete',
        } satisfies SecurityRuleContext));
      });
  };

  const processedData = useMemo(() => {
    const sl = searchTerm.toLowerCase();
    const matches = (u: ProfileData) => (u.firstName?.toLowerCase().includes(sl) || u.surname?.toLowerCase().includes(sl) || u.email?.toLowerCase().includes(sl));
    const allStaff = allUsers.filter(u => u.role === 'teacher' || u.role === 'admin');
    const allStudents = allUsers.filter(u => u.role === 'student').filter(u => !ADMIN_EMAILS.includes(u.email?.toLowerCase()));
    
    return { 
        filteredStaff: allStaff.filter(matches).map(s => {
          const students = allStudents.filter(stu => stu.teacherId === s.uid);
          return { ...s, proCount: students.filter(stu => stu.subscriptionStatus === 'pro').length, freeCount: students.filter(stu => stu.subscriptionStatus !== 'pro').length };
        }),
        filteredStudents: allStudents.filter(u => (profile?.role === 'admin' || u.teacherId === profile?.uid)).filter(matches),
        pendingTeachers: allUsers.filter(u => u.role === 'teacher' && u.status === 'pending'),
        unreadStudents: allStudents.filter(u => u.isAdminRead === false),
        moderationList: allUsers.filter(u => u.isSuspended || u.emailVerified === false),
        summaryStats: { totalTeachers: allStaff.length, totalStudents: allStudents.length, proUsers: allStudents.filter(s => s.subscriptionStatus === 'pro').length }
    };
  }, [allUsers, searchTerm, profile]);

  if (isLoading || authLoading) {
    return <div className="p-8"><Skeleton className="h-[600px] w-full rounded-3xl" /></div>;
  }

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
                    <TabsTrigger value="students" className="h-10 relative">
                      Students
                      {profile?.role === 'admin' && processedData.unreadStudents.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                          {processedData.unreadStudents.length}
                        </span>
                      )}
                    </TabsTrigger>
                    {profile?.role === 'admin' && <TabsTrigger value="staff" className="h-10">Staff List</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="blogs" className="h-10">Blogs</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="coupons" className="h-10">Gift Coupons</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="moderation" className="h-10">Moderation</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="marketing" className="h-10">Marketing</TabsTrigger>}
                    {profile?.role === 'admin' && <TabsTrigger value="system" className="h-10">System</TabsTrigger>}
                </TabsList>

                <TabsContent value="students">
                    <Card className="rounded-[1.5rem] overflow-hidden border-none shadow-md">
                        <CardHeader className="bg-muted/30"><CardTitle className="font-headline">Student Directory</CardTitle></CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-6">User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {processedData.filteredStudents.length > 0 ? processedData.filteredStudents.map((s) => (
                                <TableRow key={s.uid} className={cn(s.isAdminRead === false && "bg-orange-50/50")}>
                                  <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                        <Avatar className="h-10 w-10"><AvatarImage src={s.profilePhoto}/></Avatar>
                                        {s.isAdminRead === false && (
                                          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
                                        )}
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-bold">{s.firstName} {s.surname}</p>
                                          {s.isAdminRead === false && <Badge variant="secondary" className="text-[8px] h-3.5 px-1 bg-orange-100 text-orange-700 border-orange-200 font-black">NEW</Badge>}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{s.email}</p>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell><Badge variant={s.subscriptionStatus === 'pro' ? 'default' : 'outline'} className="font-bold">{s.subscriptionStatus}</Badge></TableCell>
                                  <TableCell className="text-right pr-6">
                                    <div className="flex justify-end gap-2">
                                      {profile?.role === 'admin' && s.isAdminRead === false && (
                                        <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(s.uid)} disabled={isResetting === 'markRead'} className="h-9 px-3 text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-bold">
                                          <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Read
                                        </Button>
                                      )}
                                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                                        <Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4 text-primary" /></Link>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )) : <TableRow><TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic font-medium">No students matched your search.</TableCell></TableRow>}
                            </TableBody>
                          </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff">
                    <Card className="rounded-[1.5rem] overflow-hidden border-none shadow-md">
                        <CardHeader className="bg-muted/30"><CardTitle>Staff Breakdown</CardTitle></CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-6">Teacher</TableHead>
                                <TableHead>Assigned Students</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                              {processedData.filteredStaff.map(s => (
                                <TableRow key={s.uid}>
                                  <TableCell className="pl-6 py-4">
                                    <div className="font-bold">{s.firstName} {s.surname}</div>
                                    <div className="text-[10px] text-muted-foreground">{s.email}</div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Badge className="bg-green-500/10 text-green-700 border-green-200 font-bold">Pro: {s.proCount}</Badge>
                                      <Badge variant="outline" className="font-bold text-muted-foreground">Free: {s.freeCount}</Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell><Badge className={cn("font-bold uppercase text-[10px]", s.role === 'admin' ? "bg-blue-600" : "bg-orange-500")}>{s.status || s.role}</Badge></TableCell>
                                  <TableCell className="text-right pr-6"><Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full"><Link href={`/admin/user/${s.uid}`}><Eye className="w-4 h-4 text-primary" /></Link></Button></TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="blogs" className="space-y-6">
                    <div className="flex justify-between items-center bg-card p-6 rounded-2xl border shadow-sm">
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tight">Blog Content</h2>
                        <p className="text-sm text-muted-foreground font-medium">Manage articles and training insights.</p>
                      </div>
                      <Button onClick={() => { setEditingBlog({ title: '', content: '', excerpt: '', category: 'News', slug: '' }); setDraftContent(''); setBlogImageFile(null); setBlogDialogMode('edit'); setIsBlogDialogOpen(true); }} className="h-11 px-6 font-bold rounded-xl shadow-lg">
                        <Plus className="mr-2 h-5 w-5" /> New Article
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blogs.map(blog => (
                        <Card key={blog.id} className="overflow-hidden group hover:border-primary/50 transition-colors shadow-sm">
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <Badge variant="secondary" className="mb-2 text-[8px] font-black tracking-widest uppercase">{blog.category}</Badge>
                                <CardTitle className="text-lg font-bold line-clamp-1">{blog.title}</CardTitle>
                              </div>
                              <div className="flex gap-1 ml-4">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingBlog(blog); setDraftContent(htmlToPlainText(blog.content)); setIsBlogDialogOpen(true); }}>
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDeleteBlog(blog.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">{blog.excerpt}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                </TabsContent>

                <TabsContent value="coupons" className="space-y-8">
                    <Card className="rounded-[1.5rem] border-none shadow-lg">
                      <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                          <Ticket className="w-6 h-6 text-primary" /> Coupon Management
                        </CardTitle>
                        <CardDescription>Issue gift codes for Pro access.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-8 px-8">
                        <form onSubmit={handleGenerateCoupon} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Access Days</Label>
                              <Select value={String(couponForm.durationDays)} onValueChange={v => setCouponForm(p => ({ ...p, durationDays: Number(v) }))}>
                                <SelectTrigger className="h-12 border-2 font-bold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="7">7 Days Trial</SelectItem>
                                  <SelectItem value="30">30 Days Pro</SelectItem>
                                  <SelectItem value="90">90 Days Pro</SelectItem>
                                  <SelectItem value="180">180 Days Pro</SelectItem>
                                  <SelectItem value="365">365 Days Pro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Claim Deadline (Days)</Label>
                              <Input 
                                type="number" 
                                value={couponForm.expireInDays} 
                                onChange={e => setCouponForm(p => ({ ...p, expireInDays: Number(e.target.value) }))}
                                className="h-12 border-2 font-bold"
                                min={1}
                              />
                            </div>
                          </div>
                          <Button type="submit" className="w-full h-14 text-base font-black uppercase tracking-widest rounded-xl shadow-xl" disabled={isResetting === 'coupon'}>
                            {isResetting === 'coupon' ? <Loader2 className="animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                            Generate Automated Coupon
                          </Button>
                        </form>

                        <div className="mt-12 rounded-2xl border overflow-hidden">
                          <Table>
                            <TableHeader className="bg-muted/50">
                              <TableRow>
                                <TableHead className="pl-6">Code</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {coupons.length > 0 ? coupons.map(c => (
                                <TableRow key={c.code} className={cn(c.isUsed && "bg-slate-50 opacity-60")}>
                                  <TableCell className="pl-6 font-mono font-bold tracking-wider">{c.code}</TableCell>
                                  <TableCell className="font-bold text-primary">{c.durationDays} Days</TableCell>
                                  <TableCell>
                                    {c.isUsed ? (
                                      <div className="flex flex-col">
                                        <Badge variant="secondary" className="w-fit bg-slate-200 text-slate-700 font-bold mb-1">USED</Badge>
                                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">By: {c.usedBy}</span>
                                      </div>
                                    ) : (
                                      <Badge variant="default" className="bg-green-500 font-bold">AVAILABLE</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                    {!c.isUsed && (
                                      <Button variant="ghost" size="sm" className="rounded-full" onClick={() => {
                                        navigator.clipboard.writeText(c.code);
                                        toast({ title: "Code Copied", description: "Ready to share with student." });
                                      }}>
                                        <Copy className="h-4 w-4 text-slate-500" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground italic">No coupons issued yet.</TableCell></TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="moderation" className="space-y-8">
                    <Card className="border-orange-200 bg-orange-50/10 rounded-[1.5rem] overflow-hidden">
                      <CardHeader className="bg-orange-100/50">
                        <CardTitle className="flex items-center gap-2 text-orange-700 font-headline">
                          <ShieldAlert className="w-5 h-5" /> Pending Teacher Approvals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="pl-6">Teacher</TableHead>
                              <TableHead>Institute</TableHead>
                              <TableHead className="text-right pr-6">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {processedData.pendingTeachers.length > 0 ? processedData.pendingTeachers.map(t => (
                              <TableRow key={t.uid}>
                                <TableCell className="pl-6 py-4">
                                  <div className="font-bold">{t.firstName} {t.surname}</div>
                                  <div className="text-[10px] text-muted-foreground">{t.email}</div>
                                </TableCell>
                                <TableCell className="text-sm font-medium">{t.instituteName || 'N/A'}</TableCell>
                                <TableCell className="text-right pr-6">
                                  <Button variant="outline" size="sm" className="bg-white border-orange-200 hover:bg-orange-100 hover:text-orange-700 font-bold h-9" onClick={() => handleApproveTeacher(t.uid)}>
                                    <UserCheck className="w-4 h-4 mr-2" /> Approve
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )) : <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic font-medium">No pending staff accounts.</TableCell></TableRow>}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200 bg-red-50/5 rounded-[1.5rem] overflow-hidden">
                      <CardHeader className="bg-red-100/50">
                        <CardTitle className="flex items-center gap-2 text-red-700 font-headline">
                          <UserX className="w-5 h-5" /> Account Moderation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="pl-6">User</TableHead>
                              <TableHead>Current Status</TableHead>
                              <TableHead className="text-right pr-6">Management</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {processedData.moderationList.length > 0 ? processedData.moderationList.map(u => (
                              <TableRow key={u.uid}>
                                <TableCell className="pl-6 py-4">
                                  <div className="font-bold">{u.firstName} {u.surname}</div>
                                  <div className="text-[10px] text-muted-foreground">{u.email}</div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-2">
                                    {u.isSuspended ? <Badge variant="destructive" className="font-black text-[9px]">SUSPENDED</Badge> : <Badge variant="outline" className="text-green-600 border-green-200">ACTIVE</Badge>}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                  <Button variant="outline" size="sm" className={cn("font-bold h-9", u.isSuspended ? "text-green-600 border-green-200 hover:bg-green-50" : "text-red-600 border-red-200 hover:bg-red-50")} onClick={() => handleToggleUserSuspension(u.uid, u.isSuspended || false)} disabled={isResetting === 'suspension'}>
                                    {u.isSuspended ? "Restore" : "Suspend"}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )) : <TableRow><TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic font-medium">System clear.</TableCell></TableRow>}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="marketing">
                    <Card className="rounded-[1.5rem] border-none shadow-lg">
                      <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                          <Mail className="w-6 h-6 text-primary" /> Marketing Hub
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-8 px-8">
                        <form onSubmit={handleBlastEmails} className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-bold">Target Audience</Label>
                            <Select value={marketingForm.targetAudience} onValueChange={(val) => setMarketingForm(p => ({ ...p, targetAudience: val, selectedStudentId: '' }))}>
                              <SelectTrigger className="h-12 border-2"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Every Student</SelectItem>
                                <SelectItem value="pro">Pro Only</SelectItem>
                                <SelectItem value="teachers">Teachers Only</SelectItem>
                                <SelectItem value="single">Particular Student</SelectItem>
                                <SelectItem value="staff_single">Particular Staff</SelectItem>
                              </SelectContent>
                            </Select>
                            {(marketingForm.targetAudience === 'single' || marketingForm.targetAudience === 'staff_single') && (
                              <div className="animate-in fade-in slide-in-from-top-2">
                                <Select value={marketingForm.selectedStudentId} onValueChange={(val) => setMarketingForm(p => ({ ...p, selectedStudentId: val }))}>
                                  <SelectTrigger className="h-12 border-2 shadow-sm"><SelectValue placeholder="Pick a member..." /></SelectTrigger>
                                  <SelectContent className="max-h-[300px]">
                                    {marketingForm.targetAudience === 'single' 
                                      ? allUsers.filter(u => u.role === 'student').map(s => (<SelectItem key={s.uid} value={s.uid}>{s.firstName} {s.surname} ({s.email})</SelectItem>)) 
                                      : allUsers.filter(u => u.role === 'teacher' || u.role === 'admin').map(s => (<SelectItem key={s.uid} value={s.uid}>{s.firstName} {s.surname} ({s.email})</SelectItem>))
                                    }
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label className="text-base font-bold">Email Subject</Label>
                            <Input value={marketingForm.subject} onChange={e => setMarketingForm(p => ({ ...p, subject: e.target.value }))} required className="h-12 border-2 font-medium" />
                          </div>
                          <div className="space-y-4">
                            <Label className="text-base font-bold">Email Message (Use {"{{name}}"} for personalization)</Label>
                            <Textarea value={marketingForm.message} onChange={e => setMarketingForm(p => ({ ...p, message: e.target.value }))} rows={12} required className="border-2 font-medium p-4 leading-relaxed" />
                          </div>
                          <Button type="submit" className="w-full h-16 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] transition-transform" disabled={isResetting !== null}>
                            {isResetting === 'blast' ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Send className="mr-3 h-6 w-6" />}
                            Launch Marketing Campaign
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                    <Card className="border-primary/20 bg-primary/5 rounded-[1.5rem] overflow-hidden">
                      <CardHeader className="bg-primary/10 border-b">
                        <CardTitle className="flex items-center gap-2 font-headline">
                          <Settings className="w-5 h-5 text-primary" />Maintenance & Reset
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
                        <div className="p-8 bg-background rounded-3xl border-2 space-y-6 shadow-sm flex flex-col justify-between">
                          <div>
                            <h4 className="font-black uppercase tracking-tight text-xl mb-2">Weekly Cycle</h4>
                            <p className="text-xs text-muted-foreground font-medium">Sends mastery reports and clears weekly scores.</p>
                          </div>
                          <Button onClick={() => handleManualReset('weekly')} variant="outline" className="w-full h-12 border-2 font-bold rounded-xl" disabled={isResetting !== null}>
                            {isResetting === 'weekly' ? <Loader2 className="animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
                            Run Weekly Reset
                          </Button>
                        </div>
                        <div className="p-8 bg-background rounded-3xl border-2 space-y-6 shadow-sm flex flex-col justify-between">
                          <div>
                            <h4 className="font-black uppercase tracking-tight text-xl mb-2 text-purple-700">Monthly Cycle</h4>
                            <p className="text-xs text-muted-foreground font-medium">Declares the monthly winner and sends elite reports.</p>
                          </div>
                          <Button onClick={() => handleManualReset('monthly')} className="w-full h-12 bg-purple-600 hover:bg-purple-700 font-bold rounded-xl shadow-lg" disabled={isResetting !== null}>
                            {isResetting === 'monthly' ? <Loader2 className="animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                            Run Monthly Reset
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <div className="space-y-8">
            <Card className="rounded-2xl overflow-hidden shadow-sm border-none">
              <CardHeader className="bg-muted/30 border-b pb-0">
                <CardTitle className="text-xl font-bold flex items-center gap-2 uppercase mb-4 tracking-tight">
                  <Trophy className="text-yellow-500 w-6 h-6" /> Top Performers
                </CardTitle>
                <Tabs defaultValue="totalPoints" onValueChange={setLeaderboardTab} className="w-full">
                  <TabsList className="grid grid-cols-3 bg-slate-200/50 mb-2 h-10 p-1">
                    <TabsTrigger value="weeklyPoints" className="text-[9px] font-black uppercase">Weekly</TabsTrigger>
                    <TabsTrigger value="monthlyPoints" className="text-[9px] font-black uppercase">Monthly</TabsTrigger>
                    <TabsTrigger value="totalPoints" className="text-[9px] font-black uppercase">Global</TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {leaderboard.length > 0 ? leaderboard.map((s, idx) => (
                    <div key={s.uid} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4 min-w-0">
                        <span className={cn("w-6 text-sm font-black", idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground")}>#{idx + 1}</span>
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm"><AvatarImage src={s.photo} /></Avatar>
                        <div className="min-w-0 overflow-hidden">
                          <span className="text-sm font-bold block truncate text-slate-900">{s.name}</span>
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase truncate inline-block" style={{ backgroundColor: s.title.color + '20', color: s.title.color }}>{s.title.name}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-primary block leading-none">{s.points.toLocaleString()}</span>
                        <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1 inline-block">Points</span>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-muted-foreground space-y-2">
                      <Settings className="w-8 h-8 mx-auto opacity-20 animate-spin-slow" />
                      <p className="text-[10px] font-black uppercase tracking-[0.2em]">Period Syncing</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

      <Dialog open={isBlogDialogOpen} onOpenChange={setIsBlogDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-hidden p-0 rounded-[2rem] border-none shadow-2xl flex flex-col">
          <DialogHeader className="p-6 bg-slate-900 text-white shrink-0 flex flex-row items-center justify-between">
            <div><DialogTitle className="text-2xl font-black uppercase tracking-tight italic">{editingBlog?.id ? 'Manage Article' : 'Create Article'}</DialogTitle></div>
            <div className="flex bg-white/10 p-1 rounded-xl gap-1 border border-white/10">
              <Button variant={blogDialogMode === 'edit' ? 'secondary' : 'ghost'} size="sm" onClick={() => setBlogDialogMode('edit')} className="rounded-lg h-9 px-4 font-bold">
                <Edit className="w-4 h-4 mr-2" /> Editor
              </Button>
              <Button variant={blogDialogMode === 'preview' ? 'secondary' : 'ghost'} size="sm" onClick={() => setBlogDialogMode('preview')} className="rounded-lg h-9 px-4 font-bold text-white hover:text-white">
                <Eye className="w-4 h-4 mr-2" /> Preview
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-white">
            {blogDialogMode === 'edit' ? (
              <form id="blog-save-form" onSubmit={handleSaveBlog} className="p-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Article Headline</Label>
                    <Input value={editingBlog?.title || ''} onChange={e => setEditingBlog(prev => ({ ...prev, title: e.target.value, slug: (prev?.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')) }))} required className="h-14 text-xl font-bold border-2 rounded-2xl focus:border-primary shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">URL Reference (Slug)</Label>
                    <Input value={editingBlog?.slug || ''} onChange={e => setEditingBlog(prev => ({ ...prev, slug: e.target.value }))} required className="h-14 bg-muted/20 border-2 rounded-2xl font-mono text-sm" />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-slate-100 space-y-6">
                  <div className="flex items-center gap-2 text-slate-700 font-black uppercase tracking-tight text-xs">
                    <ImageIcon className="w-4 h-4" /> Media & Visuals
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <Button type="button" variant="outline" className="w-full h-14 border-2 bg-white gap-2 font-black uppercase text-xs rounded-2xl hover:bg-slate-50" onClick={() => document.getElementById('blog-image-upload')?.click()}>
                        <Upload className="w-4 h-4" /> {blogImageFile ? 'Change File' : 'Upload Featured Image'}
                      </Button>
                      <input id="blog-image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) { setBlogImageFile(file); setEditingBlog(prev => ({ ...prev, image: URL.createObjectURL(file) })); } }} />
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase ml-1 opacity-50">Or Image URL</Label>
                        <Input value={editingBlog?.image || ''} onChange={e => { setEditingBlog(prev => ({ ...prev, image: e.target.value })); setBlogImageFile(null); }} placeholder="https://external-image-link.com/photo.jpg" className="h-12 border-2 bg-white rounded-xl text-xs" />
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      {(editingBlog?.image || blogImageFile) ? (
                        <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-xl aspect-[16/10] w-full max-w-[300px] bg-slate-100">
                          <img src={editingBlog?.image || ''} alt="Editor Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-full aspect-[16/10] w-full max-w-[300px] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300">
                           <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                           <p className="text-[10px] font-bold uppercase tracking-widest">No Image Set</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Content Category</Label>
                      <Input value={editingBlog?.category || ''} onChange={e => setEditingBlog(prev => ({ ...prev, category: e.target.value }))} required className="h-12 border-2 rounded-xl font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Social Summary (Excerpt)</Label>
                    <Textarea value={editingBlog?.excerpt || ''} onChange={e => setEditingBlog(p => ({ ...p, excerpt: e.target.value })) as any} rows={2} required className="border-2 rounded-2xl p-4 font-medium" placeholder="Write a short summary for social media shares..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] tracking-widest text-muted-foreground ml-1">Article Body (HTML Supported)</Label>
                    <Textarea value={draftContent} onChange={e => { setDraftContent(e.target.value); setEditingBlog(prev => ({ ...prev, content: plainTextToHtml(e.target.value) })); }} rows={16} required placeholder="Once upon a time in the world of math..." className="border-2 text-lg leading-relaxed font-serif p-8 rounded-3xl focus:ring-primary shadow-inner" />
                  </div>
                </div>
              </form>
            ) : (
              <div className="p-10 max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                  <Badge className="bg-primary text-white uppercase font-black text-[10px] px-5 py-2 rounded-full border-none shadow-md">{editingBlog?.category}</Badge>
                  <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight tracking-tighter">{editingBlog?.title || 'Draft Article Headline'}</h1>
                </div>
                {editingBlog?.image && (
                  <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-50">
                    <img src={editingBlog.image} alt="Preview Hero" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="james-clear-style prose lg:prose-xl max-w-none font-serif leading-relaxed px-4" dangerouslySetInnerHTML={{ __html: editingBlog?.content || '<p class="text-center text-muted-foreground italic">Your story is waiting to be told...</p>' }} />
              </div>
            )}
          </div>
          <DialogFooter className="p-8 border-t bg-slate-50 shrink-0">
            <Button type="button" variant="ghost" onClick={() => setIsBlogDialogOpen(false)} className="font-bold rounded-xl h-12 px-6">Cancel</Button>
            <Button form="blog-save-form" type="submit" disabled={isSavingBlog} className="h-14 px-12 font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
              {isSavingBlog ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Send className="mr-3 h-5 w-5" />} 
              {editingBlog?.id ? 'Update Article' : 'Publish Article'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
