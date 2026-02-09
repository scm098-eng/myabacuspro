
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { GameLevel, Question } from '@/types';
import { generateGameQuestions } from '@/lib/questions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Heart, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
  const { user, saveCompletedGameLevel } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const newQuestions = generateGameQuestions(level);
    setQuestions(newQuestions);
  }, [level]);
  
  const advanceQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 >= questions.length) {
      const finalScorePercentage = (score / (questions.length * 10)) * 100;
      if (finalScorePercentage >= MIN_SCORE_TO_PASS && user) {
        saveCompletedGameLevel(levelId);
        setGameState('levelComplete');
      } else {
        setGameState('gameOver');
      }
    } else {
      setCurrentQuestionIndex(i => i + 1);
    }
  }, [currentQuestionIndex, questions.length, score, user, saveCompletedGameLevel, levelId]);


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
        advanceQuestion();
    }, (maxDuration + 1) * 1000);

  }, [questions, currentQuestionIndex, lives, advanceQuestion]);

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
    } else {
      setLives(l => l - 1);
    }
    advanceQuestion();
  };

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  if (gameState === 'levelComplete') {
     const hasNextLevel = levelId < 50;
     return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl text-green-500">Level Complete!</CardTitle>
          <CardDescription>Great job! You passed {levelName}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold">Final Score: {score}</p>
           <p className="text-muted-foreground">You've unlocked the next level!</p>
          <div className="flex gap-4 justify-center">
            {hasNextLevel && (
                 <Button onClick={() => router.push(`/game/level-${levelId + 1}`)}>Next Level</Button>
            )}
            <Button variant="outline" asChild>
                <Link href="/game">Back to Level Map</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (gameState === 'gameOver') {
    const finalScorePercentage = (questions.length > 0) ? (score / (questions.length * 10)) * 100 : 0;
    const failedDueToScore = lives > 0 && finalScorePercentage < MIN_SCORE_TO_PASS;

    return (
      <Card className="w-full max-w-lg mx-auto text-center">
        <CardHeader>
          <CardTitle className="text-3xl text-destructive">Game Over</CardTitle>
           <CardDescription>
              {failedDueToScore ? `You needed ${MIN_SCORE_TO_PASS}% to pass.` : "You ran out of lives!"} Keep practicing!
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-2xl font-bold">Final Score: {score}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => {
                setCurrentQuestionIndex(0);
                setScore(0);
                setLives(MAX_LIVES);
                setGameState('playing');
            }}>Try Again</Button>
            <Button asChild variant="outline">
              <Link href="/game">Back to Level Map</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!currentQuestion) {
      return <div>Loading Game...</div>;
  }

  return (
    <div className="relative w-full h-[70vh] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-lg overflow-hidden border-4 border-blue-800 shadow-inner">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <FloatingFish />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-yellow-200" style={{clipPath: 'polygon(0 20%, 100% 0, 100% 100%, 0% 100%)'}}></div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-yellow-100" style={{clipPath: 'polygon(0 30%, 100% 10%, 100% 100%, 0% 100%)'}}></div>
            
            <Seaweed className="left-[10%] bottom-[-20px] scale-75" />
            <Seaweed className="left-[20%] scale-100" />
            <Seaweed className="right-[15%] scale-90" />
            <Seaweed className="right-[5%] bottom-[-30px] scale-60" />
            <Seaweed className="left-[50%] -translate-x-1/2 bottom-[-40px] scale-50" />

        </div>

        <div className="absolute top-0 left-0 right-0 p-2 bg-black/20 backdrop-blur-sm flex justify-between items-center z-20">
            <div className="text-white px-2">
                <h2 className="text-base font-bold">{levelName}</h2>
                <p className="text-lg font-bold">Score: {score}</p>
            </div>
            <div className="flex items-center gap-1 pr-2">
                {Array.from({length: lives}).map((_, i) => (
                    <Heart key={i} className="w-6 h-6 text-red-500 fill-current" />
                ))}
                {Array.from({length: MAX_LIVES - lives}).map((_, i) => (
                    <XCircle key={i} className="w-6 h-6 text-white/50" />
                ))}
            </div>
        </div>
      
        {bubbles.map(bubble => (
            <div
            key={bubble.id}
            className={cn(
                "absolute bottom-[-150px] flex items-center justify-center cursor-pointer animate-bubble-rise border-4 shadow-lg",
                bubble.isQuestion 
                    ? 'w-64 h-24 bg-yellow-400 border-yellow-500 rounded-xl' 
                    : 'w-24 h-24 bg-pink-500 border-pink-600 rounded-full'
            )}
            style={{
                left: `${bubble.left}%`,
                animationDuration: `${bubble.duration}s`,
                animationDelay: `${bubble.delay}s`,
                transform: 'translateX(-50%)',
            }}
            onClick={() => handleBubbleClick(bubble)}
            >
            <span className="text-white text-3xl font-bold [text-shadow:2px_2px_2px_rgba(0,0,0,0.5)]">
                {bubble.isQuestion ? currentQuestion.text : bubble.value}
            </span>
            </div>
        ))}

        <style jsx>{`
            @keyframes sway {
              0%, 100% { transform: rotate(-5deg); }
              50% { transform: rotate(5deg); }
            }
            @keyframes swimRight {
                from { left: -100px; }
                to { left: 110%; }
            }
            @keyframes swimLeft {
                from { right: -100px; }
                to { right: 110%; }
            }
        `}</style>
    </div>
  );
}
