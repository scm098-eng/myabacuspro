'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Rocket, Check, Sparkles } from 'lucide-react';
import { APP_VERSION, UPDATE_NOTES } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

export default function UpdateHighlights() {
  const { user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only check for updates if the user is logged in and loading is finished
    if (!isLoading && user) {
      const lastSeenVersion = localStorage.getItem('last_seen_version');
      if (lastSeenVersion !== APP_VERSION) {
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading]);

  const handleDismiss = () => {
    localStorage.setItem('last_seen_version', APP_VERSION);
    setIsOpen(false);
  };

  // Do not render anything if user is not logged in or loading
  if (!user || isLoading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (!val) handleDismiss();
    }}>
      <DialogContent className="w-[95vw] sm:max-w-lg p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
        <div className="overflow-y-auto flex-1 scrollbar-none">
          <div className="bg-slate-900 p-6 sm:p-8 text-center text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Sparkles className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <div className="mx-auto bg-white/10 p-4 rounded-3xl w-fit mb-4">
              <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>
            <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] text-primary mb-1">New Update Available</h2>
            <DialogTitle className="text-3xl sm:text-4xl font-black font-headline uppercase tracking-tighter">
              Version {APP_VERSION}
            </DialogTitle>
          </div>

          <div className="p-6 sm:p-8 space-y-6 bg-white">
            <DialogDescription className="sr-only">What's new in this update</DialogDescription>
            <div className="grid gap-6">
              {UPDATE_NOTES.map((note, i) => (
                <div key={i} className="flex items-start gap-4 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-xl sm:text-2xl shadow-inner border border-primary/10">
                    {note.icon}
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 leading-tight mb-1">{note.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">{note.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 sm:p-8 pt-0 bg-white">
          <Button onClick={handleDismiss} className="w-full h-14 sm:h-16 text-lg sm:text-xl font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.01] transition-transform">
            Awesome, Let's Go!
            <Check className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
