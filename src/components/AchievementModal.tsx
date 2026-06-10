
'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { X, Download, Award, Trophy, Crown, Medal, Loader2, Brain, FileText } from 'lucide-react';
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
  const [isDownloading, setIsDownloading] = useState<'jpeg' | 'pdf' | null>(null);

  // A4 Landscape Dimensions (standard 96 DPI pixel equivalent for high-quality capture)
  const A4_WIDTH = 1123;
  const A4_HEIGHT = 794;

  const config = {
    exam_participation: { label: 'EXAM PARTICIPATION', theme: 'orange', icon: <Medal className="w-16 h-16" />, badge: 'OFFICIAL ATTENDEE' },
    exam_winner: { label: 'CERTIFICATE OF EXCELLENCE', theme: 'gold', icon: <Crown className="w-16 h-16" />, badge: '1st RANK CHAMPION' },
    rank: { label: 'MASTERY RANK AWARD', theme: 'orange', icon: <Award className="w-16 h-16" />, badge: 'LEVEL ACHIEVED' },
    weekly_winner: { label: 'WEEKLY CHAMPION', theme: 'gold', icon: <Trophy className="w-16 h-16" />, badge: 'WEEKLY WINNER' },
    monthly_winner: { label: 'MONTHLY MASTER', theme: 'gold', icon: <Trophy className="w-16 h-16" />, badge: 'MONTHLY WINNER' },
    global_winner: { label: 'GLOBAL LEGEND', theme: 'gold', icon: <Crown className="w-16 h-16" />, badge: 'ALL-TIME CHAMPION' },
  }[type];

  const themeColor = config.theme === 'gold' ? '#fbbf24' : '#f97316';

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [themeColor, '#ffffff', '#fbbf24'],
      zIndex: 10001
    });
  }, [themeColor]);

  const generateImage = async () => {
    if (cardRef.current === null) return null;
    
    // Ensure the capture element is visible during the process but keep it off-screen
    return await toJpeg(cardRef.current, { 
      quality: 1, 
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2, // Higher density for crispness
      width: A4_WIDTH,
      height: A4_HEIGHT,
      style: {
        visibility: 'visible',
        position: 'static',
        transform: 'none'
      }
    });
  };

  const handleDownloadJPEG = async () => {
    setIsDownloading('jpeg');
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) throw new Error("Failed to generate image");
      const link = document.createElement('a');
      link.download = `MyAbacusPro-${type}-${studentName.replace(/\s+/g, '-')}.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('JPEG download failed', err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading('pdf');
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) throw new Error("Failed to generate image");
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [A4_WIDTH, A4_HEIGHT]
      });

      pdf.addImage(dataUrl, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
      pdf.save(`MyAbacusPro-${type}-${studentName.replace(/\s+/g, '-')}.pdf`);
    } catch (err) {
      console.error('PDF download failed', err);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center max-w-4xl w-full gap-8">
        
        {/* --- CAPTURE CONTAINER (HIDDEN BUT MEASURABLE) --- */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <div 
            ref={cardRef}
            style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}
            className="bg-white relative border-[24px] border-slate-900 flex flex-col items-center justify-between p-16"
          >
            {/* Header Area */}
            <div className="w-full flex flex-col items-center space-y-2">
              <div className="flex items-center gap-4">
                <Brain className="h-12 w-12 text-primary" />
                <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">MY ABACUS PRO</h1>
              </div>
              <p className="text-[10px] font-black tracking-[0.6em] text-primary uppercase">LEARN • PRACTICE • SUCCEED</p>
            </div>

            {/* Achievement Badge */}
            <div className="flex flex-col items-center text-center space-y-4">
              <h2 className="text-3xl font-black uppercase tracking-widest text-primary italic">
                {config.label}
              </h2>
              <div className="w-48 h-1 bg-slate-100 rounded-full" />
            </div>

            {/* Main Recipient Area */}
            <div className="flex flex-col items-center text-center space-y-6">
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">This is to certify that</p>
              <h3 className="text-7xl font-black uppercase tracking-tighter text-slate-900 leading-none px-4">
                {studentName}
              </h3>
              <div className="flex flex-col items-center gap-2">
                <p className="text-xl font-bold text-slate-500 italic max-w-2xl">
                  has demonstrated exceptional skill and dedication in mental arithmetic, 
                  achieving the prestigious status of
                </p>
                <p className="text-3xl font-black uppercase tracking-tight text-primary">
                  {title}
                </p>
              </div>
            </div>

            {/* Footer Area */}
            <div className="w-full flex justify-between items-end px-10 pb-4">
               <div className="text-left space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Issue</p>
                 <p className="text-xl font-bold text-slate-900">{date || format(new Date(), 'MMMM do, yyyy')}</p>
               </div>

               {/* Center Seal Placeholder */}
               <div className="flex items-center justify-center p-4 rounded-full border-4 border-slate-50 bg-slate-50/50">
                  <div className="text-slate-300">
                    {config.icon}
                  </div>
               </div>

               <div className="text-right space-y-1">
                 <div className="flex flex-col items-end mb-2">
                    <p 
                      className="italic text-2xl font-bold text-slate-900 mb-[-12px]" 
                      style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}
                    >
                      Satish Mane
                    </p>
                    <div className="h-0.5 w-48 bg-slate-200" />
                 </div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satish Mane</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase italic">Founder, My Abacus Pro</p>
               </div>
            </div>
          </div>
        </div>

        {/* --- MODAL PREVIEW (SCALED FOR SCREEN) --- */}
        <div className="bg-white shadow-2xl relative border-[4px] sm:border-[8px] border-slate-900 overflow-hidden flex flex-col items-center justify-center aspect-[1.41] w-full sm:max-w-2xl rounded-xl">
           <div className="p-6 sm:p-12 flex flex-col items-center text-center justify-between w-full h-full">
              <div className="flex flex-col items-center scale-75 sm:scale-100 origin-top">
                <div className="flex items-center gap-2 mb-1">
                  <Brain className="h-6 w-6 text-primary" />
                  <div className="text-xl font-black uppercase tracking-tighter text-slate-900">MY ABACUS PRO</div>
                </div>
                <p className="text-[6px] font-black tracking-[0.5em] text-primary uppercase">LEARN • PRACTICE • SUCCEED</p>
              </div>
              
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest italic text-primary">{config.label}</h3>
                <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter text-slate-900 px-4 leading-none">{studentName}</h2>
                <p className="text-xs sm:text-sm font-bold text-slate-500 italic max-w-[85%] mx-auto">{title}</p>
              </div>

              <div className="scale-75 sm:scale-100 p-2 rounded-full border-2 border-slate-50">
                {config.icon}
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 w-full max-w-2xl px-4">
          <Button 
            onClick={handleDownloadPDF}
            disabled={!!isDownloading}
            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl border-none"
          >
            {isDownloading === 'pdf' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />} 
            Save PDF (A4)
          </Button>
          <Button 
            onClick={handleDownloadJPEG}
            disabled={!!isDownloading}
            className="flex-1 h-14 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest rounded-2xl shadow-lg border-2 border-slate-200"
          >
            {isDownloading === 'jpeg' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />} 
            Save JPEG
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-14 w-14 rounded-2xl"
          >
            <X className="h-6 w-6 stroke-[3px]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
