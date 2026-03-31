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
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
        <Card className={cn("overflow-hidden border-none shadow-xl", userProfile.isSuspended ? "bg-red-50/50" : "bg-card")}>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-8 p-10 bg-muted/20 border-b">
                 <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl shrink-0">
                    <AvatarImage src={userProfile.profilePhoto || ''} alt={displayName} />
                    <AvatarFallback className="text-4xl font-black">{displayInitial}</AvatarFallback>
                </Avatar>
                <div className="flex-grow space-y-4">
                    <div className="space-y-1">
                      <CardTitle className="text-4xl sm:text-5xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">
                          {displayName}
                      </CardTitle>
                      <Badge className="font-black uppercase tracking-widest text-[10px] px-3 py-1 bg-primary text-white border-none h-auto">
                        {userProfile.role}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xl font-bold flex items-center gap-2 text-primary">
                        <Mail className="w-5 h-5 shrink-0" /> {userProfile.email}
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                        {userProfile.role === 'student' && userProfile.schoolName && (
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                                <School className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-black uppercase tracking-tight text-slate-700">{userProfile.schoolName}, {userProfile.grade}</span>
                            </div>
                        )}
                        {(userProfile.role === 'teacher' || userProfile.role === 'admin') && userProfile.instituteName && (
                            <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full shadow-sm border border-slate-200">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span className="text-xs font-black uppercase tracking-tight text-slate-700">{userProfile.instituteName}</span>
                            </div>
                        )}
                      </div>
                    </div>
                </div>

                {currentUserProfile?.role === 'admin' && (
                  <div className="flex flex-col gap-3 ml-auto shrink-0 w-full md:w-auto pt-4 md:pt-0">
                    <Button 
                      onClick={handleToggleSuspension} 
                      variant={userProfile.isSuspended ? "default" : "destructive"}
                      disabled={isUpdatingStatus || isDeleting}
                      className="font-black uppercase tracking-widest text-xs h-12 shadow-lg"
                    >
                      {isUpdatingStatus ? <Loader2 className="animate-spin mr-2" /> : (userProfile.isSuspended ? <ShieldCheck className="mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />)}
                      {userProfile.isSuspended ? "Restore Account" : "Suspend Account"}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5 font-black uppercase tracking-widest text-xs h-12" disabled={isDeleting}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl border-4 border-destructive/20 p-8">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter text-destructive">
                            <AlertTriangle className="w-8 h-8" /> Critical Action
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-lg font-medium text-slate-700 mt-4">
                            You are about to permanently remove <strong>{displayName}</strong>'s data. This action cannot be reversed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-8 gap-4">
                          <AlertDialogCancel className="rounded-2xl h-12 font-bold px-8">Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90 rounded-2xl h-12 font-black uppercase tracking-widest px-8">
                            {isDeleting ? <Loader2 className="animate-spin mr-2" /> : "Confirm Deletion"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
            </CardHeader>

            <CardContent className="p-10 space-y-12">
                <div className="grid grid-cols-1 gap-12">
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
                      <div className="col-span-full bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 text-base font-bold text-slate-700 leading-relaxed shadow-inner">
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
                </div>
            </CardContent>
        </Card>

        {userProfile.role === 'student' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-lg border-none"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Tests Taken</CardTitle><Activity className="w-5 h-5 text-primary" /></CardHeader><CardContent><div className="text-4xl font-black">{summaryStats.testsTaken}</div></CardContent></Card>
                <Card className="shadow-lg border-none"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Avg Accuracy</CardTitle><Target className="w-5 h-5 text-green-500" /></CardHeader><CardContent><div className="text-4xl font-black">{summaryStats.averageAccuracy}%</div></CardContent></Card>
                <Card className="shadow-lg border-none"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Best Score</CardTitle><Star className="w-5 h-5 text-yellow-500" /></CardHeader><CardContent><div className="text-4xl font-black">{summaryStats.bestAccuracy}%</div></CardContent></Card>
                <Card className="shadow-lg border-none"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Practice Time</CardTitle><Clock className="w-5 h-5 text-blue-500" /></CardHeader><CardContent><div className="text-4xl font-black">{summaryStats.totalTime}</div></CardContent></Card>
            </div>
            
            <Card className="shadow-xl border-none">
                <CardHeader className="p-8 pb-4"><CardTitle className="text-2xl font-black uppercase tracking-tight">Performance Trend</CardTitle><CardDescription className="font-bold">Visual analysis of the last 30 practice sessions</CardDescription></CardHeader>
                <CardContent className="p-8 pt-0">
                    {testHistory.length > 0 ? (
                      <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} fontWeight="bold" />
                            <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} fontWeight="bold" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="Accuracy" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground italic font-bold">No test data available for this student.</div>
                    )}
                </CardContent>
            </Card>

            <Card className="shadow-xl border-none overflow-hidden">
                <CardHeader className="bg-muted/30 p-8"><CardTitle className="text-2xl font-black uppercase tracking-tight">Full Activity Log</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/10 h-14">
                        <TableRow>
                          <TableHead className="font-black uppercase tracking-widest text-[10px] pl-8">Date</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[10px]">Type</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[10px]">Difficulty</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[10px]">Accuracy</TableHead>
                          <TableHead className="font-black uppercase tracking-widest text-[10px]">Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                          {testHistory.length > 0 ? (testHistory.map((result) => (
                            <TableRow key={result.id} className="h-16 hover:bg-muted/20">
                              <TableCell className="text-xs font-bold pl-8">{format(result.createdAt, 'PPp')}</TableCell>
                              <TableCell className="font-black text-primary uppercase tracking-tight">{TEST_NAME_MAP[result.testId] || result.testId}</TableCell>
                              <TableCell><Badge variant="outline" className="capitalize text-[10px] font-black border-2">{result.difficulty}</Badge></TableCell>
                              <TableCell className="font-black text-lg text-slate-900">{result.accuracy.toFixed(1)}%</TableCell>
                              <TableCell className="text-xs text-muted-foreground font-bold">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell>
                            </TableRow>
                          ))) : (<TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground font-bold">No test history found for this student.</TableCell></TableRow>)}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </>
        )}

         {(userProfile.role === 'teacher' || userProfile.role === 'admin') && (
            <Card className="shadow-xl border-none overflow-hidden">
                <CardHeader className="bg-muted/30 p-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight"><Users className="w-8 h-8 text-primary"/>Assigned Students</CardTitle>
                    <CardDescription className="font-bold text-lg text-slate-600">Currently monitoring {assignedStudents.length} students.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader className="bg-muted/10 h-14">
                            <TableRow>
                                <TableHead className="font-black uppercase tracking-widest text-[10px] pl-8">Student</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Email</TableHead>
                                <TableHead className="font-black uppercase tracking-widest text-[10px]">Subscription</TableHead>
                                <TableHead className="text-right font-black uppercase tracking-widest text-[10px] pr-8">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedStudents.length > 0 ? (
                                assignedStudents.map((student) => (
                                <TableRow key={student.uid} className="h-20 hover:bg-muted/20">
                                    <TableCell className="pl-8">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <Avatar className="h-10 w-10 shrink-0 border-2 border-primary/10"><AvatarImage src={student.profilePhoto} /><AvatarFallback>{student.firstName?.[0]}{student.surname?.[0]}</AvatarFallback></Avatar>
                                            <p className="font-black text-slate-900 truncate uppercase tracking-tight">{student.firstName} {student.surname}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-bold text-muted-foreground">{student.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.subscriptionStatus === 'pro' ? 'default' : 'secondary'} className={cn("text-[9px] font-black uppercase tracking-widest h-6 px-3", student.subscriptionStatus === 'pro' ? "bg-yellow-400 text-yellow-900 border-yellow-500" : "")}>
                                            {student.subscriptionStatus || 'free'}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="text-right pr-8">
                                        <Button asChild variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-full hover:bg-primary/10">
                                            <Link href={`/admin/user/${student.uid}`}><Eye className="h-5 w-5 text-primary" /></Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center py-20 italic text-muted-foreground font-bold">No students assigned to this teacher yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
