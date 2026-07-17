'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BrainCircuit, Trophy, Timer, Zap, CheckCircle2, XCircle, ArrowRight, RotateCcw, Loader2, Heart, Swords, Users, User, LayoutGrid, ChevronRight, Share2, Clock } from 'lucide-react';
import { useSound } from '@/hooks/useSound';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { startMatchmaking, getRecentOpponents } from '@/lib/matchmaking';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const ROUNDS_PER_LEVEL = 5;
const INITIAL_LIVES = 3;
const MAX_DAILY_LEVELS = 5;

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
  const [gameState, setGameState] = useState<'lobby' | 'ready' | 'memorizing' | 'playing' | 'feedback' | 'complete' | 'fail' | 'limit_reached'>('lobby');
  
  const [gridSize, setGridSize] = useState(3);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userSelection, setUserSelection] = useState<number[]>([]);
  const [wrongSelection, setWrongSelection] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [finalMasteryPoints, setFinalMasteryPoints] = useState(0);
  const [recentOpponents, setRecentOpponents] = useState<{uid: string, name: string, photo: string}[]>([]);

  useEffect(() => {
    if (profile) {
      setLevel(profile.lastMemoryLevel || 1);
      const today = new Date().toISOString().split('T')[0];
      if (profile.lastMemoryDate === today && (profile.dailyMemoryLevelsSolved || 0) >= MAX_DAILY_LEVELS) {
        setGameState('limit_reached');
      }
    }
    if (user) {
      getRecentOpponents(user.uid).then(setRecentOpponents);
    }
  }, [profile, user]);

  const handleStartDuel = async (type: 'match' | 'friend') => {
    if (!user || !profile) return;
    setIsSubmitting(true);
    try {
      const duelId = await startMatchmaking(user.uid, profile, 'matrix', `Level ${level}`);
      router.push(`/game/duels/${duelId}`);
    } catch (e) {
      toast({ title: "Matchmaking failed", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInviteLink = () => {
    const link = `${window.location.origin}/game/duels`;
    navigator.clipboard.writeText(link);
    toast({ title: "Invite Link Copied!", description: "Share this link with a friend to join the lobby." });
  };

  const getLevelParams = useCallback((lvl: number) => {
    let size = 3;
    let tileCount = 3;
    let memorizeTime = 2500;
    let playTime = 5000;
    let colorClass = "bg-teal-400 border-teal-500";
    let shapeClass = "rounded-2xl";

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
      colorClass = "bg-indigo-400 border-indigo-500";
      shapeClass = "rounded-3xl";
    } else {
      size = 5;
      tileCount = 8 + Math.floor(lvl / 10);
      memorizeTime = 2000;
      playTime = 12000;
      colorClass = "bg-rose-400 border-rose-500";
      shapeClass = "rounded-full";
    }

    return { size, tileCount, memorizeTime: Math.max(800, memorizeTime), playTime: Math.max(3000, playTime), colorClass, shapeClass };
  }, []);

  const handleTimeOut = useCallback(() => {
    if (gameState !== 'playing') return;
    setLives(l => {
      const next = l - 1;
      if (next <= 0) setGameState('fail');
      else setGameState('ready');
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
      if (!newPattern.includes(rand)) newPattern.push(rand);
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
    if (gameState === 'ready') {
      const t = setTimeout(() => generatePattern(), 1500);
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
            setGameState('ready');
          } else {
            finishGame(score + 1);
          }
        }, 1000);
      }
    } else {
      setWrongSelection(index);
      setLives(l => l - 1);
      playSound('wrong');
      if (lives <= 1) setGameState('fail');
      else {
        setTimeout(() => {
          setWrongSelection(null);
          setUserSelection([]);
          setGameState('memorizing');
          const { memorizeTime, playTime } = getLevelParams(level);
          setTimeout(() => { setTimeLeft(playTime); setGameState('playing'); }, memorizeTime);
        }, 800);
      }
    }
  };

  const finishGame = async (finalScore: number) => {
    setIsSubmitting(true);
    const accuracy = (finalScore / ROUNDS_PER_LEVEL) * 100;
    if (accuracy >= 80) {
      if (user) {
        const bonus = 20; 
        const totalEarned = finalScore + bonus;
        setFinalMasteryPoints(totalEarned);
        await addPoints(user.uid, totalEarned);
        await recordDailyPractice(user.uid);
        const db = getFirestore(firebaseApp);
        const today = new Date().toISOString().split('T')[0];
        const dailySolved = (profile?.lastMemoryDate === today ? profile.dailyMemoryLevelsSolved || 0 : 0) + 1;
        await updateDoc(doc(db, "users", user.uid), { lastMemoryLevel: level + 1, dailyMemoryLevelsSolved: dailySolved, lastMemoryDate: today, updatedAt: serverTimestamp() });
        addDoc(collection(db, 'testResults'), { userId: user.uid, testId: 'matrix-flash' as any, difficulty: `Level ${level}`, score: finalScore, totalQuestions: ROUNDS_PER_LEVEL, accuracy, earnedPoints: totalEarned, createdAt: serverTimestamp(), isGame: true });
      }
      setGameState('complete');
      playSound('success');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, zIndex: 10001 });
    } else setGameState('fail');
    setIsSubmitting(false);
  };

  if (gameState === 'lobby' || gameState === 'limit_reached') {
    return (
      <div className="max-w-4xl mx-auto space-y-12 pb-20 animate-in fade-in duration-500 mt-10 px-4">
        <div className="text-center space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-6 py-1.5 rounded-full font-black uppercase text-xs tracking-widest">Cognitive Hub</Badge>
          <h1 className="text-4xl sm:text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 leading-none">Matrix <span className="text-primary italic whitespace-nowrap">Flash</span></h1>
          <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto">Master spatial visualization. Training starts from Level {level}.</p>
        </div>
        {gameState === 'limit_reached' ? (
          <Card className="max-w-md mx-auto rounded-[2.5rem] border-4 border-orange-200 bg-orange-50/30 p-10 text-center shadow-xl">
             <div className="mx-auto bg-orange-100 p-5 rounded-full w-fit mb-6"><Clock className="w-12 h-12 text-orange-600 animate-pulse" /></div>
             <h2 className="text-2xl font-black uppercase tracking-tight text-orange-900 leading-none">Daily Limit Reached</h2>
             <p className="mt-4 font-bold text-orange-700 leading-relaxed">You've solved {MAX_DAILY_LEVELS} levels today! Return tomorrow to continue from Level {level}.</p>
             <Button asChild variant="outline" className="mt-8 border-orange-300 text-orange-800 hover:bg-orange-100 rounded-xl font-bold"><Link href="/game">Return to Hub</Link></Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
             <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white hover:scale-[1.02] transition-all cursor-pointer group" onClick={() => setGameState('ready')}>
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
                   <CardDescription className="font-bold">Challenge a teammate.</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                   {recentOpponents.length > 0 ? (
                     <div className="space-y-3">
                       <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Recent Rivals</p>
                       {recentOpponents.map(opp => (
                         <Button key={opp.uid} variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl" onClick={() => handleStartDuel('friend')}>
                           <Avatar className="h-6 w-6"><AvatarImage src={opp.photo || undefined}/><AvatarFallback>{opp.name[0]}</AvatarFallback></Avatar>
                           <span className="font-bold text-xs truncate">{opp.name}</span>
                         </Button>
                       ))}
                     </div>
                   ) : (
                     <p className="text-xs text-muted-foreground font-medium italic text-center py-4">Challenge a friend to start a rivalry!</p>
                   )}
                   <Button onClick={handleCopyInviteLink} className="w-full h-12 rounded-xl font-black uppercase text-[10px] tracking-widest"><Share2 className="w-4 h-4 mr-2"/> Copy Invite Link</Button>
                </CardContent>
             </Card>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'complete' || gameState === 'fail') {
    const isWin = gameState === 'complete';
    const canContinue = level < 1000 && (!isWin || (profile?.dailyMemoryLevelsSolved || 0) < MAX_DAILY_LEVELS);
    return (
      <Card className="max-w-md mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden animate-in zoom-in-95 mt-10">
        <div className={cn("p-12 text-center text-white", isWin ? "bg-teal-600" : "bg-red-600")}>
          <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6">
            {isWin ? <Trophy className="w-12 h-12 text-yellow-300" /> : <XCircle className="w-12 h-12" />}
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">{isWin ? 'Level Clear!' : 'Grid Failure'}</h2>
          <p className="font-bold opacity-80 mt-2">{score}/{ROUNDS_PER_LEVEL} Patterns Matched</p>
        </div>
        <CardContent className="p-10 space-y-8">
          <div className="text-center space-y-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Points Earned</p><p className="text-5xl font-black text-primary">{isWin ? finalMasteryPoints : 0}</p></div>
          <div className="grid gap-4">
            {isWin && canContinue ? (
               <Button onClick={() => { setLevel(l => l + 1); setRound(1); setScore(0); setLives(INITIAL_LIVES); setGameState('ready'); }} className="h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl bg-teal-600 hover:bg-teal-700">Next Level <ArrowRight className="ml-2 w-6 h-6" /></Button>
            ) : isWin ? (
               <Button onClick={() => setGameState('limit_reached')} className="h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl bg-slate-900 text-white">Daily Limit Reached</Button>
            ) : (
               <Button onClick={() => { setRound(1); setScore(0); setLives(INITIAL_LIVES); setGameState('ready'); }} className="h-16 rounded-2xl text-xl font-black uppercase tracking-widest shadow-xl bg-slate-900 hover:bg-black text-white"><RotateCcw className="mr-2 w-6 h-6" /> Retry Level {level}</Button>
            )}
            <Button variant="ghost" onClick={() => setGameState('lobby')} className="font-black uppercase tracking-widest text-[10px] h-12 text-slate-400">Back to Hub</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { colorClass, shapeClass } = getLevelParams(level);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 mt-10 px-4">
      <div className="flex justify-between items-center px-4">
         <div className="space-y-1"><h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 italic">Matrix Flash</h1>
            <div className="flex gap-2"><Badge className="bg-slate-900 text-white border-none font-black text-[10px] px-3">LEVEL {level}</Badge><Badge variant="outline" className="font-black text-[10px] px-3 border-slate-200 text-slate-700">ROUND {round}/{ROUNDS_PER_LEVEL}</Badge></div>
         </div>
         <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white shadow-sm">
            {Array.from({length: INITIAL_LIVES}).map((_, i) => (<Heart key={i} className={cn("w-6 h-6 transition-all duration-300", i < lives ? "text-red-500 fill-red-500" : "text-slate-200")} />))}
         </div>
      </div>
      <Card className="rounded-[3rem] shadow-2xl border-none overflow-hidden min-h-[500px] flex flex-col bg-slate-900 relative">
        <div className="bg-white/5 p-4 shrink-0 border-b border-white/5"><Progress value={(round / ROUNDS_PER_LEVEL) * 100} className="h-1.5 bg-white/10" /></div>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Status container with fixed height to prevent layout shift */}
            <div className="h-24 flex flex-col items-center justify-center mb-6 w-full relative">
              {gameState === 'ready' && (
                <div className="animate-in zoom-in-50 duration-300 text-center">
                  <h2 className="text-4xl font-black text-white uppercase italic tracking-widest">Get Ready!</h2>
                  <p className="text-primary font-black uppercase text-xs tracking-[0.3em] mt-2">Round {round} incoming...</p>
                </div>
              )}
              {gameState === 'memorizing' && (
                <div className="animate-in fade-in duration-300 text-teal-400 flex items-center gap-3">
                  <Zap className="w-5 h-5 fill-teal-400 animate-pulse" />
                  <p className="text-sm font-black uppercase tracking-[0.3em]">Memorize Pattern</p>
                </div>
              )}
              {gameState === 'playing' && (
                <div className="animate-in fade-in duration-300 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-3 text-sky-400">
                    <Timer className="w-5 h-5 animate-pulse" />
                    <p className="text-sm font-black uppercase tracking-[0.3em]">Reconstruct Matrix</p>
                  </div>
                  <div className={cn("text-3xl font-black tabular-nums transition-colors", timeLeft <= 3000 ? "text-red-500 animate-pulse" : "text-white")}>
                    {(timeLeft / 1000).toFixed(1)}s
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:gap-4 p-4 bg-white/5 rounded-[2.5rem] border-4 border-white/10 shadow-inner" style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`, width: '100%', maxWidth: gridSize === 3 ? '320px' : gridSize === 4 ? '400px' : '500px' }}>
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const isCorrectPattern = pattern.includes(i);
                const isSelected = userSelection.includes(i);
                const isWrong = wrongSelection === i;
                const showHint = gameState === 'memorizing' || gameState === 'feedback';
                return (<div key={i} onClick={() => handleTileClick(i)} className={cn("aspect-square transition-all duration-300 cursor-pointer shadow-lg border-b-4 border-r-4 active:border-0 active:translate-y-1", shapeClass, !showHint && !isSelected && !isWrong && "bg-slate-700 border-slate-800 hover:bg-slate-600", showHint && isCorrectPattern && cn(colorClass, "scale-[0.98] ring-8 ring-white/20"), showHint && !isCorrectPattern && "bg-slate-800 border-slate-900 opacity-40", gameState === 'playing' && isSelected && cn(colorClass, "scale-[0.98] ring-8 ring-white/20 animate-in zoom-in-90"), isWrong && "bg-red-500 border-red-600 ring-8 ring-red-500/20")} />);
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
