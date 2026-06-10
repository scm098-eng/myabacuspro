'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { X, Download, Share2, Award, Trophy, Crown, Star, ShieldCheck, Medal, Loader2, Brain } from 'lucide-react';
import { Button } from './ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
    exam_participation: { label: 'Certificate of Participation', theme: 'indigo', icon: <Medal className="w-16 h-16" />, badge: 'OFFICIAL PARTICIPANT' },
    exam_winner: { label: 'Certificate of Excellence', theme: 'gold', icon: <Crown className="w-16 h-16" />, badge: '1st RANK CHAMPION' },
    rank: { label: 'Rank Advancement Award', theme: 'primary', icon: <Award className="w-16 h-16" />, badge: 'LEVEL ACHIEVED' },
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
        quality: 1, 
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: 1200,
        height: 850
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
        await navigator.share({
          title: `My Abacus Pro - ${config.label}`,
          text: `Check out ${studentName}'s official achievement on My Abacus Pro!`,
          url: window.location.origin
        });
      } catch (e) { console.warn("Share failed", e); }
    } else {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto">
      <div className="flex flex-col items-center max-w-5xl w-full my-auto gap-8">
        
        {/* CERTIFICATE AREA - Optimized for 1200x850 aspect ratio capture */}
        <div 
          ref={cardRef}
          className="bg-white shadow-2xl relative border-[24px] border-slate-900 overflow-hidden flex flex-col items-center justify-center"
          style={{ width: '1200px', height: '850px', minWidth: '1200px', minHeight: '850px', transform: 'scale(0.5)', transformOrigin: 'center center' }}
        >
          {/* Guilloché Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <div className="grid grid-cols-10 gap-10 p-12">
              {Array.from({length: 60}).map((_, i) => <Brain key={i} className="w-20 h-20" />)}
            </div>
          </div>

          {/* Decorative Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-8 border-l-8 border-primary m-4" />
          <div className="absolute top-0 right-0 w-32 h-32 border-t-8 border-r-8 border-primary m-4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-8 border-l-8 border-primary m-4" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-8 border-r-8 border-primary m-4" />

          {/* Secure Inner Border */}
          <div className="absolute inset-6 border-2 border-slate-200 pointer-events-none" />
          <div className="absolute inset-8 border-4 border-double border-slate-100 pointer-events-none" />

          {/* Main Content Area */}
          <div className="relative w-full h-full p-24 flex flex-col items-center text-center justify-between z-10">
            
            {/* Header: Logo + Tagline */}
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="flex items-center gap-6 mb-2">
                <Brain className="h-16 w-16 text-primary drop-shadow-md" />
                <div className="text-6xl font-black font-headline uppercase tracking-tighter text-slate-900 border-b-8 border-slate-900 pb-2">
                  My Abacus Pro
                </div>
              </div>
              <p className="text-sm font-black tracking-[0.8em] text-primary uppercase">
                LEARN • PRACTICE • SUCCEED
              </p>
            </div>

            {/* Achievement Label */}
            <div className="space-y-6">
               <h2 className={cn(
                 "text-5xl font-black uppercase italic tracking-tighter leading-none px-12 py-4 rounded-2xl inline-block",
                 config.theme === 'gold' ? "bg-yellow-400 text-yellow-950 shadow-lg" : "bg-slate-900 text-white"
               )}>
                {config.label}
               </h2>
               <p className="text-slate-400 text-xl font-bold tracking-widest uppercase mt-4">Official Performance Certification</p>
            </div>

            {/* Student Name */}
            <div className="space-y-6 w-full">
              <p className="text-slate-500 italic font-serif text-3xl">This prestigious award is presented to</p>
              <div className="max-w-[85%] mx-auto">
                <h3 className="text-7xl font-black font-headline text-slate-900 border-b-4 border-slate-200 pb-6 px-16 inline-block leading-tight">
                  {studentName}
                </h3>
              </div>
            </div>

            {/* Citation Text */}
            <div className="max-w-3xl mx-auto space-y-6">
               <p className="text-2xl font-bold text-slate-700 leading-relaxed">
                  Who has demonstrated exceptional mental calculation speed and unwavering dedication by achieving the distinction of
                  <span className="text-primary font-black mx-2 uppercase text-3xl underline decoration-primary/20 underline-offset-[12px]">
                    {title}
                  </span> 
                  {score && (
                    <span className="block mt-4 text-slate-500">
                      With a certified mastery score of <strong className="text-slate-900 text-3xl">{score}</strong>
                    </span>
                  )}
               </p>
            </div>

            {/* Footer Area */}
            <div className="w-full flex justify-between items-end mt-12">
              {/* Date */}
              <div className="text-left space-y-2 w-1/3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Date of Issue</p>
                <p className="text-2xl font-bold text-slate-900">{date || format(new Date(), 'MMMM do, yyyy')}</p>
              </div>

              {/* Center Seal */}
              <div className="relative w-1/3 flex justify-center">
                <div className="w-48 h-48 rounded-full border-[12px] border-yellow-400/30 flex items-center justify-center bg-yellow-50 shadow-2xl relative">
                   <div className="absolute inset-0 bg-yellow-400/5 rounded-full border border-yellow-400/10" />
                   <div className={cn("text-yellow-600 drop-shadow-2xl transition-transform", config.theme === 'gold' ? 'scale-150' : 'scale-110')}>
                      {config.icon}
                   </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl whitespace-nowrap z-20 border-2 border-white/20">
                   {config.badge}
                </div>
              </div>

              {/* Signature */}
              <div className="text-right space-y-2 w-1/3">
                <div className="font-serif italic text-5xl text-slate-900 mb-[-10px] opacity-90 tracking-tight">
                  Satish Mane
                </div>
                <div className="h-1 w-48 bg-slate-900 ml-auto" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest pt-2">Founder, My Abacus Pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls - Visible UI */}
        <div className="flex flex-wrap gap-4 w-full max-w-4xl -mt-48">
          <Button 
            onClick={handleShare}
            className="flex-1 h-20 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-3xl shadow-2xl transition-all hover:scale-[1.02] border-none text-lg"
          >
            <Share2 className="mr-3 h-8 w-8" /> Share with Parents
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 h-20 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest rounded-3xl shadow-xl transition-all hover:scale-[1.02] border-4 border-slate-200 text-lg"
          >
            {isDownloading ? <Loader2 className="animate-spin mr-3 h-8 w-8" /> : <Download className="mr-3 h-8 w-8" />} Download Certificate (JPEG)
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-20 w-20 rounded-3xl transition-all active:scale-90"
          >
            <X className="h-10 w-10 stroke-[3px]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
