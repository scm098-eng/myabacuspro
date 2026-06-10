'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { X, Download, Share2, Award, Trophy, Crown, Star, Medal, Loader2, Brain } from 'lucide-react';
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
    exam_participation: { label: 'Participation Certificate', theme: 'indigo', icon: <Medal className="w-16 h-16" />, badge: 'OFFICIAL ATTENDEE' },
    exam_winner: { label: 'Certificate of Excellence', theme: 'gold', icon: <Crown className="w-16 h-16" />, badge: '1st RANK CHAMPION' },
    rank: { label: 'Mastery Rank Award', theme: 'primary', icon: <Award className="w-16 h-16" />, badge: 'LEVEL ACHIEVED' },
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
      // Fixed A4 Landscape resolution (300 DPI approx is ~3508x2480, but 1200x850 with 2x pixel ratio is perfect for web sharing)
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
        
        {/* CERTIFICATE AREA - A4 LANDSCAPE (1200x850) */}
        <div 
          ref={cardRef}
          className="bg-white shadow-2xl relative border-[20px] border-slate-900 overflow-hidden flex flex-col items-center justify-center"
          style={{ 
            width: '1200px', 
            height: '850px', 
            minWidth: '1200px', 
            minHeight: '850px', 
            transform: 'scale(0.5)', 
            transformOrigin: 'center center' 
          }}
        >
          {/* Ornate Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
            <div className="grid grid-cols-10 gap-10 p-12">
              {Array.from({length: 60}).map((_, i) => <Brain key={i} className="w-20 h-20" />)}
            </div>
          </div>

          {/* Secure Decorative Frames */}
          <div className="absolute inset-6 border-[2px] border-slate-200 pointer-events-none" />
          <div className="absolute inset-8 border-[4px] border-double border-slate-100 pointer-events-none" />
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-32 h-32 border-t-[8px] border-l-[8px] border-primary m-4" />
          <div className="absolute top-0 right-0 w-32 h-32 border-t-[8px] border-r-[8px] border-primary m-4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-b-[8px] border-l-[8px] border-primary m-4" />
          <div className="absolute bottom-0 right-0 w-32 h-32 border-b-[8px] border-r-[8px] border-primary m-4" />

          {/* CONTENT CONTAINER */}
          <div className="relative w-full h-full p-20 flex flex-col items-center text-center justify-between z-10">
            
            {/* BRAND HEADER - Shifted Upside */}
            <div className="flex flex-col items-center w-full mt-[-10px]">
              <div className="flex items-center gap-5 mb-1">
                <div className="p-3 bg-primary rounded-2xl shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="text-4xl font-black font-headline uppercase tracking-tighter text-slate-900 pb-1">
                  My Abacus Pro
                </div>
              </div>
              <p className="text-[10px] font-black tracking-[0.7em] text-primary uppercase ml-4">
                LEARN • PRACTICE • SUCCEED
              </p>
            </div>

            {/* AWARD CATEGORY - Increased space from tagline */}
            <div className="flex flex-col items-center gap-3 mt-4">
               <h2 className={cn(
                 "text-4xl font-black uppercase italic tracking-tighter leading-none px-12 py-4 rounded-2xl shadow-lg",
                 config.theme === 'gold' ? "bg-yellow-400 text-yellow-950" : "bg-slate-900 text-white"
               )}>
                {config.label}
               </h2>
               <p className="text-slate-400 text-lg font-bold tracking-[0.2em] uppercase">Official Mastery Certification</p>
            </div>

            {/* RECIPIENT NAME */}
            <div className="w-full flex flex-col items-center space-y-3 px-10">
              <p className="text-slate-500 italic font-serif text-2xl">This prestigious award is proudly presented to</p>
              <div className="w-full max-w-[900px] border-b-2 border-slate-200 pb-2">
                <h3 className="text-6xl font-black font-headline text-slate-900 leading-tight uppercase tracking-tight break-words">
                  {studentName}
                </h3>
              </div>
            </div>

            {/* CITATION */}
            <div className="max-w-4xl mx-auto px-10">
               <p className="text-xl font-bold text-slate-700 leading-relaxed">
                  Who has demonstrated exceptional calculation speed and precision by achieving the distinction of
                  <span className="text-primary font-black mx-2 uppercase text-2xl underline decoration-primary/20 underline-offset-4">
                    {title}
                  </span> 
                  {score && (
                    <span className="block mt-2 text-slate-500">
                      With a certified performance score of <strong className="text-slate-900 text-2xl">{score}</strong>
                    </span>
                  )}
               </p>
            </div>

            {/* FOOTER */}
            <div className="w-full flex justify-between items-end mt-4 px-10">
              <div className="text-left space-y-1 w-1/3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Issue</p>
                <p className="text-xl font-bold text-slate-900">{date || format(new Date(), 'MMMM do, yyyy')}</p>
              </div>

              {/* CENTRAL SEAL AREA */}
              <div className="relative w-1/3 flex justify-center">
                <div className="w-40 h-44 rounded-full border-[10px] border-yellow-400/20 flex items-center justify-center bg-yellow-50 shadow-xl relative">
                   <div className={cn("text-yellow-600 drop-shadow-lg", config.theme === 'gold' ? 'scale-125' : 'scale-110')}>
                      {config.icon}
                   </div>
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl whitespace-nowrap border border-white/20">
                   {config.badge}
                </div>
              </div>

              {/* STYLISH SIGNATURE AREA */}
              <div className="text-right space-y-1 w-1/3">
                <div className="flex flex-col items-end">
                    {/* Stylish Handwritten Style Signature */}
                    <div className="font-serif italic text-4xl font-black text-primary pr-2 mb-[-10px] drop-shadow-sm select-none">
                      Satish Mane
                    </div>
                    <div className="h-0.5 w-48 bg-slate-900 ml-auto mb-2 opacity-20" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satish Mane</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase italic">Founder & Director, My Abacus Pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap gap-4 w-full max-w-4xl -mt-56 relative z-[10000]">
          <button 
            onClick={handleShare}
            className="flex-1 h-16 bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl border-none text-base transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center gap-3">
              <Share2 className="h-6 w-6" /> Share Achievement
            </div>
          </button>
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 h-16 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest rounded-2xl shadow-lg border-2 border-slate-200 text-base transition-transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center gap-3">
              {isDownloading ? <Loader2 className="animate-spin h-6 w-6" /> : <Download className="h-6 w-6" />} Save JPEG (A4)
            </div>
          </button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-16 w-16 rounded-2xl"
          >
            <X className="h-8 w-8 stroke-[3px]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
