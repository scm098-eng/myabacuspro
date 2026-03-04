
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { GameLevel, Question } from '@/types';
import { generateGameQuestions } from '@/lib/questions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Heart, X, Check, Flame, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { calculatePoints } from '@/lib/scoring';
import { useSound } from '@/hooks/useSound';

interface Bubble {
  id: number;
  value: number;
  isCorrect: boolean;
  left: number;
  duration: number;
  delay: number;
  isQuestion?: boolean;
}

const MAX_LIVES = 5;
const MIN_SCORE_TO_PASS = 90;

const Seaweed = ({ className }: { className: string }) => (
    <div className={cn("absolute bottom-0 w-12 h-48 origin-bottom select-none pointer-events-none", className)}>
        <div className="relative w-full h-full transform-gpu animate-[sway_8s_ease-in-out_infinite]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-full bg-green-600/60 rounded-t-full" />
            <div className="absolute bottom-0 left-0 w-2 h-3/4 bg-green-500/60 rounded-t-full transform rotate-[-15deg] origin-bottom" />
            <div className="absolute bottom-0 right-0 w-2 h-2/3 bg-green-700/60 rounded-t-full transform rotate-[15deg] origin-bottom" />
        </div>
    </div>
);

const FloatingFish = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-40">
        <div className="absolute top-[20%] left-[-100px] w-20 h-20 animate-[swimRight_25s_linear_infinite_1s]">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish.png?alt=media&token=a2ce6964-2653-489b-9e2e-7f6e1c36c00b" alt="fish" width={80} height={80} className="object-contain" />
        </div>
        <div className="absolute top-[40%] right-[-100px] w-24 h-24 animate-[swimLeft_30s_linear_infinite_5s] transform -scale-x-100">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish.png?alt=media&token=a2ce6964-2653-489b-9e2e-7f6e1c36c00b" alt="fish" width={96} height={96} className="object-contain" />
        </div>
        <div className="absolute top-[70%] left-[-120px] w-16 h-16 animate-[swimRight_20s_linear_infinite_8s]">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish.png?alt=media&token=a2ce6964-2653-489b-9e2e-7f6e1c36c00b" alt="fish" width={64} height={64} className="object-contain" />
        </div>
    </div>
);

