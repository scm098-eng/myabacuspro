
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel } from '@/types';
import { Swords, Loader2, Trophy, Crown, Zap, Timer, Users, LayoutGrid, X, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { spawnBotForDuel, startMatchmaking } from '@/lib/matchmaking';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const DOTS_ANIMATION = `
  @keyframes dots {
    0% { content: "."; }
    33% { content: ".."; }
    66% { content: "..."; }
    100% { content: "."; }
  }
  .animate-dots::after {
    content: ".";
    animation: dots 1.5s infinite;
  }
`;

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
  const [showMatchTransition, setShowMatchTransition] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  const [wrongSelection, setWrongSelection] = useState<number | null>(null);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [matrixState, setMatrixState] = useState<'memorizing' | 'playing' | 'feedback'>('memorizing');

  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Status Listener
  useEffect(() => {
    if (!user || !duelId) return;
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    return onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const rawData = snap.data();
          const { id: _, ...rest } = rawData;
          const duelData = { id: snap.id, ...rest } as Duel;
          setDuel(duelData);
          setLoading(false);
          
          // AUTO-START logic
          if (duelData.status === 'active' && !hasStarted && duelData.opponentId) {
             setShowMatchTransition(true);
             setTimeout(() => {
                setShowMatchTransition(false);
                setHasStarted(true);
             }, 3000);
          }

          // Rematch Logic
          if (duelData.rematchChallenger && duelData.rematchOpponent) {
            startRematch();
          }
        } else {
          toast({ title: "Duel not found", variant: "destructive" });
          router.push('/game');
        }
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `duels/${duelId}`, operation: 'get' }));
      }
    );
  }, [user, duelId, router, toast, hasStarted]);

  // Bot Trigger
  useEffect(() => {
    if (duel?.status === 'waiting' && user?.uid === duel.challengerId && !botTriggerTimeoutRef.current) {
        botTriggerTimeoutRef.current = setTimeout(() => {
            spawnBotForDuel(duelId);
        }, 12000);
    }
    return () => {
        if (botTriggerTimeoutRef.current) {
            clearTimeout(botTriggerTimeoutRef.current);
            botTriggerTimeoutRef.current = null;
        }
    };
  }, [duel?.status, duel?.challengerId, user?.uid, duelId]);

  // Bot Gameplay Simulation
  useEffect(() => {
    if (duel?.status === 'active' && duel.opponentType === 'bot' && !duel.opponentFinished && hasStarted) {
      let bScore = duel.opponentScore || 0;
      let bIdx = duel.mode === 'matrix' ? Math.floor(bScore) : Math.floor(bScore / 10);

      const simulateNextQuestion = () => {
        const thinkingTime = 1500 + Math.random() * 2000;
        
        botIntervalRef.current = setTimeout(async () => {
          const accuracy = duel.botAccuracy || 0.85;
          const isCorrect = Math.random() < accuracy;
          const pointsPerCorrect = duel.mode === 'matrix' ? 1 : 10;
          
          if (isCorrect) bScore += pointsPerCorrect;
          bIdx++;
          
          const db = getFirestore(firebaseApp);
          const docRef = doc(db, `duels/${duelId}`);
          const isFinal = bIdx >= duel.questions.length;
          
          const payload: any = {
            opponentScore: bScore,
            opponentFinished: isFinal,
          };

          if (isFinal) {
            if (duel.challengerFinished) {
              payload.status = 'completed';
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
  }, [duel?.status, duel?.opponentType, duelId, duel?.challengerFinished, duel?.questions.length, duel?.challengerScore, duel?.challengerId, duel?.opponentId, duel?.mode, hasStarted]);

  // Matrix State Handling
  useEffect(() => {
    if (duel?.mode === 'matrix' && hasStarted && duel.status !== 'completed') {
      setMatrixState('memorizing');
      const timer = setTimeout(() => {
        setMatrixState('playing');
        setUserSelection([]);
        setWrongSelection(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, duel?.mode, hasStarted, duel?.status]);

  const handleMatrixTileClick = (idx: number) => {
    if (matrixState !== 'playing' || !duel || duel.status === 'completed') return;
    const q = duel.questions[currentIdx];
    if (!q || !q.matrixPattern) return;

    if (q.matrixPattern.includes(idx)) {
      const newSelection = [...userSelection, idx];
      setUserSelection(newSelection);
      playSound('correct');
      if (newSelection.length === q.matrixPattern.length) {
        setMatrixState('feedback');
        setTimeout(() => processTurn(true, 1), 600);
      }
    } else {
      setWrongSelection(idx);
      playSound('wrong');
      setTimeout(() => {
        setWrongSelection(null);
        processTurn(false, 0);
      }, 600);
    }
  };

  const handleStandardAnswer = (val: number) => {
    if (!duel || duel.status === 'completed') return;
    const isCorrect = val === duel.questions[currentIdx].answer;
    processTurn(isCorrect, val);
  };

  const processTurn = (isCorrect: boolean, answer: number) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = answer;
    setAnswers(newAnswers);

    const pointsPerCorrect = duel?.mode === 'matrix' ? 1 : 10;
    
    if (isCorrect) {
      setLocalScore(s => s + pointsPerCorrect);
      playSound('correct');
    } else {
      playSound('wrong');
    }

    setTimeout(() => {
      if (currentIdx < (duel?.questions.length || 0) - 1) {
        setCurrentIdx(p => p + 1);
      } else {
        submitDuel(isCorrect ? localScore + pointsPerCorrect : localScore);
      }
    }, 500);
  };

  const submitDuel = async (finalScore: number) => {
    if (!duel || !user) return;
    setIsSubmitting(true);

    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    const isChallenger = duel.challengerId === user.uid;
    const payload: any = isChallenger ? {
      challengerScore: finalScore,
      challengerFinished: true,
    } : {
      opponentScore: finalScore,
      opponentFinished: true,
    };

    if ((isChallenger && duel.opponentFinished) || (!isChallenger && duel.challengerFinished)) {
        payload.status = 'completed';
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

  const handleRematch = async () => {
    if (!duel || !user) return;
    const db = getFirestore(firebaseApp);
    const isChallenger = duel.challengerId === user.uid;
    setRematchRequested(true);
    
    const payload = isChallenger ? { rematchChallenger: true } : { rematchOpponent: true };
    await updateDoc(doc(db, "duels", duelId), payload);

    if (duel.opponentType === 'bot') {
      await startRematch();
    }
  };

  const startRematch = async () => {
    if (!duel || !user || !profile) return;
    const newDuelId = await startMatchmaking(user.uid, profile, duel.mode, duel.difficulty);
    router.push(`/game/duels/${newDuelId}`);
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
          isWinner ? "bg-green-600" : (isDraw ? "bg-blue-600" : "bg-slate-800")
        )}>
           <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
             {isWinner ? <Crown className="w-12 h-12 text-yellow-300" /> : (isDraw ? <Users className="w-12 h-12" /> : <Trophy className="w-12 h-12 opacity-50" />)}
           </div>
           <h2 className="text-4xl font-black uppercase tracking-tighter italic whitespace-nowrap">
             {isWinner ? 'MATCH WON!' : (isDraw ? 'MATCH DRAW!' : 'MATCH LOST')}
           </h2>
        </div>
        <CardContent className="p-12">
           <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 mb-12">
              <div className="text-center space-y-4">
                 <div className="relative">
                    <Avatar className={cn("h-24 w-24 ring-4", challengerIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                      <AvatarImage src={duel.challengerPhoto || undefined}/>
                      <AvatarFallback className="font-black text-2xl">{duel.challengerName?.[0]}</AvatarFallback>
                    </Avatar>
                    {challengerIsWinner ? (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 border-none font-black text-[10px] px-3 uppercase tracking-widest shadow-md">CHAMPION</Badge>
                    ) : (
                      <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 border-none font-black text-[10px] px-3 uppercase tracking-widest shadow-md">RUNNER UP</Badge>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Challenger</p>
                    <p className="text-lg font-black truncate max-w-[150px]">{duel.challengerName}</p>
                    <p className="text-5xl font-black text-slate-900">{duel.challengerScore}</p>
                 </div>
              </div>
              <div className="text-5xl font-black text-slate-200 italic">VS</div>
              <div className="text-center space-y-4">
                 <div className="relative">
                    <Avatar className={cn("h-24 w-24 ring-4", opponentIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                      <AvatarImage src={duel.opponentPhoto || undefined}/>
                      <AvatarFallback className="font-black text-2xl">{duel.opponentName?.[0]}</AvatarFallback>
                    </Avatar>
                    {opponentIsWinner ? (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 border-none font-black text-[10px] px-3 uppercase tracking-widest shadow-md">CHAMPION</Badge>
                    ) : (
                      <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-700 border-none font-black text-[10px] px-3 uppercase tracking-widest shadow-md">RUNNER UP</Badge>
                    )}
                 </div>
                 <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Opponent</p>
                    <p className="text-lg font-black truncate max-w-[150px]">{duel.opponentName}</p>
                    <p className="text-5xl font-black text-slate-900">{duel.opponentScore}</p>
                 </div>
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Button onClick={handleRematch} disabled={rematchRequested} className="h-16 text-xl font-black rounded-2xl bg-primary text-white shadow-xl uppercase tracking-widest">
               {rematchRequested ? 'Waiting...' : <><RotateCcw className="mr-2" /> Rematch</>}
             </Button>
             <Button onClick={() => router.push('/game')} variant="outline" className="h-16 text-xl font-black rounded-2xl border-slate-200 uppercase tracking-widest">Return to Hub</Button>
           </div>
        </CardContent>
      </Card>
    );
  }

  if (showMatchTransition) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="max-w-md w-full text-center space-y-12">
           <div className="flex items-center justify-center gap-8">
              <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl animate-in slide-in-from-left-8 duration-700">
                <AvatarImage src={duel.challengerPhoto}/>
                <AvatarFallback>{duel.challengerName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-4xl font-black text-white italic animate-in zoom-in-50 duration-700">VS</div>
              <Avatar className="h-32 w-32 border-4 border-orange-500 shadow-2xl animate-in slide-in-from-right-8 duration-700">
                <AvatarImage src={duel.opponentPhoto}/>
                <AvatarFallback>{duel.opponentName?.[0]}</AvatarFallback>
              </Avatar>
           </div>
           <div className="space-y-4">
              <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic animate-pulse">Match Found!</h2>
              <p className="text-xl font-bold text-primary uppercase tracking-widest">Entering Arena in 3...</p>
           </div>
        </div>
      </div>
    );
  }

  const isChallenger = duel.challengerId === user?.uid;

  if (!hasStarted) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 animate-in fade-in duration-500 mt-10">
        <style>{DOTS_ANIMATION}</style>
        <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
          <div className="p-12 text-center text-white bg-slate-900">
            <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-pulse">
              <Swords className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-black uppercase italic tracking-tighter animate-dots">Searching</h2>
            <p className="text-slate-200 font-bold mt-2">Looking for online students...</p>
          </div>
          <CardContent className="p-10 text-center space-y-6">
             <div className="flex flex-col items-center gap-4">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm font-medium text-slate-500 italic">"Global matchmaking ensures you always find a worthy opponent."</p>
             </div>
             <Button variant="outline" className="w-full h-14 rounded-xl font-bold" onClick={() => router.push('/game')}>Cancel Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = duel.questions[currentIdx];
  if (!question) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto w-10 h-10 text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 px-4 mt-6">
      <Card className="rounded-[2rem] shadow-2xl border-none overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-slate-900 text-white p-6 border-b shrink-0">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
               <Avatar className="h-12 w-12 border-2 border-primary">
                 <AvatarImage src={(isChallenger ? (duel.opponentPhoto || '') : (duel.challengerPhoto || '')) || undefined}/>
                 <AvatarFallback>{(isChallenger ? duel.opponentName : duel.challengerName)?.[0]}</AvatarFallback>
               </Avatar>
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
          {duel.mode === 'matrix' ? (
            <div className="flex flex-col items-center">
               <div className="h-24 flex flex-col items-center justify-center mb-6 w-full relative">
                  {matrixState === 'memorizing' ? (
                    <div className="flex items-center gap-2 text-teal-600 font-black uppercase tracking-widest text-sm animate-in fade-in duration-300">
                      <Zap className="w-5 h-5 fill-teal-600 animate-pulse" /> Memorize Pattern
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sky-600 font-black uppercase tracking-widest text-sm animate-in fade-in duration-300">
                      <LayoutGrid className="w-5 h-5" /> Reconstruct Matrix
                    </div>
                  )}
               </div>
               <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900 rounded-[2rem] border-4 border-white/10 shadow-2xl">
                 {Array.from({length: 9}).map((_, i) => {
                   const isPattern = question.matrixPattern?.includes(i);
                   const isSelected = userSelection.includes(i);
                   const isWrong = wrongSelection === i;
                   const showHint = matrixState === 'memorizing' || matrixState === 'feedback';
                   
                   return (
                     <div 
                      key={i} 
                      onClick={() => handleMatrixTileClick(i)}
                      className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl transition-all cursor-pointer shadow-lg border-b-4 border-r-4 active:border-0 active:translate-y-1",
                        !showHint && !isSelected && !isWrong && "bg-slate-700 border-slate-800 hover:bg-slate-600",
                        showHint && isPattern && "bg-teal-400 border-teal-500 scale-[0.98] ring-8 ring-white/10",
                        showHint && !isPattern && "bg-slate-800 border-slate-900 opacity-40",
                        matrixState === 'playing' && isSelected && "bg-teal-400 border-teal-500 scale-[0.98] ring-8 ring-white/10 animate-in zoom-in-90",
                        isWrong && "bg-red-500 border-red-600 ring-8 ring-red-500/20"
                      )} 
                     />
                   );
                 })}
               </div>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center px-4 py-2 opacity-50">
        <div className="flex items-center gap-2">
           <Avatar className="h-8 w-8 border border-white">
             <AvatarImage src={duel.challengerPhoto || undefined} />
             <AvatarFallback>{duel.challengerName?.[0]}</AvatarFallback>
           </Avatar>
           <span className="text-[10px] font-black uppercase text-slate-500">{duel.challengerName}</span>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase text-slate-500">{duel.opponentName}</span>
           <Avatar className="h-8 w-8 border border-white">
             <AvatarImage src={duel.opponentPhoto || undefined} />
             <AvatarFallback>{duel.opponentName?.[0]}</AvatarFallback>
           </Avatar>
        </div>
      </div>
    </div>
  );
}

