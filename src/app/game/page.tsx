
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { cn } from '@/lib/utils';
import { Star, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Level {
  id: number;
  title: string;
  category: string;
  isHard?: boolean;
}

const gameLevels: Level[] = [
    { id: 1, title: 'Small Sister: +4 Formula', category: 'Small Sister' },
    { id: 2, title: 'Small Sister: +3 Formula', category: 'Small Sister' },
    { id: 3, title: 'Small Sister: +2 Formula', category: 'Small Sister' },
    { id: 4, title: 'Small Sister: +1 Formula', category: 'Small Sister' },
    { id: 5, title: 'Small Sister: -4 Formula', category: 'Small Sister' },
    { id: 6, title: 'Small Sister: -3 Formula', category: 'Small Sister' },
    { id: 7, title: 'Small Sister: -2 Formula', category: 'Small Sister' },
    { id: 8, title: 'Small Sister: -1 Formula', category: 'Small Sister' },
    { id: 9, title: 'Small Sister Challenge', category: 'Small Sister', isHard: true },
    { id: 10, title: 'Big Brother: +9 Formula', category: 'Big Brother' },
    { id: 11, title: 'Big Brother: +8 Formula', category: 'Big Brother' },
    { id: 12, title: 'Big Brother: +7 Formula', category: 'Big Brother' },
    { id: 13, title: 'Big Brother: +6 Formula', category: 'Big Brother' },
    { id: 14, title: 'Big Brother: +5 Formula', category: 'Big Brother' },
    { id: 15, title: 'Big Brother: +4 Formula', category: 'Big Brother' },
    { id: 16, title: 'Big Brother: +3 Formula', category: 'Big Brother' },
    { id: 17, title: 'Big Brother: +2 Formula', category: 'Big Brother' },
    { id: 18, title: 'Big Brother: +1 Formula', category: 'Big Brother' },
    { id: 19, title: 'Big Brother: -9 Formula', category: 'Big Brother' },
    { id: 20, title: 'Big Brother: -8 Formula', category: 'Big Brother' },
    { id: 21, title: 'Big Brother: -7 Formula', category: 'Big Brother' },
    { id: 22, title: 'Big Brother: -6 Formula', category: 'Big Brother' },
    { id: 23, title: 'Big Brother: -5 Formula', category: 'Big Brother' },
    { id: 24, title: 'Big Brother: -4 Formula', category: 'Big Brother' },
    { id: 25, title: 'Big Brother: -3 Formula', category: 'Big Brother' },
    { id: 26, title: 'Big Brother: -2 Formula', category: 'Big Brother' },
    { id: 27, title: 'Big Brother: -1 Formula', category: 'Big Brother' },
    { id: 28, title: 'Big Brother Challenge', category: 'Big Brother', isHard: true },
    { id: 29, title: 'Combination: +9 Formula', category: 'Combination' },
    { id: 30, title: 'Combination: +8 Formula', category: 'Combination' },
    { id: 31, title: 'Combination: +7 Formula', category: 'Combination' },
    { id: 32, title: 'Combination: +6 Formula', category: 'Combination' },
    { id: 33, title: 'Combination: -9 Formula', category: 'Combination' },
    { id: 34, title: 'Combination: -8 Formula', category: 'Combination' },
    { id: 35, title: 'Combination: -7 Formula', category: 'Combination' },
    { id: 36, title: 'Combination: -6 Formula', category: 'Combination' },
    { id: 37, title: 'Combination Challenge', category: 'Combination', isHard: true },
    { id: 38, title: 'Final Challenge', category: 'Final Challenge', isHard: true },
    { id: 39, title: 'Mastery Mix 1', category: 'Mastery Mix' },
    { id: 40, title: 'Mastery Mix 2', category: 'Mastery Mix' },
    { id: 41, title: 'Mastery Mix 3', category: 'Mastery Mix' },
    { id: 42, title: 'Mastery Mix 4', category: 'Mastery Mix' },
    { id: 43, title: 'Mastery Mix 5', category: 'Mastery Mix' },
    { id: 44, title: 'Mastery Mix 6', category: 'Mastery Mix' },
    { id: 45, title: 'Mastery Mix 7', category: 'Mastery Mix' },
    { id: 46, title: 'Mastery Mix 8', category: 'Mastery Mix' },
    { id: 47, title: 'Mastery Mix 9', category: 'Mastery Mix' },
    { id: 48, title: 'Mastery Mix 10', category: 'Mastery Mix' },
    { id: 49, title: 'Mastery Mix 11', category: 'Mastery Mix' },
    { id: 50, title: 'Grandmaster Challenge', category: 'Mastery Mix', isHard: true },
];

const PathLine = ({ reverse = false, className }: { reverse?: boolean; className?: string }) => (
    <svg className={cn("h-full w-full", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
            d={reverse ? "M 95 0 C 95 50, 5 50, 5 100" : "M 5 0 C 5 50, 95 50, 95 100"}
            stroke="#8c5a2b"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
        />
    </svg>
);


const LevelNode = ({ level, isLocked, isCompleted }: { level: Level; isLocked: boolean; isCompleted: boolean; }) => {
  const linkContent = (
    <div className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110",
        isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700",
        isCompleted && "bg-gradient-to-br from-yellow-400 to-yellow-600",
        "border-4 border-white/50"
    )}>
      <div className="absolute inset-1 rounded-full bg-black/10"></div>
      <div className="absolute top-2 left-4 h-4 w-8 rounded-full bg-white/30 transform -rotate-45"></div>
        <span className="relative text-4xl font-bold [text-shadow:2px_2px_2px_rgba(0,0,0,0.4)]">{level.id}</span>
        {isCompleted && !isLocked && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-white">
                <Check className="w-4 h-4 text-white" />
            </div>
        )}
        {level.isHard && !isLocked && (
             <div className="absolute -bottom-2 -right-2 bg-purple-700 rounded-full p-1 border-2 border-white">
                <Star className="w-4 h-4 text-yellow-300" />
            </div>
        )}
         {isLocked && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center" />
        )}
    </div>
  );

  return (
    isLocked ? (
      <div className="tooltip" data-tip={`Complete level ${level.id-1} to unlock`}>
        {linkContent}
      </div>
    ) : (
      <Link href={`/game/level-${level.id}`} className="tooltip" data-tip={level.title}>
        {linkContent}
      </Link>
    )
  );
};


export default function GameHomePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/game_bg.jpg?alt=media');
  const { user, getCompletedGameLevels } = useAuth();
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCompletedGameLevels()
        .then(levels => {
          setCompletedLevels(levels);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user, getCompletedGameLevels]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Your Adventure...</CardTitle>
          <CardDescription>Please wait while we get your progress.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-pink-600 font-headline drop-shadow-lg sm:text-6xl">Level Map</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-pink-800/80">
          Follow the candy road to master your abacus skills!
        </p>
      </div>

      <div className="relative w-full max-w-sm mx-auto">
        {gameLevels.map((level, index) => {
            const isLocked = user ? level.id > 1 && !completedLevels.includes(level.id - 1) : level.id > 1;
            const isCompleted = completedLevels.includes(level.id);
            const isLeft = index % 2 === 0;

            return (
                <div key={level.id} className="relative h-32 flex items-center">
                    {/* Path */}
                    {index < gameLevels.length - 1 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-32 h-full z-0">
                            <PathLine reverse={!isLeft} />
                        </div>
                    )}

                    {/* Level Node */}
                    <div className={cn("absolute z-10", isLeft ? "left-0" : "right-0")}>
                        <LevelNode level={level} isLocked={isLocked} isCompleted={isCompleted} />
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}
