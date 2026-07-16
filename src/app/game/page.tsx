
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageBackground } from '@/hooks/usePageBackground';
import { cn } from '@/lib/utils';
import { Star, Check, Swords, BrainCircuit, Gamepad2, MonitorOff, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface Level {
  id: number;
  title: string;
  category: string;
  isHard?: boolean;
}

const generateLevels = (): Level[] => {
  const levels: Level[] = [];
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
      levels.push({ id: i, title: titles[i - 1], category, isHard: i % 9 === 0 || i === 38 || i === 50 });
    } else {
      levels.push({ id: i, title: `Elite Mastery: Mix ${((i - 51) % 12) + 1}`, category: 'Elite Mastery', isHard: i % 10 === 0 });
    }
  }
  return levels;
};

const gameLevels = generateLevels();

const PathLine = ({ reverse = false, className }: { reverse?: boolean; className?: string }) => (
    <svg className={cn("h-full w-full", className)} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={reverse ? "M 95 0 C 95 50, 5 50, 5 100" : "M 5 0 C 5 50, 95 50, 95 100"} stroke="#8c5a2b" strokeWidth="12" fill="none" strokeLinecap="round" />
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
        <span className="relative text-4xl font-bold [text-shadow:2px_2px_4px_rgba(0,0,0,0.4)]">{level.id}</span>
        {isCompleted && !isLocked && (<div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 border-2 border-white shadow-md"><Check className="w-4 h-4 text-white" /></div>)}
        {level.isHard && !isLocked && (<div className="absolute -bottom-2 -right-2 bg-purple-700 rounded-full p-1 border-2 border-white shadow-md"><Star className="w-4 h-4 text-yellow-300" /></div>)}
        {isLocked && (<div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center" />)}
    </div>
  );
  return isLocked ? (<div className="tooltip" data-tip={`Complete level ${level.id-1} to unlock`}>{linkContent}</div>) : (<Link href={`/game/level-${level.id}`} className="tooltip" data-tip={level.title}>{linkContent}</Link>);
};

export default function GameHomePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/game_bg.jpg?alt=media');
  const { user, profile, getCompletedGameLevels } = useAuth();
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getCompletedGameLevels().then(levels => { setCompletedLevels(levels); setIsLoading(false); });
    } else { setIsLoading(false); }
  }, [user, getCompletedGameLevels]);

  const lastAttendedId = profile?.lastLevelAttended || 0;

  useEffect(() => {
    if (!isLoading && lastAttendedId > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`level-node-${lastAttendedId}`);
        if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, lastAttendedId]);

  if (isLoading) return (<div className="space-y-12"><Skeleton className="h-12 w-3/4 mx-auto" /><Skeleton className="h-6 w-full" /></div>);

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-pink-600 font-headline drop-shadow-lg sm:text-6xl uppercase">The Game Hub</h1>
        <p className="max-w-2xl mx-auto text-lg text-pink-800/80 font-bold">Challenge your mind with visualization drills, competitive duels, and bubble missions!</p>
      </div>

      <Tabs defaultValue="levels" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-16 p-1 bg-pink-100/50 rounded-2xl border-2 border-pink-200">
          <TabsTrigger value="levels" className="text-lg font-bold flex items-center gap-2 rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white">
            <Gamepad2 className="w-5 h-5" /> Bubble Path
          </TabsTrigger>
          <TabsTrigger value="memory" className="text-lg font-bold flex items-center gap-2 rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            <LayoutGrid className="w-5 h-5" /> Matrix Flash
          </TabsTrigger>
          <TabsTrigger value="duels" className="text-lg font-bold flex items-center gap-2 rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Swords className="w-5 h-5" /> 1v1 Duels
          </TabsTrigger>
        </TabsList>

        <div className="mt-12">
          <TabsContent value="levels" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="relative w-full max-w-sm mx-auto pb-20">
              {gameLevels.map((level, index) => {
                  const isLocked = isAdmin ? false : (user ? level.id > 1 && !completedLevels.includes(level.id - 1) : level.id > 1);
                  const isCompleted = completedLevels.includes(level.id);
                  const isLeft = index % 2 === 0;
                  const maxCompleted = Math.max(...completedLevels, 0);
                  const maxReachable = Math.max(maxCompleted + 5, lastAttendedId + 3);
                  if (level.id > maxReachable && !isAdmin) return null;
                  return (
                      <div key={level.id} id={`level-node-${level.id}`} className="relative h-32 flex items-center">
                          {index < gameLevels.length - 1 && (<div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-32 h-full z-0"><PathLine reverse={!isLeft} /></div>)}
                          <div className={cn("absolute z-10", isLeft ? "left-0" : "right-0")}><LevelNode level={level} isLocked={isLocked} isCompleted={isCompleted} /></div>
                      </div>
                  )
              })}
              {!isAdmin && (<div className="text-center mt-12"><p className="text-muted-foreground font-medium italic">Complete current levels to reveal more of the road...</p></div>)}
            </div>
          </TabsContent>

          <TabsContent value="memory" className="animate-in fade-in slide-in-from-left-8 duration-500">
             <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
               <div className="bg-teal-600 p-12 text-white text-center">
                  <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-pulse"><LayoutGrid className="w-12 h-12 text-white" /></div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Matrix Memory Flash</h2>
                  <p className="text-teal-100 font-bold mt-2 text-lg">Build perfect spatial visualization by reconstructing high-speed pattern matrices.</p>
               </div>
               <CardContent className="p-12 text-center space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                     <div className="p-6 bg-teal-50 rounded-2xl border-2 border-teal-100"><Badge className="mb-2 bg-teal-600">Phase 1</Badge><h4 className="font-bold text-teal-900">Observe</h4><p className="text-xs text-teal-700/70 mt-1 font-medium">A unique pattern flashes on the grid. Observe the shape.</p></div>
                     <div className="p-6 bg-teal-50 rounded-2xl border-2 border-teal-100"><Badge className="mb-2 bg-teal-600">Phase 2</Badge><h4 className="font-bold text-teal-900">Visualize</h4><p className="text-xs text-teal-700/70 mt-1 font-medium">The tiles clear. Reconstruct the image from your mental "snapshot".</p></div>
                     <div className="p-6 bg-teal-50 rounded-2xl border-2 border-teal-100"><Badge className="mb-2 bg-teal-600">Phase 3</Badge><h4 className="font-bold text-teal-900">Scale</h4><p className="text-xs text-teal-700/70 mt-1 font-medium">Clear 5 rounds to level up. The grid grows as you improve.</p></div>
                  </div>
                  <Button asChild size="lg" className="h-16 px-12 text-xl font-black uppercase tracking-widest rounded-2xl bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200">
                    <Link href="/game/memory">Enter Memory Matrix</Link>
                  </Button>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="duels" className="animate-in fade-in slide-in-from-right-8 duration-500">
             <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
               <div className="bg-orange-500 p-12 text-white text-center">
                  <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-bounce"><Swords className="w-12 h-12" /></div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">World Championship Duels</h2>
                  <p className="text-orange-100 font-bold mt-2 text-lg">Challenge other students worldwide in real-time or async math races.</p>
               </div>
               <CardContent className="p-12 text-center space-y-10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black uppercase text-slate-800">Quick Match</h3>
                        <p className="text-sm text-slate-500 font-medium">Find an available opponent instantly.</p>
                        <Button asChild className="h-14 w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-black">
                           <Link href="/game/duels">Find Opponent</Link>
                        </Button>
                     </div>
                     <div className="h-20 w-px bg-slate-200 hidden md:block" />
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black uppercase text-slate-800">Private Duel</h3>
                        <p className="text-sm text-slate-500 font-medium">Create a lobby and share the link with a friend.</p>
                        <Button asChild variant="outline" className="h-14 w-full border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl font-black">
                           <Link href="/game/duels?mode=create">Create Lobby</Link>
                        </Button>
                     </div>
                  </div>
               </CardContent>
             </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
