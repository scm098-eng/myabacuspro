
'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { cn } from '@/lib/utils';
import { Star, Check, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Level {
  id: number;
  title: string;
  category: string;
  isHard?: boolean;
}

// Generate 1000 levels dynamically
const generateLevels = (): Level[] => {
  const levels: Level[] = [];
  
  // Specific curriculums for the first 50 levels
  const titles = [
    'Small Sister: +4 Formula', 'Small Sister: +3 Formula', 'Small Sister: +2 Formula', 'Small Sister: +1 Formula',
    'Small Sister: -4 Formula', 'Small Sister: -3 Formula', 'Small Sister: -2 Formula', 'Small Sister: -1 Formula',
    'Small Sister Challenge',
    'Big Brother: +9 Formula', 'Big Brother: +8 Formula', 'Big Brother: +7 Formula', 'Big Brother: +6 Formula', 'Big Brother: +5 Formula', 'Big Brother: +4 Formula', 'Big Brother: +3 Formula', 'Big Brother: +2 Formula', 'Big Brother: +1 Formula',
    'Big Brother: -9 Formula', 'Big Brother: -8 Formula', 'Big Brother: -7 Formula', 'Big Brother: -6 Formula', 'Big Brother: -5 Formula', 'Big Brother: -4 Formula', 'Big Brother: -3 Formula', 'Big Brother: -2 Formula', 'Big Brother: -1 Formula',
    'Big Brother Challenge',
    'Combination: +9 Formula', 'Combination: +8 Formula', 'Combination: +7 Formula', 'Combination: +6 Formula',
    'Combination: -9 Formula', 'Combination: -8 Formula', 'Combination: -7 Formula', 'Combination: -6 Formula',
    'Combination Challenge', 'Final Challenge',
    'Mastery Mix 1', 'Mastery Mix 2', 'Mastery Mix 3', 'Mastery Mix 4', 'Mastery Mix 5', 'Mastery Mix 6', 'Mastery Mix 7', 'Mastery Mix 8', 'Mastery Mix 9', 'Mastery Mix 10', 'Mastery Mix 11', 'Mastery Mix 12'
  ];

  for (let i = 1; i <= 1000; i++) {
    if (i <= 50) {
      let category = 'Mastery Mix';
      if (i <= 9) category = 'Small Sister';
      else if (i <= 28) category = 'Big Brother';
      else if (i <= 37) category = 'Combination';
      else if (i === 38) category = 'Final Challenge';

      levels.push({
        id: i,
        title: titles[i - 1],
        category,
        isHard: i % 9 === 0 || i === 38 || i === 50
      });
    } else {
      levels.push({
        id: i,
        title: `Elite Mastery: Mix ${((i - 51) % 12) + 1}`,
        category: 'Elite Mastery',
        isHard: i % 10 === 0
      });
    }
  }
  return levels;
};

const gameLevels = generateLevels();

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

const LevelNode = ({ level, isLocked, isCompleted, isLastAttended }: { level: Level; isLocked: boolean; isCompleted: boolean; isLastAttended: boolean; }) => {
  const linkContent = (
    <div className={cn(
        "relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 transform hover:scale-110",
        isLocked ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700",
        isCompleted && "bg-gradient-to-br from-yellow-400 to-yellow-600",
        isLastAttended && "ring-4 ring-pink-500 ring-offset-4 ring-offset-background animate-pulse",
        "border-4 border-white/50"
    )}>
      <div className="absolute inset-1 rounded-full bg-black/10"></div>
      <div className="absolute top-2 left-4 h-4 w-8 rounded-full bg-white/30 transform -rotate-45"></div>
        <span className="relative text-4xl font-bold [text-shadow:2px_2px_4px_rgba(0,0,0,0.4)]">{level.id}</span>
        
        {isLastAttended && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap shadow-lg animate-bounce">
                YOU ARE HERE
            </div>
        )}

        {isCompleted && !isLocked && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-md">
                <Check className="w-4 h-4 text-white" />
            </div>
        )}
        {level.isHard && !isLocked && (
             <div className="absolute -bottom-2 -right-2 bg-purple-700 rounded-full p-1 border-2 border-white shadow-md">
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
  const { user, profile, getCompletedGameLevels } = useAuth();
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

  const isAdmin = profile?.role === 'admin';
  const lastAttendedId = profile?.lastLevelAttended || 0;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-pink-600 font-headline drop-shadow-lg sm:text-6xl uppercase">Level Map</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-pink-800/80 font-bold">
          Follow the candy road to master your abacus skills!
        </p>
      </div>

      <div className="relative w-full max-w-sm mx-auto pb-20">
        {gameLevels.map((level, index) => {
            const isLocked = isAdmin ? false : (user ? level.id > 1 && !completedLevels.includes(level.id - 1) : level.id > 1);
            const isCompleted = completedLevels.includes(level.id);
            const isLastAttended = level.id === lastAttendedId;
            const isLeft = index % 2 === 0;

            // Only show levels reachable or recently attended to keep UI clean
            const maxCompleted = Math.max(...completedLevels, 0);
            const maxReachable = Math.max(maxCompleted + 5, lastAttendedId + 3);
            
            if (level.id > maxReachable && !isAdmin) return null;

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
                        <LevelNode level={level} isLocked={isLocked} isCompleted={isCompleted} isLastAttended={isLastAttended} />
                    </div>
                </div>
            )
        })}
        {!isAdmin && completedLevels.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground font-medium italic">Complete current levels to reveal more of the road...</p>
          </div>
        )}
      </div>
    </div>
  );
}
