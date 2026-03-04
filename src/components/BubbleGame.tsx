
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { GameLevel, Question } from '@/types';
import { generateGameQuestions } from '@/lib/questions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Heart, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
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
    <div className={cn("absolute bottom-0 w-12 h-48 origin-bottom", className)}>
        <div className="relative w-full h-full transform-gpu animate-[sway_8s_ease-in-out_infinite]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-full bg-green-600 rounded-t-full" />
            <div className="absolute bottom-0 left-0 w-2 h-3/4 bg-green-500 rounded-t-full transform rotate-[-15deg] origin-bottom" />
            <div className="absolute bottom-0 right-0 w-2 h-2/3 bg-green-700 rounded-t-full transform rotate-[15deg] origin-bottom" />
        </div>
    </div>
);

const FloatingFish = () => (
    <>
        <div className="absolute top-[20%] left-[-100px] w-20 h-20 animate-[swimRight_25s_linear_infinite_1s]">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish.png?alt=media&token=a2ce6964-2653-489b-9e2e-7f6e1c36c00b" alt="fish" layout="fill" objectFit="contain" />
        </div>
        <div className="absolute top-[40%] right-[-100px] w-24 h-24 animate-[swimLeft_30s_linear_infinite_5s] transform -scale-x-100">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish.png?alt=media&token=a2ce6964-2653-489b-9e2e-7f6e1c36c00b" alt="fish" layout="fill" objectFit="contain" />
        </div>
        <div className="absolute top-[70%] left-[-120px] w-16 h-16 animate-[swimRight_20s_linear_infinite_8s]">
            <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish.png?alt=media&token=a2ce6964-2653-489b-9e2e-7f6e1c36c00b" alt="fish" layout="fill" objectFit="contain" />
        </div>
    </>
);


