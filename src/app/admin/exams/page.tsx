'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, writeBatch, getDocs } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult } from '@/types';
import { CheckCircle2, XCircle, Search, Trophy, Eye, ScrollText, RefreshCcw, Megaphone, Calendar, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [examDate, setExamDate] = useState('');
  const [startH, setStartH] = useState('12');
  const [startM, setStartM] = useState('30');
  const [endH, setEndH] = useState('16');
  const [endM, setEndM] = useState('00');
  const [lastApplyDate, setLastApplyDate] = useState('');

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'admin')) {
      router.push('/');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    
    getDoc(doc(db, "stats", "examSchedule")).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        setExamDate(data.date || '');
        const [sh, sm] = (data.startTime || '12:30').split(':');
        const [eh, em] = (data.endTime || '16:00').split(':');
        setStartH(sh); setStartM(sm);
        setEndH(eh); setEndM(em);
        setLastApplyDate(data.lastApplyDate || '');
      }
    });

    const unsubApps = onSnapshot(query(collection(db, "examApplications"), orderBy("appliedAt", "desc")), 
      (snap) => {
        setApplications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamApplication)));
        setLoading(false);
      },
      async (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examApplications', operation: 'list' }))
    );

    const unsubResults = onSnapshot(query(collection(db, "examResults"), orderBy("submittedAt", "desc")), 
      (snap) => setAllResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult))),
      async (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examResults', operation: 'list' }))
    );

    return () => { unsubApps(); unsubResults(); };
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const db = getFirestore(firebaseApp);
    updateDoc(doc(db, "examApplications", id), { status })
      .then(() => toast({ title: `Application ${status}` }))
      .catch(async (e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `examApplications/${id}`, operation: 'update' })));
  };

  const handleDeclareResult = async (id: string) => {
    const db = getFirestore(firebaseApp);
    updateDoc(doc(db, "examResults", id), { resultDeclared: true })
      .then(() => {
        updateDoc(doc(db, "stats", "examSchedule"), { lastResultDeclaredAt: serverTimestamp() });
        toast({ title: "Result Declared" });
      });
  };

  const handleSaveAndReset = async () => {
    if (!examDate || !lastApplyDate) {
      toast({ title: "Configuration Missing", variant: "destructive" });
      return;
    }
    if (!confirm("This will DELETE all current applications and results. Continue?")) return;
    
    setIsSavingSchedule(true);
    const db = getFirestore(firebaseApp);
    
    try {
      const apps = await getDocs(collection(db, "examApplications"));
      const ress = await getDocs(collection(db, "examResults"));
      
      const batch = writeBatch(db);
      apps.forEach(d => batch.delete(d.ref));
      ress.forEach(d => batch.delete(d.ref));
      
      batch.set(doc(db, "stats", "examSchedule"), {
        date: examDate,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        lastApplyDate,
        isActive: true,
        resultsDeclared: false,
        updatedAt: serverTimestamp()
      }, { merge: true });

      await batch.commit();
      toast({ title: "Cycle Reset & Published" });
    } catch (e: any) {
      toast({ title: "Reset Failed", description: e.message, variant: "destructive" });
    } finally { setIsSavingSchedule(false); }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(a => a.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [applications, searchTerm]);

  const groupedResults = useMemo(() => {
    const official = allResults.filter(r => r.isFinal);
    const grouped: Record<string, any[]> = {};
    official.forEach(r => {
      const g = r.group;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push({ ...r, studentName: applications.find(a => a.userId === r.userId)?.studentName || 'Student' });
    });
    return grouped;
  }, [allResults, applications]);

  if (loading || authLoading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <Card className="rounded-[2rem] border-none shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center gap-6">
            <div>
              <CardTitle className="text-3xl font-black uppercase tracking-tight">Exam Administration</CardTitle>
            </div>
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search student..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="applications">
            <TabsList className="mb-8">
              <TabsTrigger value="applications" className="font-bold">Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="final-results" className="font-bold">Results</TabsTrigger>
              <TabsTrigger value="schedule" className="font-bold">Schedule Manager</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Group Applied</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.map(app => (
                    <TableRow key={app.id}>
                      <TableCell className="font-bold">{app.studentName}</TableCell>
                      <TableCell><Badge variant="secondary" className="px-4">Group {app.group}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'approved' ? 'default' : (app.status === 'pending' ? 'outline' : 'destructive')}>
                          {app.status?.toUpperCase() || 'PENDING'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {app.status === 'pending' ? (
                            <Button size="sm" className="bg-green-600" onClick={() => handleUpdateStatus(app.id, 'approved')}>Approve</Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(app.id, 'pending')}>Re-apply</Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="final-results" className="space-y-12">
              {Object.keys(groupedResults).map(group => (
                <div key={group} className="space-y-6">
                  <h2 className="text-xl font-black uppercase border-b pb-2">Group {group} Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedResults[group].map(r => (
                      <Card key={r.id} className="border-2">
                        <CardHeader className="bg-slate-900 text-white p-4">
                            <div className="flex justify-between items-center text-xs font-black uppercase">
                              <span>Official Final</span>
                              {r.resultDeclared && <Badge className="bg-green-500">DECLARED</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <p className="text-lg font-black">{r.studentName}</p>
                            <p className="text-3xl font-black text-primary mt-2">{r.score}/{r.totalQuestions}</p>
                            <Button variant="outline" className="w-full mt-4" onClick={() => setSelectedResult(r)}><Eye className="w-4 h-4 mr-2" /> View Audit</Button>
                            {!r.resultDeclared && (
                                <Button className="w-full mt-2 bg-green-600" onClick={() => handleDeclareResult(r.id)}>Declare Result</Button>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="schedule">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <CardTitle>Schedule Manager</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="space-y-2">
                    <Label>Exam Date</Label>
                    <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Time (24h)</Label>
                    <div className="flex gap-1">
                      <Select value={startH} onValueChange={setStartH}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60"><ScrollArea className="h-60">{Array.from({length: 24}).map((_, i) => <SelectItem key={i} value={i.toString().padStart(2,'0')}>{i.toString().padStart(2,'0')}</SelectItem>)}</ScrollArea></SelectContent>
                      </Select>
                      <Select value={startM} onValueChange={setStartM}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60"><ScrollArea className="h-60">{Array.from({length: 60}).map((_, i) => <SelectItem key={i} value={i.toString().padStart(2,'0')}>{i.toString().padStart(2,'0')}</SelectItem>)}</ScrollArea></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time (24h)</Label>
                    <div className="flex gap-1">
                      <Select value={endH} onValueChange={setEndH}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60"><ScrollArea className="h-60">{Array.from({length: 24}).map((_, i) => <SelectItem key={i} value={i.toString().padStart(2,'0')}>{i.toString().padStart(2,'0')}</SelectItem>)}</ScrollArea></SelectContent>
                      </Select>
                      <Select value={endM} onValueChange={setEndM}>
                        <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60"><ScrollArea className="h-60">{Array.from({length: 60}).map((_, i) => <SelectItem key={i} value={i.toString().padStart(2,'0')}>{i.toString().padStart(2,'0')}</SelectItem>)}</ScrollArea></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-red-600">Apply Deadline</Label>
                    <Input type="date" value={lastApplyDate} onChange={e => setLastApplyDate(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-6 flex justify-end">
                  <Button onClick={handleSaveAndReset} disabled={isSavingSchedule} className="bg-red-600">
                    {isSavingSchedule ? <Loader2 className="animate-spin mr-2" /> : <RefreshCcw className="mr-2 w-4 h-4" />}
                    Reset & Publish New Cycle
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
            <DialogTitle>Exam Audit: Group {selectedResult?.group}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-4">
              {selectedResult?.details?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between p-4 bg-muted rounded-xl border">
                  <span className="font-bold">Question {i+1}</span>
                  <div className="flex gap-8">
                    <div><p className="text-[10px] uppercase">Key</p><p className="font-black">{item.correct}</p></div>
                    <div><p className="text-[10px] uppercase">User</p><p className={cn("font-black", item.student === item.correct ? "text-green-600" : "text-red-500")}>{item.student ?? 'N/A'}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
