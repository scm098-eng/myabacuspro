'use client';

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { GameLevel, Question } from '@/types';
import { generateGameQuestions } from '@/lib/questions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Heart, X, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { calculatePoints } from '@/lib/scoring';
import { useSound } from '@/hooks/useSound';
import confetti from 'canvas-confetti';

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

const Seaweed = memo(({ className }: { className: string }) => (
    <div className={cn("absolute bottom-0 w-12 h-40 origin-bottom select-none pointer-events-none opacity-30", className)}>
        <div className="relative w-full h-full transform-gpu animate-[sway_8s_ease-in-out_infinite]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-full bg-green-600 rounded-t-full" />
            <div className="absolute bottom-0 left-0 w-2 h-3/4 bg-green-500 rounded-t-full transform rotate-[-15deg] origin-bottom" />
            <div className="absolute bottom-0 right-0 w-2 h-2/3 bg-green-700 rounded-t-full transform rotate-[15deg] origin-bottom" />
        </div>
    </div>
));
Seaweed.displayName = 'Seaweed';

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
      zIndex: 10005,
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

export function BubbleGame({ levelId, level, levelName }: { levelId: number, level: GameLevel, levelName: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameState, setGameState] = useState<'playing' | 'levelComplete' | 'gameOver'>('playing');
  const [finalMasteryPoints, setFinalMasteryPoints] = useState(0);
  const [showSubmissionAnim, setShowSubmissionAnim] = useState(false);
  const [mounted, setMounted] = useState(false);

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, saveCompletedGameLevel, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

  const config = useMemo(() => {
    const baseDuration = Math.max(4, 10 - (levelId / 40));
    return {
      speed: baseDuration,
      answerRange: [12, 37, 63, 88], 
      qDelay: 1.2,
      variance: 1.5 
    };
  }, [levelId]);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const newQuestions = generateGameQuestions(level, levelId);
    setQuestions(newQuestions);
  }, [level, levelId]);
  
  const finishGame = useCallback(async (finalScore: number, finalLives: number) => {
    if (gameState !== 'playing') return;

    const correctAnswers = finalScore / 10;
    const accuracy = (correctAnswers / (questions.length || 1)) * 100;
    
    if (user) {
      const { earnedPoints } = calculatePoints({
        correct: correctAnswers,
        total: questions.length,
        timeInSeconds: 0,
        targetTime: 0,
        level: levelId,
        isGame: true
      });

      setFinalMasteryPoints(earnedPoints);
      addPoints(user.uid, earnedPoints);

      if (accuracy >= MIN_SCORE_TO_PASS && finalLives > 0) {
        saveCompletedGameLevel(levelId);
        recordDailyPractice(user.uid);
        playSound('success');
        setGameState('levelComplete');
        
        confetti({
          particleCount: 200,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f97316', '#fbbf24', '#ffffff'],
          zIndex: 10001,
        });
      } else {
        setGameState('gameOver');
      }
      
      if (earnedPoints > 0) {
        setTimeout(() => setShowSubmissionAnim(true), 600);
      }
    }
  }, [questions.length, user, levelId, saveCompletedGameLevel, recordDailyPractice, addPoints, playSound, gameState]);

  const advanceQuestion = useCallback((isCorrectOutcome?: boolean) => {
    const nextScore = isCorrectOutcome ? score + 10 : score;
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      finishGame(nextScore, lives);
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
  }, [currentQuestionIndex, questions.length, score, lives, finishGame]);

  const generateBubbles = useCallback(() => {
    if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
    }
    
    if (!questions.length || currentQuestionIndex >= questions.length || lives <= 0) {
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const newBubbles: Bubble[] = [];
    const batchId = `${Date.now()}-${currentQuestionIndex}`;

    newBubbles.push({
      id: `q-${batchId}`,
      value: -1, 
      isCorrect: false,
      isQuestion: true,
      left: 50,
      duration: config.speed, 
      delay: 0,
    });
    
    currentQuestion.options.forEach((option, index) => {
      const duration = (config.speed + 2) + (Math.random() * config.variance);

      newBubbles.push({
        id: `a-${batchId}-${index}`,
        value: option,
        isCorrect: option === currentQuestion.answer,
        left: config.answerRange[index],
        duration: duration,
        delay: config.qDelay + (Math.random() * 0.8),
      });
    });

    setBubbles(newBubbles);

    const maxTime = (config.speed + 3 + config.variance + config.qDelay + 0.8) * 1000;
    questionTimeoutRef.current = setTimeout(() => {
        if (gameState === 'playing') {
            setLives(l => l - 1);
            playSound('wrong');
            advanceQuestion(false);
        }
    }, maxTime);

  }, [questions, currentQuestionIndex, lives, advanceQuestion, playSound, gameState, config]);

  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0) {
      generateBubbles();
    }
     return () => {
        if (questionTimeoutRef.current) clearTimeout(questionTimeoutRef.current);
     };
  }, [gameState, questions, currentQuestionIndex, generateBubbles]);
  
  useEffect(() => {
     if (lives <= 0 && gameState === 'playing') {
      finishGame(score, 0);
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    }
  }, [lives, gameState, score, finishGame]);

  const handleBubbleClick = (bubble: Bubble) => {
    if (gameState !== 'playing' || bubble.isQuestion) return;
    
    if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
    }

    const isCorrect = bubble.isCorrect;
    if (isCorrect) {
      setScore(s => s + 10);
      playSound('correct');
    } else {
      setLives(l => l - 1);
      playSound('wrong');
    }
    advanceQuestion(isCorrect);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-cyan-400 to-blue-600 flex flex-col items-center justify-center overflow-hidden touch-none">
        <style jsx global>{`
          @keyframes float-to-profile {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.5); }
            100% { transform: translate(calc(-50% + var(--target-x)), calc(-50% + var(--target-y))) scale(0.1); opacity: 0; }
          }
        `}</style>

        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <BackgroundBubbles />
            <Seaweed className="left-[5%] bottom-[-5px] scale-90" />
            <Seaweed className="left-[15%] bottom-[-10px] scale-110" />
            <Seaweed className="right-[10%] bottom-[-5px] scale-100" />
            <Seaweed className="right-[25%] bottom-[-15px] scale-75" />
            
            <Fish className="top-[20%] animate-[swimRight_12s_linear_infinite]" duration="12s" />
            <Fish className="top-[45%] animate-[swimLeft_15s_linear_infinite]" duration="15s" flip />
            <Fish className="top-[70%] animate-[swimRight_18s_linear_infinite]" duration="18s" />

            <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-yellow-300 to-yellow-200/80 opacity-80" style={{clipPath: 'polygon(0 60%, 100% 20%, 100% 100%, 0% 100%)'}}></div>
        </div>

        <div className="absolute top-0 left-0 right-0 p-2 sm:p-6 bg-black/30 backdrop-blur-xl border-b border-white/10 flex justify-between items-center z-50 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2 sm:gap-8 text-white min-w-0 flex-1">
                <div className="min-w-0 flex-1 sm:flex-none">
                    <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-sky-200 leading-tight">Level</h2>
                    <p className="text-xs sm:text-xl font-black uppercase leading-none truncate max-w-full">{levelName}</p>
                </div>
                <div className="h-8 w-px bg-white/20 hidden sm:block shrink-0" />
                <div className="shrink-0 text-right sm:text-left">
                    <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-sky-200 leading-tight">Points</h2>
                    <div className="flex items-center justify-end sm:justify-start gap-1">
                        <p className="text-sm sm:text-2xl font-black leading-none">{score}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-white/10 rounded-xl sm:rounded-2xl border border-white/5 mx-2 shrink-0">
                {Array.from({length: MAX_LIVES}).map((_, i) => (
                    <Heart key={i} className={cn("w-3 h-3 sm:w-6 sm:h-6 transition-all duration-300 drop-shadow-lg", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />
                ))}
            </div>
            
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8 sm:h-12 sm:w-12 shrink-0" onClick={() => router.push('/game')}>
                <X className="w-5 h-5 sm:w-8 sm:h-8" />
            </Button>
        </div>

        <div className="relative w-full h-full max-w-7xl z-10 flex items-center justify-center">
            {gameState === 'playing' && (
                <>
                    {bubbles.map(bubble => (
                        <div
                            key={bubble.id}
                            className={cn(
                                "absolute bottom-[-200px] flex items-center justify-center cursor-pointer animate-bubble-rise transform-gpu border-4 shadow-2xl transition-all active:scale-95 z-10",
                                bubble.isQuestion 
                                    ? 'w-max max-w-[95vw] px-6 sm:px-10 h-16 sm:h-24 bg-yellow-400 border-yellow-500 rounded-3xl ring-8 ring-yellow-400/20 whitespace-nowrap overflow-hidden' 
                                    : 'w-20 h-20 sm:w-32 sm:h-32 bg-pink-500 border-pink-600 rounded-full ring-8 ring-pink-500/20'
                            )}
                            style={{
                                left: `${bubble.left}%`,
                                animationDuration: `${bubble.duration}s`,
                                animationDelay: `${bubble.delay}s`,
                                transform: 'translateX(-50%)',
                            }}
                            onClick={() => handleBubbleClick(bubble)}
                        >
                            <span className={cn(
                                "text-white font-black [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] select-none text-center block whitespace-nowrap",
                                bubble.isQuestion 
                                    ? getQuestionFontSize(questions[currentQuestionIndex]?.text || "")
                                    : getAnswerFontSize(bubble.value)
                            )}>
                                {bubble.isQuestion ? (questions[currentQuestionIndex]?.text) : bubble.value}
                            </span>
                        </div>
                    ))}
                </>
            )}
        </div>

        {(gameState === 'levelComplete' || gameState === 'gameOver') && (
            <div className="absolute inset-0 flex items-center justify-center p-4 z-[1000] animate-in fade-in zoom-in-95 duration-500">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
                <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 bg-white rounded-[3rem] overflow-hidden relative z-[1001]">
                    <CardHeader className={cn("text-center py-10", gameState === 'levelComplete' ? "bg-green-500" : "bg-destructive")}>
                        <div className="mx-auto bg-white/20 p-4 rounded-full w-fit mb-4">
                            {gameState === 'levelComplete' ? <CheckCircle2 className="w-12 h-12 text-white" /> : <AlertCircle className="w-12 h-12 text-white" />}
                        </div>
                        <CardTitle className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                            {gameState === 'levelComplete' ? 'Level Clear!' : 'Game Over'}
                        </CardTitle>
                        <CardDescription className="text-white/80 font-bold text-lg mt-2 px-6">
                            {gameState === 'levelComplete' ? `Awesome job on ${levelName}` : 'Keep going! Practice makes perfect.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 text-center space-y-8">
                        <div className="space-y-2 relative">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mastery Points Earned</p>
                            <div className="relative inline-block">
                              <p className="text-7xl font-black text-primary drop-shadow-sm">{finalMasteryPoints}</p>
                              {showSubmissionAnim && Array.from({ length: 20 }).map((_, i) => (
                                <FloatingParticle key={i} index={i} />
                              ))}
                            </div>
                        </div>
                        
                        <div className="grid gap-4">
                            {gameState === 'levelComplete' && levelId < 1000 ? (
                                <Button onClick={() => router.push(`/game/level-${levelId + 1}`)} className="h-16 text-xl font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                                    NEXT LEVEL
                                </Button>
                            ) : null}
                            <Button onClick={() => {
                                setCurrentQuestionIndex(0);
                                setScore(0);
                                setLives(MAX_LIVES);
                                setFinalMasteryPoints(0);
                                setShowSubmissionAnim(false);
                                setGameState('playing');
                            }} variant="outline" className="h-14 text-lg font-bold border-2 border-primary/20 rounded-2xl">
                                TRY AGAIN
                            </Button>
                            <Button variant="ghost" onClick={() => router.push('/game')} className="h-12 font-bold uppercase tracking-widest text-muted-foreground">
                                BACK TO LEVEL MAP
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
    </div>,
    document.body
  );
}