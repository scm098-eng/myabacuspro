'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc, setDoc, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult, ExamGroup } from '@/types';
import { CheckCircle2, Search, Trophy, RefreshCcw, Calendar, Loader2, Save, Ban, RotateCcw, XCircle, ScrollText, FileSearch, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function AdminExamsPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isUpdatingOnly, setIsUpdatingOnly] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isClearingApp, setIsClearingApp] = useState<string | null>(null);

  const [examDate, setExamDate] = useState('');
  const [startH, setStartH] = useState('12');
  const [startM, setStartM] = useState('30');
  const [endH, setEndH] = useState('16');
  const [endM, setEndM] = useState('00');
  const [lastApplyDate, setLastApplyDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [resultsDeclared, setResultsDeclared] = useState(false);

  const [auditResult, setAuditResult] = useState<ExamResult | null>(null);

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'admin')) {
      router.push('/');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    
    const unsubSchedule = onSnapshot(doc(db, "stats", "examSchedule"), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setExamDate(data.date || '');
        setIsActive(data.isActive !== false);
        setResultsDeclared(data.resultsDeclared || false);
        const startTime = data.startTime || '12:30';
        const endTime = data.endTime || '16:00';
        const [sh, sm] = startTime.split(':');
        const [eh, em] = endTime.split(':');
        setStartH(sh || '12'); 
        setStartM(sm || '30');
        setEndH(eh || '16'); 
        setEndM(em || '00');
        setLastApplyDate(data.lastApplyDate || '');
      }
    });

    const unsubApps = onSnapshot(query(collection(db, "examApplications"), orderBy("appliedAt", "desc")), 
      (snap) => {
        setApplications(snap.docs.map(doc => {
          const data = doc.data();
          const rawGroup = data.group || data.masteryGroup || data.masteryLevel || '?';
          const group = String(rawGroup).toUpperCase();
          const status = (data.status || 'pending').toLowerCase() as 'pending' | 'approved' | 'rejected';
          return { id: doc.id, ...data, group, status } as ExamApplication;
        }));
        setLoading(false);
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examApplications', operation: 'list' }));
      }
    );

    const unsubResults = onSnapshot(query(collection(db, "examResults"), orderBy("submittedAt", "desc")), 
      (snap) => setAllResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult))),
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'examResults', operation: 'list' }));
      }
    );

    return () => { unsubSchedule(); unsubApps(); unsubResults(); };
  }, []);

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected' | 'pending') => {
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "examApplications", id);
    const payload = { status, updatedAt: serverTimestamp() };

    setDoc(docRef, payload, { merge: true })
      .then(() => toast({ title: `Application ${status.toUpperCase()}` }))
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: docRef.path, 
          operation: 'update',
          requestResourceData: payload
        }));
      });
  };

  const handleAllowReapply = (id: string) => {
    setIsClearingApp(id);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "examApplications", id);
    
    deleteDoc(docRef)
      .then(() => toast({ title: "Dashboard Reset", description: "Student can now re-apply." }))
      .catch(async (err: any) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' })))
      .finally(() => setIsClearingApp(null));
  };

  const handleDeclareResults = async () => {
    setIsSavingSchedule(true);
    try {
      const functions = getFunctions(firebaseApp);
      const declareFn = httpsCallable(functions, 'declareOfficialResults');
      await declareFn();
      toast({ title: "Results Declared", description: "Official scores are now visible to students." });
    } catch (e: any) {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    } finally { setIsSavingSchedule(false); }
  };

  const handleUpdateOnly = () => {
    if (!examDate) { toast({ title: "Configuration Missing", variant: "destructive" }); return; }
    setIsUpdatingOnly(true);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "stats", "examSchedule");
    const payload = {
      date: examDate,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
      lastApplyDate: lastApplyDate || "",
      isActive: true,
      updatedAt: serverTimestamp()
    };
    setDoc(docRef, payload, { merge: true })
      .then(() => toast({ title: "Schedule Updated" }))
      .catch(async (err: any) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: payload })))
      .finally(() => setIsUpdatingOnly(false));
  };

  const handleCancelExam = () => {
    setIsCancelling(true);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "stats", "examSchedule");
    const payload = { isActive: false, updatedAt: serverTimestamp() };
    setDoc(docRef, payload, { merge: true })
      .then(() => toast({ title: "Exam Cancelled" }))
      .catch(async (err: any) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: payload })))
      .finally(() => setIsCancelling(false));
  };

  const handleSaveAndReset = async () => {
    if (!examDate) return;
    setIsSavingSchedule(true);
    const db = getFirestore(firebaseApp);
    try {
      const apps = await getDocs(collection(db, "examApplications"));
      const ress = await getDocs(collection(db, "examResults"));
      const batch = writeBatch(db);
      apps.forEach(d => batch.delete(d.ref));
      ress.forEach(d => batch.delete(d.ref));
      const scheduleRef = doc(db, "stats", "examSchedule");
      const schedulePayload = { date: examDate, startTime: `${startH}:${startM}`, endTime: `${endH}:${endM}`, lastApplyDate, isActive: true, resultsDeclared: false, updatedAt: serverTimestamp() };
      batch.set(scheduleRef, schedulePayload, { merge: true });
      await batch.commit();
      toast({ title: "Cycle Reset & Published" });
    } catch (e: any) { toast({ title: "Reset Failed", variant: "destructive" }); }
    finally { setIsSavingSchedule(false); }
  };

  const filteredApps = useMemo(() => applications.filter(a => a.studentName?.toLowerCase().includes(searchTerm.toLowerCase())), [applications, searchTerm]);

  const groupedResults = useMemo(() => {
    const finals = allResults.filter(r => r.isFinal === true);
    const groups: Record<ExamGroup, ExamResult[]> = { A: [], B: [], C: [], D: [] };
    finals.forEach(r => { if (groups[r.group]) groups[r.group].push(r); });
    Object.keys(groups).forEach(g => {
      groups[g as ExamGroup].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.timeLeft || 0) - (a.timeLeft || 0);
      });
    });
    return groups;
  }, [allResults]);

  const safeFormat = (dateStr: string, pattern: string) => {
    if (!dateStr) return 'None';
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, pattern) : 'None';
  };

  if (loading || authLoading) return <div className="p-8 text-center font-bold uppercase tracking-widest animate-pulse">Loading Exam Center...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-6">
      <Card className="rounded-[2rem] border-none shadow-xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Exam Administration</CardTitle>
              <div className="text-sm font-bold text-slate-500 flex items-center flex-wrap gap-2">
                <span>Cycle: {safeFormat(examDate, 'MMMM do')}</span>
                <Badge className={cn("px-3 border-none", isActive ? "bg-green-500" : "bg-red-500")}>
                  {isActive ? "ACTIVE" : "CANCELLED"}
                </Badge>
                {resultsDeclared && <Badge className="bg-indigo-600 border-none">RESULTS DECLARED</Badge>}
              </div>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search student name..." className="pl-10 h-11 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="applications">
            <TabsList className="mb-8 w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-xl border">
              <TabsTrigger value="applications" className="font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="results" className="font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Final Exam Audit</TabsTrigger>
              <TabsTrigger value="schedule" className="font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Schedule Manager</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <div className="rounded-2xl border overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/30 border-b"><TableRow>
                    <TableHead className="pl-6 h-14 text-[10px] font-black uppercase tracking-widest">Student</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Group Applied</TableHead>
                    <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                    <TableHead className="text-right pr-6 h-14 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {filteredApps.map(app => (
                      <TableRow key={app.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-bold pl-6 py-4">{app.studentName}</TableCell>
                        <TableCell><Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg">GROUP {app.group || '?'}</Badge></TableCell>
                        <TableCell className="text-center"><Badge variant={app.status === 'approved' ? 'default' : (app.status === 'pending' ? 'outline' : 'destructive')} className={cn("font-black text-[10px] uppercase min-w-[80px] justify-center py-1 rounded-full border-2", app.status === 'approved' && "bg-green-600 border-green-700", app.status === 'pending' && "border-orange-200 text-orange-700 bg-orange-50")}>{app.status?.toUpperCase() || 'PENDING'}</Badge></TableCell>
                        <TableCell className="text-right pr-6 py-4 relative isolate"><div className="flex justify-end gap-2 relative z-50">
                          {app.status === 'pending' ? (
                            <><Button size="sm" className="bg-green-600 hover:bg-green-700 font-bold h-10 px-4 rounded-xl shadow-md" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'approved'); }}><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</Button>
                              <Button size="sm" variant="destructive" className="font-bold h-10 px-4 rounded-xl shadow-md" onClick={(e) => { e.stopPropagation(); handleUpdateStatus(app.id, 'rejected'); }}><Ban className="w-4 h-4 mr-2" /> Reject</Button></>
                          ) : (
                            <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="outline" className="font-bold h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl" disabled={isClearingApp === app.id} onClick={(e) => { e.stopPropagation(); }}>{isClearingApp === app.id ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : <RotateCcw className="w-4 h-4 mr-2" />}Allow Re-apply</Button></AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl"><AlertDialogHeader><AlertDialogTitle className="font-black uppercase tracking-tight">Reset Student Dashboard?</AlertDialogTitle><AlertDialogDescription className="text-slate-600 font-bold">This will clear the current application for <strong>{app.studentName}</strong>. They will be able to select a new mastery group and apply again instantly.</AlertDialogDescription></AlertDialogHeader>
                                <AlertDialogFooter className="mt-4"><AlertDialogCancel className="rounded-xl h-11">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleAllowReapply(app.id)} className="rounded-xl h-11 font-black bg-red-600 hover:bg-red-700 border-none text-white">Confirm Reset</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                          )}
                        </div></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="results">
              <div className="space-y-12">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-indigo-50 p-6 rounded-2xl border-2 border-indigo-100 shadow-sm gap-4">
                   <div className="flex items-center gap-3 text-center sm:text-left"><Trophy className="text-indigo-600 w-8 h-8" /><div><h3 className="text-xl font-black uppercase tracking-tight text-indigo-900">Official Exam Leaderboard</h3><p className="text-sm font-bold text-indigo-700/60">Filtered by Group • Top Ranked Students First</p></div></div>
                   <AlertDialog><AlertDialogTrigger asChild><Button disabled={resultsDeclared || isSavingSchedule} className="h-12 px-8 font-black uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg border-none">{isSavingSchedule ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <ScrollText className="mr-2 h-5 w-5" />}{resultsDeclared ? "Results Official" : "Declare Official Results"}</Button></AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl"><AlertDialogHeader><AlertDialogTitle className="text-indigo-700 uppercase font-black">Publish Official Results?</AlertDialogTitle><AlertDialogDescription className="font-bold text-slate-600">This will mark the current cycle as finished and release scores for **Grand Final** attempts to all students.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeclareResults} className="bg-indigo-600 hover:bg-indigo-700 text-white border-none rounded-xl">Publish Now</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                </div>

                {(['A', 'B', 'C', 'D'] as ExamGroup[]).map(group => (
                  <div key={group} className="space-y-4">
                    <div className="flex items-center gap-3 ml-2"><Badge className="bg-slate-900 text-white h-10 w-10 flex items-center justify-center rounded-xl font-black text-lg">{group}</Badge><h4 className="text-lg font-black uppercase tracking-widest text-slate-700">Group {group} Results</h4></div>
                    <div className="rounded-2xl border overflow-hidden bg-white shadow-sm">
                      <Table><TableHeader className="bg-muted/10 border-b"><TableRow>
                            <TableHead className="pl-6 h-12 text-[9px] font-black uppercase tracking-widest">Rank</TableHead>
                            <TableHead className="h-12 text-[9px] font-black uppercase tracking-widest">Student</TableHead>
                            <TableHead className="h-12 text-[9px] font-black uppercase tracking-widest">Accuracy</TableHead>
                            <TableHead className="h-12 text-[9px] font-black uppercase tracking-widest">Time Left</TableHead>
                            <TableHead className="h-12 text-[9px] font-black uppercase tracking-widest text-center">Score</TableHead>
                            <TableHead className="text-right pr-6 h-12 text-[9px] font-black uppercase tracking-widest">Action</TableHead>
                          </TableRow></TableHeader>
                        <TableBody>
                          {groupedResults[group].map((res, idx) => (
                            <TableRow key={res.id} className={cn("hover:bg-muted/5", idx === 0 && "bg-yellow-50/30")}>
                              <TableCell className="pl-6 py-4">{idx === 0 ? (<Badge className="bg-yellow-400 text-yellow-900 border-none font-black text-[10px] px-3 gap-1 shadow-sm"><Crown className="w-3 h-3" /> RANK 1</Badge>) : (<span className="text-sm font-black text-slate-400 ml-4">#{idx + 1}</span>)}</TableCell>
                              <TableCell className="font-bold">{res.studentName || 'Unknown Student'}</TableCell>
                              <TableCell className="font-black text-indigo-600">{res.accuracy.toFixed(1)}%</TableCell>
                              <TableCell className="font-bold text-slate-500 font-mono">{Math.floor((res.timeLeft || 0)/60)}:{(res.timeLeft || 0 % 60).toString().padStart(2,'0')}</TableCell>
                              <TableCell className="text-center font-black text-lg">{res.score} <span className="text-[10px] text-muted-foreground">/ {res.totalQuestions}</span></TableCell>
                              <TableCell className="text-right pr-6 relative isolate"><Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl border-2 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 font-bold gap-2 relative z-50" onClick={(e) => { e.stopPropagation(); setAuditResult(res); }}><FileSearch className="w-4 h-4" /> Audit</Button></TableCell>
                            </TableRow>
                          ))}
                          {groupedResults[group].length === 0 && (<TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic text-xs">No final attempts recorded for Group {group}.</TableCell></TableRow>)}
                        </TableBody></Table>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <Card className="border-2 border-primary/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="bg-muted/30 p-8 border-b">
                  <div className="flex items-center gap-3"><Calendar className="w-6 h-6 text-primary" /><CardTitle className="text-2xl font-black uppercase tracking-tight">Cycle Configuration</CardTitle></div>
                  <div className="font-medium text-slate-600 mt-1">Define the testing window and application deadlines.</div>
                </div>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 p-10">
                  <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Exam Date</Label><Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="h-14 border-2 rounded-2xl font-bold" /></div>
                  <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time (24h)</Label><div className="flex gap-2 h-14">
                      <Select value={startH} onValueChange={setStartH}><SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger><SelectContent className="max-h-60 rounded-2xl"><ScrollArea className="h-60">{Array.from({length: 24}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea></SelectContent></Select>
                      <Select value={startM} onValueChange={setStartM}><SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger><SelectContent className="max-h-60 rounded-2xl"><ScrollArea className="h-60">{Array.from({length: 60}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea></SelectContent></Select>
                    </div></div>
                  <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">End Time (24h)</Label><div className="flex gap-2 h-14">
                      <Select value={endH} onValueChange={setEndH}><SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger><SelectContent className="max-h-60 rounded-2xl"><ScrollArea className="h-60">{Array.from({length: 24}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea></SelectContent></Select>
                      <Select value={endM} onValueChange={setEndM}><SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger><SelectContent className="max-h-60 rounded-2xl"><ScrollArea className="h-60">{Array.from({length: 60}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea></SelectContent></Select>
                    </div></div>
                  <div className="space-y-3"><Label className="text-xs font-black uppercase tracking-widest text-red-600 ml-1">Apply Deadline</Label><Input type="date" value={lastApplyDate} onChange={e => setLastApplyDate(e.target.value)} className="h-14 border-2 border-red-100 bg-red-50/20 rounded-2xl font-bold shadow-sm" /></div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 sm:p-10 border-t border-muted"><div className="flex flex-col sm:flex-row flex-wrap justify-end items-center gap-4 w-full relative z-50">
                    <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" className="h-14 px-8 font-black uppercase tracking-widest rounded-2xl shadow-xl border-none"><XCircle className="mr-2 w-5 h-5" /> Cancel Current Exam</Button></AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl"><AlertDialogHeader><AlertDialogTitle className="text-red-700 uppercase font-black">Deactivate Cycle?</AlertDialogTitle><AlertDialogDescription className="font-bold">This will instantly lock the Exam Arena for all students. The marquee scroll will announce the cancellation for 24 hours.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="rounded-xl h-12">Abort</AlertDialogCancel><AlertDialogAction onClick={handleCancelExam} className="rounded-xl h-12 font-black bg-red-600 hover:bg-red-700 border-none text-white">Confirm Cancellation</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                    <Button onClick={(e) => { e.preventDefault(); handleUpdateOnly(); }} disabled={isUpdatingOnly || isSavingSchedule} variant="outline" className="h-14 px-8 w-full sm:w-auto font-black uppercase tracking-widest rounded-2xl border-2 bg-white shadow-md">{isUpdatingOnly ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}Update Schedule Only</Button>
                    <AlertDialog><AlertDialogTrigger asChild><Button disabled={isSavingSchedule || isUpdatingOnly} className="h-14 px-10 w-full sm:w-auto font-black uppercase tracking-widest rounded-2xl shadow-xl bg-red-600 hover:bg-red-700 border-none text-white">{isSavingSchedule ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <RefreshCcw className="mr-2 h-5 w-5" />}Reset & Publish Cycle</Button></AlertDialogTrigger>
                      <AlertDialogContent className="rounded-3xl"><AlertDialogHeader><AlertDialogTitle className="text-red-700 uppercase font-black">Permanent Data Reset</AlertDialogTitle><AlertDialogDescription className="font-bold text-slate-600">Warning: This will PERMANENTLY DELETE all current applications and results. This is required to start a completely fresh exam cycle.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Abort</AlertDialogCancel><AlertDialogAction onClick={handleSaveAndReset} className="bg-red-600 hover:bg-red-700 rounded-xl border-none text-white">Confirm Full Reset</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                  </div></CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!auditResult} onOpenChange={(val) => !val && setAuditResult(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl flex flex-col h-[90vh]">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0"><div className="flex justify-between items-start"><div><Badge className="bg-indigo-600 text-white border-none uppercase font-black text-[10px] mb-2 px-3 py-1">Official Final Audit</Badge><DialogTitle className="text-3xl font-black uppercase tracking-tight">{auditResult?.studentName}</DialogTitle><DialogDescription className="text-slate-400 font-bold mt-1">Group {auditResult?.group} • Score: {auditResult?.score}/{auditResult?.totalQuestions}</DialogDescription></div>
                <div className="text-right"><p className="text-4xl font-black text-indigo-400 leading-none">{auditResult?.accuracy.toFixed(1)}%</p><p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2">Overall Accuracy</p></div></div></DialogHeader>
          <ScrollArea className="flex-1 p-8 bg-slate-50"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {auditResult?.details?.map((detail: any, i: number) => {
                  const isCorrect = detail.student === detail.correct;
                  const isSkipped = detail.student === null;
                  return (<div key={i} className={cn("p-5 rounded-2xl border-2 flex flex-col gap-3 shadow-sm", isSkipped ? "bg-amber-50 border-amber-100" : (isCorrect ? "bg-white border-green-100" : "bg-red-50 border-red-100"))}>
                       <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Q{i + 1}</span>{isSkipped ? <Clock className="w-4 h-4 text-amber-500" /> : (isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />)}</div>
                       <div className="flex justify-between items-end"><div><p className="text-[9px] font-bold uppercase text-slate-400">Target</p><p className="text-2xl font-black text-slate-900">{detail.correct}</p></div>
                          <div className="text-right"><p className="text-[9px] font-bold uppercase text-slate-400">Student</p><p className={cn("text-2xl font-black", isSkipped ? "text-amber-600 italic" : (isCorrect ? "text-green-600" : "text-red-600"))}>{isSkipped ? 'Skipped' : detail.student}</p></div></div></div>);
                })}
             </div></ScrollArea>
          <CardFooter className="bg-white p-6 border-t flex justify-end shrink-0"><Button onClick={() => setAuditResult(null)} className="rounded-xl font-bold h-11 px-8">Close Audit</Button></CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
