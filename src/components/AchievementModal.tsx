
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

  // A4 Landscape Dimensions at 96 DPI
  const A4_WIDTH = 1123;
  const A4_HEIGHT = 794;

  const config = {
    exam_participation: { label: 'EXAM PARTICIPATION', theme: 'orange', icon: <Medal className="w-16 h-16" /> },
    exam_winner: { label: 'CERTIFICATE OF EXCELLENCE', theme: 'gold', icon: <Crown className="w-16 h-16" /> },
    rank: { label: 'MASTERY RANK AWARD', theme: 'orange', icon: <Award className="w-16 h-16" /> },
    weekly_winner: { label: 'WEEKLY CHAMPION', theme: 'gold', icon: <Trophy className="w-16 h-16" /> },
    monthly_winner: { label: 'MONTHLY MASTER', theme: 'gold', icon: <Trophy className="w-16 h-16" /> },
    global_winner: { label: 'GLOBAL LEGEND', theme: 'gold', icon: <Crown className="w-16 h-16" /> },
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
    
    return await toJpeg(cardRef.current, { 
      quality: 1, 
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: 2, 
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
        
        {/* --- CAPTURE CONTAINER (HIDDEN BUT ACCURATE A4) --- */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <div 
            ref={cardRef}
            style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}
            className="bg-white relative border-[32px] border-[#0f172a] flex flex-col items-center justify-between p-16"
          >
            {/* Header Content */}
            <div className="w-full flex flex-col items-center">
               <p className="text-[#64748b] font-black uppercase tracking-[0.4em] text-lg mb-10">THIS IS TO CERTIFY THAT</p>
               <h2 className="text-[100px] font-black uppercase tracking-tighter text-[#0f172a] leading-none text-center px-12">
                 {studentName}
               </h2>
            </div>

            {/* Achievement Text */}
            <div className="flex flex-col items-center text-center space-y-6">
              <p className="text-2xl font-bold italic text-[#64748b] leading-relaxed max-w-3xl">
                has demonstrated exceptional skill and dedication in mental arithmetic, 
                achieving the prestigious status of
              </p>
              <h3 className="text-6xl font-black uppercase tracking-widest text-[#f97316]">
                {title}
              </h3>
            </div>

            {/* Footer with Adjusted Signature */}
            <div className="w-full flex justify-between items-end px-10 pb-8">
               <div className="text-left space-y-2">
                 <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">DATE OF ISSUE</p>
                 <p className="text-2xl font-bold text-[#0f172a]">{date || format(new Date(), 'MMMM do, yyyy')}</p>
               </div>

               {/* Center Seal */}
               <div className="flex items-center justify-center p-6 rounded-full border-[6px] border-[#f1f5f9] bg-[#f8fafc]/50">
                  <div className="text-[#cbd5e1] opacity-60">
                    {config.icon}
                  </div>
               </div>

               {/* Signature Column */}
               <div className="text-right">
                 <div className="flex flex-col items-end">
                    {/* Stylish Red Cursive Signature shifted slightly up away from line */}
                    <p 
                      className="italic text-3xl font-bold text-[#dc2626] mb-[-4px] pr-4 translate-y-[-8px]" 
                      style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}
                    >
                      Satish Mane
                    </p>
                    <div className="h-0.5 w-56 bg-[#cbd5e1]" />
                 </div>
                 <div className="mt-3">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-1">SATISH MANE</p>
                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-tighter opacity-70">FOUNDER, MY ABACUS PRO</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- MODAL PREVIEW (SCALED FOR UI) --- */}
        <div className="bg-white shadow-2xl relative border-[12px] border-[#0f172a] overflow-hidden flex flex-col items-center justify-center aspect-[1.41] w-full sm:max-w-2xl rounded-xl">
           <div className="p-8 flex flex-col items-center text-center justify-between w-full h-full">
              <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">THIS IS TO CERTIFY THAT</p>
              <h2 className="text-2xl sm:text-5xl font-black uppercase tracking-tighter text-[#0f172a] leading-none px-4">{studentName}</h2>
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs font-bold text-slate-500 italic">has achieved the prestigious status of</p>
                <h3 className="text-xl sm:text-3xl font-black uppercase tracking-widest text-[#f97316]">{title}</h3>
              </div>
              <div className="flex justify-between w-full items-end pt-4">
                <div className="text-left"><p className="text-[6px] font-bold text-slate-400 uppercase">DATE</p><p className="text-xs font-bold">{date || 'June 10th, 2026'}</p></div>
                <div className="text-right flex flex-col items-end">
                   <p className="italic text-lg text-red-600 font-bold translate-y-[-4px]" style={{ fontFamily: "cursive" }}>Satish Mane</p>
                   <div className="h-[1px] w-20 bg-slate-300" />
                   <p className="text-[6px] font-black text-slate-400 mt-1 uppercase">Satish Mane</p>
                </div>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 w-full max-w-2xl px-4">
          <Button onClick={handleDownloadPDF} disabled={!!isDownloading} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl border-none">
            {isDownloading === 'pdf' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />} 
            Save PDF (A4)
          </Button>
          <Button onClick={handleDownloadJPEG} disabled={!!isDownloading} className="flex-1 h-14 bg-white text-slate-900 hover:bg-slate-50 font-black uppercase tracking-widest rounded-2xl shadow-lg border-2 border-slate-200">
            {isDownloading === 'jpeg' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />} 
            Save JPEG
          </Button>
          <Button onClick={onClose} variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-14 w-14 rounded-2xl">
            <X className="h-6 w-6 stroke-[3px]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
