'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, deleteDoc, orderBy, limit, addDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel } from '@/types';
import { Swords, Loader2, PlayCircle, Trophy, Users, Plus, ShieldAlert, Share2, Copy, Zap, Clock, MonitorOff } from 'lucide-react';
import { generateDuelQuestions } from '@/lib/questions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

function DuelsLobbyContent() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [activeDuels, setActiveDuels] = useState<Duel[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState<'standard' | 'flash'>('standard');

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    // Modified query to ensure duels stay visible until someone joins, 
    // even if the challenger has already finished.
    const q = query(
      collection(db, "duels"), 
      where("status", "==", "waiting"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, 
      (snap) => {
        setActiveDuels(snap.docs.map(doc => {
            const data = doc.data() as Duel;
            const { id: _, ...rest } = data;
            return { id: doc.id, ...rest } as Duel;
        }));
        setLoading(false);
      },
      async (err) => {
        setLoading(false);
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'duels', operation: 'list' }));
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleCreateDuel = async () => {
    if (!user || !profile) return;
    setIsCreating(true);

    try {
      const db = getFirestore(firebaseApp);
      const seed = `${Date.now()}`;
      const questions = generateDuelQuestions(selectedMode, seed);
      
      const newDuel: Partial<Duel> = {
        challengerId: user.uid,
        challengerName: `${profile.firstName} ${profile.surname}`,
        challengerPhoto: profile.profilePhoto || '',
        status: 'waiting',
        mode: selectedMode,
        questions,
        challengerScore: 0,
        opponentScore: 0,
        challengerFinished: false,
        opponentFinished: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "duels"), newDuel);
      router.push(`/game/duels/${docRef.id}`);
    } catch (e: any) {
      toast({ title: "Failed to create duel", description: e.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinDuel = async (duel: Duel) => {
    if (!user || !profile) return;
    if (duel.challengerId === user.uid) {
        router.push(`/game/duels/${duel.id}`);
        return;
    }

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duel.id);

    try {
      await updateDoc(docRef, {
        opponentId: user.uid,
        opponentName: `${profile.firstName} ${profile.surname}`,
        opponentPhoto: profile.profilePhoto || '',
        status: 'active',
        updatedAt: serverTimestamp()
      });
      router.push(`/game/duels/${duel.id}`);
    } catch (e: any) {
      toast({ title: "Failed to join duel", description: e.message, variant: "destructive" });
    }
  };

  if (loading || authLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">
          Duel <span className="text-primary italic">Arena</span>
        </h1>
        <p className="text-lg text-muted-foreground font-medium">Join an existing match or create a private lobby to challenge anyone online.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden">
             <div className="p-10 space-y-6 text-center">
                <div className="mx-auto bg-primary/20 p-5 rounded-full w-fit mb-4">
                  <Zap className="w-12 h-12 text-primary fill-primary animate-pulse" />
                </div>
                <h2 className="text-3xl font-black uppercase italic tracking-tighter">New Challenger?</h2>
                
                <div className="space-y-4 py-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Battle Mode</Label>
                  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <Button 
                      variant={selectedMode === 'standard' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="flex-1 rounded-lg h-10 font-bold" 
                      onClick={() => setSelectedMode('standard')}
                    >
                      Standard
                    </Button>
                    <Button 
                      variant={selectedMode === 'flash' ? 'default' : 'ghost'} 
                      size="sm" 
                      className="flex-1 rounded-lg h-10 font-bold" 
                      onClick={() => setSelectedMode('flash')}
                    >
                      Flash Anzan
                    </Button>
                  </div>
                </div>

                <Button onClick={handleCreateDuel} disabled={isCreating} className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20">
                  {isCreating ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2 w-6 h-6" /> Create Duel</>}
                </Button>
             </div>
             <CardFooter className="bg-white/5 p-6 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 w-full text-center">Global Matchmaking Active</p>
             </CardFooter>
           </Card>

           <Card className="rounded-[2rem] border-none shadow-lg bg-indigo-50 border-2 border-indigo-100">
             <CardHeader>
               <CardTitle className="flex items-center gap-2 text-indigo-900 font-headline uppercase">
                 <Trophy className="w-5 h-5 text-yellow-500" />
                 Arena Rules
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div className="flex items-start gap-3">
                 <div className="h-5 p-px w-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">1</div>
                 <p className="text-xs font-bold text-indigo-700/80">Lobby host picks the mode for all players.</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="h-5 p-px w-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">2</div>
                 <p className="text-xs font-bold text-indigo-700/80">Highest score wins. Draw if scores equal.</p>
               </div>
               <div className="flex items-start gap-3">
                 <div className="h-5 p-px w-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">3</div>
                 <p className="text-xs font-bold text-indigo-700/80">Winner takes +50 Mastery Points!</p>
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
             <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
               <Users className="w-6 h-6 text-primary" />
               Waiting Lobbies
             </h2>
             <Badge className="bg-green-100 text-green-700 border-green-200 font-black px-4">{activeDuels.length} Active</Badge>
           </div>

           <div className="grid grid-cols-1 gap-4">
              {activeDuels.length > 0 ? activeDuels.map(duel => (
                <Card key={duel.id} className="rounded-3xl border-none shadow-lg hover:shadow-xl transition-all group">
                  <CardContent className="p-6 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-5 min-w-0 flex-1">
                      <Avatar className="h-14 w-14 border-4 border-muted shrink-0">
                        <AvatarImage src={duel.challengerPhoto} />
                        <AvatarFallback className="font-black text-xl">{duel.challengerName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-black uppercase tracking-widest text-primary leading-none">Challenger</p>
                          <Badge className={cn("text-[9px] font-black uppercase", duel.mode === 'flash' ? "bg-orange-500" : "bg-blue-600")}>{duel.mode || 'standard'}</Badge>
                        </div>
                        <h3 className="text-xl font-bold truncate leading-none">{duel.challengerName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <Badge variant="outline" className="text-[9px] font-black uppercase border-muted-foreground/20">{duel.questions.length} Rounds</Badge>
                           <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                             <Clock className="w-3 h-3" /> 
                             {new Date(duel.createdAt?.toDate ? duel.createdAt.toDate() : Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => handleJoinDuel(duel)} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest bg-orange-500 hover:bg-orange-600 transition-all group-hover:scale-105 shrink-0 shadow-lg">
                      {duel.challengerId === user?.uid ? "Enter My Lobby" : "Join Match"}
                    </Button>
                  </CardContent>
                </Card>
              )) : (
                <Card className="rounded-3xl border-2 border-dashed p-16 text-center bg-muted/20">
                  <div className="mx-auto w-16 h-16 bg-muted p-4 rounded-full mb-4 opacity-50">
                    <MonitorOff className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-tight">No Lobbies Found</h3>
                  <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto mt-2">Be the first to start a challenge today!</p>
                  <Button variant="outline" onClick={handleCreateDuel} className="mt-8 h-12 px-10 rounded-xl border-2 font-bold uppercase tracking-widest">
                    Create New Lobby
                  </Button>
                </Card>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default function DuelsLobbyPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  return (
    <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>}>
      <DuelsLobbyContent />
    </Suspense>
  );
}
