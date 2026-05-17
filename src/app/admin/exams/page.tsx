
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult } from '@/types';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Search, Trophy, Eye, FileText, ScrollText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  useEffect(() => {
    if (!authLoading && (!profile || profile.role !== 'admin')) {
      router.push('/');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
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
      .catch(() => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `examApplications/${id}`, operation: 'update' })));
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
              <CardDescription>Review applications and audit official final results.</CardDescription>
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
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleUpdateStatus(app.id, 'approved')}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleUpdateStatus(app.id, 'rejected')}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
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
                          <p className="text-[10px] font-black uppercase text-indigo-400">Official Final</p>
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
                        <Button variant="outline" className="w-full font-bold uppercase text-xs tracking-widest h-10" onClick={() => setSelectedResult(r)}>
                           <Eye className="w-4 h-4 mr-2" /> View Submission
                        </Button>
                     </CardContent>
                   </Card>
                 ))}
                 {finalResults.length === 0 && <p className="col-span-full text-center py-20 text-muted-foreground italic">No official final exams submitted yet.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 rounded-[2rem] overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
               <ScrollText className="text-indigo-400" />
               Exam Audit: {selectedResult?.group}
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-bold">
               Detailed breakdown of student answers vs. official keys.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-hidden">
            <ScrollArea className="h-full p-6">
              <div className="space-y-4">
                {selectedResult?.details?.map((item: any, i: number) => (
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
          <div className="p-6 border-t bg-slate-50 flex justify-end">
             <Button onClick={() => setSelectedResult(null)} className="font-black uppercase tracking-widest h-12 px-8">Close Audit</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
