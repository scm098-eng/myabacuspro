
'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, Question } from '@/types';
import { Swords, Loader2, Timer, CheckCircle2, XCircle, Share2, Copy, ArrowRight, Trophy, Crown, UserX, AlertCircle, PlayCircle, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default function DuelArenaPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/admin_bg.jpg?alt=media');
  const { duelId } = useParams() as { duelId: string };
  const { user, profile, addPoints } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { playSound } = useSound();

  const [duel, setDuel] = useState<Duel | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!user || !duelId) return;
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    return onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Duel;
          setDuel({ id: snap.id, ...data });
          
          if (data.status === 'active' || (data.challengerId === user.uid && data.challengerFinished) || (data.opponentId === user.uid && data.opponentFinished)) {
            // Already initialized or finished
          } else {
            setAnswers(new Array(data.questions.length).fill(null));
          }
          setLoading(false);
        } else {
          toast({ title: "Duel not found", variant: "destructive" });
          router.push('/game/duels');
        }
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `duels/${duelId}`, operation: 'get' }));
      }
    );
  }, [user, duelId, router, toast]);

  const isChallenger = duel?.challengerId === user?.uid;
  const isFinished = isChallenger ? duel?.challengerFinished : duel?.opponentFinished;

  const handleAnswer = (val: number) => {
    if (isFinished || !duel) return;

    const isCorrect = val === duel.questions[currentIdx].answer;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = val;
    setAnswers(newAnswers);

    if (isCorrect) {
      setLocalScore(s => s + 1);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentIdx < duel.questions.length - 1) {
        setCurrentIdx(p => p + 1);
      } else {
        submitDuel(isCorrect ? localScore + 1 : localScore);
      }
    }, 500);
  };

  const submitDuel = async (finalScore: number) => {
    if (!duel || !user) return;
    setIsSubmitting(true);

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    const payload: any = isChallenger ? {
      challengerScore: finalScore,
      challengerFinished: true,
      status: duel.opponentFinished ? 'completed' : duel.status
    } : {
      opponentScore: finalScore,
      opponentFinished: true,
      status: duel.challengerFinished ? 'completed' : duel.status
    };

    if (payload.status === 'completed') {
      const p1Score = isChallenger ? finalScore : duel.challengerScore;
      const p2Score = isChallenger ? duel.opponentScore : finalScore;
      
      if (p1Score > p2Score) payload.winnerId = duel.challengerId;
      else if (p2Score > p1Score) payload.winnerId = duel.opponentId;
      else payload.winnerId = 'draw';

      // Reward Winner
      if (payload.winnerId === user.uid) {
        await addPoints(user.uid, 50);
      } else if (payload.winnerId === 'draw') {
        await addPoints(user.uid, 20);
      }
    }

    try {
      await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      playSound('success');
      if (payload.status === 'completed') {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyDuelLink = () => {
    const url = `${window.location.origin}/game/duels/${duelId}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied", description: "Share this link with your opponent!" });
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;
  if (!duel) return null;

  if (duel.status === 'waiting' && isChallenger) {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
          <div className="bg-slate-900 p-12 text-center text-white">
            <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-pulse">
              <Users className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Waiting for Opponent...</h2>
            <p className="text-slate-400 font-bold mt-2">Send this match link to a friend or wait for a global challenger.</p>
          </div>
          <CardContent className="p-10 space-y-8">
            <div className="flex gap-2">
               <div className="bg-muted p-4 rounded-xl flex-1 font-mono text-sm break-all truncate h-12 flex items-center border">
                  {`${window.location.origin}/game/duels/${duelId}`}
               </div>
               <Button size="icon" className="h-12 w-12 rounded-xl" onClick={copyDuelLink}>
                 <Copy className="h-5 w-5" />
               </Button>
            </div>
            <Button onClick={copyDuelLink} className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-xl">
               <Share2 className="mr-2 w-6 h-6" /> Invite Friend
            </Button>
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <Loader2 className="w-3 h-3 animate-spin" /> Live Syncing Registry
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (duel.status === 'completed') {
    const isWinner = duel.winnerId === user?.uid;
    const isDraw = duel.winnerId === 'draw';
    return (
      <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className={cn("p-12 text-center text-white", isWinner ? "bg-green-600" : isDraw ? "bg-blue-600" : "bg-slate-800")}>
           <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
             {isWinner ? <Crown className="w-12 h-12 text-yellow-300" /> : isDraw ? <Users className="w-12 h-12" /> : <Trophy className="w-12 h-12 opacity-50" />}
           </div>
           <h2 className="text-4xl font-black uppercase tracking-tighter italic">
             {isWinner ? 'YOU WON!' : isDraw ? 'MATCH DRAW!' : 'GOOD GAME!'}
           </h2>
           <p className="text-xl font-bold opacity-80 mt-2">
             {isWinner ? '+50 Mastery Points Earned' : isDraw ? '+20 Mastery Points Earned' : 'Persistence build speed!'}
           </p>
        </div>
        <CardContent className="p-12">
           <div className="flex items-center justify-center gap-8 sm:gap-20 mb-12">
              <div className="text-center space-y-4">
                 <Avatar className="h-24 w-24 ring-4 ring-slate-100"><AvatarImage src={duel.challengerPhoto}/><AvatarFallback className="font-black text-2xl">{duel.challengerName?.[0]}</AvatarFallback></Avatar>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Challenger</p>
                    <p className="text-lg font-black">{duel.challengerName}</p>
                    <p className="text-5xl font-black text-slate-900">{duel.challengerScore}</p>
                 </div>
              </div>
              <div className="text-5xl font-black text-slate-200 italic">VS</div>
              <div className="text-center space-y-4">
                 <Avatar className="h-24 w-24 ring-4 ring-slate-100"><AvatarImage src={duel.opponentPhoto}/><AvatarFallback className="font-black text-2xl">{duel.opponentName?.[0]}</AvatarFallback></Avatar>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Opponent</p>
                    <p className="text-lg font-black">{duel.opponentName}</p>
                    <p className="text-5xl font-black text-slate-900">{duel.opponentScore}</p>
                 </div>
              </div>
           </div>
           <div className="grid gap-4 max-w-sm mx-auto">
             <Button onClick={() => router.push('/game/duels')} className="h-16 text-xl font-black uppercase tracking-widest rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl">
               Play Another Match
             </Button>
             <Button variant="ghost" onClick={() => router.push('/game')} className="font-bold text-slate-500 uppercase tracking-widest h-12">Return to Lobby</Button>
           </div>
        </CardContent>
      </Card>
    );
  }

  if (!isFinished && !hasStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
           <div className="bg-orange-500 p-12 text-center text-white">
              <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-bounce">
                <Swords className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Duel Commencing!</h2>
              <p className="text-orange-100 font-bold mt-2 text-lg">Opponent Ready: <span className="underline">{isChallenger ? duel.opponentName : duel.challengerName}</span></p>
           </div>
           <CardContent className="p-10 space-y-8 text-center">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Match Settings</p>
                 <p className="text-xl font-bold text-slate-700">20 Questions • 10 Seconds per round • Mixed Arithmetic</p>
              </div>
              <Button onClick={() => setHasStarted(true)} className="w-full h-20 text-2xl font-black uppercase tracking-widest rounded-3xl bg-orange-500 hover:bg-orange-600 shadow-2xl shadow-orange-200 transition-all active:scale-95">
                <PlayCircle className="mr-3 w-8 h-8" /> ENTER ARENA
              </Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
           <div className="bg-slate-900 p-12 text-center text-white">
              <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
                <Clock className="w-12 h-12 text-indigo-400 animate-pulse" />
              </div>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Turn Submitted</h2>
              <p className="text-slate-400 font-bold mt-2">Waiting for your opponent to finish their turn.</p>
           </div>
           <CardContent className="p-10 space-y-8 text-center">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Your Result</p>
                 <p className="text-6xl font-black text-slate-900">{isChallenger ? duel.challengerScore : duel.opponentScore}</p>
                 <p className="text-xs font-bold text-slate-500">Mastery level maintained. Winning points awarded after results declarations.</p>
              </div>
              <Button variant="outline" onClick={() => router.push('/game/duels')} className="w-full h-14 rounded-xl border-2 font-black uppercase tracking-widest">
                Return to Lobby
              </Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  const question = duel.questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      <Card className="rounded-[2rem] shadow-2xl border-none overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-slate-900 text-white p-6 border-b shrink-0">
          <div className="flex justify-between items-center">
             <div>
               <CardTitle className="text-xl font-black uppercase flex items-center gap-2 italic">
                 <Swords className="w-5 h-5 text-orange-500" /> Duel Arena
               </CardTitle>
               <CardDescription className="text-indigo-300 font-bold">Round {currentIdx + 1} of {duel.questions.length}</CardDescription>
             </div>
             <div className="text-right shrink-0">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">My Score</p>
                <p className="text-3xl font-black leading-none text-orange-500">{localScore}</p>
             </div>
          </div>
          <div className="mt-6">
            <Progress value={(currentIdx / duel.questions.length) * 100} className="h-1.5 bg-white/10" />
          </div>
        </CardHeader>
        
        <CardContent className="p-8 text-center flex-grow flex flex-col justify-center overflow-hidden">
          <div className="space-y-12">
            <div className="py-12 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-primary/10 shadow-inner">
                <p className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 animate-in zoom-in-50 duration-300" key={currentIdx}>
                  {question.text} = ?
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {question.options.map((opt, i) => (
                <Button 
                  key={i} 
                  variant="outline"
                  className="h-20 text-3xl font-black rounded-2xl border-4 transition-all hover:scale-105 active:scale-95 shadow-md" 
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 p-6 border-t flex justify-center">
           <div className="flex items-center gap-3 opacity-30">
              <ShieldAlert className="w-4 h-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">Anti-Cheat Active • Speed Tracking</p>
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}