export function BubbleGame({ levelId, level, levelName }: { levelId: number, level: GameLevel, levelName: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameState, setGameState] = useState<'playing' | 'levelComplete' | 'gameOver'>('playing');

  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, saveCompletedGameLevel, recordDailyPractice, addPoints } = useAuth();
  const { playSound } = useSound();
  const router = useRouter();

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
      duration: 6,
      delay: 0,
    });
    
    const numAnswerBubbles = currentQuestion.options.length;
    const bubbleSpacingPercent = 20;
    const totalBubbleWidth = numAnswerBubbles * bubbleSpacingPercent;
    const startLeft = 50 - totalBubbleWidth / 2;

    currentQuestion.options.forEach((option, index) => {
        const duration = Math.random() * 4 + 7; 
        const delay = Math.random() * 2;
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
        setLives(l => l - 1);
        playSound('wrong');
        advanceQuestion();
    }, (maxDuration + 1) * 1000);

  }, [questions, currentQuestionIndex, lives, advanceQuestion, playSound]);

  useEffect(() => {
    if (gameState === 'playing' && questions.length > 0) {
      generateBubbles();
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, questions, currentQuestionIndex]);
  
  useEffect(() => {
     if (lives <= 0) {
      setGameState('gameOver');
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    }
  }, [lives]);

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

  return (
    <div className="fixed inset-0 z-[60] bg-gradient-to-b from-cyan-400 to-blue-600 flex flex-col items-center justify-center p-0 sm:p-4 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
            <FloatingFish />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-yellow-200 opacity-80" style={{clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0% 100%)'}}></div>
            <div className="absolute bottom-0 left-0 w-full h-24 bg-yellow-100 opacity-90" style={{clipPath: 'polygon(0 30%, 100% 10%, 100% 100%, 0% 100%)'}}></div>
            
            <Seaweed className="left-[5%] bottom-[-20px] scale-125" />
            <Seaweed className="left-[15%] scale-150" />
            <Seaweed className="right-[10%] scale-125" />
            <Seaweed className="right-[25%] bottom-[-30px] scale-110" />
            <Seaweed className="left-[50%] -translate-x-1/2 bottom-[-40px] scale-90" />
        </div>

        {/* HUD (Heads-Up Display) */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-md flex justify-between items-center z-50">
            <div className="text-white">
                <h2 className="text-sm sm:text-lg font-black uppercase tracking-tight">{levelName}</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-sky-200">SCORE:</span>
                    <span className="text-xl sm:text-2xl font-black text-white">{score}</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-white/10 rounded-2xl">
                    {Array.from({length: MAX_LIVES}).map((_, i) => (
                        <Heart key={i} className={cn("w-5 h-5 sm:w-7 sm:h-7 transition-all duration-300", i < lives ? "text-red-500 fill-current" : "text-white/20")} />
                    ))}
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => router.push('/game')}>
                    <X className="w-6 h-6" />
                </Button>
            </div>
        </div>

        {/* Play Area */}
        <div className="relative w-full h-full max-w-6xl z-10">
            {gameState === 'playing' && currentQuestion ? (
                <>
                    {bubbles.map(bubble => (
                        <div
                            key={bubble.id}
                            className={cn(
                                "absolute bottom-[-150px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-2xl transition-transform active:scale-95",
                                bubble.isQuestion 
                                    ? 'w-64 h-24 sm:w-80 sm:h-32 bg-yellow-400 border-yellow-500 rounded-3xl' 
                                    : 'w-24 h-24 sm:w-28 sm:h-28 bg-pink-500 border-pink-600 rounded-full'
                            )}
                            style={{
                                left: `${bubble.left}%`,
                                animationDuration: `${bubble.duration}s`,
                                animationDelay: `${bubble.delay}s`,
                                transform: 'translateX(-50%)',
                            }}
                            onClick={() => handleBubbleClick(bubble)}
                        >
                            <span className="text-white text-3xl sm:text-4xl font-black [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
                                {bubble.isQuestion ? currentQuestion.text : bubble.value}
                            </span>
                        </div>
                    ))}
                </>
            ) : null}

            {/* Overlays */}
            {(gameState === 'levelComplete' || gameState === 'gameOver') && (
                <div className="absolute inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-500">
                    <Card className="w-full max-w-lg shadow-2xl border-4 border-white/20 bg-white/95 backdrop-blur-xl rounded-[2rem] overflow-hidden">
                        <CardHeader className={cn("text-center py-8", gameState === 'levelComplete' ? "bg-green-500" : "bg-destructive")}>
                            <CardTitle className="text-4xl font-black text-white uppercase tracking-tighter">
                                {gameState === 'levelComplete' ? 'Fantastic!' : 'Game Over'}
                            </CardTitle>
                            <CardDescription className="text-white/80 font-bold text-lg mt-2">
                                {gameState === 'levelComplete' ? `You passed ${levelName}!` : 'You ran out of bubbles!'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-10 text-center space-y-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Final Results</p>
                                <p className="text-6xl font-black text-primary">{score}</p>
                                <p className="text-sm font-bold text-muted-foreground">Mastery Points Earned</p>
                            </div>
                            
                            <div className="grid gap-4">
                                {gameState === 'levelComplete' && levelId < 50 ? (
                                    <Button onClick={() => router.push(`/game/level-${levelId + 1}`)} className="h-16 text-xl font-black rounded-2xl shadow-xl">
                                        NEXT LEVEL
                                    </Button>
                                ) : null}
                                <Button onClick={() => {
                                    setCurrentQuestionIndex(0);
                                    setScore(0);
                                    setLives(MAX_LIVES);
                                    setGameState('playing');
                                }} variant="outline" className="h-14 text-lg font-bold border-2 rounded-2xl">
                                    TRY AGAIN
                                </Button>
                                <Button variant="ghost" onClick={() => router.push('/game')} className="h-12 font-bold uppercase tracking-widest text-muted-foreground">
                                    BACK TO MAP
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
    </div>
  );
}
