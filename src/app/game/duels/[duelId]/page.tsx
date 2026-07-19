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
import { Swords, Loader2, Trophy, Crown, Zap, Users, X, RotateCcw, Heart, Star, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSound } from '@/hooks/useSound';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { spawnBotForDuel, startMatchmaking } from '@/lib/matchmaking';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const DOTS_ANIMATION = `@keyframes dots { 0% { content: "."; } 33% { content: ".."; } 66% { content: "..."; } 100% { content: "."; } } .animate-dots::after { content: "."; animation: dots 1.5s infinite; }`;

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

  // Flash Anzan States
  const [isFlashing, setIsFlashing] = useState(false);
  const [activeNumber, setActiveNumber] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isReadyForInput, setIsReadyForInput] = useState(false);

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const botTriggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const answersRef = useRef<(number | null)[]>([]);
  const flashIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isChallenger = duel?.challengerId === user?.uid;
  const gameState = duel?.status === 'completed' ? 'completed' : duel?.status === 'active' ? 'playing' : 'searching';
  const currentQuestion = duel?.questions[currentIdx];

  const config = useMemo(() => ({
    speed: 8, answerRange: [12, 37, 63, 88], qDelay: 0.4, variance: 1.5 
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
             setTimeout(() => { setShowMatchTransition(false); setHasStarted(true); }, 3000);
          }
          if (duelData.rematchChallenger && duelData.rematchOpponent) startRematch();
        }
      },
      async (err) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `duels/${duelId}`, operation: 'get' }))
    );
  }, [user, duelId, hasStarted]);

  useEffect(() => { answersRef.current = answers; }, [answers]);

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
      if (payload.status === 'completed') {
        playSound('success');
        if (payload.winnerId === user.uid) confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, zIndex: 10001 });
      }
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  }, [duel, user, duelId, isSubmitting, addPoints, playSound]);

  const processTurn = useCallback((isCorrect: boolean, answer: number | null) => {
    const newAnswers = [...answersRef.current];
    newAnswers[currentIdx] = answer;
    setAnswers(newAnswers);
    const pts = 10;
    let nextScore = localScore;
    if (isCorrect) { nextScore = localScore + pts; setLocalScore(nextScore); playSound('correct'); }
    else { setLives(l => l - 1); playSound('wrong'); if (lives <= 1) { submitDuel(nextScore); return; } }

    setTimeout(() => {
      if (currentIdx < (duel?.questions.length || 0) - 1) setCurrentIdx(p => p + 1);
      else submitDuel(nextScore);
    }, 150);
  }, [currentIdx, duel, localScore, playSound, submitDuel, lives]);

  const startFlashSequence = useCallback(() => {
    if (!currentQuestion?.sequence) return;
    setIsFlashing(true);
    setIsReadyForInput(false);
    let idx = 0;
    const seq = currentQuestion.sequence;
    const delay = currentQuestion.delay || 1000;
    flashIntervalRef.current = setInterval(() => {
      if (idx >= seq.length) {
        clearInterval(flashIntervalRef.current!);
        setIsFlashing(false);
        setIsReadyForInput(true);
        return;
      }
      setActiveNumber(seq[idx]);
      playSound('timerTick');
      setTimeout(() => setActiveNumber(null), delay * 0.8);
      idx++;
    }, delay);
  }, [currentQuestion, playSound]);

  const generateBubbles = useCallback(() => {
    if (!duel || !hasStarted || duel.status !== 'active' || duel.mode === 'flash') return;
    if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
    const q = duel.questions[currentIdx];
    if (!q) return;
    const batchId = `${duel.id}-${currentIdx}`;
    const newBubbles: Bubble[] = [];
    newBubbles.push({ id: `q-${batchId}`, value: -1, isCorrect: false, isQuestion: true, left: 50, duration: config.speed, delay: 0 });
    q.options.forEach((opt, i) => {
      newBubbles.push({ id: `a-${batchId}-${i}`, value: opt, isCorrect: opt === q.answer, left: config.answerRange[i], duration: config.speed + 2 + Math.random() * config.variance, delay: config.qDelay + (i * 0.1) });
    });
    setBubbles(newBubbles);
    const maxTime = (config.speed + 4) * 1000;
    questionTimeoutRef.current = setTimeout(() => { if (!isSubmitting) processTurn(false, null); }, maxTime);
  }, [duel, currentIdx, hasStarted, isSubmitting, config, processTurn]);

  useEffect(() => {
    if (hasStarted && duel?.status === 'active') {
      if (duel.mode === 'flash') startFlashSequence();
      else generateBubbles();
    }
    return () => { 
      if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current); 
      if (flashIntervalRef.current) clearInterval(flashIntervalRef.current);
    };
  }, [currentIdx, duel?.status, hasStarted, generateBubbles, startFlashSequence, duel?.mode]);

  useEffect(() => {
    if (duel?.status === 'waiting' && user?.uid === duel.challengerId && !botTriggerTimeoutRef.current) {
        botTriggerTimeoutRef.current = setTimeout(() => spawnBotForDuel(duelId), 6000);
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
        }, 1800 + Math.random() * 1500);
      };
      simulateNext();
    }
    return () => { if (botIntervalRef.current) clearTimeout(botIntervalRef.current); };
  }, [duel?.status, duel?.opponentType, duelId, duel?.challengerFinished, duel?.questions.length, duel?.challengerScore, hasStarted]);

  const handleRematch = async () => {
    if (!duel || !user) return;
    setRematchRequested(true);
    await updateDoc(doc(getFirestore(firebaseApp), "duels", duelId), isChallenger ? { rematchChallenger: true } : { rematchOpponent: true });
    if (duel.opponentType === 'bot') setTimeout(startRematch, 1000);
  };

  const startRematch = async () => {
    if (!duel || !user || !profile) return;
    const newDuelId = await startMatchmaking(user.uid, profile, duel.mode as any, duel.difficulty);
    router.push(`/game/duels/${newDuelId}`);
  };

  if (!mounted) return null;
  if (loading) return <div className="fixed inset-0 bg-slate-900 z-[10000] flex items-center justify-center"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;

  return createPortal(
    <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col overflow-hidden h-screen w-screen">
      <style jsx global>{`${DOTS_ANIMATION} @keyframes bubble-rise { from { transform: translate(-50%, 0); } to { transform: translate(-50%, -130vh); } } .animate-bubble-rise { animation: bubble-rise linear forwards; } @keyframes bubble-rise-bg { 0% { transform: translateY(0) scale(0.5); opacity: 0; } 10% { opacity: 0.4; } 90% { opacity: 0.4; } 100% { transform: translateY(-110vh) scale(1.2); opacity: 0; } }`}</style>
      <div className="absolute inset-0 z-0">
          <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Game%20Background.webp?alt=media" alt="Arena" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/20" />
      </div>
      <div className="relative bg-black/40 backdrop-blur-md p-4 border-b border-white/10 flex justify-between items-center z-50 shrink-0">
          <div className="flex items-center gap-3 text-white min-w-0 flex-1">
             <Avatar className="h-10 w-10 border-2 border-primary shrink-0"><AvatarImage src={isChallenger ? duel?.challengerPhoto : duel?.opponentPhoto} /><AvatarFallback>{(isChallenger ? duel?.challengerName : duel?.opponentName)?.[0]}</AvatarFallback></Avatar>
             <div className="min-w-0 flex-1">
                <CardTitle className="text-sm sm:text-base font-black uppercase flex items-center gap-1.5 italic truncate leading-none"><Swords className="w-3 h-3 text-orange-500" /> Duel Arena</CardTitle>
                <CardDescription className="text-sky-300 font-bold text-[10px]">Group {duel?.difficulty} • Round {currentIdx + 1}</CardDescription>
             </div>
          </div>
          <div className="flex items-center gap-4 text-white">
             <div className="text-right">
                <p className="text-[10px] font-black uppercase text-sky-200 leading-none mb-1">{duel?.challengerName}</p>
                <p className="text-2xl font-black text-orange-500 leading-none">{isChallenger ? localScore : (duel?.challengerScore || 0)}</p>
             </div>
             <div className="text-2xl font-black text-white/20 italic">VS</div>
             <div className="text-left">
                <p className="text-[10px] font-black uppercase text-sky-200 leading-none mb-1">{duel?.opponentName || 'Searching...'}</p>
                <p className="text-2xl font-black text-primary leading-none">{!isChallenger ? localScore : (duel?.opponentScore || 0)}</p>
             </div>
             <Button variant="ghost" size="icon" className="text-white/40 hover:text-white" onClick={() => router.push('/game')}><X className="w-6 h-6"/></Button>
          </div>
      </div>
      <Progress value={(currentIdx / (duel?.questions.length || 1)) * 100} className="relative h-1 bg-white/5 rounded-none z-50" />
      <div className="relative flex-1 flex flex-col justify-center overflow-hidden z-10 w-full">
          {duel?.status === 'active' && hasStarted && (
            <div className="w-full h-full flex flex-col items-center justify-center p-8">
              {duel.mode === 'flash' ? (
                <div className="w-full max-w-lg space-y-12">
                   {isFlashing ? (
                     <div className="text-center animate-in zoom-in-95 duration-200">
                        <div className={cn("text-7xl sm:text-9xl font-black tracking-tighter drop-shadow-2xl text-white", activeNumber && activeNumber < 0 && "text-red-500")}>
                          {activeNumber !== null ? (activeNumber > 0 ? `+${activeNumber}` : activeNumber) : ''}
                        </div>
                     </div>
                   ) : isReadyForInput ? (
                     <div className="bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] border-2 border-white/10 shadow-2xl space-y-6">
                        <h3 className="text-2xl font-black text-center text-white uppercase italic">Sequence Result?</h3>
                        <div className="flex gap-3">
                           <Input type="number" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && processTurn(parseInt(inputValue) === currentQuestion?.answer, parseInt(inputValue))} className="h-16 text-center text-4xl font-black rounded-2xl bg-white/10 border-white/20 text-white" placeholder="???" />
                           <Button onClick={() => processTurn(parseInt(inputValue) === currentQuestion?.answer, parseInt(inputValue))} className="h-16 w-16 rounded-2xl bg-primary text-white"><ChevronRight/></Button>
                        </div>
                     </div>
                   ) : <div className="text-white font-black text-xl animate-pulse">Get Ready...</div>}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {bubbles.map(b => (
                    <div key={b.id} onClick={() => !b.isQuestion && processTurn(b.isCorrect, b.value)} className={cn("absolute bottom-[-150px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl transition-all active:scale-95", b.isQuestion ? 'w-max px-8 h-16 bg-yellow-400 border-yellow-500 rounded-3xl' : 'w-24 h-24 sm:w-32 sm:h-32 bg-pink-500 border-pink-600 rounded-full')} style={{ left: `${b.left}%`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`, transform: 'translateX(-50%)' }}>
                        <span className={cn("text-white font-black text-center", b.isQuestion ? getQuestionFontSize(currentQuestion?.text || "") : "text-3xl")}>{b.isQuestion ? currentQuestion?.text : b.value}</span>
                    </div>
                  ))}
                </div>
              )}
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
                     <div><p className="text-[10px] font-black uppercase text-slate-400">{duel?.challengerName}</p><p className="text-3xl font-black">{duel?.challengerScore}</p></div>
                     <div className="text-xl font-black text-slate-200">VS</div>
                     <div><p className="text-[10px] font-black uppercase text-slate-400">{duel?.opponentName}</p><p className="text-3xl font-black">{duel?.opponentScore}</p></div>
                  </div>
                  <Button onClick={handleRematch} disabled={rematchRequested} className="w-full h-12 rounded-xl font-black uppercase tracking-widest">{rematchRequested ? 'Waiting...' : 'Rematch'}</Button>
                  <Button variant="ghost" onClick={() => router.push('/game')} className="w-full h-10 rounded-xl font-bold uppercase text-xs">Exit Arena</Button>
               </CardContent>
            </Card>
        </div>
      )}
    </div>, document.body
  );
}
