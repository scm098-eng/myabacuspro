'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { X, Download, Award, Trophy, Crown, Medal, Loader2, Brain, FileText, Star } from 'lucide-react';
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

  const themeColor = '#f97316'; // Brand Orange

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: [themeColor, '#ffffff', '#fbbf24', '#0f172a'],
      zIndex: 10001
    });
  }, []);

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
      link.download = `MyAbacusPro-${studentName.replace(/\s+/g, '-')}.jpeg`;
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
      pdf.save(`MyAbacusPro-${studentName.replace(/\s+/g, '-')}.pdf`);
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
            className="bg-white relative border-[24px] border-[#0f172a] flex flex-col items-center p-12 overflow-hidden"
          >
            {/* Orange Corner Accents */}
            <div className="absolute top-4 left-4 w-32 h-32 border-t-[6px] border-l-[6px] border-[#f97316]" />
            <div className="absolute top-4 right-4 w-32 h-32 border-t-[6px] border-r-[6px] border-[#f97316]" />
            <div className="absolute bottom-4 left-4 w-32 h-32 border-b-[6px] border-l-[6px] border-[#f97316]" />
            <div className="absolute bottom-4 right-4 w-32 h-32 border-b-[6px] border-r-[6px] border-[#f97316]" />

            {/* Brain Pattern Watermark */}
            <div className="absolute inset-0 z-0 grid grid-cols-10 grid-rows-10 opacity-[0.03] pointer-events-none">
              {Array.from({ length: 100 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center p-8">
                  <Brain className="w-16 h-16 text-[#0f172a]" />
                </div>
              ))}
            </div>

            {/* Header / Brand */}
            <div className="relative z-10 w-full flex flex-col items-center mt-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-[#f97316] p-3 rounded-2xl shadow-lg shadow-orange-200">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-black text-[#0f172a] tracking-tighter">MY ABACUS PRO</h1>
              </div>
              <p className="text-[#f97316] font-black text-sm tracking-[0.6em] uppercase">LEARN • PRACTICE • SUCCEED</p>
            </div>

            {/* Main Award Title */}
            <div className="relative z-10 mt-10">
               <div className="bg-[#0f172a] px-20 py-4 rounded-[2rem] shadow-xl">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-wider">MASTERY RANK AWARD</h2>
               </div>
            </div>

            {/* Certification Type */}
            <div className="relative z-10 mt-6 text-center space-y-4">
               <p className="text-[#94a3b8] font-black uppercase tracking-[0.4em] text-lg">OFFICIAL MASTERY CERTIFICATION</p>
               <p className="text-3xl font-bold italic text-[#64748b] font-serif">This prestigious award is proudly presented to</p>
            </div>

            {/* Student Name */}
            <div className="relative z-10 mt-6">
              <h3 className="text-[90px] font-black uppercase tracking-tighter text-[#0f172a] leading-none text-center px-12">
                {studentName}
              </h3>
            </div>

            {/* Award Description */}
            <div className="relative z-10 mt-8 text-center space-y-2 max-w-4xl">
              <p className="text-xl font-bold text-[#475569] leading-relaxed">
                Who has demonstrated exceptional calculation speed and precision by achieving
              </p>
              <p className="text-xl font-bold text-[#475569] leading-relaxed">
                the distinction of <span className="text-[#f97316] font-black uppercase text-3xl ml-1">{title}</span>
              </p>
            </div>

            {/* Performance Score */}
            <div className="relative z-10 mt-6">
              <p className="text-2xl font-bold text-[#64748b]">
                With a certified performance score of <span className="text-[#0f172a] font-black underline underline-offset-4">{score || '---'}</span>
              </p>
            </div>

            {/* Footer Section */}
            <div className="relative z-10 w-full mt-auto flex justify-between items-end px-6 pb-4">
               {/* Left: Date */}
               <div className="text-left space-y-1">
                 <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">DATE OF ISSUE</p>
                 <p className="text-2xl font-bold text-[#0f172a]">{date || format(new Date(), 'MMMM do, yyyy')}</p>
               </div>

               {/* Center: Gold Seal */}
               <div className="flex flex-col items-center gap-2">
                 <div className="bg-[#fef9c3] p-6 rounded-full border-[6px] border-[#fbbf24] shadow-lg relative">
                    <Award className="w-16 h-16 text-[#fbbf24] drop-shadow-sm" />
                 </div>
                 <div className="bg-[#0f172a] px-4 py-1.5 rounded-full shadow-md">
                   <p className="text-[8px] font-black text-white uppercase tracking-widest">LEVEL ACHIEVED</p>
                 </div>
               </div>

               {/* Right: Signature */}
               <div className="text-right">
                 <div className="flex flex-col items-end">
                    <p 
                      className="italic text-[45px] font-bold text-[#f97316] mb-[-4px] pr-4 translate-y-[-12px]" 
                      style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive" }}
                    >
                      Satish Mane
                    </p>
                    <div className="h-[2px] w-56 bg-[#cbd5e1]" />
                 </div>
                 <div className="mt-3">
                    <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em] mb-1">SATISH MANE</p>
                    <p className="text-[9px] font-black text-[#94a3b8] uppercase tracking-tighter opacity-70">FOUNDER & DIRECTOR, MY ABACUS PRO</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* --- MODAL PREVIEW (SCALED FOR UI) --- */}
        <div className="bg-white shadow-2xl relative border-[8px] border-[#0f172a] overflow-hidden flex flex-col items-center justify-center aspect-[1.41] w-full sm:max-w-2xl rounded-xl">
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none grid grid-cols-6 grid-rows-6">
              {Array.from({length: 36}).map((_, i) => <div key={i} className="flex items-center justify-center"><Brain className="w-8 h-8" /></div>)}
           </div>
           <div className="p-4 sm:p-8 flex flex-col items-center text-center justify-between w-full h-full relative z-10">
              <div className="flex items-center gap-2">
                <div className="bg-[#f97316] p-1.5 rounded-lg"><Brain className="w-4 h-4 text-white" /></div>
                <span className="text-xs font-black text-[#0f172a]">MY ABACUS PRO</span>
              </div>
              <div className="bg-[#0f172a] px-6 py-1.5 rounded-2xl text-[8px] font-bold text-white italic uppercase tracking-wider">MASTERY RANK AWARD</div>
              <h2 className="text-xl sm:text-4xl font-black uppercase tracking-tighter text-[#0f172a] leading-none px-4">{studentName}</h2>
              <div className="space-y-1">
                <p className="text-[8px] sm:text-xs font-bold text-slate-500 italic">has achieved the distinction of</p>
                <h3 className="text-sm sm:text-xl font-black uppercase tracking-widest text-[#f97316]">{title}</h3>
              </div>
              <div className="flex justify-between w-full items-end pt-2">
                <div className="text-left"><p className="text-[6px] font-bold text-slate-400 uppercase">DATE</p><p className="text-[10px] font-bold">{date || 'June 10th, 2026'}</p></div>
                <div className="flex flex-col items-center">
                  <div className="bg-yellow-50 p-2 rounded-full border-2 border-yellow-400"><Award className="w-4 h-4 text-yellow-500" /></div>
                </div>
                <div className="text-right flex flex-col items-end">
                   <p className="italic text-base text-[#f97316] font-bold translate-y-[-4px]" style={{ fontFamily: "cursive" }}>Satish Mane</p>
                   <div className="h-[1px] w-16 bg-slate-300" />
                   <p className="text-[6px] font-black text-slate-400 mt-1 uppercase">Founder, My Abacus Pro</p>
                </div>
              </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 w-full max-w-2xl px-4 relative z-[10002]">
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
