'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { GameLevel, Question } from '@/types';
import { generateGameQuestions } from '@/lib/questions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Heart, X, Star, Trophy, XCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { calculatePoints } from '@/lib/scoring';
import { useSound } from '@/hooks/useSound';
import confetti from 'canvas-confetti';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { PAGE_GUIDES } from '@/lib/constants';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Bubble {
  id: string;
  value: number;
  isCorrect: boolean;
  left: number;
  duration: number;
  delay: number;
  isQuestion?: boolean;
}

const MAX_LIVES = 5;
const MIN_SCORE_TO_PASS = 90;

const getAnswerFontSize = (val: number) => {
    const s = val.toString().length;
    if (s <= 2) return "text-xl sm:text-4xl";
    if (s === 3) return "text-lg sm:text-3xl";
    return "text-sm sm:text-2xl";
};

const getQuestionFontSize = (text: string) => {
  if (text.length > 35) return "text-sm sm:text-base";
  if (text.length > 25) return "text-base sm:text-xl";
  if (text.length > 15) return "text-lg sm:text-3xl";
  return "text-xl sm:text-4xl";
};

const Fish = memo(({ className, duration, flip = false }: { className: string, duration: string, flip?: boolean }) => (
  <div 
    className={cn("absolute pointer-events-none select-none z-0 opacity-80 left-0", className)}
    style={{ animationDuration: duration }}
  >
    <div className={cn(flip && "scale-x-[-1]")}>
      <Image 
        src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish%20(2).webp?alt=media&token=870ea1d9-54e8-4b02-81ee-324662339f71"
        alt="Swimming fish"
        width={100}
        height={60}
        className="animate-[wiggle_1s_ease-in-out_infinite] drop-shadow-md"
      />
    </div>
  </div>
));
Fish.displayName = 'Fish';

const BackgroundBubbles = memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white/30 rounded-full animate-[bubble-rise-bg_linear_infinite]"
        style={{
          width: `${Math.random() * 10 + 4}px`,
          height: `${Math.random() * 10 + 4}px`,
          left: `${Math.random() * 100}%`,
          bottom: "-50px",
          animationDuration: `${Math.random() * 6 + 6}s`,
          animationDelay: `${Math.random() * 12}s`,
        }}
      />
    ))}
  </div>
));
BackgroundBubbles.displayName = 'BackgroundBubbles';

const FloatingParticle = ({ index }: { index: number }) => {
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const targetX = 400 + Math.random() * 400;
    const targetY = -800 - Math.random() * 400;
    const duration = 1.2 + Math.random() * 0.8;
    const delay = Math.random() * 0.4;
    setStyle({
      position: 'absolute',
      left: '50%',
      top: '50%',
      zIndex: 10005,
      pointerEvents: 'none',
      animation: `float-to-profile ${duration}s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s forwards`,
      '--target-x': `${targetX}px`,
      '--target-y': `${targetY}px`,
    } as any);
  }, []);

  return <div style={style}>{index % 2 === 0 ? <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" /> : <div className="w-5 h-5 bg-orange-400 rounded-full border-2 border-orange-600 flex items-center justify-center text-[10px] font-bold text-orange-900">₹</div>}</div>;
};

