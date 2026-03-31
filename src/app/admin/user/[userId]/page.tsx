'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import type { ProfileData, TestResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInYears } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Building, Eye, TrendingUp, Activity, CheckCircle, Target, Clock, Star, UserCircle, School, Users, Home, Phone, MessageSquare, Calendar, UserCheck, Ban, ShieldCheck, Loader2, Trash2, AlertTriangle, MapPin, Mail } from 'lucide-react';
import { getTestSettings } from '@/lib/questions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEST_NAME_MAP } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-background/90 border border-border rounded-lg shadow-lg">
        <p className="font-bold text-foreground">{`${data.date}`}</p>
        <p className="text-primary">{`Accuracy: ${data.Accuracy}%`}</p>
        <p className="text-sm text-muted-foreground">{data.Test}</p>
        <p className="text-sm text-muted-foreground">{`Score: ${data.score}/${data.totalQuestions}`}</p>
      </div>
    );
  }
  return null;
};

const ProfileSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
      <Icon className="w-5 h-5" />
      <h3 className="text-lg font-headline font-bold uppercase tracking-tight">{title}</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
      {children}
    </div>
  </div>
);

const DetailItem = ({ label, value, icon: Icon }: { label: string, value?: string | number | null, icon?: any }) => (
  <div className="flex items-start gap-3">
    {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />}
    <div className="grid gap-0.5 min-w-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-bold text-foreground break-words">{value || 'Not provided'}</span>
    </div>
  </div>
);

