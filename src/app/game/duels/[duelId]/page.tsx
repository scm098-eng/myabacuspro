
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel, Question } from '@/types';
import { Swords, Loader2, Trophy, Crown, Zap, Timer, Users, LayoutGrid, X, RotateCcw, Heart, Star } from 'lucide-react';
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
  @keyframes bubble-rise {
    from { transform: translate(-50%, 0); }
    to { transform: translate(-50%, -130vh); }
  }
  .animate-bubble-rise {
    animation: bubble-rise linear forwards;
  }
  @keyframes swimRight {
    0% { transform: translateX(-300px); }
    100% { transform: translateX(calc(100vw + 300px)); }
  }
  @keyframes swimLeft {
    0% { transform: translateX(calc(100vw + 300px)); }
    100% { transform: translateX(-300px); }
  }
`;

interface Bubble {
  id: string;
  value: number;
  isCorrect: boolean;
  left: number;
  duration: number;
  delay: number;
  isQuestion?: boolean;
}

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
  const [lives, setLives] = useState(5);
  const [hasStarted, setHasStarted] = useState(false);
  const [showMatchTransition, setShowMatchTransition] = useState(false);
  const [rematchRequested, setRematchRequested] = useState(false);

  // Bubble specific state
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scope critical variables at component level
  const isChallenger = useMemo(() => duel?.challengerId === user?.uid, [duel, user]);
  const gameState = useMemo(() => {
    if (duel?.status === 'completed') return 'completed';
    if (duel?.status === 'active') return 'playing';
    return 'searching';
  }, [duel]);
  const currentQuestion = useMemo(() => duel?.questions[currentIdx], [duel, currentIdx]);

  // Helper for dynamic avatar emotions
  const getAvatarUrl = (baseUrl: string | undefined, isWinner: boolean, isDraw: boolean, isResultsScreen: boolean = false) => {
    if (!baseUrl) return undefined;
    if (!baseUrl.includes('api.dicebear.com')) return baseUrl;
    
    if (isResultsScreen) {
      if (isDraw) return `${baseUrl}&eyes=happy&mouth=smile`;
      return isWinner 
        ? `${baseUrl}&eyes=starstruck&mouth=smile` 
        : `${baseUrl}&eyes=cry&mouth=sad`;
    }

    return `${baseUrl}&eyes=happy&mouth=smile`;
  };

  useEffect(() => {
    if (!user || !duelId) return;
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    return onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const rawData = snap.data();
          const duelData = { id: snap.id, ...rawData } as Duel;
          setDuel(duelData);
          setLoading(false);
          
          if (duelData.status === 'active' && !hasStarted && duelData.opponentId) {
             setShowMatchTransition(true);
             setTimeout(() => {
                setShowMatchTransition(false);
                setHasStarted(true);
             }, 3000);
          }

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

  const config = useMemo(() => {
    return {
      speed: 8,
      answerRange: [15, 35, 65, 85],
      qDelay: 1.2,
      variance: 2
    };
  }, []);

  const submitDuel = useCallback(async (finalScore: number) => {
    if (!duel || !user || isSubmitting) return;
    setIsSubmitting(true);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);
    
    const isChallengerLocal = duel.challengerId === user.uid;
    const payload: any = isChallengerLocal ? { challengerScore: finalScore, challengerFinished: true } : { opponentScore: finalScore, opponentFinished: true };
    
    if ((isChallengerLocal && duel.opponentFinished) || (!isChallengerLocal && duel.challengerFinished)) {
        payload.status = 'completed';
        const p1 = isChallengerLocal ? finalScore : (duel.challengerScore || 0);
        const p2 = isChallengerLocal ? (duel.opponentScore || 0) : finalScore;
        if (p1 > p2) payload.winnerId = duel.challengerId;
        else if (p2 > p1) payload.winnerId = duel.opponentId;
        else payload.winnerId = 'draw';
        
        if (payload.winnerId === user.uid) await addPoints(user.uid, 50);
        else if (payload.winnerId === 'draw') await addPoints(user.uid, 20);
    }
    
    try {
      await updateDoc(docRef, { ...payload, updatedAt: serverTimestamp() });
      playSound('success');
      if (payload.status === 'completed') confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, zIndex: 10001 });
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  }, [duel, user, duelId, isSubmitting, addPoints, playSound]);

  const processTurn = useCallback((isCorrect: boolean, answer: number | null) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = answer;
    setAnswers(newAnswers);
    
    const pts = 10;
    let nextScore = localScore;

    if (isCorrect) { 
      nextScore = localScore + pts;
      setLocalScore(nextScore); 
      playSound('correct'); 
    } else {
      setLives(l => {
        const nextLives = l - 1;
        if (nextLives <= 0 && !isSubmitting) {
          submitDuel(nextScore);
        }
        return nextLives;
      });
      playSound('wrong'); 
    }

    setTimeout(() => {
      if (currentIdx < (duel?.questions.length || 0) - 1) {
        setCurrentIdx(p => p + 1);
      } else {
        submitDuel(nextScore);
      }
    }, 500);
  }, [answers, currentIdx, duel, localScore, playSound, submitDuel, isSubmitting]);

  const generateBubbles = useCallback(() => {
    if (!duel || !hasStarted || duel.status !== 'active') return;
    
    if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
    
    const q = duel.questions[currentIdx];
    if (!q) return;

    const batchId = `${duel.id}-${currentIdx}`;
    const newBubbles: Bubble[] = [];

    newBubbles.push({
      id: `q-${batchId}`,
      value: -1,
      isCorrect: false,
      isQuestion: true,
      left: 50,
      duration: config.speed,
      delay: 0
    });

    q.options.forEach((opt, i) => {
      newBubbles.push({
        id: `a-${batchId}-${i}`,
        value: opt,
        isCorrect: opt === q.answer,
        left: config.answerRange[i],
        duration: config.speed + 2 + Math.random() * config.variance,
        delay: config.qDelay + (i * 0.2)
      });
    });

    setBubbles(newBubbles);

    const maxTime = (config.speed + 4) * 1000;
    questionTimeoutRef.current = setTimeout(() => {
        if (!isSubmitting) {
          processTurn(false, null);
        }
    }, maxTime);

  }, [duel, currentIdx, hasStarted, isSubmitting, config, processTurn]);

  useEffect(() => {
    if (hasStarted && duel?.status === 'active') {
      generateBubbles();
    }
    return () => { if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current); };
  }, [currentIdx, duel?.status, hasStarted, generateBubbles]);

  useEffect(() => {
    if (duel?.status === 'waiting' && user?.uid === duel.challengerId && !botTriggerTimeoutRef.current) {
        botTriggerTimeoutRef.current = setTimeout(() => {
            spawnBotForDuel(duelId);
        }, 12000);
    }
    return () => { if (botTriggerTimeoutRef.current) { clearTimeout(botTriggerTimeoutRef.current); botTriggerTimeoutRef.current = null; } };
  }, [duel?.status, duel?.challengerId, user?.uid, duelId]);

  useEffect(() => {
    if (duel?.status === 'active' && duel.opponentType === 'bot' && !duel.opponentFinished && hasStarted) {
      let bScore = duel.opponentScore || 0;
      let bIdx = Math.floor(bScore / 10);

      const simulateNextQuestion = () => {
        const thinkingTime = 2000 + Math.random() * 2000;
        
        botIntervalRef.current = setTimeout(async () => {
          const accuracy = duel.botAccuracy || 0.85;
          const isCorrect = Math.random() < accuracy;
          const pts = 10;
          if (isCorrect) bScore += pts;
          bIdx++;
          const db = getFirestore(firebaseApp);
          const docRef = doc(db, `duels/${duelId}`);
          const isFinal = bIdx >= duel.questions.length;
          const payload: any = { opponentScore: bScore, opponentFinished: isFinal };
          if (isFinal) {
            if (duel.challengerFinished) {
              payload.status = 'completed';
              const p1 = duel.challengerScore || 0;
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
  }, [duel?.status, duel?.opponentType, duelId, duel?.challengerFinished, duel?.questions.length, duel?.challengerScore, hasStarted]);

  const handleBubbleClick = (bubble: Bubble) => {
    if (gameState !== 'playing' || bubble.isQuestion || isSubmitting) return;
    if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
    processTurn(bubble.isCorrect, bubble.value);
  };

  const handleRematch = async () => {
    if (!duel || !user) return;
    const db = getFirestore(firebaseApp);
    setRematchRequested(true);
    const payload = isChallenger ? { rematchChallenger: true } : { rematchOpponent: true };
    await updateDoc(doc(db, "duels", duelId), payload);
    if (duel.opponentType === 'bot') await startRematch();
  };

  const startRematch = async () => {
    if (!duel || !user || !profile) return;
    const newDuelId = await startMatchmaking(user.uid, profile, duel.mode, duel.difficulty);
    router.push(`/game/duels/${newDuelId}`);
  };

  const getQuestionFontSize = (text: string) => {
    if (text.length > 35) return "text-sm sm:text-base";
    if (text.length > 25) return "text-base sm:text-xl";
    if (text.length > 15) return "text-lg sm:text-3xl";
    return "text-xl sm:text-4xl";
  };

  if (loading) return <div className="fixed inset-0 bg-slate-900 z-[10000] flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;
  if (!duel) return null;

  if (duel.status === 'completed') {
    const isWinner = duel.winnerId === user?.uid;
    const isDraw = duel.winnerId === 'draw';
    const challengerIsWinner = duel.winnerId === duel.challengerId;
    const opponentIsWinner = duel.winnerId === duel.opponentId;

    return (
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[10000] flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-4xl rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className={cn("p-12 text-center text-white", isWinner ? "bg-green-600" : (isDraw ? "bg-blue-600" : "bg-slate-800"))}>
            <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
              {isWinner ? <Crown className="w-12 h-12 text-yellow-300" /> : (isDraw ? <Users className="w-12 h-12" /> : <Trophy className="w-12 h-12 opacity-50" />)}
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic">{isWinner ? 'MATCH WON!' : (isDraw ? 'MATCH DRAW!' : 'MATCH LOST')}</h2>
          </div>
          <CardContent className="p-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 sm:gap-24 mb-12">
                <div className="text-center space-y-4">
                  <div className="relative">
                      <Avatar className={cn("h-24 w-24 ring-4", challengerIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                        <AvatarImage src={getAvatarUrl(duel.challengerPhoto, challengerIsWinner, isDraw, true)} />
                        <AvatarFallback className="font-black text-2xl">{duel.challengerName?.[0]}</AvatarFallback>
                      </Avatar>
                      <Badge className={cn("absolute -top-3 left-1/2 -translate-x-1/2 border-none font-black text-[10px] px-3 uppercase shadow-md", challengerIsWinner ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-700")}>{challengerIsWinner ? 'CHAMPION' : 'RUNNER UP'}</Badge>
                  </div>
                  <div className="space-y-1"><p className="text-sm font-black uppercase tracking-widest text-slate-400">Challenger</p><p className="text-lg font-black truncate max-w-[150px]">{duel.challengerName}</p><p className="text-5xl font-black text-slate-900">{duel.challengerScore || 0}</p></div>
                </div>
                <div className="text-5xl font-black text-slate-200 italic">VS</div>
                <div className="text-center space-y-4">
                  <div className="relative">
                      <Avatar className={cn("h-24 w-24 ring-4", opponentIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                        <AvatarImage src={getAvatarUrl(duel.opponentPhoto, opponentIsWinner, isDraw, true)} />
                        <AvatarFallback className="font-black text-2xl">{duel.opponentName?.[0]}</AvatarFallback>
                      </Avatar>
                      <Badge className={cn("absolute -top-3 left-1/2 -translate-x-1/2 border-none font-black text-[10px] px-3 uppercase shadow-md", opponentIsWinner ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-700")}>{opponentIsWinner ? 'CHAMPION' : 'RUNNER UP'}</Badge>
                  </div>
                  <div className="space-y-1"><p className="text-sm font-black uppercase tracking-widest text-slate-400">Opponent</p><p className="text-lg font-black truncate max-w-[150px]">{duel.opponentName}</p><p className="text-5xl font-black text-slate-900">{duel.opponentScore || 0}</p></div>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={handleRematch} disabled={rematchRequested} className="h-16 text-xl font-black rounded-2xl bg-primary text-white shadow-xl uppercase">{rematchRequested ? 'Waiting...' : <><RotateCcw className="mr-2" /> Rematch</>}</Button>
              <Button onClick={() => router.push('/game')} variant="outline" className="h-16 text-xl font-black rounded-2xl uppercase">Return to Hub</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showMatchTransition) {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-12">
           <div className="flex items-center justify-center gap-8">
              <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl animate-in slide-in-from-left-8 duration-700">
                <AvatarImage src={getAvatarUrl(duel.challengerPhoto, false, true)} />
                <AvatarFallback>{duel.challengerName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="text-4xl font-black text-white italic animate-in zoom-in-50 duration-700">VS</div>
              <Avatar className="h-32 w-32 border-4 border-orange-500 shadow-2xl animate-in slide-in-from-right-8 duration-700">
                <AvatarImage src={getAvatarUrl(duel.opponentPhoto, false, true)} />
                <AvatarFallback>{duel.opponentName?.[0]}</AvatarFallback>
              </Avatar>
           </div>
           <div className="space-y-4"><h2 className="text-5xl font-black text-white uppercase italic animate-pulse">Match Found!</h2><p className="text-xl font-bold text-primary uppercase tracking-widest">Entering Arena in 3...</p></div>
        </div>
      </div>
    );
  }

  if (duel.status === 'waiting') {
    return (
      <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col items-center justify-center p-4">
        <style>{DOTS_ANIMATION}</style>
        <Card className="w-full max-w-xl rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
          <div className="p-12 text-center text-white bg-slate-900 border-b border-white/5">
            <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-pulse"><Swords className="w-12 h-12 text-primary" /></div>
            <h2 className="text-3xl font-black uppercase italic animate-dots">Searching</h2>
            <p className="text-slate-200 font-bold mt-2">Looking for online students...</p>
          </div>
          <CardContent className="p-10 text-center space-y-6 bg-white">
             <div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-sm font-medium text-slate-500 italic">"Global matchmaking ensures you always find a worthy opponent."</p></div>
             <Button variant="outline" className="w-full h-14 rounded-xl font-bold border-2" onClick={() => router.push('/game')}>Cancel Search</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col overflow-hidden animate-in fade-in duration-700">
      <style>{DOTS_ANIMATION}</style>
      
      {/* HUD Header */}
      <div className="bg-black/60 backdrop-blur-xl p-4 sm:p-6 border-b border-white/10 flex justify-between items-center z-50">
          <div className="flex items-center gap-4 text-white min-w-0 flex-1">
             <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary shrink-0">
               <AvatarImage src={getAvatarUrl(isChallenger ? duel.opponentPhoto : duel.challengerPhoto, false, true)}/>
               <AvatarFallback>{(isChallenger ? duel.opponentName : duel.challengerName)?.[0]}</AvatarFallback>
             </Avatar>
             <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-lg font-black uppercase flex items-center gap-2 italic truncate">
                  <Swords className="w-4 h-4 text-orange-500 shrink-0" /> Duel Arena
                </CardTitle>
                <CardDescription className="text-sky-300 font-bold text-[10px] sm:text-xs">Round {currentIdx + 1} of {duel.questions.length}</CardDescription>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-1 bg-white/10 p-2 rounded-xl border border-white/5 mr-4">
                {Array.from({length: 5}).map((_, i) => (<Heart key={i} className={cn("w-4 h-4 transition-all", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />))}
             </div>
             <div className="text-right">
                <p className="text-[8px] font-black uppercase text-sky-200 leading-none mb-1">Score</p>
                <div className="flex items-baseline justify-end gap-2">
                   <p className="text-xl sm:text-3xl font-black text-orange-500 leading-none">{localScore}</p>
                   <p className="text-xs sm:text-lg font-black text-white/20 leading-none">VS</p>
                   <p className="text-base sm:text-2xl font-black text-slate-400 leading-none">{isChallenger ? (duel.opponentScore || 0) : (duel.challengerScore || 0)}</p>
                </div>
             </div>
          </div>
      </div>

      <Progress value={(currentIdx / duel.questions.length) * 100} className="h-1 bg-white/5 rounded-none z-50" />

      {/* Main Playing Arena */}
      <div className="relative flex-grow flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Game%20Background.webp?alt=media" alt="Arena" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Ambient Marine Life */}
          <div className="absolute top-[20%] left-[-100px] animate-[swimRight_20s_linear_infinite] opacity-30">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish%20(2).webp?alt=media" alt="fish" width={60} height={40} />
          </div>
          <div className="absolute top-[50%] right-[-100px] animate-[swimLeft_25s_linear_infinite] opacity-30 scale-x-[-1]">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish%20(2).webp?alt=media" alt="fish" width={80} height={50} />
          </div>
        </div>

        <div className="relative z-10 w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full">
                {bubbles.map(bubble => (
                    <div 
                      key={bubble.id} 
                      className={cn(
                        "absolute bottom-[-200px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl transition-all active:scale-95", 
                        bubble.isQuestion ? 'w-max px-6 sm:px-10 h-16 sm:h-24 bg-yellow-400 border-yellow-500 rounded-3xl ring-8 ring-yellow-400/20' : 'w-20 h-20 sm:w-32 sm:h-32 bg-pink-500 border-pink-600 rounded-full ring-8 ring-pink-500/20'
                      )} 
                      style={{ 
                        left: `${bubble.left}%`, 
                        animationDuration: `${bubble.duration}s`, 
                        animationDelay: `${bubble.delay}s`, 
                        transform: 'translateX(-50%)' 
                      }} 
                      onClick={() => handleBubbleClick(bubble)}
                    >
                        <span className={cn(
                          "text-white font-black [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] select-none whitespace-nowrap text-center", 
                          bubble.isQuestion ? getQuestionFontSize(currentQuestion?.text || "") : 'text-xl sm:text-4xl'
                        )}>
                            {bubble.isQuestion ? currentQuestion?.text : bubble.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="p-4 bg-black/60 border-t border-white/10 flex justify-between items-center text-white z-50">
         <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-white/20 text-white font-black text-[10px]">{duel.mode.toUpperCase()}</Badge>
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">{duel.difficulty || 'Normal'} Race</span>
         </div>
         <Button variant="ghost" size="sm" onClick={() => router.push('/game')} className="text-white/40 hover:text-white font-bold h-8">
            <X className="w-4 h-4 mr-2" /> Forfeit
         </Button>
      </div>
    </div>
  );
}
