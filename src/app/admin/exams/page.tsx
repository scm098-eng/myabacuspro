
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { ExamApplication, ExamResult } from '@/types';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Search, Trophy, FileText, UserCheck, BarChart3, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

export default function AdminExamsPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [allResults, setAllResults] = useState<ExamResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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
        const permissionError = new FirestorePermissionError({
          path: 'examApplications',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    const unsubResults = onSnapshot(query(collection(db, "examResults"), orderBy("submittedAt", "desc")), 
      (snap) => {
        setAllResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ExamResult)));
      },
      async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: 'examResults',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => {
      unsubApps();
      unsubResults();
    };
  }, []);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const db = getFirestore(firebaseApp);
      updateDoc(doc(db, "examApplications", id), { status })
        .catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: `examApplications/${id}`,
            operation: 'update',
            requestResourceData: { status },
          });
          errorEmitter.emit('permission-error', permissionError);
        });
      toast({ title: `Application ${status}` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  const filteredApps = useMemo(() => {
    return applications.filter(a => a.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [applications, searchTerm]);

  const finalResults = useMemo(() => {
    return allResults.filter(r => r.isFinal);
  }, [allResults]);

  if (loading || authLoading) return <div className="p-8">Loading Admin Arena...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <Card className="rounded-[2rem] border-none shadow-xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <CardTitle className="text-3xl font-black uppercase tracking-tight">Exam Administration</CardTitle>
              <CardDescription>Manage group applications and final official results.</CardDescription>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search student name..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="applications">
            <TabsList className="mb-8">
              <TabsTrigger value="applications" className="font-bold">Applications ({applications.filter(a => a.status === 'pending').length})</TabsTrigger>
              <TabsTrigger value="final-results" className="font-bold">Final Results ({finalResults.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="applications">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Applied Date</TableHead>
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
                      <TableCell className="text-xs text-muted-foreground">{format(app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(), 'PPP')}</TableCell>
                      <TableCell>
                        <Badge variant={app.status === 'approved' ? 'default' : (app.status === 'pending' ? 'outline' : 'destructive')}>
                          {app.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {app.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleUpdateStatus(app.id, 'approved')}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleUpdateStatus(app.id, 'rejected')}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredApps.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-10 italic">No applications found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="final-results">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {finalResults.map(r => (
                   <Card key={r.id} className="border-2 border-slate-100 shadow-sm overflow-hidden">
                     <CardHeader className="bg-slate-900 text-white p-4">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-black uppercase text-indigo-400">Official Result</p>
                          <Trophy className="w-4 h-4 text-yellow-400" />
                        </div>
                     </CardHeader>
                     <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-6">
                           <div>
                              <p className="text-lg font-black">{applications.find(a => a.userId === r.userId)?.studentName || 'Student'}</p>
                              <Badge variant="outline" className="mt-1">Group {r.group}</Badge>
                           </div>
                           <div className="text-right">
                              <p className="text-3xl font-black text-primary">{r.score}/{r.totalQuestions}</p>
                              <p className="text-[10px] font-bold uppercase text-muted-foreground">Mastery Score</p>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between text-xs font-bold">
                              <span className="text-muted-foreground uppercase">Accuracy</span>
                              <span>{r.accuracy.toFixed(1)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${r.accuracy}%` }} />
                           </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                           <span>{format(r.submittedAt?.toDate ? r.submittedAt.toDate() : new Date(), 'PPpp')}</span>
                        </div>
                     </CardContent>
                   </Card>
                 ))}
                 {finalResults.length === 0 && <p className="col-span-full text-center py-20 text-muted-foreground italic">The exam hasn't started yet or no final submissions recorded.</p>}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
