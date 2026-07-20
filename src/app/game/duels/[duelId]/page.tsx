
'use client';

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Duel } from '@/types';
import { Swords, Loader2, Trophy, Crown, Zap, Users, X, Heart, Star, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Bubble {
  id: string; value: number; isCorrect: boolean; left: number; duration: number; delay: number; isQuestion?: boolean;
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
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localScore, setLocalScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [hasStarted, setHasStarted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  const [isFlashing, setIsFlashing] = useState(false);
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isReadyForInput, setIsReadyForInput] = useState(false);

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isChallenger = duel?.challengerId === user?.uid;
  const gameState = duel?.status === 'completed' ? 'completed' : duel?.status === 'active' ? 'playing' : 'searching';
  
  const currentQuestion = useMemo(() => duel?.questions[currentIdx] || null, [duel, currentIdx]);

  useEffect(() => {
    setMounted(true);
    if (!user || !duelId) return;
    const db = getFirestore(firebaseApp);
    return onSnapshot(doc(db, "duels", duelId), (snap) => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as Duel;
          setDuel(data);
          setLoading(false);
          if (data.status === 'active' && !hasStarted) {
             setHasStarted(true);
          }
        }
      }, async (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `duels/${duelId}`, operation: 'get' }))
    );
  }, [user, duelId, hasStarted]);

  // Bot progress simulation
  useEffect(() => {
    if (gameState === 'playing' && duel?.opponentType === 'bot' && isChallenger && !duel.opponentFinished) {
      const bot = (duel as any).botRef;
      if (!bot) return;

      const simulateBotTurn = () => {
        const delay = bot.minSpeedMs + Math.random() * (bot.maxSpeedMs - bot.minSpeedMs);
        botTimerRef.current = setTimeout(async () => {
          const isCorrect = Math.random() < bot.accuracyRate;
          const botIdx = (duel as any).botIdx || 0;
          const nextIdx = botIdx + 1;
          
          const db = getFirestore(firebaseApp);
          const update: any = {
            opponentScore: increment(isCorrect ? 10 : 0),
            botIdx: nextIdx,
            updatedAt: serverTimestamp()
          };
          
          if (nextIdx >= duel.questions.length) update.opponentFinished = true;

          await updateDoc(doc(db, "duels", duelId), update);
          if (nextIdx < duel.questions.length) simulateBotTurn();
        }, delay);
      };

      simulateBotTurn();
    }
    return () => { if (botTimerRef.current) clearTimeout(botTimerRef.current); };
  }, [gameState, duel, isChallenger, duelId]);

  const submitDuel = useCallback(async (finalScore: number) => {
    if (!duel || !user || isSubmitting) return;
    setIsSubmitting(true);
    const db = getFirestore(firebaseApp);
    const docRef = doc(db, "duels", duelId);
    
    const payload: any = isChallenger 
      ? { challengerScore: finalScore, challengerFinished: true } 
      : { opponentScore: finalScore, opponentFinished: true };
      
    const otherFinished = isChallenger ? duel.opponentFinished : duel.challengerFinished;

    if (otherFinished) {
        payload.status = 'completed';
        const p1 = isChallenger ? finalScore : (duel.challengerScore || 0);
        const p2 = isChallenger ? (duel.opponentScore || 0) : finalScore;
        if (p1 > p2) payload.winnerId = duel.challengerId;
        else if (p2 > p1) payload.winnerId = duel.opponentId;
        else payload.winnerId = 'draw';
        
        if (payload.winnerId === user.uid) {
           confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, zIndex: 10001 });
           await addPoints(user.uid, 50);
        }
    }
    try { await updateDoc(docRef, payload); } 
    catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  }, [duel, user, duelId, isSubmitting, addPoints, isChallenger]);

  const processTurn = useCallback((isCorrect: boolean) => {
    const pts = 10;
    let nextScore = localScore;
    if (isCorrect) { 
      nextScore = localScore + pts; 
      setLocalScore(nextScore); 
      playSound('correct'); 
    } else { 
      setLives(l => l - 1); 
      playSound('wrong'); 
      if (lives <= 1) { 
        submitDuel(nextScore); 
        return; 
      } 
    }
    
    if (currentIdx < (duel?.questions.length || 0) - 1) {
      setCurrentIdx(p => p + 1);
    } else {
      submitDuel(nextScore);
    }
  }, [currentIdx, duel, localScore, playSound, submitDuel, lives]);

  useEffect(() => {
    if (hasStarted && duel?.status === 'active' && currentQuestion) {
      if (duel.mode === 'flash' && currentQuestion.sequence) {
        setIsFlashing(true); setIsReadyForInput(false);
        let sIdx = 0;
        flashIntervalRef.current = setInterval(() => {
          if (sIdx >= currentQuestion.sequence!.length) {
            clearInterval(flashIntervalRef.current!);
            setIsFlashing(false); setIsReadyForInput(true);
            return;
          }
          setActiveNumber(currentQuestion.sequence![sIdx]);
          playSound('timerTick');
          setTimeout(() => setActiveNumber(null), 800);
          sIdx++;
        }, 1000);
      } else if (duel.mode === 'standard') {
        const batchId = `${duel.id}-${currentIdx}`;
        setBubbles([
          { id: `q-${batchId}`, value: -1, isCorrect: false, isQuestion: true, left: 50, duration: 8, delay: 0 },
          ...currentQuestion.options.map((opt, i) => ({ id: `a-${batchId}-${i}`, value: opt, isCorrect: opt === currentQuestion!.answer, left: [15, 35, 65, 85][i], duration: 10 + Math.random() * 2, delay: 0.5 }))
        ]);
        questionTimeoutRef.current = setTimeout(() => processTurn(false), 12000);
      }
    }
    return () => { if (flashIntervalRef.current) clearInterval(flashIntervalRef.current); if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current); };
  }, [currentIdx, hasStarted, duel?.status, duel?.mode, currentQuestion, playSound, processTurn]);

  if (!mounted) return null;
  if (loading) return <div className="fixed inset-0 bg-slate-900 z-[10000] flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col overflow-hidden h-screen w-screen">
      <style jsx global>{`@keyframes bubble-rise { from { transform: translate(-50%, 0); } to { transform: translate(-50%, -130vh); } } .animate-bubble-rise { animation: bubble-rise linear forwards; }`}</style>
      <div className="absolute inset-0 z-0">
          <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Game%20Background.webp?alt=media" alt="Arena" fill className="object-cover" priority />
      </div>
      <div className="relative bg-black/40 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center z-50">
          <div className="flex items-center gap-3 text-white flex-1">
             <Avatar className="h-10 w-10 border-2 border-primary"><AvatarImage src={isChallenger ? duel?.challengerPhoto : duel?.opponentPhoto}/><AvatarFallback>?</AvatarFallback></Avatar>
             <div><CardTitle className="text-sm font-black uppercase italic leading-none">{isChallenger ? duel?.challengerName : duel?.opponentName}</CardTitle><CardDescription className="text-sky-300 font-bold text-[10px]">Round {currentIdx + 1}</CardDescription></div>
          </div>
          <div className="flex items-center gap-4 text-white">
             <div className="text-right"><p className="text-[10px] font-black uppercase text-sky-200 leading-none">{isChallenger ? duel?.challengerName : duel?.opponentName}</p><p className="text-2xl font-black text-orange-500">{isChallenger ? localScore : (duel?.challengerScore || 0)}</p></div>
             <div className="text-2xl font-black text-white/20">VS</div>
             <div className="text-left"><p className="text-[10px] font-black uppercase text-sky-200 leading-none">{!isChallenger ? duel?.challengerName : (duel?.opponentName || 'Searching...')}</p><p className="text-2xl font-black text-primary">{!isChallenger ? localScore : (duel?.opponentScore || 0)}</p></div>
             <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => router.push('/game')}><X className="w-6 h-6"/></Button>
          </div>
      </div>
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden z-10 w-full">
          {duel?.status === 'active' && hasStarted && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              {duel.mode === 'flash' ? (
                <div className="w-full max-w-lg space-y-12">
                   {isFlashing ? (
                     <div className="text-7xl sm:text-9xl font-black text-white text-center drop-shadow-2xl">{activeNumber !== null ? (activeNumber > 0 ? `+${activeNumber}` : activeNumber) : ''}</div>
                   ) : isReadyForInput ? (
                     <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-white/10 shadow-2xl space-y-6">
                        <Input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && processTurn(parseInt(inputValue) === currentQuestion?.answer)} className="h-16 text-center text-4xl font-black rounded-2xl bg-white/10 border-white/20 text-white" placeholder="???" />
                        <Button onClick={() => processTurn(parseInt(inputValue) === currentQuestion?.answer)} className="w-full h-14 rounded-2xl bg-primary text-white">SUBMIT</Button>
                     </div>
                   ) : <div className="text-white font-black animate-pulse">Get Ready...</div>}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {bubbles.map(b => (
                    <div key={b.id} onClick={() => !b.isQuestion && processTurn(b.isCorrect)} className={cn("absolute bottom-[-150px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl", b.isQuestion ? 'w-max px-8 h-16 bg-yellow-400 border-yellow-500 rounded-3xl' : 'w-24 h-24 sm:w-28 sm:h-28 bg-pink-500 border-pink-600 rounded-full')} style={{ left: `${b.left}%`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`, transform: 'translateX(-50%)' }}>
                        <span className="text-white font-black text-center">{b.isQuestion ? currentQuestion?.text : b.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {gameState === 'searching' && (
             <div className="absolute inset-0 flex items-center justify-center z-[100]"><div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                <Card className="w-full max-w-sm rounded-[2.5rem] border-none shadow-2xl p-10 text-center"><Loader2 className="animate-spin w-12 h-12 mx-auto text-primary mb-6"/><h2 className="text-2xl font-black uppercase italic">Scanning Arena</h2><p className="text-muted-foreground font-medium mt-2">Waiting for a real student to join...</p></Card>
             </div>
          )}
      </div>
      {gameState === 'completed' && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[10001] flex items-center justify-center p-4">
            <Card className="w-full max-w-sm rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white animate-in zoom-in-95">
               <div className={cn("p-8 text-center text-white", duel?.winnerId === user?.uid ? "bg-green-600" : "bg-slate-800")}>
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-300"/>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter">{duel?.winnerId === user?.uid ? 'Victory!' : 'Match End'}</h2>
               </div>
               <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-center text-center">
                     <div className="relative">
                        <Avatar className="h-16 w-16 mb-2 border-2 border-slate-100"><AvatarImage src={duel?.challengerPhoto}/></Avatar>
                        {duel?.winnerId === duel?.challengerId && <Badge className="absolute -top-2 -right-2 bg-green-500 text-white font-black text-[8px] px-2 py-0.5">WINNER</Badge>}
                        <p className="text-[10px] font-black uppercase text-slate-400">{duel?.challengerName}</p>
                        <p className="text-3xl font-black">{duel?.challengerScore}</p>
                     </div>
                     <div className="text-xl font-black text-slate-200">VS</div>
                     <div className="relative">
                        <Avatar className="h-16 w-16 mb-2 border-2 border-slate-100"><AvatarImage src={duel?.opponentPhoto}/></Avatar>
                        {duel?.winnerId === duel?.opponentId && <Badge className="absolute -top-2 -right-2 bg-green-500 text-white font-black text-[8px] px-2 py-0.5">WINNER</Badge>}
                        <p className="text-[10px] font-black uppercase text-slate-400">{duel?.opponentName}</p>
                        <p className="text-3xl font-black">{duel?.opponentScore}</p>
                     </div>
                  </div>
                  <Button variant="ghost" onClick={() => router.push('/game')} className="w-full h-10 rounded-xl font-bold uppercase text-xs">Exit Arena</Button>
               </CardContent>
            </Card>
        </div>
      )}
    </div>, document.body
  );
}
