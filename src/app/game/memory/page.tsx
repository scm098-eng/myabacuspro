'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Trophy, Timer, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2, Heart, ShieldAlert, Star, Swords, Users, User, LayoutGrid, ChevronRight, Share2 } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { startMatchmaking, getRecentOpponents } from '@/lib/matchmaking';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const ROUNDS_PER_LEVEL = 5;
const INITIAL_LIVES = 3;

const FloatingParticle = ({ index }: { index: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const randomOffsetX = (Math.random() - 0.5) * 100;
    const randomOffsetY = (Math.random() - 0.5) * 100;
    const targetX = 400 + Math.random() * 400;
    const targetY = -800 - Math.random() * 400;
    const duration = 1.2 + Math.random() * 0.8;
    const delay = Math.random() * 0.4;

    setStyle({
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: `translate(calc(-50% + ${randomOffsetX}px), calc(-50% + ${randomOffsetY}px))`,
      zIndex: 100,
      pointerEvents: 'none',
      animation: `float-to-profile ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`,
      '--target-x': `${targetX}px`,
      '--target-y': `${targetY}px`,
    } as any);
  }, []);

  return (
    <div style={style}>
      {index % 2 === 0 ? (
        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
      ) : (
        <div className="w-5 h-5 bg-orange-400 rounded-full border-2 border-orange-600 shadow-lg flex items-center justify-center text-[10px] font-bold text-orange-900 shadow-orange-500/50">₹</div>
      )}
    </div>
  );
};

