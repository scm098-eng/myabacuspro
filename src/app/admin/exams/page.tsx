
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, deleteDoc, getDoc, setDoc, writeBatch, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult } from '@/types';
import { CheckCircle2, Search, Trophy, Eye, RefreshCcw, Calendar, Loader2, Save, Ban, RotateCcw, XCircle, ShieldAlert, AlertTriangle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

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
          const rawGroup = data.group || data.masteryGroup || data.mastery_group || data.masteryLevel || data.mastery_level || '?';
          const group = String(rawGroup).toUpperCase();
          return { id: doc.id, ...data, group } as ExamApplication;
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
      .then(() => {
        toast({ 
          title: "Dashboard Reset", 
          description: "Student record cleared. They can now re-apply." 
        });
      })
      .catch(async (err: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: docRef.path, 
          operation: 'delete' 
        }));
      })
      .finally(() => setIsClearingApp(null));
  };

  const handleUpdateOnly = () => {
    if (!examDate) {
      toast({ title: "Configuration Missing", description: "Exam date is required.", variant: "destructive" });
      return;
    }
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
      .catch(async (err: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: docRef.path, 
          operation: 'update',
          requestResourceData: payload
        }));
      })
      .finally(() => setIsUpdatingOnly(false));
  };

  const handleCancelExam = () => {
    setIsCancelling(true);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "stats", "examSchedule");
    const payload = {
      isActive: false,
      updatedAt: serverTimestamp()
    };

    setDoc(docRef, payload, { merge: true })
      .then(() => toast({ title: "Exam Cancelled", description: "Arena access locked for all students." }))
      .catch(async (err: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ 
          path: docRef.path, 
          operation: 'update',
          requestResourceData: payload
        }));
      })
      .finally(() => setIsCancelling(false));
  };

  const handleSaveAndReset = async () => {
    if (!examDate || !lastApplyDate) {
      toast({ title: "Configuration Missing", variant: "destructive" });
      return;
    }
    
    setIsSavingSchedule(true);
    const db = getFirestore(firebaseApp);
    try {
      const apps = await getDocs(collection(db, "examApplications"));
      const ress = await getDocs(collection(db, "examResults"));
      const batch = writeBatch(db);
      apps.forEach(d => batch.delete(d.ref));
      ress.forEach(d => batch.delete(d.ref));
      
      const scheduleRef = doc(db, "stats", "examSchedule");
      const schedulePayload = {
        date: examDate,
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endM}`,
        lastApplyDate,
        isActive: true,
        resultsDeclared: false,
        updatedAt: serverTimestamp()
      };
      
      batch.set(scheduleRef, schedulePayload, { merge: true });
      await batch.commit();
      toast({ title: "Cycle Reset & Published" });
    } catch (e: any) {
      toast({ title: "Reset Failed", description: e.message, variant: "destructive" });
    } finally { setIsSavingSchedule(false); }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(a => a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()));
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

  if (loading || authLoading) return <div className="p-8 text-center font-bold uppercase tracking-widest animate-pulse">Loading Exam Center...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-6">
      
      {/* 🚀 Emergency Control Center */}
      <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldAlert className="w-48 h-48" /></div>
        <CardHeader className="p-8 sm:p-10 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Badge className={cn("px-4 py-1 font-black", isActive ? "bg-green-500" : "bg-red-500")}>
                  {isActive ? "ARENA ACTIVE" : "ARENA LOCKED"}
                </Badge>
              </div>
              <CardTitle className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic">Cycle Management</CardTitle>
              <CardDescription className="text-slate-400 font-bold text-lg">
                Current: {examDate ? format(new Date(examDate), 'MMMM do') : 'None'} • Deadline: {lastApplyDate ? format(new Date(lastApplyDate), 'MMM d') : 'None'}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto isolate">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="h-16 px-10 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-red-900/40 border-2 border-red-500/50 hover:scale-[1.02] transition-transform relative z-10">
                    <XCircle className="mr-2 w-6 h-6" /> Cancel Current Exam
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl border-4 border-red-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-black uppercase text-red-700">Deactivate Cycle?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base font-bold">
                      This will instantly lock the Exam Arena for all students. Applications and results will NOT be deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="rounded-xl h-12 font-bold">Abort</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancelExam} className="rounded-xl h-12 font-black bg-red-600 hover:bg-red-700">
                      Confirm Cancellation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-[2rem] border-none shadow-xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Records & Schedule</CardTitle>
              <CardDescription className="font-bold text-slate-500">Manage student eligibility and testing windows.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search student..." className="pl-10 h-11 rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="applications">
            <TabsList className="mb-8 w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-xl border">
              <TabsTrigger value="applications" className="font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Applications ({applications.length})</TabsTrigger>
              <TabsTrigger value="results" className="font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Results</TabsTrigger>
              <TabsTrigger value="schedule" className="font-bold py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Schedule Manager</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <div className="rounded-2xl border overflow-hidden bg-white shadow-sm">
                <Table>
                  <TableHeader className="bg-muted/30 border-b">
                    <TableRow>
                      <TableHead className="pl-6 h-14 text-[10px] font-black uppercase tracking-widest">Student</TableHead>
                      <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest">Group Applied</TableHead>
                      <TableHead className="h-14 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                      <TableHead className="text-right pr-6 h-14 text-[10px] font-black uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApps.map(app => (
                      <TableRow key={app.id} className="hover:bg-muted/10 transition-colors">
                        <TableCell className="font-bold pl-6 py-4">{app.studentName}</TableCell>
                        <TableCell>
                          <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-1 text-[10px] font-black tracking-widest uppercase rounded-lg">
                            GROUP {app.group || '?'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={app.status === 'approved' ? 'default' : (app.status === 'pending' ? 'outline' : 'destructive')} 
                            className={cn(
                              "font-black text-[10px] uppercase min-w-[80px] justify-center py-1 rounded-full border-2", 
                              app.status === 'approved' && "bg-green-600 border-green-700",
                              app.status === 'pending' && "border-orange-200 text-orange-700 bg-orange-50"
                            )}
                          >
                            {app.status?.toUpperCase() || 'PENDING'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4 isolate relative">
                          <div className="flex justify-end gap-2 isolate relative z-50">
                            {app.status === 'pending' ? (
                              <>
                                <Button 
                                  type="button"
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700 font-bold h-10 px-4 rounded-xl shadow-md cursor-pointer relative z-10" 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateStatus(app.id, 'approved'); }}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                </Button>
                                <Button 
                                  type="button"
                                  size="sm" 
                                  variant="destructive" 
                                  className="font-bold h-10 px-4 rounded-xl shadow-md cursor-pointer relative z-10" 
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateStatus(app.id, 'rejected'); }}
                                >
                                  <Ban className="w-4 h-4 mr-2" /> Reject
                                </Button>
                              </>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    type="button"
                                    size="sm" 
                                    variant="outline" 
                                    className="font-bold h-10 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl cursor-pointer relative z-10" 
                                    disabled={isClearingApp === app.id}
                                  >
                                    <RotateCcw className="w-4 h-4 mr-2" /> Allow Re-apply
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-3xl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="font-black uppercase tracking-tight">Reset Student Dashboard?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-600 font-bold">
                                      This will clear the current application for <strong>{app.studentName}</strong>. They will be able to select a new mastery group and apply again instantly.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-4">
                                    <AlertDialogCancel className="rounded-xl h-11">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleAllowReapply(app.id)} className="rounded-xl h-11 font-black bg-red-600 hover:bg-red-700">
                                      {isClearingApp === app.id ? <Loader2 className="animate-spin w-5 h-5" /> : "Confirm Reset"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-12">
              {Object.keys(groupedResults).length > 0 ? Object.keys(groupedResults).map(group => (
                <div key={group} className="space-y-6">
                  <h2 className="text-xl font-black uppercase border-b-4 border-primary/20 pb-2 inline-block">Group {group} Results</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedResults[group].map(r => (
                      <Card key={r.id} className="border-2 border-slate-100 rounded-3xl overflow-hidden shadow-md group hover:border-primary/30 transition-all">
                        <CardHeader className="bg-slate-900 text-white p-5">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span>Grand Final Attempt</span>
                              {r.resultDeclared && <Badge className="bg-green-500 border-none px-3">DECLARED</Badge>}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 text-center space-y-4">
                            <p className="text-xl font-black text-slate-900">{r.studentName}</p>
                            <div className="bg-muted/50 p-4 rounded-2xl border border-muted">
                              <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Score</p>
                              <p className="text-4xl font-black text-primary leading-none">{r.score}/{r.totalQuestions}</p>
                            </div>
                            <Button variant="outline" className="w-full font-bold h-11 rounded-xl" onClick={() => setSelectedResult(r)}><Eye className="w-4 h-4 mr-2" /> Audit</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )) : (
                <div className="text-center py-24 bg-muted/30 rounded-[3rem] border-2 border-dashed">
                   <Trophy className="w-16 h-16 mx-auto text-muted-foreground opacity-10 mb-4" />
                   <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No official results found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule">
              <Card className="border-2 border-primary/20 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="bg-muted/30 p-8 border-b">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <CardTitle className="text-2xl font-black uppercase tracking-tight">Cycle Configuration</CardTitle>
                  </div>
                  <CardDescription className="font-medium">Define the testing window and application deadlines.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 p-10">
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Exam Date</Label>
                    <Input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="h-14 border-2 rounded-2xl font-bold" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time (24h)</Label>
                    <div className="flex gap-2 h-14">
                      <Select value={startH} onValueChange={setStartH}>
                        <SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60 rounded-2xl">
                          <ScrollArea className="h-60">{Array.from({length: 24}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea>
                        </SelectContent>
                      </Select>
                      <Select value={startM} onValueChange={setStartM}>
                        <SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60 rounded-2xl">
                          <ScrollArea className="h-60">{Array.from({length: 60}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">End Time (24h)</Label>
                    <div className="flex gap-2 h-14">
                      <Select value={endH} onValueChange={setEndH}>
                        <SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60 rounded-2xl">
                          <ScrollArea className="h-60">{Array.from({length: 24}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea>
                        </SelectContent>
                      </Select>
                      <Select value={endM} onValueChange={setEndM}>
                        <SelectTrigger className="w-full h-full border-2 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="max-h-60 rounded-2xl">
                          <ScrollArea className="h-60">{Array.from({length: 60}).map((_, i) => { const v = i.toString().padStart(2,'0'); return <SelectItem key={v} value={v}>{v}</SelectItem>; })}</ScrollArea>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-black uppercase tracking-widest text-red-600 ml-1">Apply Deadline</Label>
                    <Input type="date" value={lastApplyDate} onChange={e => setLastApplyDate(e.target.value)} className="h-14 border-2 border-red-100 bg-red-50/20 rounded-2xl font-bold shadow-sm" />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 p-6 sm:p-10 flex flex-col sm:flex-row flex-wrap justify-end gap-4 border-t border-muted">
                  <Button 
                    type="button"
                    onClick={handleUpdateOnly} 
                    disabled={isUpdatingOnly || isSavingSchedule} 
                    variant="outline" 
                    className="h-14 px-8 w-full sm:w-auto font-black uppercase tracking-widest rounded-2xl border-2 hover:bg-muted text-xs bg-white shadow-md"
                  >
                    {isUpdatingOnly ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 w-5 h-5" />}
                    Update Schedule Only
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        type="button"
                        disabled={isSavingSchedule || isUpdatingOnly} 
                        className="h-14 px-10 w-full sm:w-auto font-black uppercase tracking-widest rounded-2xl shadow-xl bg-red-600 hover:bg-red-700 text-xs"
                      >
                        {isSavingSchedule ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <RefreshCcw className="mr-2 w-5 h-5" />}
                        Reset & Publish Cycle
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-700">Permanent Data Reset</AlertDialogTitle>
                        <AlertDialogDescription className="font-bold">
                          Warning: This will PERMANENTLY DELETE all current applications and results. This is required to start a completely fresh exam cycle.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveAndReset} className="bg-red-600 hover:bg-red-700 rounded-xl">
                          Confirm Full Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0">
            <div className="flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black uppercase tracking-tight">Audit Log: {selectedResult?.studentName}</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold">Group {selectedResult?.group} • Final Submission Audit</DialogDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-primary">{selectedResult?.score}/{selectedResult?.totalQuestions}</p>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 p-8">
            <div className="space-y-4 pb-20">
              {selectedResult?.details?.map((item: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-5 bg-muted/40 rounded-2xl border border-muted group hover:bg-muted/60 transition-colors">
                  <span className="font-bold text-slate-700">Question {i+1}</span>
                  <div className="flex gap-10 items-center">
                    <div className="text-center"><p className="text-[9px] uppercase font-black text-muted-foreground mb-1">Key</p><p className="font-black text-slate-900">{item.correct}</p></div>
                    <div className="text-center"><p className="text-[9px] uppercase font-black text-muted-foreground mb-1">User</p><p className={cn("font-black px-3 py-1 rounded-lg", item.student === item.correct ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100")}>{item.student ?? 'N/A'}</p></div>
                  </div>
                </div>
              ))}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
