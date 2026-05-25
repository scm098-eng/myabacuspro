'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult } from '@/types';
import { format, parseISO, isValid } from 'date-fns';
import { CheckCircle2, XCircle, Search, Trophy, Eye, FileText, ScrollText, RefreshCcw, Megaphone, Calendar, Clock, Save, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

export default function AdminExamsPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  
  // Schedule States
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('12:30');
  const [endTime, setEndTime] = useState('16:00');

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'admin')) {
      router.push('/');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    
    // Fetch Schedule
    getDoc(doc(db, "stats", "examSchedule")).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setExamDate(data.date || '');
        setStartTime(data.startTime || '12:30');
        setEndTime(data.endTime || '16:00');
      }
    });

    const unsubApps = onSnapshot(query(collection(db, "examApplications"), orderBy("appliedAt", "desc")), 
      (snap) => {
        setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamApplication)));
        setLoading(false);
      },
      async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examApplications', operation: 'list' }));
      }
    );

    const unsubResults = onSnapshot(query(collection(db, "examResults"), orderBy("submittedAt", "desc")), 
      (snap) => {
        setAllResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
      },
      async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examResults', operation: 'list' }));
      }
    );

    return () => {
      unsubApps();
      unsubResults();
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const db = getFirestore(firebaseApp);
    updateDoc(doc(db, "examApplications", id), { status })
      .then(() => toast({ title: `Application ${status}` }))
      .catch(async (serverError) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `examApplications/${id}`, operation: 'update', requestResourceData: { status } })));
  };

  const handleDeclareResult = async (id: string) => {
    const db = getFirestore(firebaseApp);
    updateDoc(doc(db, "examResults", id), { resultDeclared: true })
      .then(() => toast({ title: "Result Declared", description: "Student can now view their score." }))
      .catch(async (serverError) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `examResults/${id}`, operation: 'update', requestResourceData: { resultDeclared: true } })));
  };

  const handleDeleteApplication = async (id: string) => {
    const db = getFirestore(firebaseApp);
    deleteDoc(doc(db, "examApplications", id))
      .then(() => toast({ title: `Application Reset`, description: "Student can now apply again." }))
      .catch(async (serverError) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `examApplications/${id}`, operation: 'delete' })));
  };

  const handleSaveSchedule = async () => {
    if (!examDate) {
      toast({ title: "Select a Date", variant: "destructive" });
      return;
    }
    setIsSavingSchedule(true);
    const db = getFirestore(firebaseApp);
    const payload = {
      date: examDate,
      startTime,
      endTime,
      updatedAt: new Date().toISOString()
    };

    setDoc(doc(db, "stats", "examSchedule"), payload, { merge: true })
      .then(() => {
        toast({ title: "Schedule Updated", description: `Official exam set for ${examDate}.` });
        setIsSavingSchedule(false);
      })
      .catch(async (serverError) => {
        setIsSavingSchedule(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: "stats/examSchedule", 
          operation: 'update',
          requestResourceData: payload
        }));
      });
  };

  const filteredApps = useMemo(() => {
    return applications.filter(a => a.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [applications, searchTerm]);

  const finalResults = useMemo(() => {
    return allResults.filter(r => r.isFinal);
  }, [allResults]);

  if (loading || authLoading) return <div className="p-8">Loading Exam Management...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <Card className="rounded-[2rem] border-none shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <CardTitle className="text-3xl font-black uppercase tracking-tight">Exam Administration</CardTitle>
              <CardDescription>Manage schedule, review applications, and audit results.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search student..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="applications">
            <TabsList className="mb-8">
              <TabsTrigger value="applications" className="font-bold">Applications ({applications.filter(a => a.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="final-results" className="font-bold">Official Results ({finalResults.length})</TabsTrigger>
              <TabsTrigger value="schedule" className="font-bold">Exam Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-bold">{app.studentName}</TableCell>
                      <TableCell><Badge variant="secondary">Group {app.group}</Badge></TableCell>
                      <TableCell>{app.age} Yrs</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{app.appliedAt?.toDate ? format(app.appliedAt.toDate(), 'PPP') : 'Recently'}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'approved' ? 'default' : (app.status === 'pending' ? 'outline' : 'destructive')}>
                          {app.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(app.id, 'approved')}>
                                <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(app.id, 'rejected')}>
                                <XCircle className="w-4 h-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {(app.status === 'rejected' || app.status === 'approved') && (
                             <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => handleDeleteApplication(app.id)}>
                                <RefreshCcw className="w-4 h-4 mr-1" /> Allow Re-apply
                             </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="final-results">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {finalResults.map(r => (
                   <Card key={r.id} className="border-2 border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
                     <CardHeader className="bg-slate-900 text-white p-4 shrink-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                             <p className="text-[10px] font-black uppercase text-indigo-400">Official Final</p>
                             {r.resultDeclared && <Badge className="bg-green-500 h-4 text-[8px]">DECLARED</Badge>}
                          </div>
                          <Trophy className="w-4 h-4 text-yellow-400" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-6 flex-grow">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <p className="text-lg font-black">{applications.find(a => a.userId === r.userId)?.studentName || 'Student'}</p>
                              <Badge variant="outline" className="mt-1">Group {r.group}</Badge>
                           </div>
                           <div className="text-right">
                              <p className="text-3xl font-black text-primary">{r.score}/{r.totalQuestions}</p>
                              <p className="text-[10px] font-bold uppercase text-muted-foreground">Accuracy: {r.accuracy.toFixed(1)}%</p>
                           </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-6">
                           <div className="h-full bg-primary" style={{ width: `${r.accuracy}%` }} />
                        </div>
                        <div className="space-y-2">
                            <Button variant="outline" className="w-full font-bold uppercase text-xs tracking-widest h-10" onClick={() => setSelectedResult(r)}>
                               <Eye className="w-4 h-4 mr-2" /> View Audit
                            </Button>
                            {!r.resultDeclared && (
                                <Button className="w-full bg-green-600 hover:bg-green-700 font-bold uppercase text-xs tracking-widest h-10" onClick={() => handleDeclareResult(r.id)}>
                                   <Megaphone className="w-4 h-4 mr-2" /> Declare Result
                                </Button>
                            )}
                        </div>
                     </CardContent>
                   </Card>
                 ))}
                 {finalResults.length === 0 && <p className="col-span-full text-center py-20 text-muted-foreground italic">No official final exams submitted yet.</p>}
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Calendar className="w-6 h-6 text-primary" /> Official Schedule Manager</CardTitle>
                  <CardDescription>Define the date and time window when the Final Exam paper becomes accessible to students.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <Label className="font-bold">Exam Date</Label>
                    <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="bg-white border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Start Time (24h)</Label>
                    <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-white border-2" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">End Time (24h)</Label>
                    <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-white border-2" />
                  </div>
                </CardContent>
                <CardFooter className="bg-white/50 border-t p-6">
                  <Button onClick={handleSaveSchedule} disabled={isSavingSchedule} className="w-full sm:w-auto h-12 px-10 font-black uppercase tracking-widest shadow-lg">
                    {isSavingSchedule ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 w-4 h-4" />}
                    Publish Exam Schedule
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
               <ScrollText className="text-indigo-400" />
               Exam Audit: {selectedResult?.group}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold">
               Detailed breakdown of student answers vs. official keys.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0 relative">
            <ScrollArea className="h-full w-full">
              <div className="p-6 space-y-4">
                {(selectedResult as any)?.details?.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black text-muted-foreground w-6">#{i+1}</span>
                      <p className="font-bold text-slate-800">{item.text}</p>
                    </div>
                    <div className="flex gap-8 text-right">
                      <div>
                        <p className="text-[8px] font-black uppercase text-muted-foreground">Key</p>
                        <p className="text-sm font-black text-primary">{item.correct}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-muted-foreground">Student</p>
                        <p className={cn("text-sm font-black", item.student === item.correct ? "text-green-600" : "text-red-500")}>
                          {item.student ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )) || <div className="p-20 text-center italic text-muted-foreground">No detailed data captured for this result.</div>}
              </div>
            </ScrollArea>
          </div>
          <div className="p-6 border-t bg-slate-50 flex justify-end shrink-0">
             <Button onClick={() => setSelectedResult(null)} className="font-black uppercase tracking-widest h-12 px-8">Close Audit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
