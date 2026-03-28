'use client';

import React from 'react';
import { Trophy, X, PartyPopper, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MilestoneCelebrationProps {
  days: number;
  onClose: () => void;
}

export default function MilestoneCelebration({ days, onClose }: MilestoneCelebrationProps) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-500">
      <div className="relative max-w-md w-full bg-gradient-to-b from-white to-slate-50 rounded-[3rem] shadow-[0_0_50px_rgba(251,191,36,0.3)] p-10 text-center border-4 border-yellow-400 overflow-hidden">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-orange-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-8 relative">
            {/* The Rotating Trophy */}
            <div className="bg-gradient-to-br from-yellow-300 to-yellow-500 p-8 rounded-full shadow-2xl animate-trophy-pop-rotate">
              <Trophy className="w-24 h-24 text-yellow-900 drop-shadow-lg" />
            </div>
            {/* Decorative icons */}
            <div className="absolute -top-4 -right-4 animate-bounce delay-100">
                <PartyPopper className="w-8 h-8 text-orange-500" />
            </div>
            <div className="absolute -bottom-4 -left-4 animate-bounce delay-300">
                <Star className="w-8 h-8 text-yellow-600 fill-yellow-600" />
            </div>
          </div>
          
          <div className="space-y-2 mb-8">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">
              Practice Milestone!
            </h2>
            <div className="bg-yellow-100 text-yellow-700 px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest inline-block border-2 border-yellow-200">
              {days} Days Consistency
            </div>
          </div>

          <p className="text-lg font-bold text-slate-600 leading-relaxed mb-10">
            Fantastic effort! You've practiced for <span className="text-primary font-black">{days} days</span>. 
            You're building the mind of a Human Calculator!
          </p>
          
          <Button 
            onClick={onClose} 
            className="w-full h-16 text-xl font-black uppercase tracking-widest bg-yellow-400 hover:bg-yellow-500 text-yellow-950 rounded-2xl shadow-2xl shadow-yellow-200 transition-transform active:scale-95 group"
          >
            Claim Reward
          </Button>
        </div>
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 transition-colors"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </button>
      </div>
    </div>
  );
}