export default function AdminUserDetailsPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_user_bg.jpg?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9');
  const { userId } = useParams() as { userId: string };
  const { profile: currentUserProfile, getUserProfile, getUserTestHistory, getAllUsers, toggleUserSuspension, deleteUserAccount, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUserProfile || (currentUserProfile.role !== 'admin' && currentUserProfile.role !== 'teacher')) {
        router.push('/');
        return;
      }
      if (userId) {
        getUserProfile(userId).then(profile => {
          if (!profile) {
            setIsLoading(false);
            return;
          }
          if (currentUserProfile.role === 'teacher' && profile.uid !== currentUserProfile.uid && profile.teacherId !== currentUserProfile.uid) {
            router.push('/admin');
            return;
          }
          
          setUserProfile(profile);

          if (profile.role === 'student') {
            getUserTestHistory(userId).then(history => {
              setTestHistory(history);
              setIsLoading(false);
            });
          } else if (profile.role === 'teacher' || profile.role === 'admin') {
            getAllUsers('student').then(allStudents => {
              setAssignedStudents(allStudents.filter(s => s.teacherId === userId));
              setIsLoading(false);
            });
          } else {
             setIsLoading(false);
          }
        });
      }
    }
  }, [authLoading, currentUserProfile, router, userId, getUserProfile, getUserTestHistory, getAllUsers]);
  
  const handleToggleSuspension = async () => {
    if (!userProfile) return;
    setIsUpdatingStatus(true);
    try {
      const newStatus = !userProfile.isSuspended;
      await toggleUserSuspension(userId, newStatus);
      setUserProfile(prev => prev ? { ...prev, isSuspended: newStatus } : null);
      toast({
        title: newStatus ? "User Suspended" : "User Unsuspended",
        description: `The account for ${userProfile.firstName} is now ${newStatus ? 'inactive' : 'active'}.`,
        variant: newStatus ? "destructive" : "default"
      });
    } catch (e: any) {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccount(userId);
      toast({ title: "User Deleted", description: "The account and data have been removed from Firestore." });
      router.push('/admin');
    } catch (e: any) {
      toast({ title: "Deletion Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const chartData = useMemo(() => {
        if(userProfile?.role !== 'student') return [];
        return testHistory
            .slice() 
            .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) 
            .map(result => {
                const settings = getTestSettings(result.testId, result.difficulty);
                return {
                    date: format(result.createdAt, 'MMM d'),
                    Accuracy: parseFloat(result.accuracy.toFixed(1)),
                    Test: settings ? settings.title : result.testId,
                    score: result.score,
                    totalQuestions: result.totalQuestions,
                }
             })
            .slice(-30); 
    }, [testHistory, userProfile]);

    const summaryStats = useMemo(() => {
        if (testHistory.length === 0 || userProfile?.role !== 'student') {
            return { testsTaken: 0, averageAccuracy: 0, bestAccuracy: 0, totalTime: '0m 0s' };
        }
        const totalTests = testHistory.length;
        const totalAccuracy = testHistory.reduce((acc, r) => acc + r.accuracy, 0);
        const averageAccuracy = totalAccuracy / totalTests;
        const bestAccuracy = Math.max(...testHistory.map(r => r.accuracy));
        const totalSeconds = testHistory.reduce((acc, r) => acc + r.timeSpent, 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return {
            testsTaken: totalTests,
            averageAccuracy: parseFloat(averageAccuracy.toFixed(1)),
            bestAccuracy: parseFloat(bestAccuracy.toFixed(1)),
            totalTime: `${minutes}m ${seconds}s`,
        };
    }, [testHistory, userProfile]);


  if (isLoading || authLoading) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!userProfile) {
    return <div className="p-20 text-center font-bold">User profile not found.</div>;
  }
  
  const displayName = userProfile.middleName 
    ? `${userProfile.firstName} ${userProfile.middleName} ${userProfile.surname}`
    : `${userProfile.firstName} ${userProfile.surname}`;

  const displayInitial = (userProfile.firstName?.[0] || '') + (userProfile.surname?.[0] || '');
  const age = userProfile.dob ? differenceInYears(new Date(), new Date(userProfile.dob)) : 'N/A';
  
  const residentialAddress = [
    userProfile.addressLine1, 
    userProfile.city, 
    userProfile.taluka, 
    userProfile.district, 
    userProfile.state, 
    userProfile.pincode, 
    userProfile.country
  ].filter(Boolean).join(', ');

  const instituteAddress = [
    userProfile.instituteAddressLine1, 
    userProfile.instituteCity, 
    userProfile.instituteTaluka, 
    userProfile.instituteDistrict, 
    userProfile.instituteState, 
    userProfile.institutePincode, 
    userProfile.instituteCountry
  ].filter(Boolean).join(', ');


  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 px-4">
        <Card className={cn("overflow-hidden border-none shadow-xl", userProfile.isSuspended ? "bg-red-50/50" : "bg-card")}>
            <CardHeader className="flex flex-col lg:flex-row items-start lg:items-center gap-6 p-6 sm:p-8 bg-muted/20 border-b">
                 <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary/20 shadow-2xl shrink-0">
                    <AvatarImage src={userProfile.profilePhoto || ''} alt={displayName} />
                    <AvatarFallback className="text-2xl sm:text-4xl font-black">{displayInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-headline font-black uppercase tracking-tight flex items-center gap-3 truncate max-w-full">
                          {displayName}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="font-black uppercase tracking-widest text-[10px] px-3 py-1 shrink-0">{userProfile.role}</Badge>
                        {userProfile.isSuspended && <Badge variant="destructive" className="font-black uppercase tracking-widest text-[10px] px-3 py-1 shrink-0">SUSPENDED</Badge>}
                        {userProfile.role === 'teacher' && (
                            <Badge variant={userProfile.status === 'approved' ? 'default' : 'secondary'} className={cn("font-black uppercase tracking-widest text-[10px] px-3 py-1 shrink-0", userProfile.status === 'approved' ? "bg-green-500/20 text-green-700 border-green-400" : "")}>
                                <UserCheck className="mr-2 h-3 w-3" />
                                {userProfile.status}
                            </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-lg sm:text-xl font-bold flex items-center gap-2 text-primary truncate">
                      <Mail className="w-5 h-5 shrink-0" /> {userProfile.email}
                    </CardDescription>
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                      {userProfile.role === 'student' && userProfile.schoolName && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border shrink-0">
                              <School className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-bold">{userProfile.schoolName}, {userProfile.grade}</span>
                          </div>
                      )}
                      {(userProfile.role === 'teacher' || userProfile.role === 'admin') && userProfile.instituteName && (
                          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border shrink-0">
                              <Building className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs font-bold">{userProfile.instituteName}</span>
                          </div>
                      )}
                    </div>
                </div>
                {currentUserProfile?.role === 'admin' && (
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-64 mt-4 lg:mt-0">
                    <Button 
                      onClick={handleToggleSuspension} 
                      variant={userProfile.isSuspended ? "default" : "destructive"}
                      disabled={isUpdatingStatus || isDeleting}
                      className="flex-1 h-12 font-black uppercase text-xs"
                    >
                      {isUpdatingStatus ? <Loader2 className="animate-spin mr-2" /> : (userProfile.isSuspended ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />)}
                      {userProfile.isSuspended ? "Restore Account" : "Suspend Account"}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex-1 h-12 font-black uppercase text-xs" disabled={isDeleting}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[2rem]">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-2xl font-headline font-black text-red-600"><AlertTriangle /> CRITICAL ACTION</AlertDialogTitle>
                          <AlertDialogDescription className="text-base font-medium">
                            You are about to permanently remove <strong>{displayName}</strong>'s data from the system. This cannot be undone.
                            <br/><br/>
                            <em>Note: To prevent re-login, you must also delete them from the Firebase Auth Console manually.</em>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700 rounded-xl font-bold">
                            {isDeleting ? <Loader2 className="animate-spin mr-2" /> : "Permanently Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-10">
                {/* --- UNIVERSAL PROFILE DETAILS --- */}
                <ProfileSection title="Personal Profile" icon={UserCircle}>
                    <DetailItem label="Date of Birth" value={userProfile.dob ? format(new Date(userProfile.dob), 'PPP') : 'N/A'} icon={Calendar} />
                    <DetailItem label="Age" value={age !== 'N/A' ? `${age} Years` : 'N/A'} icon={Activity} />
                    <DetailItem label="Mobile Number" value={userProfile.mobileNo} icon={Phone} />
                    <DetailItem label="WhatsApp" value={userProfile.whatsappNo} icon={MessageSquare} />
                    <DetailItem label="Location" value={`${userProfile.city || ''}, ${userProfile.state || ''}`} icon={MapPin} />
                    <DetailItem label="Country" value={userProfile.country} icon={Home} />
                </ProfileSection>

                <ProfileSection title="Residential Address" icon={Home}>
                    <div className="col-span-full bg-muted/10 p-4 rounded-xl border border-dashed text-sm font-medium leading-relaxed">
                        {residentialAddress || 'No full address provided.'}
                    </div>
                </ProfileSection>

                {/* --- ROLE SPECIFIC DETAILS --- */}
                {userProfile.role === 'student' ? (
                  <ProfileSection title="Academic Information" icon={School}>
                      <DetailItem label="School Name" value={userProfile.schoolName} />
                      <DetailItem label="Grade / Standard" value={userProfile.grade} />
                      <DetailItem label="Assigned Teacher ID" value={userProfile.teacherId} />
                  </ProfileSection>
                ) : (
                  <ProfileSection title="Institute Information" icon={Building}>
                      <DetailItem label="Institute Name" value={userProfile.instituteName} />
                      <DetailItem label="Full Institute Address" value={instituteAddress} />
                  </ProfileSection>
                )}
            </CardContent>
        </Card>

        {userProfile.role === 'student' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tests Taken</CardTitle><Activity className="w-5 h-5 text-primary" /></CardHeader><CardContent><div className="text-3xl font-black">{summaryStats.testsTaken}</div></CardContent></Card>
                <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Avg Accuracy</CardTitle><Target className="w-5 h-5 text-green-500" /></CardHeader><CardContent><div className="text-3xl font-black">{summaryStats.averageAccuracy}%</div></CardContent></Card>
                <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Best Score</CardTitle><Star className="w-5 h-5 text-yellow-500" /></CardHeader><CardContent><div className="text-3xl font-black">{summaryStats.bestAccuracy}%</div></CardContent></Card>
                <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">Practice Time</CardTitle><Clock className="w-5 h-5 text-blue-500" /></CardHeader><CardContent><div className="text-3xl font-black">{summaryStats.totalTime}</div></CardContent></Card>
            </div>
            
            <Card className="shadow-lg border-none">
                <CardHeader><CardTitle className="font-headline font-black uppercase tracking-tight">Performance Trend</CardTitle><CardDescription>Last 30 practice sessions</CardDescription></CardHeader>
                <CardContent>
                    {testHistory.length > 0 ? (
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="Accuracy" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground italic">No test data available for this student.</div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-muted/30"><CardTitle className="font-headline font-black uppercase tracking-tight">Full Activity Log</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                          {testHistory.length > 0 ? (testHistory.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="text-xs font-bold">{format(result.createdAt, 'PPp')}</TableCell>
                              <TableCell className="font-bold text-primary">{TEST_NAME_MAP[result.testId] || result.testId}</TableCell>
                              <TableCell><Badge variant="outline" className="capitalize text-[10px] font-bold">{result.difficulty}</Badge></TableCell>
                              <TableCell className="font-black text-foreground">{result.accuracy.toFixed(1)}%</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell>
                            </TableRow>
                          ))) : (<TableRow><TableCell colSpan={5} className="text-center py-12 italic text-muted-foreground">No test history found.</TableCell></TableRow>)}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </>
        )}

         {(userProfile.role === 'teacher' || userProfile.role === 'admin') && (
            <Card className="shadow-lg border-none overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <CardTitle className="flex items-center gap-2 font-headline font-black uppercase tracking-tight"><Users className="w-6 h-6 text-primary"/>Assigned Students</CardTitle>
                    <CardDescription className="font-medium text-muted-foreground">Currently monitoring {assignedStudents.length} students.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Subscription</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedStudents.length > 0 ? (
                                assignedStudents.map((student) => (
                                <TableRow key={student.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-8 w-8 shrink-0"><AvatarImage src={student.profilePhoto} /><AvatarFallback>{student.firstName?.[0]}{student.surname?.[0]}</AvatarFallback></Avatar>
                                            <p className="font-bold text-sm truncate">{student.firstName} {student.surname}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{student.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.subscriptionStatus === 'pro' ? 'default' : 'secondary'} className={cn("text-[9px] font-black uppercase", student.subscriptionStatus === 'pro' ? "bg-yellow-400 text-yellow-900 border-yellow-500" : "")}>
                                            {student.subscriptionStatus || 'free'}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <Link href={`/admin/user/${student.uid}`}><Eye className="h-4 w-4" /></Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center py-12 italic text-muted-foreground">No students assigned yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
