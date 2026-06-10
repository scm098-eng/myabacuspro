
'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { X, Download, Award, Brain, FileText, Loader2, Share2, Medal } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
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

// A4 Landscape Dimensions at 96 DPI
const A4_WIDTH = 1123;
const A4_HEIGHT = 794;

const CertificateContent = React.forwardRef<HTMLDivElement, { studentName: string; title: string; score?: string; date?: string; type: AchievementType }>(
  ({ studentName, title, score, date, type }, ref) => {
    const formattedName = studentName.trim().replace(/\s+/g, ' ');
    const isWinnerDesign = type === 'exam_winner';

    return (
      <div 
        ref={ref}
        style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}
        className={cn(
          "relative border-[16px] flex flex-col items-center p-8 overflow-hidden font-sans select-none transition-colors duration-700",
          isWinnerDesign ? "bg-[#fffcf0] border-[#b45309]" : "bg-white border-[#0f172a]"
        )}
      >
        {/* --- PRESTIGIOUS CORNER BRACKETS --- */}
        <div className={cn("absolute top-2 left-2 w-24 h-24 border-t-[6px] border-l-[6px] z-20", isWinnerDesign ? "border-[#fbbf24]" : "border-[#f97316]")} />
        <div className={cn("absolute top-2 right-2 w-24 h-24 border-t-[6px] border-r-[6px] z-20", isWinnerDesign ? "border-[#fbbf24]" : "border-[#f97316]")} />
        <div className={cn("absolute bottom-2 left-2 w-24 h-24 border-b-[6px] border-l-[6px] z-20", isWinnerDesign ? "border-[#fbbf24]" : "border-[#f97316]")} />
        <div className={cn("absolute bottom-2 right-2 w-24 h-24 border-b-[6px] border-r-[6px] z-20", isWinnerDesign ? "border-[#fbbf24]" : "border-[#f97316]")} />

        {/* --- REFINED DOUBLE INNER BORDER --- */}
        <div className={cn("absolute top-8 left-8 right-8 bottom-8 border-[0.5px] pointer-events-none z-20", isWinnerDesign ? "border-[#92400e]/40" : "border-[#cbd5e1]")} />
        <div className={cn("absolute top-10 left-10 right-10 bottom-10 border-[0.5px] pointer-events-none z-20", isWinnerDesign ? "border-[#92400e]/40" : "border-[#cbd5e1]")} />

        {/* --- WATERMARK GRID --- */}
        <div className={cn("absolute inset-0 z-0 grid grid-cols-6 grid-rows-6 pointer-events-none p-10 transition-opacity", isWinnerDesign ? "opacity-[0.15]" : "opacity-[0.05]")}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <Brain style={{ width: '80px', height: '80px' }} className={cn(isWinnerDesign ? "text-[#b45309]" : "text-[#0f172a]")} />
            </div>
          ))}
        </div>

        {/* --- CONTENT LIFTED HEADER --- */}
        <div className="relative z-10 w-full flex flex-col items-center mt-12">
          <div className="flex items-center gap-3 mb-1">
            <div className={cn("p-2 rounded-xl shadow-lg", isWinnerDesign ? "bg-[#92400e]" : "bg-[#f97316]")}>
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className={cn("text-4xl font-black tracking-tight uppercase", isWinnerDesign ? "text-[#78350f]" : "text-[#0f172a]")}>MY ABACUS PRO</h1>
          </div>
          <p className={cn("font-black text-[10px] tracking-[0.5em] uppercase", isWinnerDesign ? "text-[#b45309]" : "text-[#f97316]")}>LEARN • PRACTICE • SUCCEED</p>
        </div>

        {/* --- MAIN HONOR BADGE --- */}
        <div className="relative z-10 mt-6">
           <div className={cn("px-24 py-4 rounded-[2rem] shadow-xl border-b-4", isWinnerDesign ? "bg-[#92400e] border-[#451a03]" : "bg-[#0f172a] border-black/20")}>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-widest">
                {isWinnerDesign ? "1st RANK CHAMPION AWARD" : "MASTERY RANK AWARD"}
              </h2>
           </div>
        </div>

        {/* --- CERTIFICATION TEXT BLOCK --- */}
        <div className="relative z-10 mt-8 text-center flex flex-col items-center gap-1">
           <p className={cn("text-xs font-black uppercase tracking-[0.4em] mb-1", isWinnerDesign ? "text-[#b45309]" : "text-[#94a3b8]")}>OFFICIAL MASTERY CERTIFICATION</p>
           <p className="text-2xl font-bold italic text-[#475569] font-serif opacity-90 leading-none">This prestigious award is proudly presented to</p>
           
           <div className="mt-3 w-fit px-12 pb-1 flex flex-col items-center gap-2">
             <h3 className={cn("text-7xl font-black uppercase tracking-normal leading-none text-center", isWinnerDesign ? "text-[#451a03]" : "text-[#0f172a]")}>
               {formattedName}
             </h3>
             <div className={cn("h-[1.5px] w-full", isWinnerDesign ? "bg-[#92400e]/40" : "bg-[#cbd5e1]")} />
           </div>

           <div className="mt-5 text-center space-y-1.5 max-w-4xl">
             <p className={cn("text-sm font-bold uppercase tracking-wide leading-none opacity-70", isWinnerDesign ? "text-[#451a03]" : "text-[#0f172a]")}>
               WHO HAS DEMONSTRATED EXCEPTIONAL CALCULATION SPEED AND PRECISION BY ACHIEVING
             </p>
             <div className="flex flex-col items-center gap-1">
               <p className={cn("text-sm font-bold uppercase tracking-widest leading-none", isWinnerDesign ? "text-[#451a03]" : "text-[#0f172a]")}>
                 THE DISTINCTION OF <span className={cn("font-black text-4xl ml-2", isWinnerDesign ? "text-[#92400e]" : "text-[#f97316]")}>{title}</span>
               </p>
             </div>
           </div>

           <div className="mt-1">
             <p className={cn("text-lg font-bold leading-none", isWinnerDesign ? "text-[#451a03]" : "text-[#0f172a]")}>
               With a certified performance score of <span className={cn("font-black border-b-2 pb-0.5 px-2 underline-offset-4", isWinnerDesign ? "border-[#92400e]" : "border-[#0f172a]")}>{score || '---'}</span>
             </p>
           </div>
        </div>

        {/* --- SIGNATURE FOOTER --- */}
        <div className="relative z-10 w-full mt-auto flex justify-between items-end px-12 pb-10">
           <div className="text-left space-y-1 w-64">
             <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isWinnerDesign ? "text-[#b45309]" : "text-[#94a3b8]")}>DATE OF ISSUE</p>
             <p className={cn("text-xl font-bold", isWinnerDesign ? "text-[#451a03]" : "text-[#0f172a]")}>{date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
           </div>

           <div className="flex flex-col items-center gap-2 mb-[-5px]">
             <div className={cn("p-5 rounded-full border-[5px] shadow-xl relative animate-in zoom-in-50 duration-700", isWinnerDesign ? "bg-[#fffbeb] border-[#fbbf24]" : "bg-[#fef9c3] border-[#fbbf24]")}>
                {isWinnerDesign ? <Medal className="w-14 h-14 text-[#fbbf24] drop-shadow-sm" /> : <Award className="w-14 h-14 text-[#fbbf24] drop-shadow-sm" />}
             </div>
             <div className={cn("px-5 py-1.5 rounded-full shadow-md", isWinnerDesign ? "bg-[#92400e]" : "bg-[#0f172a]")}>
               <p className="text-[8px] font-black text-white uppercase tracking-widest">LEVEL ACHIEVED</p>
             </div>
           </div>

           <div className="text-right w-64">
             <div className="flex flex-col items-end relative">
                <p 
                  className={cn("absolute bottom-[4px] right-8 font-sacramento text-[36px] font-bold", isWinnerDesign ? "text-[#92400e]" : "text-[#f97316]")}
                  style={{ fontFamily: 'var(--font-sacramento), cursive' }}
                >
                  Satish Mane
                </p>
                <div className={cn("h-[1.5px] w-60 mt-10", isWinnerDesign ? "bg-[#92400e]/40" : "bg-[#cbd5e1]")} />
             </div>
             <div className="mt-2">
                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isWinnerDesign ? "text-[#b45309]" : "text-[#94a3b8]")}>SATISH MANE</p>
                <p className={cn("text-[8px] font-black uppercase tracking-tighter opacity-70", isWinnerDesign ? "text-[#b45309]" : "text-[#94a3b8]")}>FOUNDER & DIRECTOR, MY ABACUS PRO</p>
             </div>
           </div>
        </div>
      </div>
    );
  }
);
CertificateContent.displayName = 'CertificateContent';