export function BubbleGame({ levelId, level, levelName }: { levelId: number, level: GameLevel, levelName: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0); 
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'levelComplete' | 'gameOver'>('intro');
  const [finalMasteryPoints, setFinalMasteryPoints] = useState(0);
  const [showSubmissionAnim, setShowSubmissionAnim] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isFinishingRef = useRef(false);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, saveCompletedGameLevel, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

  const config = useMemo(() => ({
    speed: Math.max(4, 10 - (levelId / 40)),
    answerRange: [12, 37, 63, 88], 
    qDelay: 0.4,
    variance: 1.5 
  }), [levelId]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    if (localStorage.getItem('skip_rules_bubble_game') === 'true') setGameState('playing');
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => { setQuestions(generateGameQuestions(level, levelId)); }, [level, levelId]);
  
  const handleStart = () => {
    if (dontShowAgain) localStorage.setItem('skip_rules_bubble_game', 'true');
    setGameState('playing');
    playSound('points');
  };

  const finishGame = useCallback(async (finalScore: number, finalLives: number) => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    const correctAnswers = finalScore / 10;
    const accuracy = (correctAnswers / (questions.length || 1)) * 100;
    if (user) {
      const { earnedPoints } = calculatePoints({ correct: correctAnswers, total: questions.length, answered: questions.length, timeInSeconds: 0, targetTime: 0, level: levelId, isGame: true });
      setFinalMasteryPoints(earnedPoints);
      addPoints(user.uid, earnedPoints);
      const db = getFirestore(firebaseApp);
      addDoc(collection(db, 'testResults'), { userId: user.uid, testId: 'bubble-game', difficulty: levelName, score: correctAnswers, totalQuestions: questions.length, accuracy, earnedPoints, createdAt: serverTimestamp(), isGame: true });
      if (accuracy >= MIN_SCORE_TO_PASS && finalLives > 0) {
        saveCompletedGameLevel(levelId);
        recordDailyPractice(user.uid);
        playSound('success');
        setGameState('levelComplete');
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, zIndex: 10001 });
      } else {
        setGameState('gameOver');
        playSound('wrong');
      }
      if (earnedPoints > 0) setTimeout(() => setShowSubmissionAnim(true), 600);
    }
  }, [questions.length, user, levelId, saveCompletedGameLevel, recordDailyPractice, addPoints, playSound, levelName]);

  const advanceQuestion = useCallback((isCorrectOutcome?: boolean) => {
    if (lives <= 0) return; // Prevent advancing if no lives left

    const nextScore = isCorrectOutcome ? score + 10 : score;
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= questions.length) finishGame(nextScore, lives);
    else setCurrentQuestionIndex(nextIndex);
  }, [currentQuestionIndex, questions.length, score, lives, finishGame]);

  const generateBubbles = useCallback(() => {
    if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
    if (!questions.length || currentQuestionIndex >= questions.length || lives <= 0 || isFinishingRef.current) return;
    const q = questions[currentQuestionIndex];
    const batchId = `${Date.now()}-${currentQuestionIndex}`;
    const newBubbles: Bubble[] = [];
    newBubbles.push({ id: `q-${batchId}`, value: -1, isCorrect: false, isQuestion: true, left: 50, duration: config.speed, delay: 0 });
    q.options.forEach((opt, idx) => {
      newBubbles.push({ id: `a-${batchId}-${idx}`, value: opt, isCorrect: opt === q.answer, left: config.answerRange[idx], duration: config.speed + 2 + Math.random() * config.variance, delay: config.qDelay + Math.random() * 0.4 });
    });
    setBubbles(newBubbles);
    const maxTime = (config.speed + 4) * 1000;
    questionTimeoutRef.current = setTimeout(() => {
        if (gameState === 'playing' && !isFinishingRef.current) {
            const nextLives = lives - 1;
            setLives(nextLives);
            playSound('wrong');
            if (nextLives <= 0) {
                finishGame(score, 0);
            } else {
                advanceQuestion(false);
            }
        }
    }, maxTime);
  }, [questions, currentQuestionIndex, lives, advanceQuestion, playSound, gameState, config, score, finishGame]);

  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0 && lives > 0) generateBubbles();
    return () => { if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current); };
  }, [gameState, questions, currentQuestionIndex, generateBubbles, lives]);
  
  const handleBubbleClick = (bubble: Bubble) => {
    if (gameState !== 'playing' || bubble.isQuestion || isFinishingRef.current || lives <= 0) return;
    if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
    
    const isCorrect = bubble.isCorrect;
    if (isCorrect) { 
      setScore(s => s + 10); 
      playSound('correct'); 
      advanceQuestion(isCorrect);
    } else { 
      const nextLives = lives - 1;
      setLives(nextLives); 
      playSound('wrong'); 
      if (nextLives <= 0) {
        finishGame(score, 0);
      } else {
        advanceQuestion(isCorrect);
      }
    }
  };

  if (!mounted) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] bg-slate-900 flex flex-col items-center justify-center overflow-hidden touch-none">
        <div className="absolute inset-0 z-0">
          <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/Game%20Background.webp?alt=media" alt="Arena" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <BackgroundBubbles />
            <Fish className="top-[20%] animate-[swimRight_12s_linear_infinite]" duration="12s" />
            <Fish className="top-[45%] animate-[swimLeft_15s_linear_infinite]" duration="15s" flip />
            <Fish className="top-[70%] animate-[swimRight_18s_linear_infinite]" duration="18s" />
        </div>
        <div className="absolute top-0 left-0 right-0 p-2 sm:p-6 bg-black/40 backdrop-blur-xl border-b border-white/10 flex justify-between items-center z-50">
            <div className="flex items-center gap-2 sm:gap-8 text-white min-w-0 flex-1">
                <div><h2 className="text-[8px] sm:text-[10px] font-black uppercase text-sky-200">Level</h2><p className="text-xs sm:text-xl font-black uppercase leading-none truncate">{levelName}</p></div>
                <div className="h-8 w-px bg-white/20 hidden sm:block" />
                <div><h2 className="text-[8px] sm:text-[10px] font-black uppercase text-sky-200">Points</h2><p className="text-sm sm:text-2xl font-black leading-none">{score}</p></div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-2xl border border-white/5 mx-2">
                {Array.from({length: MAX_LIVES}).map((_, i) => (<Heart key={i} className={cn("w-3 h-3 sm:w-6 sm:h-6 transition-all duration-300", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />))}
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8 sm:h-12 sm:w-12" onClick={() => router.push('/game')}><X className="w-5 h-5 sm:w-8 sm:h-8" /></Button>
        </div>
        <div className="relative w-full h-full max-w-7xl z-10 flex items-center justify-center">
            {gameState === 'playing' && lives > 0 && bubbles.map(b => (
                <div key={b.id} onClick={() => handleBubbleClick(b)} className={cn("absolute bottom-[-200px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl transition-all active:scale-95 z-10", b.isQuestion ? 'w-max px-6 sm:px-10 h-auto min-h-16 sm:min-h-24 bg-yellow-400 border-yellow-500 rounded-3xl ring-8 ring-yellow-400/20' : 'w-20 h-20 sm:w-32 sm:h-32 bg-pink-500 border-pink-600 rounded-full ring-8 ring-pink-500/20')} style={{ left: `${b.left}%`, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s`, transform: 'translateX(-50%)' }}>
                    <span className={cn("text-white font-black text-center whitespace-normal break-words", b.isQuestion ? getQuestionFontSize(questions[currentQuestionIndex]?.text || "") : getAnswerFontSize(b.value))}>
                        {b.isQuestion ? (
                          (questions[currentQuestionIndex]?.text || "").split(' ').reduce((acc: React.ReactNode[], part, i, arr) => {
                            if (['+', '-', '×', '÷'].includes(part)) return acc;
                            const prev = arr[i-1];
                            if (prev && ['+', '-', '×', '÷'].includes(prev)) {
                              acc.push(<span key={i} className="inline-block whitespace-nowrap">{prev} {part}</span>);
                            } else {
                              acc.push(<span key={i} className="inline-block">{part}</span>);
                            }
                            if (i < arr.length - 1) acc.push(<span key={`space-${i}`}> </span>);
                            return acc;
                          }, [])
                        ) : b.value}
                    </span>
                </div>
            ))}
        </div>
        {gameState === 'intro' && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-[1000]"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 bg-white rounded-[3rem] overflow-hidden relative z-[1001] max-h-[90vh] flex flex-col">
                    <CardHeader className="bg-pink-500 text-white text-center py-6 sm:py-10 shrink-0"><CardTitle className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter">How to Play</CardTitle></CardHeader>
                    <CardContent className="p-6 sm:p-8 space-y-4 overflow-y-auto flex-1 scrollbar-none">{PAGE_GUIDES.bubble_game.steps.map((s, i) => (<div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50 border border-muted-foreground/5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500 text-white text-xs font-black shadow-md">{i + 1}</div><p className="text-sm sm:text-base font-medium text-slate-700 leading-tight pt-1.5">{s}</p></div>))}</CardContent>
                    <CardFooter className="p-6 sm:p-8 pt-0 flex flex-col gap-4 bg-white/50 border-t shrink-0"><div className="flex items-center space-x-2 py-2"><Checkbox id="db" checked={dontShowAgain} onCheckedChange={v => setDontShowAgain(!!v)} /><Label htmlFor="db" className="text-xs font-bold text-muted-foreground uppercase cursor-pointer">Do not show rules again</Label></div><Button onClick={handleStart} className="w-full h-14 sm:h-16 text-xl font-black uppercase rounded-2xl bg-pink-500 hover:bg-pink-600 text-white">Start Popping!</Button></CardFooter>
                </Card>
            </div>
        )}
        {(gameState === 'levelComplete' || gameState === 'gameOver') && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-[1000] animate-in zoom-in-95"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 bg-white rounded-[3rem] overflow-hidden relative z-[1001]">
                    <CardHeader className={cn("text-center py-6 sm:py-10", gameState === 'levelComplete' ? "bg-green-500" : "bg-destructive")}><CardTitle className="text-3xl font-black text-white uppercase tracking-tighter">{gameState === 'levelComplete' ? 'Level Clear!' : 'Game Over'}</CardTitle></CardHeader>
                    <CardContent className="p-6 sm:p-10 text-center space-y-8"><div className="space-y-2 relative"><p className="text-[10px] font-black uppercase text-muted-foreground">Points Earned</p><div className="relative inline-block"><p className="text-5xl sm:text-7xl font-black text-primary">{finalMasteryPoints}</p>{showSubmissionAnim && Array.from({length:20}).map((_,i)=>(<FloatingParticle key={i} index={i}/>))}</div></div>
                        <div className="grid gap-4">{gameState === 'levelComplete' && levelId < 1000 && <Button onClick={() => router.push(`/game/level-${levelId + 1}`)} className="h-14 sm:h-16 text-lg font-black rounded-2xl shadow-xl">NEXT LEVEL</Button>}
                            <Button onClick={() => { isFinishingRef.current = false; setCurrentQuestionIndex(0); setScore(0); setLives(MAX_LIVES); setFinalMasteryPoints(0); setShowSubmissionAnim(false); setGameState('playing'); }} variant="outline" className="h-12 border-2 rounded-2xl font-bold">TRY AGAIN</Button>
                            <Button variant="ghost" onClick={() => router.push('/game')} className="font-bold uppercase text-xs">BACK TO MAP</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </div>
  );

  return createPortal(content, document.body);
}
