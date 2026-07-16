
'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, Question } from '@/types';
import { Swords, Loader2, PlayCircle, Trophy, Crown, AlertCircle, ArrowRight, UserX, Copy, Share2, Zap, Timer, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { spawnBotForDuel } from '@/lib/matchmaking';

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
  const [matchmakingTimer, setMatchmakingTimer] = useState(6);

  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !duelId) return;
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    const unsubscribe = onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const rawData = snap.data() as Duel;
          // Destructure to avoid duplicate id property assignment
          const { id: _, ...data } = rawData;
          setDuel({ id: snap.id, ...data } as Duel);
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

    return () => unsubscribe();
  }, [user, duelId, router, toast]);

  useEffect(() => {
    if (duel?.status === 'waiting' && matchmakingTimer > 0) {
      const t = setTimeout(() => setMatchmakingTimer(prev => prev - 1), 1000);
      return () => clearTimeout(t);
    } else if (duel?.status === 'waiting' && matchmakingTimer === 0) {
      spawnBotForDuel(duelId);
    }
  }, [duel?.status, matchmakingTimer, duelId]);

  useEffect(() => {
    if (duel?.status === 'active' && duel.opponentType === 'bot' && !duel.opponentFinished) {
      let bScore = 0;
      let bIdx = 0;
      
      const simulateNextQuestion = () => {
        // Optimized thinking time: 1.5s to 3.5s per question
        const thinkingTime = 1500 + Math.random() * 2000;
        
        botIntervalRef.current = setTimeout(async () => {
          const isCorrect = Math.random() > 0.15;
          if (isCorrect) bScore++;
          bIdx++;
          
          const db = getFirestore(firebaseApp);
          const docRef = db.doc(`duels/${duelId}`);
          const isFinal = bIdx >= duel.questions.length;
          
          const payload: any = {
            opponentScore: bScore,
            opponentFinished: isFinal,
          };

          if (isFinal) {
            payload.status = duel.challengerFinished ? 'completed' : 'active';
            if (payload.status === 'completed') {
              const p1 = duel.challengerScore;
              const p2 = bScore;
              if (p1 > p2) payload.winnerId = duel.challengerId;
              else if (p2 > p1) payload.winnerId = duel.opponentId;
              else payload.winnerId = 'draw';
            }
          }

          await updateDoc(docRef, payload);
          if (!isFinal) simulateNextQuestion();
        }, thinkingTime);
      };

      simulateNextQuestion();
    }
    return () => { if (botIntervalRef.current) clearTimeout(botIntervalRef.current); };
  }, [duel?.status, duel?.opponentType, duelId, duel?.challengerFinished, duel?.questions.length, duel?.challengerScore, duel?.challengerId, duel?.opponentId]);

  const isChallenger = duel?.challengerId === user?.uid;
  const isFinished = isChallenger ? duel?.challengerFinished : duel?.opponentFinished;

  const handleStandardAnswer = (val: number) => {
    if (isFinished || !duel) return;
    const isCorrect = val === duel.questions[currentIdx].answer;
    processTurn(isCorrect, val);
  };

  const processTurn = (isCorrect: boolean, answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = answer;
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
      status: duel.opponentFinished ? 'completed' : 'active'
    } : {
      opponentScore: finalScore,
      opponentFinished: true,
      status: duel.challengerFinished ? 'completed' : 'active'
    };

    if (payload.status === 'completed') {
      const p1 = isChallenger ? finalScore : duel.challengerScore;
      const p2 = isChallenger ? duel.opponentScore : finalScore;
      if (p1 > p2) payload.winnerId = duel.challengerId;
      else if (p2 > p1) payload.winnerId = duel.opponentId;
      else payload.winnerId = 'draw';

      if (payload.winnerId === user.uid) await addPoints(user.uid, 50);
      else if (payload.winnerId === 'draw') await addPoints(user.uid, 20);
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

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;
  if (!duel) return null;

  if (duel.status === 'completed') {
    const isWinner = duel.winnerId === user?.uid;
    const isDraw = duel.winnerId === 'draw';
    const challengerIsWinner = duel.winnerId === duel.challengerId;
    const opponentIsWinner = duel.winnerId === duel.opponentId;

    return (
      <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95 mt-10">
        <div className={cn(
          "p-12 text-center text-white", 
          isWinner ? "bg-green-600" : isDraw ? "bg-blue-600" : "bg-slate-800"
        )}>
           <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
             {isWinner ? <Crown className="w-12 h-12 text-yellow-300" /> : isDraw ? <Users className="w-12 h-12" /> : <Trophy className="w-12 h-12 opacity-50" />}
           </div>
           <h2 className="text-4xl font-black uppercase tracking-tighter italic">
             {isWinner ? 'CHAMPION!' : isDraw ? 'MATCH DRAW!' : 'MATCH LOST'}
           </h2>
        </div>
        <CardContent className="p-12">
           <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 mb-12">
              <div className="text-center space-y-4">
                 <div className="relative">
                    <Avatar className={cn("h-24 w-24 ring-4", challengerIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                      <AvatarImage src={duel.challengerPhoto}/>
                      <AvatarFallback className="font-black text-2xl">{duel.challengerName?.[0]}</AvatarFallback>
                    </Avatar>
                    {challengerIsWinner && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 border-none font-black text-[10px] px-3 uppercase tracking-widest shadow-md">WINNER</Badge>
                    )}
                    {!challengerIsWinner && !isDraw && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">RUNNER UP</Badge>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Challenger</p>
                    <p className="text-lg font-black">{duel.challengerName}</p>
                    <p className="text-5xl font-black text-slate-900">{duel.challengerScore}</p>
                 </div>
              </div>

              <div className="text-5xl font-black text-slate-200 italic">VS</div>

              <div className="text-center space-y-4">
                 <div className="relative">
                    <Avatar className={cn("h-24 w-24 ring-4", opponentIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                      <AvatarImage src={duel.opponentPhoto}/>
                      <AvatarFallback className="font-black text-2xl">{duel.opponentName?.[0]}</AvatarFallback>
                    </Avatar>
                    {opponentIsWinner && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 border-none font-black text-[10px] px-3 uppercase tracking-widest shadow-md">WINNER</Badge>
                    )}
                    {!opponentIsWinner && !isDraw && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 border-none font-black text-[10px] px-3 uppercase tracking-widest">RUNNER UP</Badge>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Opponent</p>
                    <p className="text-lg font-black">{duel.opponentName}</p>
                    <p className="text-5xl font-black text-slate-900">{duel.opponentScore}</p>
                 </div>
              </div>
           </div>
           <Button onClick={() => router.push('/game')} className="w-full h-16 text-xl font-black rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl">Return to Hub</Button>
        </CardContent>
      </Card>
    );
  }

  if (duel.status === 'waiting') {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-500">
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
          <div className="bg-slate-900 p-12 text-center text-white">
            <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-pulse">
              <Swords className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Searching...</h2>
            <p className="text-slate-400 font-bold mt-2">Looking for a real online student...</p>
            <div className="mt-8 flex justify-center gap-2">
                {Array.from({length: 6}).map((_, i) => (
                    <div key={i} className={cn("w-3 h-3 rounded-full transition-all duration-300", i < 6 - matchmakingTimer ? "bg-primary scale-110" : "bg-white/10")} />
                ))}
            </div>
          </div>
          <CardContent className="p-10 text-center space-y-6">
             {isChallenger && !isFinished && (
               <Button onClick={() => setHasStarted(true)} className="w-full h-16 text-xl font-black uppercase tracking-widest rounded-2xl bg-primary hover:bg-primary/90 shadow-xl">
                 Start Battle Solo
               </Button>
             )}
             <p className="text-sm text-muted-foreground font-medium italic">"A true master is always ready for any challenger."</p>
             <Button variant="outline" className="w-full h-14 rounded-xl font-bold border-2" onClick={() => router.push('/game/duels')}>Cancel Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isFinished) {
    return (
       <div className="max-w-xl mx-auto py-12 animate-in fade-in duration-500">
           <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
               <div className="bg-indigo-600 p-12 text-center text-white">
                   <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
                       <Loader2 className="w-12 h-12 animate-spin" />
                   </div>
                   <h2 className="text-3xl font-black uppercase italic tracking-tighter">Turn Finished!</h2>
                   <p className="text-indigo-100 font-bold mt-2 text-lg">My Score: {localScore}</p>
                   <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mt-6">Waiting for opponent to finish their race...</p>
               </div>
               <CardContent className="p-10 text-center">
                   <Button variant="outline" onClick={() => router.push('/game')} className="w-full h-14 rounded-xl font-bold uppercase tracking-widest border-2">Return to Hub</Button>
               </CardContent>
           </Card>
       </div>
    );
 }

  if (!isFinished && !hasStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 mt-10">
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
           <div className="bg-orange-500 p-12 text-center text-white">
              <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-bounce">
                <Swords className="w-12 h-12" />
              </div>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Duel Ready!</h2>
              <p className="text-orange-100 font-bold mt-2 text-lg">Opponent: <span className="underline">{isChallenger ? duel.opponentName : duel.challengerName}</span></p>
              <Badge className="mt-4 bg-white/20 text-white border-none uppercase font-black px-4 tracking-widest">MODE: {duel.mode?.toUpperCase()}</Badge>
           </div>
           <CardContent className="p-10 space-y-8 text-center">
              <Button onClick={() => setHasStarted(true)} className="w-full h-20 text-2xl font-black uppercase tracking-widest rounded-3xl bg-orange-500 hover:bg-orange-600 shadow-2xl transition-all">
                <PlayCircle className="mr-3 h-8 w-8" /> ENTER ARENA
              </Button>
           </CardContent>
        </Card>
      </div>
    );
  }

  const question = duel.questions[currentIdx];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 mt-6">
      <Card className="rounded-[2rem] shadow-2xl border-none overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-slate-900 text-white p-6 border-b shrink-0">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
               <Avatar className="h-12 w-12 border-2 border-primary"><AvatarImage src={isChallenger ? duel.challengerPhoto : duel.opponentPhoto}/></Avatar>
               <div>
                  <CardTitle className="text-lg font-black uppercase flex items-center gap-2 italic">
                    <Swords className="w-4 h-4 text-orange-500" /> Duel Arena
                  </CardTitle>
                  <CardDescription className="text-indigo-300 font-bold">Round {currentIdx + 1} of {duel.questions.length}</CardDescription>
               </div>
             </div>
             <div className="text-right shrink-0">
                <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Live Score</p>
                <div className="flex items-end gap-3">
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase text-slate-500">ME</p>
                      <p className="text-3xl font-black text-orange-500">{localScore}</p>
                   </div>
                   <div className="text-slate-700 font-black pb-1">/</div>
                   <div className="text-center">
                      <p className="text-[8px] font-black uppercase text-slate-500">OPP</p>
                      <p className="text-3xl font-black text-slate-400">{isChallenger ? duel.opponentScore : duel.challengerScore}</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="mt-6">
            <Progress value={(currentIdx / duel.questions.length) * 100} className="h-1.5 bg-white/10" />
          </div>
        </CardHeader>
        
        <CardContent className="p-8 text-center flex-grow flex flex-col justify-center overflow-hidden bg-white">
          <div className="space-y-12">
             <div className="py-12 bg-muted/20 rounded-[2.5rem] border-4 border-dashed border-primary/10 shadow-inner">
                <p className="text-5xl sm:text-7xl font-black tracking-tighter text-slate-900 animate-in zoom-in-50 duration-300" key={currentIdx}>
                    {question.text} = ?
                </p>
             </div>
             <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
               {question.options.map((opt, i) => (
                 <Button key={i} variant="outline" className="h-20 text-3xl font-black rounded-2xl border-4 transition-all hover:scale-105 shadow-md" onClick={() => handleStandardAnswer(opt)}>{opt}</Button>
               ))}
             </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-slate-50 p-6 border-t flex justify-center">
           <div className="flex items-center gap-3 opacity-30">
              <Zap className="w-4 h-4" />
              <p className="text-[9px] font-black uppercase tracking-[0.3em]">Smart Matchmaking Active • Bot Detection Secure</p>
           </div>
        </CardFooter>
      </Card>
    </div>
  );
}