const AchievementModal: React.FC<AchievementProps> = ({ type, studentName, title, score, date, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState<'jpeg' | 'pdf' | 'share' | null>(null);
  const [modalScale, setModalScale] = useState(0.5);
  const { toast } = useToast();

  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#ffffff', '#fbbf24', '#0f172a'],
      zIndex: 10001
    });

    const updateScale = () => {
      const padding = 40;
      const maxWidth = window.innerWidth - padding;
      const maxHeight = window.innerHeight - 250;
      const scaleW = maxWidth / A4_WIDTH;
      const scaleH = maxHeight / A4_HEIGHT;
      setModalScale(Math.min(scaleW, scaleH, 0.75));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const generateImage = async () => {
    if (cardRef.current === null) return null;
    return await toJpeg(cardRef.current, { 
      quality: 1, 
      pixelRatio: 2,
    });
  };

  const handleDownloadJPEG = async () => {
    setIsDownloading('jpeg');
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const link = document.createElement('a');
      link.download = `MyAbacusPro-${studentName.replace(/\s+/g, '-')}.jpeg`;
      link.href = dataUrl;
      link.click();
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloading('pdf');
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [A4_WIDTH, A4_HEIGHT] });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);
      pdf.save(`MyAbacusPro-${studentName.replace(/\s+/g, '-')}.pdf`);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleShare = async () => {
    setIsDownloading('share');
    try {
      const dataUrl = await generateImage();
      if (!dataUrl) return;

      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'achievement.jpg', { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Abacus Pro Achievement',
          text: `I just achieved the distinction of ${title} on My Abacus Pro! 🧮✨`,
          url: 'https://myabacuspro.com',
        });
      } else {
        await navigator.clipboard.writeText('https://myabacuspro.com');
        toast({
          title: "Link Copied",
          description: "Sharing image is not supported on this browser. Website link copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center w-full max-w-5xl gap-6">
        
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <CertificateContent ref={cardRef} studentName={studentName} title={title} score={score} date={date} type={type} />
        </div>

        <div 
          className="shadow-2xl overflow-hidden rounded-xl bg-white border-2 border-white/20 origin-center transition-transform duration-500"
          style={{ 
            width: `${A4_WIDTH}px`, 
            height: `${A4_HEIGHT}px`, 
            transform: `scale(${modalScale})`,
            marginTop: `-${(A4_HEIGHT * (1 - modalScale)) / 2}px`,
            marginBottom: `-${(A4_HEIGHT * (1 - modalScale)) / 2}px`
          }}
        >
          <CertificateContent studentName={studentName} title={title} score={score} date={date} type={type} />
        </div>

        <div className="flex flex-wrap gap-4 w-full max-w-3xl px-4 relative z-[10002] animate-in slide-in-from-bottom-4 duration-500">
          <Button onClick={handleDownloadPDF} disabled={!!isDownloading} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl border-none text-base">
            {isDownloading === 'pdf' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />} 
            Save PDF (A4)
          </Button>
          <Button onClick={handleDownloadJPEG} disabled={!!isDownloading} className="flex-1 h-14 bg-white text-[#0f172a] hover:bg-slate-50 font-black uppercase tracking-widest rounded-2xl shadow-lg border-2 border-slate-200 text-base">
            {isDownloading === 'jpeg' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />} 
            Save JPEG
          </Button>
          <Button onClick={handleShare} disabled={!!isDownloading} className="flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl border-none text-base">
            {isDownloading === 'share' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Share2 className="h-5 w-5 mr-2" />} 
            Share
          </Button>
          <Button onClick={onClose} variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-14 w-14 rounded-2xl shrink-0">
            <X className="h-6 h-6 stroke-[3px]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
