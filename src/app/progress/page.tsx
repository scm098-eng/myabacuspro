'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { TestResult, ExamResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity, CheckCircle, Target, Clock, Star, Gamepad2, BookOpen, FileCheck, FileEdit } from 'lucide-react';
import { getTestSettings } from '@/lib/questions';
import { TEST_NAME_MAP } from '@/lib/constants';
import { FirestorePermissionError } from '@/lib/errors';
import { errorEmitter } from '@/lib/error-emitter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

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

function ProgressReportSkeleton() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
}

function ProgressContent() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/progress_bg.jpg?alt=media');
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/login');
    }
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        const db = getFirestore(firebaseApp);
        
        try {
          const testQ = query(
            collection(db, 'testResults'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );
          const testSnap = await getDocs(testQ);
          const tests: TestResult[] = testSnap.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            } as TestResult;
          });
          setTestHistory(tests);

          const examQ = query(
            collection(db, 'examResults'),
            where('userId', '==', user.uid),
            orderBy('submittedAt', 'desc')
          );
          const examSnap = await getDocs(examQ);
          const exams: ExamResult[] = examSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as ExamResult));
          setExamHistory(exams);

        } catch (error: any) {
          if (error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: '/progress-fetch',
              operation: 'list',
            }));
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const chartData = useMemo(() => {
    const practiceData = testHistory.map(result => {
      const settings = getTestSettings(result.testId, result.difficulty);
      return {
        timestamp: result.createdAt.getTime(),
        date: format(result.createdAt, 'MMM d'),
        Accuracy: parseFloat(result.accuracy.toFixed(1)),
        Test: settings ? settings.title : (TEST_NAME_MAP[result.testId] || result.testId),
        score: result.score,
        totalQuestions: result.totalQuestions,
      };
    });

    const examData = examHistory
      .filter(r => !r.isFinal || r.resultDeclared)
      .map(result => {
        const date = result.submittedAt?.toDate ? result.submittedAt.toDate() : new Date();
        return {
          timestamp: date.getTime(),
          date: format(date, 'MMM d'),
          Accuracy: parseFloat(result.accuracy.toFixed(1)),
          Test: result.paperId === 'final' ? `Final Exam (Group ${result.group})` : `Practice Paper ${result.paperId.split('-')[1]} (Group ${result.group})`,
          score: result.score,
          totalQuestions: result.totalQuestions,
        };
      });

    return [...practiceData, ...examData]
      .sort((a, b) => a.timestamp - b.timestamp) 
      .slice(-20); 
  }, [testHistory, examHistory]);

  const summaryStats = useMemo(() => {
    const allActivities = [...testHistory, ...examHistory.filter(r => !r.isFinal || r.resultDeclared)];
    if (allActivities.length === 0) {
      return { totalActivities: 0, averageAccuracy: 0, bestAccuracy: 0, totalPracticeTime: '0m 0s' };
    }
    const totalAccuracy = allActivities.reduce((acc, r) => acc + r.accuracy, 0);
    const averageAccuracy = totalAccuracy / allActivities.length;
    const bestAccuracy = Math.max(...allActivities.map(r => r.accuracy));
    
    const totalSeconds = testHistory.reduce((acc, r) => acc + (r.timeSpent || 0), 0);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      totalActivities: allActivities.length,
      averageAccuracy: parseFloat(averageAccuracy.toFixed(1)),
      bestAccuracy: parseFloat(bestAccuracy.toFixed(1)),
      totalPracticeTime: `${minutes}m ${seconds}s`,
    };
  }, [testHistory, examHistory]);

  const { practiceTests, gameResults } = useMemo(() => {
    return {
      practiceTests: testHistory.filter(r => r.isGame !== true),
      gameResults: testHistory.filter(r => r.isGame === true)
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
          <CardDescription>Your performance summary across practice, games, and exams.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Activities</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summaryStats.totalActivities}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Avg Accuracy</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{summaryStats.averageAccuracy}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Best Score</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-yellow-500">{summaryStats.bestAccuracy}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Training Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summaryStats.totalPracticeTime}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-black uppercase tracking-tight">Performance Trend (Last 20 Sessions)</CardTitle>
          <CardDescription className="font-medium">Live visualization of your accuracy across all system activities.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={90} stroke="hsl(var(--primary))" strokeOpacity={0.2} strokeDasharray="3 3" />
                  <Line 
                    name="Accuracy Trend"
                    type="monotone" 
                    dataKey="Accuracy" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground italic font-medium">
              Complete an activity to reveal your training trend.
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8 bg-muted/50 p-1 rounded-2xl h-auto">
          <TabsTrigger value="tests" className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] py-3">
            <BookOpen className="w-3 h-3" /> Practice
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] py-3">
            <Gamepad2 className="w-3 h-3" /> Games
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] py-3">
            <FileCheck className="w-3 h-3" /> Exams
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tests">
          <Card className="border-none shadow-lg overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-black uppercase tracking-tight">Practice Session Log</CardTitle>
              <CardDescription className="font-bold">History of your timed challenges and visualization drills.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead className="pr-6">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {practiceTests.length > 0 ? (
                    practiceTests.map((result) => (
                      <TableRow key={result.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="pl-6 text-xs font-medium">{format(result.createdAt, 'MMM d, p')}</TableCell>
                        <TableCell className="font-bold">{TEST_NAME_MAP[result.testId] || result.testId}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-[10px] font-black">{result.difficulty}</Badge>
                        </TableCell>
                        <TableCell className="font-black text-primary">{result.accuracy.toFixed(1)}%</TableCell>
                        <TableCell className="pr-6 text-xs text-muted-foreground font-medium">{Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No practice history found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card className="border-none shadow-lg overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-pink-500/5">
              <CardTitle className="font-black uppercase tracking-tight text-pink-600">Bubble Game History</CardTitle>
              <CardDescription className="font-bold">A record of your journey through the underwater level map.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-pink-500/10">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Level Name</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead className="pr-6 text-right">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameResults.length > 0 ? (
                    gameResults.map((result) => (
                      <TableRow key={result.id} className="hover:bg-pink-50/50 transition-colors">
                        <TableCell className="pl-6 text-xs font-medium">{format(result.createdAt, 'MMM d, p')}</TableCell>
                        <TableCell className="font-bold text-pink-700">{result.difficulty}</TableCell>
                        <TableCell className="font-black text-foreground">{result.accuracy.toFixed(1)}%</TableCell>
                        <TableCell className="pr-6 text-right">
                          <Badge className={cn("rounded-lg px-4 font-black text-[10px]", result.accuracy >= 90 ? "bg-green-600" : "bg-muted text-muted-foreground")}>
                            {result.accuracy >= 90 ? 'CLEARED' : 'ATTEMPTED'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">Your candy road is waiting!</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams">
          <Card className="border-none shadow-lg overflow-hidden rounded-[2rem]">
            <CardHeader className="bg-indigo-600/5">
              <CardTitle className="font-black uppercase tracking-tight text-indigo-700">Official Exam Audit</CardTitle>
              <CardDescription className="font-bold text-indigo-900/60">Comprehensive results from practice papers and official final assessments.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-indigo-600/10">
                  <TableRow>
                    <TableHead className="pl-6">Submitted</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Paper Type</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead className="pr-6 text-right">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examHistory.length > 0 ? (
                    examHistory.map((r) => (
                      <TableRow key={r.id} className="hover:bg-indigo-50/50 transition-colors">
                        <TableCell className="pl-6 text-xs font-medium">
                          {format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'MMM d, p')}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-indigo-600 font-black">Group {r.group}</Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-700">
                          <div className="flex items-center gap-2">
                            {r.isFinal ? <FileCheck className="w-3 h-3 text-orange-500" /> : <FileEdit className="w-3 h-3 text-slate-400" />}
                            {r.paperId === 'final' ? 'Official Final' : `Practice Paper #${r.paperId.split('-')[1]}`}
                          </div>
                        </TableCell>
                        <TableCell className="font-black text-indigo-700">
                          {r.isFinal && !r.resultDeclared ? "---" : `${r.accuracy.toFixed(1)}%`}
                        </TableCell>
                        <TableCell className="pr-6 text-right font-black text-slate-900">
                          {r.isFinal && !r.resultDeclared ? (
                            <span className="text-[10px] text-orange-600 italic">Awaiting Result</span>
                          ) : (
                            <>{r.score} <span className="text-[10px] text-muted-foreground">/ {r.totalQuestions}</span></>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">Apply for an exam group to begin your certification journey.</TableCell>
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

export default function ProgressReportPage() {
  return (
    <Suspense fallback={<ProgressReportSkeleton />}>
      <ProgressContent />
    </Suspense>
  )
}
