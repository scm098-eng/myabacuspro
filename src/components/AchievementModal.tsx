
'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { X, Download, Brain, Loader2, Share2, FileText } from 'lucide-react';
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
  rank?: number;
  groupName?: string;
  onClose: () => void;
}

const A4_WIDTH = 1123;
const A4_HEIGHT = 794;

const AbacusToolIcon = ({ color }: { color: string }) => (
  <svg width="100" height="50" viewBox="0 0 100 50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="96" height="46" rx="4" strokeWidth="2" />
    <line x1="2" y1="16" x2="98" y2="16" strokeWidth="2" />
    {Array.from({ length: 9 }).map((_, i) => {
      const x = 10 + i * 10;
      return (
        <React.Fragment key={i}>
          <line x1={x} y1="2" x2={x} y2="48" opacity="0.3" />
          <circle cx={x} cy="9" r="3" fill={color} stroke="none" />
          <circle cx={x} cy="23" r="3" fill={color} stroke="none" />
          <circle cx={x} cy="30" r="3" fill={color} stroke="none" />
          <circle cx={x} cy="37" r="3" fill={color} stroke="none" />
          <circle cx={x} cy="44" r="3" fill={color} stroke="none" />
        </React.Fragment>
      );
    })}
  </svg>
);

const CertificateContent = React.forwardRef<HTMLDivElement, { studentName: string; title: string; score?: string; date?: string; type: AchievementType, rank?: number, groupName?: string }>(
  ({ studentName, title, score, date, type, rank, groupName }, ref) => {
    const formattedName = studentName.trim().replace(/\s+/g, ' ');
    const isWinnerDesign = type === 'exam_winner' || rank !== undefined;
    const isOfficialExam = type === 'exam_participation' || type === 'exam_winner';

    let themeClass = "bg-white border-[#0f172a]";
    let accentColor = "#f97316";
    let headerColor = "#0f172a";
    let subHeaderColor = "#f97316";
    let cornerBorder = "border-[#f97316]";
    let innerBorder = "border-[#cbd5e1]";

    if (isWinnerDesign) {
      if (rank === 1) {
        themeClass = "bg-[#fffcf0] border-[#b45309]"; 
        accentColor = "#fbbf24";
        headerColor = "#78350f";
        subHeaderColor = "#b45309";
        cornerBorder = "border-[#fbbf24]";
        innerBorder = "border-[#b45309]/30";
      } else if (rank === 2) {
        themeClass = "bg-[#f8fafc] border-[#1e293b]"; 
        accentColor = "#94a3b8";
        headerColor = "#1e293b";
        subHeaderColor = "#475569";
        cornerBorder = "border-[#94a3b8]";
        innerBorder = "border-[#475569]/30";
      } else if (rank === 3) {
        themeClass = "bg-[#fffaf3] border-[#451a03]"; 
        accentColor = "#cd7f32";
        headerColor = "#451a03";
        subHeaderColor = "#78350f";
        cornerBorder = "border-[#cd7f32]";
        innerBorder = "border-[#78350f]/30";
      } else {
        themeClass = "bg-[#f0f9ff] border-[#1e3a8a]"; 
        accentColor = "#3b82f6";
        headerColor = "#1e3a8a";
        subHeaderColor = "#2563eb";
        cornerBorder = "border-[#3b82f6]";
        innerBorder = "border-[#1e40af]/30";
      }
    }

    let headerPillTitle = "Mastery Rank Award";
    if (isOfficialExam) {
      headerPillTitle = `Group "${groupName || 'A'}" Rank Achiever`;
    } else if (type === 'rank') {
      headerPillTitle = "Title Achiever";
    }

    return (
      <div 
        ref={ref}
        style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px`, borderColor: 'transparent' }}
        className={cn(
          "relative border-[16px] flex flex-col items-center p-8 overflow-hidden font-sans select-none transition-colors duration-700",
          themeClass
        )}
      >
        <div className={cn("absolute top-2 left-2 w-24 h-24 border-t-[6px] border-l-[6px] z-20", cornerBorder)} />
        <div className={cn("absolute top-2 right-2 w-24 h-24 border-t-[6px] border-r-[6px] z-20", cornerBorder)} />
        <div className={cn("absolute bottom-2 left-2 w-24 h-24 border-b-[6px] border-l-[6px] z-20", cornerBorder)} />
        <div className={cn("absolute bottom-2 right-2 w-24 h-24 border-b-[6px] border-r-[6px] z-20", cornerBorder)} />

        <div className={cn("absolute top-8 left-8 right-8 bottom-8 border-[0.5px] pointer-events-none z-20", innerBorder)} />
        <div className={cn("absolute top-10 left-10 right-10 bottom-10 border-[0.5px] pointer-events-none z-20", innerBorder)} />

        <div className={cn("absolute inset-0 z-0 grid grid-cols-6 grid-rows-6 pointer-events-none p-16 transition-opacity", isWinnerDesign ? "opacity-[0.07]" : "opacity-[0.02]")}>
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <Brain style={{ width: '60px', height: '60px', color: headerColor }} />
            </div>
          ))}
        </div>

        <div className="relative z-10 w-full flex flex-col items-center mt-12">
          <div className="flex items-center gap-3 mb-1">
            <div className={cn("p-2 rounded-xl shadow-lg")} style={{ backgroundColor: subHeaderColor }}>
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className={cn("text-4xl font-black tracking-tight uppercase")} style={{ color: headerColor }}>MY ABACUS PRO</h1>
          </div>
          <p className={cn("font-black text-[10px] tracking-[0.5em] uppercase")} style={{ color: subHeaderColor }}>LEARN • PRACTICE • SUCCEED</p>
        </div>

        <div className="relative z-10 mt-6">
           <div className={cn("px-16 py-3.5 rounded-[2rem] shadow-xl border-b-4", isWinnerDesign ? "border-black/20" : "bg-[#0f172a] border-black/20")} style={isWinnerDesign ? { backgroundColor: headerColor } : {}}>
              <h2 className="text-xl font-black italic text-white tracking-widest text-center">
                {headerPillTitle}
              </h2>
           </div>
        </div>

        <div className="relative z-10 mt-8 text-center flex flex-col items-center gap-1">
           <p className={cn("text-[12px] font-black uppercase tracking-[0.4em] mb-1")} style={{ color: subHeaderColor }}>OFFICIAL MASTERY CERTIFICATION</p>
           <p className="text-2xl font-bold italic text-[#475569] font-serif opacity-90 leading-none">This prestigious award is proudly presented to</p>
           
           <div className="mt-3 w-fit px-12 pb-1 flex flex-col items-center gap-2">
             <h3 className={cn("text-7xl font-black uppercase tracking-normal leading-none text-center")} style={{ color: headerColor }}>
               {formattedName}
             </h3>
             <div className="h-[2px] w-full mt-1 opacity-20" style={{ backgroundColor: headerColor }} />
           </div>

           <div className="mt-6 text-center space-y-1.5 max-w-4xl">
             <p className={cn("text-[11px] font-bold uppercase tracking-wide leading-none opacity-60")} style={{ color: headerColor }}>
               WHO HAS DEMONSTRATED EXCEPTIONAL CALCULATION SPEED AND PRECISION BY ACHIEVING
             </p>
             <div className="flex flex-col items-center gap-1">
               <p className={cn("text-sm font-bold uppercase tracking-widest leading-none")} style={{ color: headerColor }}>
                 THE DISTINCTION OF <span className={cn("font-black text-4xl ml-2")} style={{ color: subHeaderColor }}>{rank ? `RANK ${rank} ACHIEVER` : title}</span>
               </p>
             </div>
           </div>

           <div className="mt-2">
             <p className={cn("text-lg font-bold leading-none")} style={{ color: headerColor }}>
               With a certified performance score of <span className={cn("font-black border-b-2 pb-0.5 px-2")} style={{ borderColor: headerColor }}>{score || '---'}</span>
             </p>
           </div>
        </div>

        <div className="relative z-10 w-full mt-auto flex justify-between items-end px-12 pb-10">
           <div className="text-left space-y-1 w-64">
             <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]")} style={{ color: subHeaderColor }}>DATE OF ISSUE</p>
             <p className={cn("text-xl font-bold")} style={{ color: headerColor }}>{date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
           </div>

           <div className="flex flex-col items-center gap-3 relative">
             <div className={cn("p-3 rounded-[2rem] border-[3px] shadow-2xl relative animate-in zoom-in-50 duration-700 bg-white border-slate-100")}>
                <AbacusToolIcon color={headerColor} />
             </div>
             <div className="px-8 py-2 rounded-full shadow-lg border border-black/5" style={{ backgroundColor: subHeaderColor }}>
                <p className="text-2xl font-sacramento text-white font-bold leading-none px-2">Congratulations!</p>
             </div>
           </div>

           <div className="text-right w-64 flex flex-col items-end">
             <div className="flex flex-col items-center relative pr-4">
                <p 
                  className={cn("font-sacramento text-[36px] font-bold mb-[-12px]")}
                  style={{ fontFamily: 'var(--font-sacramento), cursive', color: subHeaderColor }}
                >
                  Satish Mane
                </p>
                <div className={cn("h-[1px] w-52 mb-2")} style={{ backgroundColor: headerColor, opacity: 0.2 }} />
                <div className="text-center">
                   <p className={cn("text-[11px] font-black uppercase tracking-[0.2em]")} style={{ color: headerColor }}>SATISH MANE</p>
                   <p className={cn("text-[9px] font-black uppercase tracking-tighter opacity-70")} style={{ color: headerColor }}>FOUNDER & DIRECTOR, MY ABACUS PRO</p>
                </div>
             </div>
           </div>
        </div>
      </div>
    );
  }
);
CertificateContent.displayName = 'CertificateContent';

const AchievementModal: React.FC<AchievementProps> = ({ type, studentName, title, score, date, rank, groupName, onClose }) => {
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
          text: `I just achieved the distinction of ${rank ? `Rank ${rank}` : title} on My Abacus Pro! 🧮✨`,
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
          <CertificateContent ref={cardRef} studentName={studentName} title={title} score={score} date={date} type={type} rank={rank} groupName={groupName} />
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
          <CertificateContent studentName={studentName} title={title} score={score} date={date} type={type} rank={rank} groupName={groupName} />
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
