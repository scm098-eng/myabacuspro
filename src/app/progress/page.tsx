
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
import { TrendingUp, Activity, CheckCircle, Target, Clock, Star, Gamepad2, BookOpen } from 'lucide-react';
import { getTestSettings } from '@/lib/questions';
import { TEST_NAME_MAP } from '@/lib/constants';
import { FirestorePermissionError } from '@/lib/errors';
import { errorEmitter } from '@/lib/error-emitter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                    Test: settings ? settings.title : (TEST_NAME_MAP[result.testId] || result.testId),
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

    const { practiceTests, gameResults } = useMemo(() => {
        return {
            practiceTests: testHistory.filter(r => !r.isGame),
            gameResults: testHistory.filter(r => r.isGame)
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
                        <CardTitle className="text-sm font-medium">Activities Completed</CardTitle>
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
                        <CardTitle className="text-sm font-medium">Practice Time (Tests)</CardTitle>
                        <Clock className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryStats.totalTime}</div>
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Performance Trend (Last 15 Sessions)</CardTitle>
                    <CardDescription>Accuracy percentage over your most recent tests and games.</CardDescription>
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
                            Complete an activity to see your performance trend.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="tests" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="tests" className="flex items-center gap-2 rounded-lg font-bold">
                        <BookOpen className="w-4 h-4" /> Practice Tests
                    </TabsTrigger>
                    <TabsTrigger value="games" className="flex items-center gap-2 rounded-lg font-bold">
                        <Gamepad2 className="w-4 h-4" /> Game History
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tests">
                    <Card className="border-none shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle>Detailed Test History</CardTitle>
                            <CardDescription>A log of all your completed timed practice tests.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
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
                                    {practiceTests.length > 0 ? (
                                        practiceTests.map((result) => (
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
                                                <TableCell className="font-bold text-primary">{result.accuracy.toFixed(1)}%</TableCell>
                                                <TableCell>{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium">No test history found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="games">
                    <Card className="border-none shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30">
                            <CardTitle>Bubble Game History</CardTitle>
                            <CardDescription>Visual log of your journey through the level map.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/10">
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Activity</TableHead>
                                        <TableHead>Level Name</TableHead>
                                        <TableHead>Points</TableHead>
                                        <TableHead>Accuracy</TableHead>
                                        <TableHead className="text-right">Outcome</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {gameResults.length > 0 ? (
                                        gameResults.map((result) => (
                                            <TableRow key={result.id}>
                                                <TableCell>{format(result.createdAt, 'PPp')}</TableCell>
                                                <TableCell className="font-bold text-pink-600">Bubble Game</TableCell>
                                                <TableCell>{result.difficulty}</TableCell>
                                                <TableCell className="font-black text-orange-600">+{result.earnedPoints}</TableCell>
                                                <TableCell>{result.accuracy.toFixed(1)}%</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className={cn("rounded-md px-3", result.accuracy >= 90 ? "bg-green-500" : "bg-muted text-muted-foreground")}>
                                                        {result.accuracy >= 90 ? 'CLEARED' : 'ATTEMPTED'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium">No game history found. Start popping bubbles!</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
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
                <Card className="p-6"><Skeleton className="h-16 w-full" /></Card>
                <Card className="p-6"><Skeleton className="h-16 w-full" /></Card>
                <Card className="p-6"><Skeleton className="h-16 w-full" /></Card>
                <Card className="p-6"><Skeleton className="h-16 w-full" /></Card>
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
