
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
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Building, Eye, TrendingUp, Activity, CheckCircle, Target, Clock, Star, UserCircle, School, Users } from 'lucide-react';
import { getTestSettings } from '@/lib/questions';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TEST_NAME_MAP } from '@/lib/constants';
import { Button } from '@/components/ui/button';


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

export default function AdminUserDetailsPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_user_bg.jpg?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9');
  const { userId } = useParams() as { userId: string };
  const { profile: currentUserProfile, getUserProfile, getUserTestHistory, getAllUsers, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
          } else if (profile.role === 'teacher') {
            getAllUsers('student').then(allStudents => {
              setAssignedStudents(allStudents.filter(s => s.teacherId === userId));
              setIsLoading(false);
            });
          } else { // Admin
             setIsLoading(false);
          }
        });
      }
    }
  }, [authLoading, currentUserProfile, router, userId, getUserProfile, getUserTestHistory, getAllUsers]);
  
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
    return <div>Loading user details...</div>; // Replace with a skeleton loader
  }

  if (!userProfile) {
    return <div>User not found.</div>;
  }
  
  const displayName = `${userProfile.firstName} ${userProfile.surname}`;
  const displayInitial = (userProfile.firstName?.[0] || '') + (userProfile.surname?.[0] || '');

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader className="flex flex-col md:flex-row items-start md:items-center gap-6">
                 <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={userProfile.profilePhoto || ''} alt={displayName} />
                    <AvatarFallback className="text-3xl">{displayInitial}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <CardTitle className="text-3xl font-headline flex items-center gap-2">
                        <UserCircle className="w-8 h-8 text-primary" />
                        {displayName}
                         <Badge className="capitalize">{userProfile.role}</Badge>
                    </CardTitle>
                    <CardDescription>{userProfile.email}</CardDescription>
                    {userProfile.role === 'student' && (
                        <div className="flex items-center gap-2 pt-1">
                            <School className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{userProfile.schoolName}, {userProfile.grade}</span>
                        </div>
                    )}
                     {userProfile.role === 'teacher' && userProfile.instituteName && (
                        <div className="flex items-center gap-2 pt-1">
                            <Building className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{userProfile.instituteName}</span>
                        </div>
                    )}
                </div>
            </CardHeader>
        </Card>

        {userProfile.role === 'student' && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Tests Taken</CardTitle><Activity className="w-5 h-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summaryStats.testsTaken}</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Average Accuracy</CardTitle><Target className="w-5 h-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summaryStats.averageAccuracy}%</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Best Accuracy</CardTitle><Star className="w-5 h-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summaryStats.bestAccuracy}%</div></CardContent></Card>
                <Card><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Practice Time</CardTitle><Clock className="w-5 h-5 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{summaryStats.totalTime}</div></CardContent></Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Performance Trend (Last 30 Tests)</CardTitle><CardDescription>Accuracy percentage over the student's most recent tests.</CardDescription></CardHeader>
                <CardContent>
                    {testHistory.length > 0 ? (<ResponsiveContainer width="100%" height={300}><LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} /><YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} /><Tooltip content={<CustomTooltip />} /><Legend /><Line type="monotone" dataKey="Accuracy" stroke="hsl(var(--primary))" strokeWidth={2} /></LineChart></ResponsiveContainer>) : (<div className="h-[300px] flex items-center justify-center text-muted-foreground">No test data available for this student.</div>)}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Detailed Test History</CardTitle><CardDescription>A log of all completed practice tests for this student.</CardDescription></CardHeader>
                <CardContent>
                    <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Test Type</TableHead><TableHead>Difficulty</TableHead><TableHead>Score</TableHead><TableHead>Accuracy</TableHead><TableHead>Time Spent</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {testHistory.length > 0 ? (testHistory.map((result) => (<TableRow key={result.id}><TableCell>{format(result.createdAt, 'PPp')}</TableCell><TableCell>{TEST_NAME_MAP[result.testId] || result.testId}</TableCell><TableCell><Badge variant={result.difficulty === 'hard' ? 'destructive' : result.difficulty === 'medium' ? 'secondary' : 'default'} className="capitalize">{result.difficulty}</Badge></TableCell><TableCell>{result.score}/{result.totalQuestions}</TableCell><TableCell>{result.accuracy.toFixed(1)}%</TableCell><TableCell>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell></TableRow>))) : (<TableRow><TableCell colSpan={6} className="text-center">No test history found.</TableCell></TableRow>)}
                    </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </>
        )}

         {userProfile.role === 'teacher' && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users className="w-6 h-6 text-primary"/>Assigned Students</CardTitle>
                    <CardDescription>A list of all students assigned to this teacher.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Subscription</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignedStudents.length > 0 ? (
                                assignedStudents.map((student) => (
                                <TableRow key={student.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar><AvatarImage src={student.profilePhoto} /><AvatarFallback>{student.firstName?.[0]}{student.surname?.[0]}</AvatarFallback></Avatar>
                                            <div><p className="font-medium">{`${student.firstName} ${student.surname}`}</p></div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{student.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={student.subscriptionStatus === 'pro' ? 'default' : 'secondary'} className={student.subscriptionStatus === 'pro' ? 'bg-green-500/20 text-green-700 border-green-400' : ''}>
                                            {student.subscriptionStatus === 'pro' && <CheckCircle className="mr-1 h-3 w-3" />}
                                            {student.subscriptionStatus || 'free'}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/admin/user/${student.uid}`}><Eye className="mr-2 h-4 w-4" />View Details</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="text-center">No students assigned to this teacher.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
