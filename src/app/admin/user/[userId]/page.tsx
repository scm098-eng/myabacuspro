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

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: any }) => (
  <Card className="shadow-sm border-slate-100">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <Icon className="w-5 h-5 text-slate-400" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
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
  const [teacherName, setTeacherName] = useState<string | null>(null);
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
            // Fetch teacher name if assigned
            if (profile.teacherId && profile.teacherId !== 'unassigned') {
                getUserProfile(profile.teacherId).then(tp => {
                    if (tp) setTeacherName(`${tp.firstName} ${tp.surname}`);
                });
            }

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
            return { testsTaken: 0, averageAccuracy: '0%', bestAccuracy: '0%', totalTime: '0m 0s' };
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
            averageAccuracy: `${averageAccuracy.toFixed(1)}%`,
            bestAccuracy: `${bestAccuracy.toFixed(1)}%`,
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
  
  const displayName = `${userProfile.firstName} ${userProfile.surname}`;
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
        {/* --- MAIN PROFILE HEADER --- */}
        <Card className={cn("overflow-hidden border-slate-100 shadow-sm", userProfile.isSuspended ? "bg-red-50/50" : "bg-card")}>
            <CardHeader className="flex flex-col md:flex-row items-center gap-8 p-10">
                 <Avatar className="h-24 w-24 bg-pink-500 text-white shrink-0">
                    <AvatarImage src={userProfile.profilePhoto || ''} alt={displayName} />
                    <AvatarFallback className="text-4xl font-bold">{displayInitial}</AvatarFallback>
                </Avatar>
                
                <div className="flex-grow space-y-2 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                      <UserCircle className="w-6 h-6 text-orange-500" />
                      <CardTitle className="text-3xl font-bold text-slate-900 leading-none">
                          {displayName}
                      </CardTitle>
                      <Badge className="bg-orange-500 text-white border-none rounded-full px-4 text-[10px] uppercase font-bold">
                        {userProfile.role}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-500 font-medium text-lg">{userProfile.email}</p>
                      
                      <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400">
                        <School className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {userProfile.role === 'student' 
                            ? `${userProfile.schoolName || 'Unassigned School'}, ${userProfile.grade || 'N/A'}`
                            : (userProfile.instituteName || 'Unassigned Institute')
                          }
                        </span>
                      </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                  <Button 
                    onClick={handleToggleSuspension} 
                    variant="destructive"
                    disabled={isUpdatingStatus || isDeleting}
                    className={cn("font-bold h-11 px-8 rounded-xl", userProfile.isSuspended && "bg-green-600 hover:bg-green-700")}
                  >
                    {isUpdatingStatus ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Ban className="mr-2 h-4 w-4" />}
                    {userProfile.isSuspended ? "Restore Account" : "Suspend Account"}
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="text-destructive border-slate-200 hover:bg-destructive/5 font-bold h-11 px-8 rounded-xl" disabled={isDeleting}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="text-destructive" /> Critical Action
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete <strong>{displayName}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90 rounded-xl">
                          {isDeleting ? <Loader2 className="animate-spin mr-2" /> : "Confirm Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
            </CardHeader>
        </Card>

        {/* --- STAT CARDS GRID --- */}
        {userProfile.role === 'student' && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Tests Taken" value={summaryStats.testsTaken} icon={Activity} />
                <StatCard title="Average Accuracy" value={summaryStats.averageAccuracy} icon={Target} />
                <StatCard title="Best Accuracy" value={summaryStats.bestAccuracy} icon={Star} />
                <StatCard title="Total Practice Time" value={summaryStats.totalTime} icon={Clock} />
            </div>
            
            {/* --- PERFORMANCE TREND CHART --- */}
            <Card className="shadow-sm border-slate-100">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-bold text-slate-900">Performance Trend (Last 30 Tests)</CardTitle>
                  <CardDescription className="text-slate-500">Accuracy percentage over the student's most recent tests.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                    {testHistory.length > 0 ? (
                      <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="Accuracy" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground italic font-medium">No test data available for this student.</div>
                    )}
                </CardContent>
            </Card>

            {/* --- ACTIVITY LOG TABLE --- */}
            <Card className="shadow-sm border-slate-100 overflow-hidden">
                <CardHeader className="p-8"><CardTitle className="text-xl font-bold">Activity Log</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead className="pl-8">Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Accuracy</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                          {testHistory.length > 0 ? (testHistory.map((result) => (
                            <TableRow key={result.id} className="hover:bg-slate-50/50">
                              <TableCell className="text-xs font-medium pl-8">{format(result.createdAt, 'PPp')}</TableCell>
                              <TableCell className="font-bold text-slate-700">{TEST_NAME_MAP[result.testId] || result.testId}</TableCell>
                              <TableCell><Badge variant="outline" className="capitalize text-[10px] font-bold">{result.difficulty}</Badge></TableCell>
                              <TableCell className="font-bold text-slate-900">{result.accuracy.toFixed(1)}%</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell>
                            </TableRow>
                          ))) : (<TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No test history found.</TableCell></TableRow>)}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </>
        )}

        {/* --- COMPLETE PROFILE DETAILS --- */}
        <Card className="shadow-sm border-slate-100">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" /> Full Registration Profile
              </CardTitle>
              <CardDescription>Detailed contact and location data provided during signup.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-12">
                <div className="grid grid-cols-1 gap-12">
                  <ProfileSection title="Personal Profile" icon={UserCircle}>
                      <DetailItem label="Date of Birth" value={userProfile.dob ? format(new Date(userProfile.dob), 'PPP') : 'N/A'} icon={Calendar} />
                      <DetailItem label="Age" value={age !== 'N/A' ? `${age} Years` : 'N/A'} icon={Activity} />
                      <DetailItem label="Mobile Number" value={userProfile.mobileNo} icon={Phone} />
                      <DetailItem label="WhatsApp" value={userProfile.whatsappNo} icon={MessageSquare} />
                      <DetailItem label="Location" value={`${userProfile.city || ''}, ${userProfile.state || ''}`} icon={MapPin} />
                      <DetailItem label="Country" value={userProfile.country} icon={Home} />
                  </ProfileSection>

                  <ProfileSection title="Residential Address" icon={Home}>
                      <div className="col-span-full bg-slate-50 p-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 leading-relaxed shadow-inner">
                          {residentialAddress || 'No full address provided.'}
                      </div>
                  </ProfileSection>

                  {userProfile.role === 'student' ? (
                    <ProfileSection title="Academic Information" icon={School}>
                        <DetailItem label="School Name" value={userProfile.schoolName} />
                        <DetailItem label="Grade / Standard" value={userProfile.grade} />
                        <DetailItem label="Assigned Teacher" value={teacherName || 'Fetching...'} />
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

         {(userProfile.role === 'teacher' || userProfile.role === 'admin') && assignedStudents.length > 0 && (
            <Card className="shadow-sm border-slate-100 overflow-hidden">
                <CardHeader className="bg-slate-50 p-8 border-b">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold"><Users className="w-6 h-6 text-primary"/>Assigned Students</CardTitle>
                    <CardDescription className="font-medium text-slate-600">Managing {assignedStudents.length} students.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                     <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="pl-8">Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Subscription</TableHead>
                                <TableHead className="text-right pr-8">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedStudents.map((student) => (
                            <TableRow key={student.uid} className="hover:bg-slate-50/50">
                                <TableCell className="pl-8">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8"><AvatarImage src={student.profilePhoto} /><AvatarFallback>{student.firstName?.[0]}</AvatarFallback></Avatar>
                                        <p className="font-bold text-slate-900">{student.firstName} {student.surname}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">{student.email}</TableCell>
                                <TableCell>
                                    <Badge variant={student.subscriptionStatus === 'pro' ? 'default' : 'secondary'} className="text-[10px] font-bold">
                                        {student.subscriptionStatus || 'free'}
                                    </Badge>
                                </TableCell>
                                 <TableCell className="text-right pr-8">
                                    <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                        <Link href={`/admin/user/${student.uid}`}><Eye className="h-4 w-4 text-primary" /></Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
