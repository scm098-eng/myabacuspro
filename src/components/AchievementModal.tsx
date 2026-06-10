
'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { X, Download, Share2, Award, Trophy, Crown, Star, CheckCircle2, ShieldCheck, Medal } from 'lucide-react';
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
  title: string; // "Math Ninja", "Group A Champion", etc.
  score?: string; // "145/150", "98.5%", etc.
  date?: string;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementProps> = ({ type, studentName, title, score, date, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const config = {
    exam_participation: { label: 'Certificate of Participation', theme: 'indigo', icon: <Medal />, badge: 'PARTICIPANT' },
    exam_winner: { label: 'Certificate of Excellence', theme: 'gold', icon: <Crown />, badge: 'WINNER' },
    rank: { label: 'Mastery Rank Advancement', theme: 'primary', icon: <Award />, badge: 'RANK UP' },
    weekly_winner: { label: 'Weekly Hall of Fame', theme: 'gold', icon: <Trophy />, badge: 'CHAMPION' },
    monthly_winner: { label: 'Monthly Elite Master', theme: 'gold', icon: <Trophy />, badge: 'CHAMPION' },
    global_winner: { label: 'Global Grandmaster', theme: 'gold', icon: <Crown />, badge: 'LEGEND' },
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
        backgroundColor: '#ffffff'
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
      <div className="flex flex-col items-center max-w-2xl w-full my-auto">
        
        {/* --- THE CERTIFICATE --- */}
        <div 
          ref={cardRef}
          className="bg-white p-2 sm:p-4 w-full shadow-2xl relative aspect-[1.414/1] flex items-center justify-center border-[12px] border-slate-900 overflow-hidden"
        >
          {/* Ornamental Background */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <div className="grid grid-cols-6 gap-4 p-8">
              {Array.from({length: 24}).map((_, i) => <Star key={i} className="w-12 h-12" />)}
            </div>
          </div>

          <div className="relative w-full h-full border-4 border-slate-200 p-8 sm:p-12 flex flex-col items-center text-center justify-between bg-white/80">
            
            {/* Header Area */}
            <div className="space-y-4 w-full">
              <div className="flex justify-center items-center gap-2 mb-2">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Official Certification</span>
                <ShieldCheck className="w-6 h-6 text-slate-400" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black font-headline uppercase tracking-tighter text-slate-900 border-b-4 border-slate-900 pb-2 inline-block">
                My Abacus Pro
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">The Ultimate Training Ground for Mental Arithmetic</p>
            </div>

            {/* Achievement Label */}
            <div className="my-6">
               <h2 className="text-xl sm:text-3xl font-black text-slate-800 uppercase italic tracking-tight">{config.label}</h2>
               <div className="h-1 w-24 bg-primary/20 mx-auto mt-2 rounded-full" />
            </div>

            {/* Student Identity */}
            <div className="space-y-4">
              <p className="text-slate-500 italic font-medium">This is to certify that</p>
              <h3 className="text-3xl sm:text-5xl font-black font-headline text-slate-900 border-b-2 border-slate-100 pb-2 px-8 min-w-[250px] inline-block">
                {studentName}
              </h3>
            </div>

            {/* Contextual Logic */}
            <div className="max-w-md mx-auto space-y-3">
               <p className="text-sm sm:text-base font-bold text-slate-700 leading-relaxed">
                  Has successfully demonstrated exceptional dedication and mental arithmetic skill by achieving 
                  <span className="text-primary font-black mx-1.5 uppercase">{title}</span> 
                  {score && <span>with a performance score of <strong className="text-slate-900">{score}</strong></span>}.
               </p>
            </div>

            {/* Footer Signature & Seal */}
            <div className="w-full flex justify-between items-end mt-8">
              <div className="text-left space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Award</p>
                <p className="text-sm font-bold text-slate-900">{date || format(new Date(), 'MMMM do, yyyy')}</p>
              </div>

              {/* Official Seal */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-yellow-400/50 flex items-center justify-center bg-yellow-50/50 shadow-inner group">
                   <div className="absolute inset-0 bg-yellow-400/10 animate-pulse rounded-full" />
                   <div className={cn("text-yellow-600 drop-shadow-md transition-transform group-hover:scale-110", type === 'exam_winner' ? 'scale-125' : 'scale-100')}>
                      {config.icon}
                   </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-950 px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                   {config.badge}
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="font-serif italic text-xl sm:text-2xl text-slate-900 mb-[-10px] opacity-80">Satish Mane</div>
                <div className="h-0.5 w-24 bg-slate-900 ml-auto" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Founder, My Abacus Pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* --- CONTROLS --- */}
        <div className="mt-8 flex gap-4 w-full">
          <Button 
            onClick={handleShare}
            className="flex-1 h-14 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl shadow-xl shadow-green-900/20 transition-all hover:scale-[1.01]"
          >
            <Share2 className="mr-2 h-5 w-5" /> Share with Parents
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={isDownloading}
            variant="secondary"
            className="flex-1 h-14 bg-slate-100 text-slate-900 hover:bg-white font-bold rounded-2xl shadow-lg transition-all"
          >
            {isDownloading ? <Loader2 className="animate-spin" /> : <Download className="mr-2 h-5 w-5" />} Download Certificate
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-white/5 border-white/20 hover:bg-white/10 text-white h-14 w-14 rounded-2xl transition-all"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
