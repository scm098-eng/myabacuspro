
'use client';

import React from 'react';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { MousePointerClick, Eye, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const DIGIT_CATEGORIES = [
  { title: "Single Digit", range: "Levels 1 - 10", start: 1, end: 10 },
  { title: "Double Digit", range: "Levels 11 - 20", start: 11, end: 20 },
  { title: "Triple Digit", range: "Levels 21 - 30", start: 21, end: 30 },
  { title: "4-Digit", range: "Levels 31 - 40", start: 31, end: 40 },
];

const LevelGrid = ({ mode, category, isLocked }: { mode: 'beads-identify' | 'beads-set', category: typeof DIGIT_CATEGORIES[0], isLocked: boolean }) => {
  const router = useRouter();
  const levels = Array.from({ length: 10 }, (_, i) => category.start + i);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 py-4">
      {levels.map((level) => (
        <Button
          key={level}
          variant="outline"
          disabled={isLocked}
          onClick={() => router.push(`/tests/${mode}/level-${level}`)}
          className={cn(
            "h-16 text-lg font-bold transition-all hover:scale-105",
            isLocked ? "opacity-50 grayscale" : "border-primary/20 hover:border-primary bg-card"
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
  const { user, profile, isLoading, isTrialActive } = useAuth();
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
  // Beads tests are generally open but let's follow the standard locking logic if required
  // For now, we'll keep them open but prioritize pro branding
  const isLocked = false; 

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">Beads Mastery</h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Progress from single digits to complex 4-digit numbers with our structured training levels.
        </p>
      </div>

      <Tabs defaultValue="identify" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto h-16 p-1 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger value="identify" className="text-lg font-bold flex items-center gap-2">
            <Eye className="w-5 h-5" /> Identify Value
          </TabsTrigger>
          <TabsTrigger value="set" className="text-lg font-bold flex items-center gap-2">
            <MousePointerClick className="w-5 h-5" /> Set Value
          </TabsTrigger>
        </TabsList>

        <div className="mt-10">
          <TabsContent value="identify" className="animate-in fade-in slide-in-from-left-4">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-yellow-500 text-white rounded-t-xl py-8">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-3">
                  <Eye className="w-10 h-10" />
                  Visual Recognition Lab
                </CardTitle>
                <CardDescription className="text-white/80 font-bold">
                  Observe the abacus and enter the corresponding numeric value.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {DIGIT_CATEGORIES.map((cat, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-2xl px-6 bg-background/50">
                      <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-4 text-left">
                          <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-black text-xl shadow-inner">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground uppercase leading-tight">{cat.title}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cat.range}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <LevelGrid mode="beads-identify" category={cat} isLocked={isLocked} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="set" className="animate-in fade-in slide-in-from-right-4">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
              <CardHeader className="bg-blue-600 text-white rounded-t-xl py-8">
                <CardTitle className="text-3xl font-black uppercase flex items-center gap-3">
                  <MousePointerClick className="w-10 h-10" />
                  Interactive Setting Lab
                </CardTitle>
                <CardDescription className="text-white/80 font-bold">
                  Use the digital abacus to represent the target number shown on screen.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full space-y-4">
                  {DIGIT_CATEGORIES.map((cat, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`} className="border rounded-2xl px-6 bg-background/50">
                      <AccordionTrigger className="hover:no-underline py-6">
                        <div className="flex items-center gap-4 text-left">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xl shadow-inner">
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-foreground uppercase leading-tight">{cat.title}</h3>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{cat.range}</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <LevelGrid mode="beads-set" category={cat} isLocked={isLocked} />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      {!isPro && !isAdminOrTeacher && (
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-700">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-2">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Unlock All Levels</h2>
              <p className="text-orange-100 font-bold text-lg">Pro members get immediate access to all 40 levels and advanced 4-digit challenges.</p>
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
