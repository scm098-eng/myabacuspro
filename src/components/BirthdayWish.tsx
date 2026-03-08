
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Cake } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';
import confetti from 'canvas-confetti';

export default function BirthdayWish() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (profile?.dob && isToday(parseISO(profile.dob))) {
      // Use a timeout to avoid showing the dialog immediately on page load, which can be jarring.
      const timer = setTimeout(() => {
        setIsOpen(true);
        // 🎊 CELEBRATION FLASH: Confetti Burst
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ec4899', '#f43f5e', '#ffffff', '#fbbf24']
        });
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [profile]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center border-pink-200 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2.5rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" />
        <DialogHeader className="relative z-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-pink-100 mb-6 animate-bounce shadow-lg shadow-pink-200 border-4 border-white">
            <Cake className="h-12 w-12 text-pink-600 animate-pulse" />
          </div>
          <DialogTitle className="text-4xl font-black font-headline text-pink-600 uppercase tracking-tighter drop-shadow-sm">
            Happy Birthday!
          </DialogTitle>
          <DialogDescription className="mt-4 text-xl font-bold text-slate-700 leading-relaxed px-4">
            {profile?.firstName}, wishing you an amazing day filled with joy and success. Keep shining, Champion! 🌟
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 relative z-10">
           <div className="inline-block px-8 py-3 bg-pink-600 text-white rounded-full font-black text-sm uppercase tracking-widest shadow-xl shadow-pink-200 animate-pulse border-2 border-pink-400">
              Birthday Mastery Bonus: +100 PTS!
           </div>
           <p className="text-[10px] text-pink-400 font-black uppercase tracking-[0.3em] mt-6">From the My Abacus Pro Team</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
