'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { X, Download, Share2, Award, Trophy, Crown, Star, ShieldCheck, Medal, Loader2, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Logo } from './shared/Logo';

export type AchievementType = 
  | 'exam_participation' 
  | 'exam_winner' 
  | 'rank' 
  | 'weekly_winner' 
  | 'monthly_winner' 
  | 'global_winner';

interface AchievementProps {
  type: AchievementType;
  studentName: string;
  title: string; 
  score?: string; 
  date?: string;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementProps> = ({ type, studentName, title, score, date, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const config = {
    exam_participation: { label: 'Certificate of Participation', theme: 'indigo', icon: <Medal className="w-16 h-16" />, badge: 'PARTICIPANT' },
    exam_winner: { label: 'Certificate of Excellence', theme: 'gold', icon: <Crown className="w-16 h-16" />, badge: '1st RANK WINNER' },
    rank: { label: 'Mastery Rank Advancement', theme: 'primary', icon: <Award className="w-16 h-16" />, badge: 'RANK UP ACHIEVED' },
    weekly_winner: { label: 'Weekly Hall of Fame', theme: 'gold', icon: <Trophy className="w-16 h-16" />, badge: 'WEEKLY CHAMPION' },
    monthly_winner: { label: 'Monthly Elite Master', theme: 'gold', icon: <Trophy className="w-16 h-16" />, badge: 'MONTHLY CHAMPION' },
    global_winner: { label: 'Global Grandmaster', theme: 'gold', icon: <Crown className="w-16 h-16" />, badge: 'GLOBAL LEGEND' },
  }[type];

  const themeColor = config.theme === 'gold' ? '#fbbf24' : (config.theme === 'indigo' ? '#4f46e5' : '#f97316');

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [themeColor, '#ffffff', '#fbbf24'],
      zIndex: 10001
    });
  }, [themeColor]);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 0.95, 
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2
      });
      const link = document.createElement('a');
      link.download = `MyAbacusPro-${type}-${studentName.replace(/\s+/g, '-')}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const url = window.location.origin;
        await navigator.share({
          title: `My Abacus Pro - ${config.label}`,
          text: `Check out ${studentName}'s official achievement on My Abacus Pro!`,
          url: url
        });
      } catch (e) { console.warn("Share failed", e); }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="flex flex-col items-center max-w-4xl w-full my-auto">
        
        {/* CERTIFICATE CONTAINER */}
        <div 
          ref={cardRef}
          className="bg-white w-full shadow-2xl relative aspect-[1.414/1] flex items-center justify-center border-[20px] border-slate-900 overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none select-none">
            <div className="grid grid-cols-8 gap-8 p-12">
              {Array.from({length: 48}).map((_, i) => <Brain key={i} className="w-16 h-16" />)}
            </div>
          </div>

          {/* Inner Decorative Border */}
          <div className="absolute inset-4 border-2 border-slate-200 pointer-events-none" />
          <div className="absolute inset-6 border-4 border-double border-slate-100 pointer-events-none" />

          {/* Main Certificate Content Area */}
          <div className="relative w-full h-full p-10 sm:p-16 flex flex-col items-center text-center justify-between z-10">
            
            {/* Header: Logo + Tagline */}
            <div className="space-y-2 w-full flex flex-col items-center">
              <div className="flex items-center gap-4 mb-2">
                <Brain className="h-12 w-12 text-primary drop-shadow-sm" />
                <div className="text-4xl font-black font-headline uppercase tracking-tighter text-slate-900 border-b-4 border-slate-900 pb-1">
                  My Abacus Pro
                </div>
              </div>
              <p className="text-[10px] sm:text-xs font-black tracking-[0.6em] text-primary uppercase animate-pulse">
                LEARN • PRACTICE • SUCCEED
              </p>
            </div>

            {/* Achievement Label */}
            <div className="my-4">
               <h2 className="text-2xl sm:text-4xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">
                {config.label}
               </h2>
               <div className="h-1.5 w-32 bg-primary/30 mx-auto mt-4 rounded-full" />
            </div>

            {/* Student Name */}
            <div className="space-y-4 w-full">
              <p className="text-slate-500 italic font-serif text-lg">This is to certify that</p>
              <div className="max-w-[90%] mx-auto overflow-hidden">
                <h3 className="text-4xl sm:text-6xl font-black font-headline text-slate-900 border-b-2 border-slate-200 pb-4 px-12 inline-block leading-tight">
                  {studentName}
                </h3>
              </div>
            </div>

            {/* Citation Text */}
            <div className="max-w-xl mx-auto space-y-4">
               <p className="text-sm sm:text-lg font-bold text-slate-700 leading-relaxed">
                  Has demonstrated exceptional mental calculation speed and dedication by achieving the distinction of
                  <span className="text-primary font-black mx-2 uppercase text-lg sm:text-xl underline decoration-primary/20 underline-offset-8">
                    {title}
                  </span> 
                  {score && (
                    <span className="block mt-2">
                      With a certified performance score of <strong className="text-slate-900 text-lg">{score}</strong>
                    </span>
                  )}
               </p>
            </div>

            {/* Footer: Signatures, Date, and Seal */}
            <div className="w-full flex justify-between items-end mt-4">
              {/* Date */}
              <div className="text-left space-y-1 w-1/3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dated</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{date || format(new Date(), 'MMMM do, yyyy')}</p>
              </div>

              {/* Center Seal */}
              <div className="relative w-1/3 flex justify-center">
                <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full border-8 border-yellow-400/30 flex items-center justify-center bg-yellow-50/50 shadow-2xl relative">
                   <div className="absolute inset-0 bg-yellow-400/5 rounded-full border border-yellow-400/10" />
                   <div className={cn("text-yellow-600 drop-shadow-xl transition-transform", config.theme === 'gold' ? 'scale-125' : 'scale-100')}>
                      {config.icon}
                   </div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl whitespace-nowrap z-20">
                   {config.badge}
                </div>
              </div>

              {/* Signature */}
              <div className="text-right space-y-1 w-1/3">
                <div className="font-serif italic text-2xl sm:text-4xl text-slate-900 mb-[-15px] opacity-90 tracking-tight">
                  Satish Mane
                </div>
                <div className="h-0.5 w-32 bg-slate-900 ml-auto" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Founder, My Abacus Pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls */}
        <div className="mt-10 flex flex-wrap gap-4 w-full">
          <Button 
            onClick={handleShare}
            className="flex-1 h-16 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all hover:scale-[1.02] border-none"
          >
            <Share2 className="mr-3 h-6 w-6" /> Share with Parents
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 h-16 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] border-2 border-slate-200"
          >
            {isDownloading ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : <Download className="mr-3 h-6 w-6" />} Download JPEG
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-16 w-16 rounded-2xl transition-all active:scale-90"
          >
            <X className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;