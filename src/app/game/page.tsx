'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageBackground } from '@/hooks/usePageBackground';
import { cn } from '@/lib/utils';
import { Star, Check, Swords, BrainCircuit, Gamepad2, MonitorOff, LayoutGrid, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

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
      levels.push({ id: i, title: titles[i - 1] || `Mix ${i}`, category, isHard: i % 9 === 0 || i === 38 || i === 50 });
    } else {
      levels.push({ id: i, title: `Elite Mastery: Mix ${((i - 51) % 12) + 1}`, category: 'Elite Mastery', isHard: i % 10 === 0 });
    }
  }
  return levels;
};

const gameLevels = generateLevels();

const LevelNode = ({ level, isLocked, isCompleted, style }: { level: Level; isLocked: boolean; isCompleted: boolean; style?: React.CSSProperties }) => {
  const linkContent = (
    <div 
      className={cn(
        "relative w-20 h-20 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform",
        isLocked ? "bg-gray-400 grayscale cursor-not-allowed" : "bg-gradient-to-br from-pink-400 to-pink-600 hover:scale-110",
        isCompleted && !isLocked && "from-green-400 to-green-600",
        level.isHard && !isLocked && "ring-4 ring-yellow-400 ring-offset-4 ring-offset-transparent",
        "border-4 border-white/50"
      )}
    >
        <div className="absolute inset-1 rounded-full bg-black/10"></div>
        <span className="relative text-3xl sm:text-5xl font-black [text-shadow:2px_2px_4px_rgba(0,0,0,0.4)]">{level.id}</span>
        {isCompleted && !isLocked && (<div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 border-2 border-white shadow-md"><Check className="w-4 h-4 text-white stroke-[4px]" /></div>)}
        {level.isHard && !isLocked && (<div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1.5 border-2 border-white shadow-md"><Star className="w-4 h-4 text-yellow-900 fill-yellow-900" /></div>)}
        {isLocked && (<div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center"><Check className="w-8 h-8 text-white/20" /></div>)}
    </div>
  );
  
  return isLocked ? (
    <div className="opacity-50 pointer-events-none" style={style}>{linkContent}</div>
  ) : (
    <Link href={`/game/level-${level.id}`} className="block" style={style}>
      {linkContent}
    </Link>
  );
};

export default function GameHomePage() {
  usePageBackground('');
  const { user, profile, getCompletedGameLevels } = useAuth();
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("levels");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getCompletedGameLevels().then(levels => { setCompletedLevels(levels); setIsLoading(false); });
    } else { setIsLoading(false); }
  }, [user, getCompletedGameLevels]);

  const lastAttendedId = profile?.lastLevelAttended || 1;

  // Persistent Scroll Logic: Triggers whenever "levels" tab is selected or load finishes
  useEffect(() => {
    if (!isLoading && activeTab === "levels" && scrollContainerRef.current) {
      const timer = setTimeout(() => {
        const node = document.getElementById(`level-node-${lastAttendedId}`);
        if (node) {
          node.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, lastAttendedId, activeTab]);

  if (isLoading) return (<div className="space-y-12"><Skeleton className="h-12 w-3/4 mx-auto" /><Skeleton className="h-6 w-full" /></div>);

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="relative min-h-[80vh] flex flex-col">
      <div className="text-center space-y-4 mb-8 shrink-0">
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-pink-600 font-headline drop-shadow-sm uppercase">Bubble Game</h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-lg text-pink-800/80 font-bold">Challenge your mind with visualization drills, competitive duels, and bubble missions!</p>
      </div>

      <Tabs defaultValue="levels" value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <div className="sticky top-16 z-[60] bg-background/95 backdrop-blur-md py-4 border-b shrink-0">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto h-14 sm:h-16 p-1 bg-pink-100/50 rounded-2xl border-2 border-pink-200">
            <TabsTrigger value="levels" className="text-xs sm:text-lg font-black flex items-center gap-2 rounded-xl data-[state=active]:bg-pink-500 data-[state=active]:text-white">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" /> Bubble Game
            </TabsTrigger>
            <TabsTrigger value="memory" className="text-xs sm:text-lg font-black flex items-center gap-2 rounded-xl data-[state=active]:bg-teal-500 data-[state=active]:text-white">
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" /> Matrix
            </TabsTrigger>
            <TabsTrigger value="duels" className="text-xs sm:text-lg font-black flex items-center gap-2 rounded-xl data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5" /> Duels
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent value="levels" className="h-full m-0 animate-in fade-in duration-500 outline-none">
            <div className="relative h-[650px] overflow-hidden bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950 rounded-[3.5rem] border-8 border-white/20 shadow-2xl mt-8 mx-auto max-w-2xl">
              
              {/* Light Rays Effect */}
              <div className="absolute top-0 left-0 right-0 h-full opacity-40 pointer-events-none" 
                   style={{ background: 'radial-gradient(circle at 50% 10%, white 0%, transparent 60%)' }} />

              {/* Decorative Rising Bubbles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-white/20 rounded-full animate-[bubble-rise-bg_linear_infinite]"
                    style={{
                      width: `${Math.random() * 12 + 4}px`,
                      height: `${Math.random() * 12 + 4}px`,
                      left: `${Math.random() * 100}%`,
                      bottom: "-20px",
                      animationDuration: `${Math.random() * 7 + 7}s`,
                      animationDelay: `${Math.random() * 15}s`,
                    }}
                  />
                ))}
              </div>

              {/* Animated Fish Decorations */}
              <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute top-[30%] animate-[swimRight_20s_linear_infinite]">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish%20(2).webp?alt=media" alt="Fish" width={80} height={50} />
                  </div>
                  <div className="absolute top-[60%] animate-[swimLeft_25s_linear_infinite]">
                    <Image src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/fish%20(2).webp?alt=media" alt="Fish" width={100} height={60} className="scale-x-[-1]" />
                  </div>
              </div>

              <div 
                ref={scrollContainerRef}
                className="absolute inset-0 overflow-y-auto scrollbar-none py-[280px] px-8"
              >
                <div className="relative flex flex-col items-center gap-24">
                  {gameLevels.map((level) => {
                    const isLocked = isAdmin ? false : (user ? level.id > 1 && !completedLevels.includes(level.id - 1) : level.id > 1);
                    const isCompleted = completedLevels.includes(level.id);
                    
                    const maxCompleted = Math.max(...completedLevels, 0);
                    if (level.id > maxCompleted + 20 && !isAdmin) return null;

                    return (
                      <div 
                        key={level.id} 
                        id={`level-node-${level.id}`}
                        className="relative transition-all duration-300 flex justify-center"
                      >
                        <LevelNode 
                          level={level} 
                          isLocked={isLocked} 
                          isCompleted={isCompleted}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Fog/Atmosphere Overlays */}
              <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-sky-400 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-indigo-950 to-transparent z-10 pointer-events-none" />
            </div>
          </TabsContent>

          <TabsContent value="memory" className="animate-in slide-in-from-left-8 duration-500 pt-8 outline-none">
             <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
               <div className="bg-teal-600 p-8 sm:p-12 text-white text-center">
                  <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-pulse"><LayoutGrid className="w-10 h-10 sm:w-12 sm:h-12 text-white" /></div>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">Matrix Memory Flash</h2>
                  <p className="text-teal-100 font-bold mt-2 text-sm sm:text-lg">Build perfect spatial visualization by reconstructing high-speed pattern matrices.</p>
               </div>
               <CardContent className="p-8 sm:p-12 text-center space-y-8">
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

          <TabsContent value="duels" className="animate-in slide-in-from-right-8 duration-500 pt-8 outline-none">
             <Card className="max-w-4xl mx-auto rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
               <div className="bg-orange-500 p-8 sm:p-12 text-white text-center">
                  <div className="mx-auto bg-white/20 p-5 rounded-full w-fit mb-6 animate-bounce"><Swords className="w-10 h-10 sm:w-12 sm:h-12" /></div>
                  <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">World Championship Duels</h2>
                  <p className="text-orange-100 font-bold mt-2 text-sm sm:text-lg">Challenge other students worldwide in real-time or async math races.</p>
               </div>
               <CardContent className="p-8 sm:p-12 text-center space-y-10">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                     <div className="space-y-4">
                        <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-800">Quick Match</h3>
                        <p className="text-sm text-slate-500 font-medium">Find an available opponent instantly.</p>
                        <Button asChild className="h-14 w-full bg-orange-500 hover:bg-orange-600 rounded-xl font-black">
                           <Link href="/game/duels">Find Opponent</Link>
                        </Button>
                     </div>
                     <div className="h-20 w-px bg-slate-200 hidden md:block" />
                     <div className="space-y-4">
                        <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-800">Private Duel</h3>
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