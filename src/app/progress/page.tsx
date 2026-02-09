
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { TestResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, CheckCircle, Target, Clock, Star } from 'lucide-react';
import { getTestSettings } from '@/lib/questions';
import { TEST_NAME_MAP } from '@/lib/constants';
import { FirestorePermissionError } from '@/lib/errors';
import { errorEmitter } from '@/lib/error-emitter';

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


export default function ProgressReportPage() {
    usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/progress_bg.jpg?alt=media');
    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();
    const [testHistory, setTestHistory] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthLoading && !user) {
            router.push('/login');
        }
    }, [isAuthLoading, user, router]);

    useEffect(() => {
        if (user) {
            const fetchTestHistory = async () => {
                setIsLoading(true);
                const db = getFirestore(firebaseApp);
                const testResultsCollection = collection(db, 'testResults');
                const q = query(
                    testResultsCollection,
                    where('userId', '==', user.uid),
                    orderBy('createdAt', 'desc')
                );
                
                try {
                    const querySnapshot = await getDocs(q);
                    const history: TestResult[] = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        history.push({
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                        } as TestResult);
                    });
                    setTestHistory(history);
                } catch (error: any) {
                     if (error.code === 'permission-denied') {
                        const permissionError = new FirestorePermissionError({
                            path: '/testResults',
                            operation: 'list',
                        });
                        errorEmitter.emit('permission-error', permissionError);
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchTestHistory();
        }
    }, [user]);

    const chartData = useMemo(() => {
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
            .slice(-15); 
    }, [testHistory]);

    const summaryStats = useMemo(() => {
        if (testHistory.length === 0) {
            return {
                testsTaken: 0,
                averageAccuracy: 0,
                bestAccuracy: 0,
                totalTime: '0m 0s',
            };
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
    }, [testHistory]);

    if (isLoading || isAuthLoading) {
        return <ProgressReportSkeleton />;
    }

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl font-headline flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-primary" />
                        Progress Report
                    </CardTitle>
                    <CardDescription>Your performance summary and test history.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Tests Taken</CardTitle>
                        <Activity className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.testsTaken}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                        <Target className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.averageAccuracy}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Best Accuracy</CardTitle>
                        <Star className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.bestAccuracy}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Practice Time</CardTitle>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalTime}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Performance Trend (Last 15 Tests)</CardTitle>
                    <CardDescription>Accuracy percentage over your most recent tests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {testHistory.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Legend />
                                <ReferenceLine y={90} label={{ value: 'Excellent', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', fontSize: 10 }} stroke="hsl(var(--accent))" strokeDasharray="3 3" />
                                <ReferenceLine y={75} label={{ value: 'Good', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', fontSize: 10 }} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                                <ReferenceLine y={50} label={{ value: 'Passing', position: 'insideTopLeft', fill: 'hsl(var(--foreground))', fontSize: 10 }} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                                <Line 
                                    type="monotone" 
                                    dataKey="Accuracy" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={2}
                                    dot={{ r: 4, fill: "hsl(var(--primary))" }}
                                    activeDot={{ r: 8, fill: "hsl(var(--primary))" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            Complete a test to see your performance trend.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detailed Test History</CardTitle>
                    <CardDescription>A log of all your completed practice tests.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Test Type</TableHead>
                                <TableHead>Difficulty</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Accuracy</TableHead>
                                <TableHead>Time Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testHistory.length > 0 ? (
                                testHistory.map((result) => (
                                    <TableRow key={result.id}>
                                        <TableCell>{format(result.createdAt, 'PPp')}</TableCell>
                                        <TableCell>{TEST_NAME_MAP[result.testId] || result.testId}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                result.difficulty === 'hard' ? 'destructive' :
                                                result.difficulty === 'medium' ? 'secondary' : 'default'
                                            } className="capitalize">{result.difficulty}</Badge>
                                        </TableCell>
                                        <TableCell>{result.score}/{result.totalQuestions}</TableCell>
                                        <TableCell>{result.accuracy.toFixed(1)}%</TableCell>
                                        <TableCell>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No test history found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function ProgressReportSkeleton() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </CardHeader>
            </Card>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-72" />
                    <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-56" />
                    <Skeleton className="h-4 w-72" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
