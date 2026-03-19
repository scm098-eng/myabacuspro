'use client';

import React from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { MousePointerClick, Eye, Lock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const LevelGrid = ({ mode, isLocked }: { mode: 'beads-identify' | 'beads-set', isLocked: boolean }) => {
  const router = useRouter();
  const levels = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4">
      {levels.map((level) => (
        <Button
          key={level}
          variant="outline"
          disabled={isLocked}
          onClick={() => router.push(`/tests/${mode}/level-${level}`)}
          className={cn(
            "h-20 text-xl font-black transition-all hover:scale-105 rounded-2xl",
            isLocked ? "opacity-50 grayscale" : "border-primary/20 hover:border-primary bg-card hover:bg-primary/5 shadow-sm"
          )}
        >
          {isLocked ? <Lock className="w-4 h-4 mr-2" /> : null}
          Level {level}
        </Button>
      ))}
    </div>
  );
};

export default function BeadsValuePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/beads_value_bg.jpg?alt=media');
  const { user, profile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="space-y-12 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isPro = profile?.subscriptionStatus === 'pro';
  const isAdminOrTeacher = profile?.role === 'admin' || profile?.role === 'teacher';
  const isLocked = false; 

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">Beads Mastery</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          10 levels of progressive training. Each level features a dynamic mixture of digits to sharpen your mental visualization.
        </p>
      </div>

      <Tabs defaultValue="identify" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-16 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl">
          <TabsTrigger value="identify" className="text-lg font-bold flex items-center gap-2 rounded-xl">
            <Eye className="w-5 h-5" /> Identify
          </TabsTrigger>
          <TabsTrigger value="set" className="text-lg font-bold flex items-center gap-2 rounded-xl">
            <MousePointerClick className="w-5 h-5" /> Set Value
          </TabsTrigger>
        </TabsList>

        <div className="mt-10">
          <TabsContent value="identify" className="animate-in fade-in slide-in-from-left-4">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-yellow-500 text-white py-10 text-center">
                <div className="mx-auto bg-white/20 p-4 rounded-full w-fit mb-4">
                  <Eye className="w-10 h-10" />
                </div>
                <CardTitle className="text-3xl font-black uppercase tracking-tight">
                  Visual Recognition
                </CardTitle>
                <CardDescription className="text-white/80 font-bold text-lg">
                  Can you read the abacus? Select a level to start.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <LevelGrid mode="beads-identify" isLocked={isLocked} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="set" className="animate-in fade-in slide-in-from-right-4">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-blue-600 text-white py-10 text-center">
                <div className="mx-auto bg-white/20 p-4 rounded-full w-fit mb-4">
                  <MousePointerClick className="w-10 h-10" />
                </div>
                <CardTitle className="text-3xl font-black uppercase tracking-tight">
                  Interactive Setting
                </CardTitle>
                <CardDescription className="text-white/80 font-bold text-lg">
                  Place the beads yourself to match the target number.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <LevelGrid mode="beads-set" isLocked={isLocked} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {!isPro && !isAdminOrTeacher && (
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-700">
          <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Zap className="text-yellow-300 w-6 h-6 fill-yellow-300" />
                <span className="text-white font-black uppercase tracking-widest text-sm">Pro Feature</span>
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Accelerate Your Learning</h2>
              <p className="text-orange-100 font-bold text-lg">Pro members unlock advanced analytic reports and appear on the global Hall of Fame.</p>
            </div>
            <Button onClick={() => router.push('/pricing')} className="bg-white text-orange-600 hover:bg-orange-50 font-black h-16 px-10 rounded-2xl text-xl shadow-2xl transition-transform hover:scale-105 shrink-0">
              UPGRADE NOW
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
