'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
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
import { TrendingUp, Activity, Target, Clock, Star, Gamepad2, BookOpen, FileCheck } from 'lucide-react';
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

const ProgressReportSkeleton = () => {
  return (
    <div className="space-y-8">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 rounded-2xl">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full mt-2" />
          </Card>
        ))}
      </div>
      <Card className="h-96 rounded-[2.5rem]">
        <CardContent className="p-6">
          <Skeleton className="h-full w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  );
};

function ProgressContent() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [examHistory, setExamHistory] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) router.push('/login');
  }, [isAuthLoading, user, router]);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoading(true);
        const db = getFirestore(firebaseApp);
        try {
          const testQ = query(collection(db, 'testResults'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const testSnap = await getDocs(testQ);
          setTestHistory(testSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt instanceof Timestamp ? doc.data().createdAt.toDate() : new Date() } as TestResult)));
          const examQ = query(collection(db, 'examResults'), where('userId', '==', user.uid), orderBy('submittedAt', 'desc'));
          const examSnap = await getDocs(examQ);
          setExamHistory(examSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
        } catch (error: any) {
          if (error.code === 'permission-denied') errorEmitter.emit('permission-error', new FirestorePermissionError({ path: '/progress-fetch', operation: 'list' }));
        } finally { setIsLoading(false); }
      };
      fetchData();
    }
  }, [user]);

  const chartData = useMemo(() => {
    const practiceData = testHistory.map(result => ({ timestamp: result.createdAt.getTime(), date: format(result.createdAt, 'MMM d'), Accuracy: parseFloat(result.accuracy.toFixed(1)), Test: TEST_NAME_MAP[result.testId] || result.testId, score: result.score, totalQuestions: result.totalQuestions }));
    const examData = examHistory.filter(r => !r.isFinal || r.resultDeclared).map(result => { const d = result.submittedAt?.toDate ? result.submittedAt.toDate() : new Date(); return { timestamp: d.getTime(), date: format(d, 'MMM d'), Accuracy: parseFloat(result.accuracy.toFixed(1)), Test: result.paperId === 'final' ? 'Final Exam' : `Paper ${result.paperId}`, score: result.score, totalQuestions: result.totalQuestions }; });
    return [...practiceData, ...examData].sort((a, b) => a.timestamp - b.timestamp).slice(-20);
  }, [testHistory, examHistory]);

  const summaryStats = useMemo(() => {
    const all = [...testHistory, ...examHistory.filter(r => !r.isFinal || r.resultDeclared)];
    if (all.length === 0) return { totalActivities: 0, averageAccuracy: 0, bestAccuracy: 0, totalPracticeTime: '0m 0s' };
    const totalSeconds = testHistory.reduce((acc, r) => acc + (r.timeSpent || 0), 0);
    return { totalActivities: all.length, averageAccuracy: parseFloat((all.reduce((acc, r) => acc + r.accuracy, 0) / all.length).toFixed(1)), bestAccuracy: parseFloat(Math.max(...all.map(r => r.accuracy)).toFixed(1)), totalPracticeTime: `${Math.floor(totalSeconds / 60)}m ${totalSeconds % 60}s` };
  }, [testHistory, examHistory]);

  const { practiceTests, gameResults } = useMemo(() => ({ practiceTests: testHistory.filter(r => r.isGame !== true), gameResults: testHistory.filter(r => r.isGame === true) }), [testHistory]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <CardHeader className="relative z-10 p-10">
          <CardTitle className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4 font-headline">
            <TrendingUp className="w-10 h-10 text-primary" /> Progress Audit
          </CardTitle>
          <CardDescription className="text-slate-400 font-bold text-lg">Detailed performance analytics and training history.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Total Units</CardTitle>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summaryStats.totalActivities}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Avg Accuracy</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-primary">{summaryStats.averageAccuracy}%</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Elite Performance</CardTitle>
            <Star className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-yellow-500">{summaryStats.bestAccuracy}%</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Active Time</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summaryStats.totalPracticeTime}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2.5rem] border-none shadow-xl overflow-hidden">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-2xl font-black uppercase tracking-tight">Performance Trend</CardTitle>
          <CardDescription className="font-medium text-muted-foreground">Visualizing accuracy fluctuations over your last 20 activities.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          {chartData.length > 0 ? (
            <div className="h-[350px] w-full mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis unit="%" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={90} stroke="hsl(var(--primary))" strokeOpacity={0.2} strokeDasharray="3 3" />
                  <Line name="Accuracy %" type="monotone" dataKey="Accuracy" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground italic font-medium">No training data recorded yet. Start a practice session!</div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="tests" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-8 bg-muted/50 p-1 rounded-2xl h-auto border">
          <TabsTrigger value="tests" className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] py-4">
            <BookOpen className="w-3 h-3" /> Practice History
          </TabsTrigger>
          <TabsTrigger value="games" className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] py-4">
            <Gamepad2 className="w-3 h-3" /> Game Missions
          </TabsTrigger>
          <TabsTrigger value="exams" className="flex items-center gap-2 rounded-xl font-black uppercase text-[10px] py-4">
            <FileCheck className="w-3 h-3" /> Official Exams
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tests">
          <Card className="border-none shadow-lg overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="bg-muted/30 border-b p-8">
              <CardTitle className="font-black uppercase tracking-tight text-xl">Practice Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-8 py-4 text-[10px] font-black uppercase tracking-widest">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Training Unit</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Accuracy</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {practiceTests.length > 0 ? practiceTests.map(r => (
                    <TableRow key={r.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-8 text-xs font-bold text-slate-500">{format(r.createdAt, 'MMM d, p')}</TableCell>
                      <TableCell className="font-black text-slate-900">{TEST_NAME_MAP[r.testId] || r.testId}</TableCell>
                      <TableCell><Badge variant="outline" className="font-black text-primary border-primary/20">{r.accuracy.toFixed(1)}%</Badge></TableCell>
                      <TableCell className="pr-8 text-right font-bold text-slate-400">{Math.floor(r.timeSpent / 60)}m {r.timeSpent % 60}s</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic font-medium">No practice history found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="games">
          <Card className="border-none shadow-lg overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="bg-pink-50 border-b p-8">
              <CardTitle className="font-black uppercase tracking-tight text-xl text-pink-700">Mission History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-pink-50/50">
                  <TableRow>
                    <TableHead className="pl-8 py-4 text-[10px] font-black uppercase tracking-widest text-pink-600">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-pink-600">Game Mode</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-pink-600">Performance</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-pink-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gameResults.length > 0 ? gameResults.map(r => (
                    <TableRow key={r.id} className="hover:bg-pink-50/50 transition-colors">
                      <TableCell className="pl-8 text-xs font-bold text-slate-500">{format(r.createdAt, 'MMM d, p')}</TableCell>
                      <TableCell className="font-black text-pink-700 uppercase italic tracking-tight">{TEST_NAME_MAP[r.testId] || r.difficulty}</TableCell>
                      <TableCell className="font-black text-slate-900">{r.accuracy.toFixed(1)}%</TableCell>
                      <TableCell className="pr-8 text-right">
                        <Badge className={cn("rounded-lg px-4 py-1 font-black text-[9px] uppercase border-none", r.accuracy >= 80 ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}>
                          {r.accuracy >= 80 ? 'MISSION CLEARED' : 'ATTEMPTED'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic font-medium">No game data found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="exams">
          <Card className="border-none shadow-lg overflow-hidden rounded-[2rem] bg-white">
            <CardHeader className="bg-indigo-50 border-b p-8">
              <CardTitle className="font-black uppercase tracking-tight text-xl text-indigo-700">Official Exam Audit</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-indigo-50/50">
                  <TableRow>
                    <TableHead className="pl-8 py-4 text-[10px] font-black uppercase tracking-widest text-indigo-600">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Mastery Group</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Final Score</TableHead>
                    <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-indigo-600">Result</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examHistory.length > 0 ? examHistory.map(r => (
                    <TableRow key={r.id} className="hover:bg-indigo-50/50 transition-colors">
                      <TableCell className="pl-8 text-xs font-bold text-slate-500">{format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'MMM d, p')}</TableCell>
                      <TableCell className="font-black text-slate-900 uppercase">GROUP {r.group}</TableCell>
                      <TableCell className="font-black text-indigo-700">
                        {r.isFinal && !r.resultDeclared ? "AUDIT PENDING" : `${r.score} / ${r.totalQuestions}`}
                      </TableCell>
                      <TableCell className="pr-8 text-right">
                        {r.isFinal && !r.resultDeclared ? (
                          <Badge variant="outline" className="border-orange-200 text-orange-600 bg-orange-50 font-black text-[9px] px-3 uppercase">Awaiting Release</Badge>
                        ) : (
                          <Badge className="bg-indigo-600 text-white font-black text-[9px] px-4 uppercase">OFFICIAL {r.accuracy.toFixed(1)}%</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-24 text-muted-foreground italic font-medium">No exam records found.</TableCell>
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
  );
}