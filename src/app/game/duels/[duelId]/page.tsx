'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel } from '@/types';
import { Swords, Loader2, Trophy, Crown, Zap, Users, X, RotateCcw, Heart, Star } from 'lucide-react';
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
  usePageBackground('');
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
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef<(number | null)[]>([]);

  // Correct variable scoping
  const isChallenger = duel?.challengerId === user?.uid;
  const gameState = duel?.status === 'completed' ? 'completed' : duel?.status === 'active' ? 'playing' : 'searching';
  const currentQuestion = duel?.questions[currentIdx];

  const config = useMemo(() => ({
    speed: 8,
    answerRange: [12, 37, 63, 88], 
    qDelay: 1.2,
    variance: 1.5 
  }), []);

  useEffect(() => {
    setMounted(true);
    if (!user || !duelId) return;
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);

    return onSnapshot(docRef, 
      (snap) => {
        if (snap.exists()) {
          const duelData = { id: snap.id, ...snap.data() } as Duel;
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
        }
      },
      async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `duels/${duelId}`, operation: 'get' }));
      }
    );
  }, [user, duelId, hasStarted]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submitDuel = useCallback(async (finalScore: number) => {
    if (!duel || !user || isSubmitting) return;
    setIsSubmitting(true);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);
    
    const isChallengerLocal = duel.challengerId === user.uid;
    const payload: any = isChallengerLocal 
      ? { challengerScore: finalScore, challengerFinished: true } 
      : { opponentScore: finalScore, opponentFinished: true };
    
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
    const newAnswers = [...answersRef.current];
    newAnswers[currentIdx] = answer;
    setAnswers(newAnswers);
    
    const pts = 10;
    let nextScore = localScore;

    if (isCorrect) { 
      nextScore = localScore + pts;
      setLocalScore(nextScore); 
      playSound('correct'); 
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      playSound('wrong'); 
      if (nextLives <= 0) {
        submitDuel(nextScore);
        return;
      }
    }

    setTimeout(() => {
      if (currentIdx < (duel?.questions.length || 0) - 1) {
        setCurrentIdx(p => p + 1);
      } else {
        submitDuel(nextScore);
      }
    }, 500);
  }, [currentIdx, duel, localScore, playSound, submitDuel, lives]);

  const generateBubbles = useCallback(() => {
    if (!duel || !hasStarted || duel.status !== 'active') return;
    if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
    
    const q = duel.questions[currentIdx];
    if (!q) return;

    const batchId = `${duel.id}-${currentIdx}`;
    const newBubbles: Bubble[] = [];

    newBubbles.push({
      id: `q-${batchId}`, value: -1, isCorrect: false, isQuestion: true, left: 50, duration: config.speed, delay: 0
    });

    q.options.forEach((opt, i) => {
      newBubbles.push({
        id: `a-${batchId}-${i}`, value: opt, isCorrect: opt === q.answer, left: config.answerRange[i],
        duration: config.speed + 2 + Math.random() * config.variance,
        delay: config.qDelay + (i * 0.2)
      });
    });

    setBubbles(newBubbles);

    const maxTime = (config.speed + 4) * 1000;
    questionTimeoutRef.current = setTimeout(() => {
        if (!isSubmitting) processTurn(false, null);
    }, maxTime);
  }, [duel, currentIdx, hasStarted, isSubmitting, config, processTurn]);

  useEffect(() => {
    if (hasStarted && duel?.status === 'active') generateBubbles();
    return () => { if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current); };
  }, [currentIdx, duel?.status, hasStarted, generateBubbles]);

  useEffect(() => {
    if (duel?.status === 'waiting' && user?.uid === duel.challengerId && !botTriggerTimeoutRef.current) {
        botTriggerTimeoutRef.current = setTimeout(() => spawnBotForDuel(duelId), 12000);
    }
    return () => { if (botTriggerTimeoutRef.current) clearTimeout(botTriggerTimeoutRef.current); };
  }, [duel?.status, duel?.challengerId, user?.uid, duelId]);

  useEffect(() => {
    if (duel?.status === 'active' && duel.opponentType === 'bot' && !duel.opponentFinished && hasStarted) {
      let bScore = duel.opponentScore || 0;
      let bIdx = Math.floor(bScore / 10);
      const simulateNext = () => {
        botIntervalRef.current = setTimeout(async () => {
          const isCorrect = Math.random() < (duel.botAccuracy || 0.85);
          if (isCorrect) bScore += 10;
          bIdx++;
          const isFinal = bIdx >= duel.questions.length;
          const payload: any = { opponentScore: bScore, opponentFinished: isFinal };
          if (isFinal && duel.challengerFinished) {
              payload.status = 'completed';
              const p1 = duel.challengerScore || 0;
              const p2 = bScore;
              payload.winnerId = p1 > p2 ? duel.challengerId : (p2 > p1 ? duel.opponentId : 'draw');
          }
          await updateDoc(doc(getFirestore(firebaseApp), `duels/${duelId}`), payload);
          if (!isFinal) simulateNext();
        }, 2000 + Math.random() * 2000);
      };
      simulateNext();
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
    setRematchRequested(true);
    await updateDoc(doc(getFirestore(firebaseApp), "duels", duelId), isChallenger ? { rematchChallenger: true } : { rematchOpponent: true });
    if (duel.opponentType === 'bot') await startRematch();
  };

  const startRematch = async () => {
    if (!duel || !user || !profile) return;
    const newDuelId = await startMatchmaking(user.uid, profile, duel.mode as any, duel.difficulty);
    router.push(`/game/duels/${newDuelId}`);
  };

  const getAvatarUrl = (baseUrl: string | undefined, isWinner: boolean, isDraw: boolean, isResultsScreen: boolean = false) => {
    if (!baseUrl) return undefined;
    if (!baseUrl.includes('api.dicebear.com')) return baseUrl;
    if (isResultsScreen) {
      if (isDraw) return `${baseUrl}&eyes=happy&mouth=smile`;
      return isWinner ? `${baseUrl}&eyes=starstruck&mouth=smile` : `${baseUrl}&eyes=cry&mouth=sad`;
    }
    return `${baseUrl}&eyes=happy&mouth=smile`;
  };

  const getQuestionFontSize = (text: string) => {
    if (text.length > 35) return "text-sm sm:text-base";
    if (text.length > 25) return "text-base sm:text-xl";
    if (text.length > 15) return "text-lg sm:text-3xl";
    return "text-xl sm:text-4xl";
  };

  if (!mounted) return null;
  if (loading) return <div className="fixed inset-0 bg-slate-900 z-[10000] flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  if (duel?.status === 'completed') {
    const isWinner = duel.winnerId === user?.uid;
    const isDraw = duel.winnerId === 'draw';
    const challengerIsWinner = duel.winnerId === duel.challengerId;
    const opponentIsWinner = duel.winnerId === duel.opponentId;

    return createPortal(
      <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[10001] flex items-center justify-center p-4 overflow-hidden h-screen">
          <Card className="w-full max-w-lg rounded-[2rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95 bg-white max-h-[90vh] flex flex-col">
            <div className={cn("p-6 text-center text-white shrink-0", isWinner ? "bg-green-600" : (isDraw ? "bg-blue-600" : "bg-slate-800"))}>
              <div className="mx-auto bg-white/20 p-2 rounded-full w-fit mb-2">
                {isWinner ? <Crown className="w-6 h-6 text-yellow-300" /> : (isDraw ? <Users className="w-6 h-6" /> : <Trophy className="w-6 h-6 opacity-50" />)}
              </div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none">{isWinner ? 'MATCH WON!' : (isDraw ? 'MATCH DRAW!' : 'MATCH LOST')}</h2>
            </div>
            <CardContent className="p-6 overflow-y-auto scrollbar-none flex-1">
              <div className="flex items-center justify-around mb-6">
                  <div className="text-center space-y-2">
                    <div className="relative">
                        <Avatar className={cn("h-16 w-16 sm:h-20 sm:w-20 ring-4", challengerIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                          <AvatarImage src={getAvatarUrl(duel.challengerPhoto, challengerIsWinner, isDraw, true)} />
                          <AvatarFallback className="font-black text-lg">{duel.challengerName?.[0]}</AvatarFallback>
                        </Avatar>
                        <Badge className={cn("absolute -top-2 left-1/2 -translate-x-1/2 border-none font-black text-[7px] px-2 uppercase shadow-md", challengerIsWinner ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-700")}>{challengerIsWinner ? 'CHAMPION' : 'RUNNER UP'}</Badge>
                    </div>
                    <div className="space-y-0.5"><p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Challenger</p><p className="text-xs font-black truncate max-w-[80px]">{duel.challengerName}</p><p className="text-2xl font-black text-slate-900">{duel.challengerScore || 0}</p></div>
                  </div>
                  <div className="text-xl font-black text-slate-200 italic">VS</div>
                  <div className="text-center space-y-2">
                    <div className="relative">
                        <Avatar className={cn("h-16 w-16 sm:h-20 sm:w-20 ring-4", opponentIsWinner ? "ring-yellow-400" : "ring-slate-100")}>
                          <AvatarImage src={getAvatarUrl(duel.opponentPhoto, opponentIsWinner, isDraw, true)} />
                          <AvatarFallback className="font-black text-lg">{duel.opponentName?.[0]}</AvatarFallback>
                        </Avatar>
                        <Badge className={cn("absolute -top-2 left-1/2 -translate-x-1/2 border-none font-black text-[7px] px-2 uppercase shadow-md", opponentIsWinner ? "bg-yellow-400 text-yellow-900" : "bg-slate-200 text-slate-700")}>{opponentIsWinner ? 'CHAMPION' : 'RUNNER UP'}</Badge>
                    </div>
                    <div className="space-y-0.5"><p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Opponent</p><p className="text-xs font-black truncate max-w-[80px]">{duel.opponentName}</p><p className="text-2xl font-black text-slate-900">{duel.opponentScore || 0}</p></div>
                  </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button onClick={handleRematch} disabled={rematchRequested} className="h-12 text-sm font-black rounded-xl bg-primary text-white shadow-xl uppercase w-full">{rematchRequested ? 'Waiting...' : <><RotateCcw className="mr-2 h-4 w-4" /> Rematch</>}</Button>
                <Button onClick={() => router.push('/game')} variant="outline" className="h-10 text-xs font-black rounded-xl uppercase w-full border-2">Return to Hub</Button>
              </div>
            </CardContent>
          </Card>
      </div>,
      document.body
    );
  }

  if (showMatchTransition) {
    return createPortal(
      <div className="fixed inset-0 z-[10001] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4 h-screen">
          <div className="max-w-md w-full text-center space-y-8">
             <div className="flex items-center justify-center gap-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary shadow-2xl animate-in slide-in-from-left-8 duration-700">
                  <AvatarImage src={getAvatarUrl(duel?.challengerPhoto, false, true)} />
                  <AvatarFallback>{duel?.challengerName?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-2xl sm:text-3xl font-black text-white italic animate-in zoom-in-50 duration-700">VS</div>
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-orange-500 shadow-2xl animate-in slide-in-from-right-8 duration-700">
                  <AvatarImage src={getAvatarUrl(duel?.opponentPhoto, false, true)} />
                  <AvatarFallback>{duel?.opponentName?.[0]}</AvatarFallback>
                </Avatar>
             </div>
             <div className="space-y-3"><h2 className="text-3xl sm:text-4xl font-black text-white uppercase italic animate-pulse leading-none">Match Found!</h2><p className="text-base sm:text-lg font-bold text-primary uppercase tracking-widest">Arena entering in 3...</p></div>
          </div>
      </div>,
      document.body
    );
  }

  if (duel?.status === 'waiting') {
    return createPortal(
      <div className="fixed inset-0 z-[10001] bg-slate-900 overflow-hidden flex flex-col items-center justify-center p-4 h-screen">
          <style>{DOTS_ANIMATION}</style>
          <Card className="w-full max-w-sm rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white">
            <div className="p-8 text-center text-white bg-slate-900 border-b border-white/5">
              <div className="mx-auto bg-white/20 p-3 rounded-full w-fit mb-4 animate-pulse"><Swords className="w-8 h-8 text-primary" /></div>
              <h2 className="text-xl font-black uppercase italic animate-dots leading-none">Searching</h2>
              <p className="text-slate-300 font-bold mt-2 text-xs">Looking for online students...</p>
            </div>
            <CardContent className="p-6 text-center space-y-4">
               <div className="flex flex-col items-center gap-2"><Loader2 className="h-6 w-6 animate-spin text-primary" /><p className="text-[10px] font-medium text-slate-500 italic">"Global matchmaking ensures you always find a worthy opponent."</p></div>
               <Button variant="outline" className="w-full h-10 rounded-xl font-bold border-2 text-xs" onClick={() => router.push('/game')}>Cancel Search</Button>
            </CardContent>
          </Card>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col overflow-hidden animate-in fade-in duration-700 h-screen w-screen">
      <style jsx global>{`
        ${DOTS_ANIMATION}
        @keyframes bubble-rise { from { transform: translate(-50%, 0); } to { transform: translate(-50%, -130vh); } }
        .animate-bubble-rise { animation: bubble-rise linear forwards; }
        @keyframes bubble-rise-bg { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.4; } 100% { transform: translateY(-110vh) scale(1.2); opacity: 0; } }
      `}</style>
      
      {/* Full-Screen Immersive Marine Environment */}
      <div className="absolute inset-0 z-0 h-full w-full">
          <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Game%20Background.webp?alt=media" alt="Arena" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/20 rounded-full animate-[bubble-rise-bg_linear_infinite]"
                style={{
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  left: `${Math.random() * 100}%`,
                  bottom: "-50px",
                  animationDuration: `${Math.random() * 5 + 5}s`,
                  animationDelay: `${Math.random() * 10}s`,
                }}
              />
            ))}
          </div>
      </div>

      {/* Immersive HUD (Fit to screen) */}
      <div className="relative bg-black/20 backdrop-blur-md p-3 sm:p-4 border-b border-white/10 flex justify-between items-center z-50 shrink-0">
          <div className="flex items-center gap-3 text-white min-w-0 flex-1">
             <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary shrink-0">
               <AvatarImage src={getAvatarUrl(isChallenger ? duel?.opponentPhoto : duel?.challengerPhoto, false, true)}/>
               <AvatarFallback>{(isChallenger ? duel?.opponentName : duel?.challengerName)?.[0]}</AvatarFallback>
             </Avatar>
             <div className="min-w-0 flex-1">
                <CardTitle className="text-[10px] sm:text-base font-black uppercase flex items-center gap-1.5 italic truncate leading-none">
                  <Swords className="w-3 h-3 text-orange-500 shrink-0" /> Duel Arena
                </CardTitle>
                <CardDescription className="text-sky-300 font-bold text-[8px] sm:text-[10px]">Round {currentIdx + 1} of {duel?.questions.length}</CardDescription>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="hidden sm:flex items-center gap-1 bg-white/10 p-1.5 rounded-xl border border-white/5 mr-2">
                {Array.from({length: 5}).map((_, i) => (<Heart key={i} className={cn("w-3.5 h-3.5 transition-all", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />))}
             </div>
             <div className="text-right">
                <p className="text-[7px] font-black uppercase text-sky-200 leading-none mb-0.5">Score</p>
                <div className="flex items-baseline justify-end gap-1.5 leading-none">
                   <p className="text-xl sm:text-2xl font-black text-orange-500 leading-none">{localScore}</p>
                   <p className="text-[8px] sm:text-sm font-black text-white/20 leading-none uppercase">VS</p>
                   <p className="text-sm sm:text-xl font-black text-slate-400 leading-none">{isChallenger ? (duel?.opponentScore || 0) : (duel?.challengerScore || 0)}</p>
                </div>
             </div>
          </div>
      </div>

      <Progress value={(currentIdx / (duel?.questions.length || 1)) * 100} className="relative h-0.5 bg-white/5 rounded-none z-50" />

      {/* Viewport-Fitting Playing Field */}
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden z-10 w-full h-full">
          <div className="relative w-full h-full">
                {bubbles.map(bubble => (
                    <div 
                      key={bubble.id} 
                      className={cn(
                        "absolute bottom-[-150px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl transition-all active:scale-95", 
                        bubble.isQuestion 
                          ? 'w-max max-w-[95vw] px-6 sm:px-8 h-12 sm:h-20 bg-yellow-400 border-yellow-500 rounded-2xl ring-4 ring-yellow-400/20' 
                          : 'w-20 h-20 sm:w-32 sm:h-32 bg-pink-500 border-pink-600 rounded-full ring-8 ring-pink-500/20'
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
                          "text-white font-black [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] select-none whitespace-nowrap text-center px-2", 
                          bubble.isQuestion ? getQuestionFontSize(currentQuestion?.text || "") : "text-xl sm:text-4xl"
                        )}>
                            {bubble.isQuestion ? currentQuestion?.text : bubble.value}
                        </span>
                    </div>
                ))}
          </div>
      </div>

      {/* Semi-Transparent Footer Overlay */}
      <div className="relative bg-black/20 backdrop-blur-md p-2 sm:p-3 border-t border-white/10 flex justify-between items-center text-white z-50 shrink-0">
         <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-white/20 text-white font-black text-[8px] h-4 sm:h-5">{duel?.mode.toUpperCase()}</Badge>
            <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">{duel?.difficulty || 'Normal'} Race</span>
         </div>
         <Button variant="ghost" size="sm" onClick={() => router.push('/game')} className="text-white/40 hover:text-white font-bold h-6 sm:h-7 px-3 sm:px-4 text-[10px]">
            <X className="w-3 h-3 mr-2" /> Forfeit
         </Button>
      </div>
    </div>,
    document.body
  );
}