export function BubbleGame({ levelId, level, levelName }: { levelId: number, level: GameLevel, levelName: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameState, setGameState] = useState<'playing' | 'levelComplete' | 'gameOver'>('playing');
  const [mounted, setMounted] = useState(false);

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, saveCompletedGameLevel, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const newQuestions = generateGameQuestions(level);
    setQuestions(newQuestions);
  }, [level]);
  
  const advanceQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 >= questions.length) {
      const finalScorePercentage = (score / (questions.length * 10)) * 100;
      if (user) {
        const { earnedPoints } = calculatePoints({
          correct: score / 10,
          total: questions.length,
          timeInSeconds: 0,
          targetTime: 0,
          level: levelId,
          isGame: true
        });

        if (finalScorePercentage >= MIN_SCORE_TO_PASS) {
          saveCompletedGameLevel(levelId);
          recordDailyPractice(user.uid);
          addPoints(user.uid, earnedPoints);
          playSound('success');
          setGameState('levelComplete');
        } else {
          addPoints(user.uid, Math.floor(earnedPoints * 0.5));
          setGameState('gameOver');
        }
      }
    } else {
      setCurrentQuestionIndex(i => i + 1);
    }
  }, [currentQuestionIndex, questions.length, score, user, saveCompletedGameLevel, levelId, recordDailyPractice, addPoints, playSound]);

  const generateBubbles = useCallback(() => {
    if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
    }
    
    if (!questions.length || currentQuestionIndex >= questions.length || lives <= 0) {
      setGameState('gameOver');
      return;
    }

    const currentQuestion = questions[currentQuestionIndex];
    const newBubbles: Bubble[] = [];
    let maxDuration = 0;

    newBubbles.push({
      id: Date.now(),
      value: -1, 
      isCorrect: false,
      isQuestion: true,
      left: 50,
      duration: 7,
      delay: 0,
    });
    
    const numAnswerBubbles = currentQuestion.options.length;
    const bubbleSpacingPercent = 20;
    const totalBubbleWidth = numAnswerBubbles * bubbleSpacingPercent;
    const startLeft = 50 - totalBubbleWidth / 2;

    currentQuestion.options.forEach((option, index) => {
        const duration = Math.random() * 3 + 8; 
        const delay = Math.random() * 1.5;
        if (duration + delay > maxDuration) {
            maxDuration = duration + delay;
        }

      newBubbles.push({
        id: Date.now() + index + 1,
        value: option,
        isCorrect: option === currentQuestion.answer,
        left: startLeft + index * bubbleSpacingPercent + (bubbleSpacingPercent / 2),
        duration: duration,
        delay: delay,
      });
    });

    setBubbles(newBubbles);

    questionTimeoutRef.current = setTimeout(() => {
        if (gameState === 'playing') {
            setLives(l => l - 1);
            playSound('wrong');
            advanceQuestion();
        }
    }, (maxDuration + 1) * 1000);

  }, [questions, currentQuestionIndex, lives, advanceQuestion, playSound, gameState]);

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
      setGameState('gameOver');
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    }
  }, [lives, gameState]);

  const handleBubbleClick = (bubble: Bubble) => {
    if (gameState !== 'playing' || bubble.isQuestion) return;
    
    if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
    }

    if (bubble.isCorrect) {
      setScore(s => s + 10);
      playSound('correct');
    } else {
      setLives(l => l - 1);
      playSound('wrong');
    }
    advanceQuestion();
  };

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-gradient-to-b from-cyan-400 to-blue-600 flex flex-col items-center justify-center overflow-hidden touch-none">
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <FloatingFish />
            <div className="absolute bottom-0 left-0 w-full h-48 bg-yellow-200 opacity-80" style={{clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0% 100%)'}}></div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-yellow-100 opacity-90" style={{clipPath: 'polygon(0 30%, 100% 10%, 100% 100%, 0% 100%)'}}></div>
            <Seaweed className="left-[5%] bottom-[-20px] scale-125" />
            <Seaweed className="left-[15%] scale-150" />
            <Seaweed className="right-[10%] scale-125" />
            <Seaweed className="right-[25%] bottom-[-30px] scale-110" />
            <Seaweed className="left-[50%] -translate-x-1/2 bottom-[-40px] scale-90" />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-black/30 backdrop-blur-xl border-b border-white/10 flex justify-between items-center z-50 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4 sm:gap-8">
                <div className="text-white">
                    <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-sky-200">Level</h2>
                    <p className="text-base sm:text-xl font-black uppercase leading-none truncate max-w-[120px] sm:max-w-none">{levelName}</p>
                </div>
                <div className="h-10 w-px bg-white/20 hidden sm:block" />
                <div className="text-white">
                    <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-sky-200">Score</h2>
                    <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <p className="text-xl sm:text-2xl font-black leading-none">{score}</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-2xl border border-white/5">
                    {Array.from({length: MAX_LIVES}).map((_, i) => (
                        <Heart key={i} className={cn("w-4 h-4 sm:w-6 sm:h-6 transition-all duration-300 drop-shadow-lg", i < lives ? "text-red-500 fill-red-500" : "text-white/10")} />
                    ))}
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-10 w-10 sm:h-12 sm:w-12" onClick={() => router.push('/game')}>
                    <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
            </div>
        </div>

        <div className="relative w-full h-full max-w-7xl z-10 flex items-center justify-center">
            {gameState === 'playing' && currentQuestion ? (
                <>
                    {bubbles.map(bubble => (
                        <div
                            key={bubble.id}
                            className={cn(
                                "absolute bottom-[-200px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl transition-transform active:scale-90",
                                bubble.isQuestion 
                                    ? 'w-64 h-24 sm:w-96 sm:h-36 bg-yellow-400 border-yellow-500 rounded-[2.5rem] ring-8 ring-yellow-400/20' 
                                    : 'w-24 h-24 sm:w-32 sm:h-32 bg-pink-500 border-pink-600 rounded-full ring-8 ring-pink-500/20'
                            )}
                            style={{
                                left: `${bubble.left}%`,
                                animationDuration: `${bubble.duration}s`,
                                animationDelay: `${bubble.delay}s`,
                                transform: 'translateX(-50%)',
                            }}
                            onClick={() => handleBubbleClick(bubble)}
                        >
                            <span className="text-white text-3xl sm:text-5xl font-black [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] select-none text-center px-4">
                                {bubble.isQuestion ? currentQuestion.text : bubble.value}
                            </span>
                        </div>
                    ))}
                </>
            ) : null}

            {(gameState === 'levelComplete' || gameState === 'gameOver') && (
                <div className="absolute inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-500">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
                    <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 bg-white/95 backdrop-blur-2xl rounded-[3rem] overflow-hidden relative z-10">
                        <CardHeader className={cn("text-center py-10", gameState === 'levelComplete' ? "bg-green-500" : "bg-destructive")}>
                            <div className="mx-auto bg-white/20 p-4 rounded-full w-fit mb-4">
                                {gameState === 'levelComplete' ? <Trophy className="w-12 h-12 text-white" /> : <X className="w-12 h-12 text-white" />}
                            </div>
                            <CardTitle className="text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter">
                                {gameState === 'levelComplete' ? 'Level Clear!' : 'Game Over'}
                            </CardTitle>
                            <CardDescription className="text-white/80 font-bold text-lg mt-2">
                                {gameState === 'levelComplete' ? `Awesome job on ${levelName}` : 'Don\'t give up! Try again.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 text-center space-y-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mastery Points Earned</p>
                                <p className="text-7xl font-black text-primary drop-shadow-sm">{score}</p>
                            </div>
                            
                            <div className="grid gap-4">
                                {gameState === 'levelComplete' && levelId < 50 ? (
                                    <Button onClick={() => router.push(`/game/level-${levelId + 1}`)} className="h-16 text-xl font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                                        NEXT LEVEL
                                    </Button>
                                ) : null}
                                <Button onClick={() => {
                                    setCurrentQuestionIndex(0);
                                    setScore(0);
                                    setLives(MAX_LIVES);
                                    setGameState('playing');
                                }} variant="outline" className="h-14 text-lg font-bold border-2 border-primary/20 rounded-2xl hover:bg-primary/5">
                                    TRY AGAIN
                                </Button>
                                <Button variant="ghost" onClick={() => router.push('/game')} className="h-12 font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                    BACK TO LEVEL MAP
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>

        <style jsx>{`
            @keyframes sway {
              0%, 100% { transform: rotate(-5deg); }
              50% { transform: rotate(5deg); }
            }
            @keyframes swimRight {
                from { left: -150px; }
                to { left: calc(100% + 150px); }
            }
            @keyframes swimLeft {
                from { right: -150px; }
                to { right: calc(100% + 150px); }
            }
        `}</style>
    </div>,
    document.body
  );
}