export default function PatternMemoryPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/game_bg.jpg?alt=media');
  const { user, profile, addPoints, recordDailyPractice } = useAuth();
  const router = useRouter();
  const { playSound } = useSound();
  const { toast } = useToast();

  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameState, setGameState] = useState<'lobby' | 'idle' | 'memorizing' | 'playing' | 'feedback' | 'complete' | 'fail'>('lobby');
  
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [wrongSelection, setWrongSelection] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finalMasteryPoints, setFinalMasteryPoints] = useState(0);
  const [showSubmissionAnim, setShowSubmissionAnim] = useState(false);
  const [recentOpponents, setRecentOpponents] = useState<{uid: string, name: string, photo: string}[]>([]);

  useEffect(() => {
    if (user) {
      getRecentOpponents(user.uid).then(setRecentOpponents);
    }
  }, [user]);

  const handleStartDuel = async (type: 'match' | 'friend', friendId?: string) => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      const duelId = await startMatchmaking(user.uid, profile, 'matrix', `Level ${level}`);
      router.push(`/game/duels/${duelId}`);
    } catch (e) {
      toast({ title: "Failed to start duel", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine game parameters based on level
  const getLevelParams = useCallback((lvl: number) => {
    let size = 3;
    let tileCount = 3;
    let memorizeTime = 2500;
    let playTime = 5000;

    if (lvl <= 5) {
      size = 3;
      tileCount = 3 + Math.floor(lvl / 2);
      memorizeTime = 2500 - (lvl * 200);
      playTime = 5000 + (lvl * 500); 
    } else if (lvl <= 15) {
      size = 4;
      tileCount = 5 + Math.floor((lvl - 5) / 3);
      memorizeTime = 3000 - ((lvl - 5) * 150);
      playTime = 8000 + ((lvl - 5) * 400);
    } else {
      size = 5;
      tileCount = 8 + Math.floor((lvl - 15) / 5);
      memorizeTime = 3500 - ((lvl - 15) * 100);
      playTime = 12000 + ((lvl - 15) * 300);
    }

    return { 
      size, 
      tileCount, 
      memorizeTime: Math.max(800, memorizeTime), 
      playTime: Math.max(3000, playTime) 
    };
  }, []);

  const handleTimeOut = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setLives(l => {
      const next = l - 1;
      if (next <= 0) {
        setGameState('fail');
      } else {
        setGameState('idle'); 
      }
      return next;
    });
    
    playSound('wrong');
  }, [gameState, playSound]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 100;
          if (next <= 0) {
            clearInterval(interval);
            handleTimeOut();
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft, handleTimeOut]);

  const generatePattern = useCallback(() => {
    const { size, tileCount, memorizeTime, playTime } = getLevelParams(level);
    setGridSize(size);
    
    const newPattern: number[] = [];
    const totalTiles = size * size;
    
    while (newPattern.length < tileCount) {
      const rand = Math.floor(Math.random() * totalTiles);
      if (!newPattern.includes(rand)) {
        newPattern.push(rand);
      }
    }
    
    setPattern(newPattern);
    setUserSelection([]);
    setWrongSelection(null);
    setGameState('memorizing');

    setTimeout(() => {
      setTimeLeft(playTime);
      setGameState('playing');
    }, memorizeTime);
  }, [level, getLevelParams]);

  useEffect(() => {
    if (gameState === 'idle') {
      const t = setTimeout(() => generatePattern(), 1000);
      return () => clearTimeout(t);
    }
  }, [gameState, generatePattern]);

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing' || userSelection.includes(index) || isSubmitting) return;

    if (pattern.includes(index)) {
      const newSelection = [...userSelection, index];
      setUserSelection(newSelection);
      playSound('correct');

      if (newSelection.length === pattern.length) {
        setGameState('feedback');
        setScore(s => s + 1);
        setTimeout(() => {
          if (round < ROUNDS_PER_LEVEL) {
            setRound(r => r + 1);
            setGameState('idle');
          } else {
            finishGame(score + 1);
          }
        }, 1000);
      }
    } else {
      setWrongSelection(index);
      setLives(l => l - 1);
      playSound('wrong');
      
      if (lives <= 1) {
        setGameState('fail');
      } else {
        setTimeout(() => {
          setWrongSelection(null);
          setUserSelection([]);
          setGameState('memorizing');
          const { memorizeTime, playTime } = getLevelParams(level);
          setTimeout(() => {
            setTimeLeft(playTime);
            setGameState('playing');
          }, memorizeTime);
        }, 800);
      }
    }
  };

  const finishGame = async (finalScore: number) => {
    setIsSubmitting(true);
    const accuracy = (finalScore / ROUNDS_PER_LEVEL) * 100;
    
    if (accuracy >= 80) {
      if (user) {
        const bonus = level * 10;
        setFinalMasteryPoints(bonus);
        await addPoints(user.uid, bonus);
        await recordDailyPractice(user.uid);

        const db = getFirestore(firebaseApp);
        const resultData = {
          userId: user.uid,
          testId: 'matrix-flash' as any,
          difficulty: `Level ${level}`,
          score: finalScore,
          totalQuestions: ROUNDS_PER_LEVEL,
          accuracy,
          timeSpent: 0,
          timeLeft: 0,
          earnedPoints: bonus,
          createdAt: serverTimestamp(),
          isGame: true
        };
        addDoc(collection(db, 'testResults'), resultData);
      }
      setGameState('complete');
      playSound('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => setShowSubmissionAnim(true), 600);
    } else {
      setGameState('fail');
    }
    setIsSubmitting(false);
  };

  if (gameState === 'lobby') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500 mt-10">
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black uppercase text-xs tracking-widest">Cognitive Hub</Badge>
          <h1 className="text-4xl sm:text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">
            Matrix <span className="text-primary italic">Flash</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Master spatial visualization and short-term memory through high-speed pattern drills.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setGameState('idle')}>
              <CardHeader className="p-8 text-center bg-teal-50 rounded-t-[2.5rem] border-b">
                 <div className="mx-auto bg-teal-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><User className="w-8 h-8 text-teal-600" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight">Train Alone</CardTitle>
                 <CardDescription className="font-bold">Standard single-player progression.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center"><Button variant="ghost" className="font-black text-teal-600">Start Session <ChevronRight className="ml-1 w-4 h-4"/></Button></CardContent>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => handleStartDuel('match')}>
              <CardHeader className="p-8 text-center bg-white/5 rounded-t-[2.5rem] border-b border-white/10">
                 <div className="mx-auto bg-primary/20 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Swords className="w-8 h-8 text-primary" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Find Duel</CardTitle>
                 <CardDescription className="text-slate-400 font-bold">Battle anyone online instantly.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center"><Button variant="ghost" className="font-black text-primary">Join Matchmaking <ChevronRight className="ml-1 w-4 h-4"/></Button></CardContent>
           </Card>

           <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all group overflow-hidden">
              <CardHeader className="p-8 text-center bg-indigo-50 border-b">
                 <div className="mx-auto bg-indigo-100 p-4 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform"><Users className="w-8 h-8 text-indigo-600" /></div>
                 <CardTitle className="text-2xl font-black uppercase tracking-tight">Play Friend</CardTitle>
                 <CardDescription className="font-bold">Challenge a specific teammate.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                 {recentOpponents.length > 0 ? (
                   <div className="space-y-3">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Recent Rivals</p>
                     {recentOpponents.map(opp => (
                       <Button key={opp.uid} variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={() => handleStartDuel('friend', opp.uid)}>
                         <Avatar className="h-6 w-6"><AvatarImage src={opp.photo}/><AvatarFallback>{opp.name[0]}</AvatarFallback></Avatar>
                         <span className="font-bold text-xs truncate">{opp.name}</span>
                       </Button>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center space-y-2 py-4">
                     <p className="text-xs text-muted-foreground font-medium italic px-4">No recent opponents found. Share your lobby link to start a rivalry!</p>
                   </div>
                 )}
                 <Button onClick={() => handleStartDuel('match')} className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest"><Share2 className="w-4 h-4 mr-2"/> Create Private Link</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    );
  }

  if (gameState === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-6">
        <Loader2 className="w-16 h-16 animate-spin text-teal-500" />
        <h2 className="text-2xl font-black uppercase italic tracking-widest text-slate-800">Constructing Level {level}...</h2>
      </div>
    );
  }

  if (gameState === 'complete' || gameState === 'fail') {
    const isWin = gameState === 'complete';
    return (
      <Card className="max-w-md mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95 mt-10">
        <div className={cn("p-12 text-center text-white", isWin ? "bg-teal-600" : "bg-red-600")}>
          <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
            {isWin ? <Trophy className="w-12 h-12 text-yellow-300" /> : <XCircle className="w-12 h-12" />}
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">{isWin ? 'Perfect Memory!' : 'Grid Failure'}</h2>
          <p className="font-bold opacity-80 mt-2">{score}/{ROUNDS_PER_LEVEL} Patterns Matched</p>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="text-center space-y-6">
            <div className="space-y-1 relative">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mastery Points Earned</p>
                <div className="relative inline-block">
                  <p className="text-5xl font-black text-primary drop-shadow-sm">{isWin ? finalMasteryPoints : 0}</p>
                  {showSubmissionAnim && Array.from({ length: 20 }).map((_, i) => (
                    <FloatingParticle key={i} index={i} />
                  ))}
                </div>
            </div>
          </div>
          <div className="grid gap-4">
            {isWin ? (
               <Button onClick={() => { setLevel(l => l + 1); setRound(1); setScore(0); setLives(INITIAL_LIVES); setGameState('idle'); }} className="h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl bg-teal-600 hover:bg-teal-700">Next Level <ArrowRight className="ml-2 w-6 h-6" /></Button>
            ) : (
               <Button onClick={() => { setRound(1); setScore(0); setLives(INITIAL_LIVES); setGameState('idle'); }} className="h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl bg-slate-900 hover:bg-black text-white"><RotateCcw className="mr-2 w-6 h-6" /> Retry Matrix</Button>
            )}
            <Button variant="ghost" onClick={() => setGameState('lobby')} className="font-black uppercase tracking-widest text-[10px] h-12 text-slate-400">Back to Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { playTime } = getLevelParams(level);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 mt-10 px-4">
      <div className="flex justify-between items-center px-4">
         <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 italic">Matrix Flash</h1>
            <div className="flex gap-2">
              <Badge className="bg-teal-600 text-white border-none font-black text-[10px] px-3">LEVEL {level}</Badge>
              <Badge variant="outline" className="font-black text-[10px] px-3 border-teal-200 text-teal-700">ROUND {round}/{ROUNDS_PER_LEVEL}</Badge>
            </div>
         </div>
         <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white shadow-sm">
            {Array.from({length: INITIAL_LIVES}).map((_, i) => (
                <Heart key={i} className={cn("w-6 h-6 transition-all duration-300", i < lives ? "text-red-500 fill-red-500" : "text-slate-200")} />
            ))}
         </div>
      </div>

      <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden min-h-[500px] flex flex-col bg-slate-900 relative">
        <div className="bg-white/5 p-4 shrink-0 border-b border-white/5">
          <Progress value={(round / ROUNDS_PER_LEVEL) * 100} className="h-1.5 bg-white/10" />
        </div>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {gameState === 'memorizing' && (
              <div className="mb-10 animate-in fade-in duration-300 text-teal-400 flex items-center gap-3">
                 <Zap className="w-5 h-5 fill-teal-400 animate-pulse" />
                 <p className="text-sm font-black uppercase tracking-[0.3em]">Memorize Pattern</p>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="mb-10 animate-in fade-in duration-300 flex flex-col items-center gap-2">
                 <div className="flex items-center gap-3 text-sky-400">
                    <Timer className="w-5 h-5 animate-pulse" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Reconstruct Matrix</p>
                 </div>
                 <div className={cn("text-3xl font-black tabular-nums transition-colors", timeLeft <= 3000 ? "text-red-500 animate-pulse" : "text-white")}>
                    {(timeLeft / 1000).toFixed(1)}s
                 </div>
              </div>
            )}

            <div 
              className="grid gap-3 sm:gap-4 p-4 bg-white/5 rounded-[2.5rem] border-4 border-white/10 shadow-inner mt-4"
              style={{ 
                gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                width: '100%',
                maxWidth: gridSize === 3 ? '320px' : gridSize === 4 ? '400px' : '500px'
              }}
            >
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const isCorrectPattern = pattern.includes(i);
                const isSelected = userSelection.includes(i);
                const isWrong = wrongSelection === i;
                const showHint = gameState === 'memorizing' || gameState === 'feedback';

                return (
                  <div
                    key={i}
                    onClick={() => handleTileClick(i)}
                    className={cn(
                      "aspect-square rounded-2xl transition-all duration-300 cursor-pointer shadow-lg",
                      "border-b-4 border-r-4 active:border-0 active:translate-y-1",
                      !showHint && !isSelected && !isWrong && "bg-slate-700 border-slate-800 hover:bg-slate-600",
                      showHint && isCorrectPattern && "bg-teal-400 border-teal-500 scale-[0.98] ring-8 ring-teal-400/20",
                      showHint && !isCorrectPattern && "bg-slate-800 border-slate-900 opacity-40",
                      gameState === 'playing' && isSelected && "bg-teal-400 border-teal-500 scale-[0.98] ring-8 ring-teal-400/20 animate-in zoom-in-90",
                      isWrong && "bg-red-500 border-red-600 ring-8 ring-red-500/20 animate-shake"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
