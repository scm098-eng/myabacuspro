
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, CheckCircle2, ChevronRight } from 'lucide-react';
import { PAGE_GUIDES } from '@/lib/constants';

interface PageGuideProps {
  guideKey: keyof typeof PAGE_GUIDES;
  triggerLabel?: string;
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export default function PageGuide({ guideKey, triggerLabel = "How to Use", variant = "outline", className }: PageGuideProps) {
  const guide = PAGE_GUIDES[guideKey];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Info className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-md rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex-1 overflow-y-auto p-6 sm:p-8 scrollbar-none">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-6 shadow-inner text-primary">
            <Info className="w-8 h-8" />
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-black font-headline uppercase tracking-tighter text-foreground text-center leading-none">
              {guide.title}
            </DialogTitle>
            <DialogDescription className="sr-only">Step-by-step instructions</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-8">
            {guide.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-muted-foreground/5 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white text-[10px] font-black">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-slate-700 leading-tight pt-0.5">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="relative z-10 p-6 pt-0">
          <Button className="w-full h-12 font-black uppercase tracking-widest rounded-xl shadow-lg" asChild>
            <DialogTrigger>
              Got it, thanks! <CheckCircle2 className="ml-2 h-4 w-4" />
            </DialogTrigger>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
