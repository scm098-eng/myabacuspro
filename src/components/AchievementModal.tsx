'use client';

import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { X, Download, Award, Brain, FileText, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

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

const CertificateContent = React.forwardRef<HTMLDivElement, { studentName: string; title: string; score?: string; date?: string }>(
  ({ studentName, title, score, date }, ref) => {
    // Ensure name has at least one space if it contains multiple words
    const formattedName = studentName.trim().replace(/\s+/g, ' ');

    return (
      <div 
        ref={ref}
        style={{ width: `${A4_WIDTH}px`, height: `${A4_HEIGHT}px` }}
        className="bg-white relative border-[16px] border-[#0f172a] flex flex-col items-center p-8 overflow-hidden font-sans select-none"
      >
        {/* --- ORANGE CORNER BRACKETS --- */}
        <div className="absolute top-2 left-2 w-24 h-24 border-t-[6px] border-l-[6px] border-[#f97316] z-20" />
        <div className="absolute top-2 right-2 w-24 h-24 border-t-[6px] border-r-[6px] border-[#f97316] z-20" />
        <div className="absolute bottom-2 left-2 w-24 h-24 border-b-[6px] border-l-[6px] border-[#f97316] z-20" />
        <div className="absolute bottom-2 right-2 w-24 h-24 border-b-[6px] border-r-[6px] border-[#f97316] z-20" />

        {/* --- WATERMARK BACKGROUND --- */}
        <div className="absolute inset-0 z-0 grid grid-cols-6 grid-rows-6 opacity-[0.04] pointer-events-none p-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <Brain className="w-20 h-20 text-[#0f172a]" />
            </div>
          ))}
        </div>

        {/* --- HEADER --- */}
        <div className="relative z-10 w-full flex flex-col items-center mt-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-[#f97316] p-2 rounded-xl shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">MY ABACUS PRO</h1>
          </div>
          <p className="text-[#f97316] font-black text-[10px] tracking-[0.5em] uppercase">LEARN • PRACTICE • SUCCEED</p>
        </div>

        {/* --- MASTERY AWARD BADGE --- */}
        <div className="relative z-10 mt-4">
           <div className="bg-[#0f172a] px-20 py-4 rounded-[2rem] shadow-xl">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-widest">MASTERY RANK AWARD</h2>
           </div>
        </div>

        {/* --- CERTIFICATION TEXT --- */}
        <div className="relative z-10 mt-6 text-center space-y-1">
           <p className="text-[#94a3b8] font-black uppercase tracking-[0.4em] text-xs">OFFICIAL MASTERY CERTIFICATION</p>
           <p className="text-2xl font-bold italic text-[#475569] font-serif opacity-90">This prestigious award is proudly presented to</p>
        </div>

        {/* --- STUDENT NAME --- */}
        <div className="relative z-10 mt-2 w-fit px-12 border-b-2 border-slate-200 pb-1">
          <h3 className="text-7xl font-black uppercase tracking-tighter text-[#0f172a] leading-none text-center">
            {formattedName}
          </h3>
        </div>

        {/* --- ACHIEVEMENT DESCRIPTION --- */}
        <div className="relative z-10 mt-8 text-center space-y-2 max-w-4xl">
          <p className="text-sm font-bold text-[#0f172a] uppercase tracking-wide leading-tight">
            WHO HAS DEMONSTRATED EXCEPTIONAL CALCULATION SPEED AND PRECISION BY ACHIEVING
          </p>
          <p className="text-sm font-bold text-[#0f172a] uppercase tracking-widest">
            THE DISTINCTION OF <span className="text-[#f97316] font-black text-3xl ml-2">{title}</span>
          </p>
        </div>

        {/* --- SCORE --- */}
        <div className="relative z-10 mt-6">
          <p className="text-lg font-bold text-[#0f172a]">
            With a certified performance score of <span className="font-black border-b-2 border-[#0f172a] pb-0.5 px-1">{score || '---'}</span>
          </p>
        </div>

        {/* --- FOOTER --- */}
        <div className="relative z-10 w-full mt-auto flex justify-between items-end px-12 pb-8">
           {/* Date Section */}
           <div className="text-left space-y-1 w-64">
             <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">DATE OF ISSUE</p>
             <p className="text-xl font-bold text-[#0f172a]">{date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
           </div>

           {/* Gold Seal */}
           <div className="flex flex-col items-center gap-2 mb-[-10px]">
             <div className="bg-[#fef9c3] p-5 rounded-full border-[5px] border-[#fbbf24] shadow-xl relative">
                <Award className="w-14 h-14 text-[#fbbf24] drop-shadow-sm" />
             </div>
             <div className="bg-[#0f172a] px-4 py-1 rounded-full shadow-md">
               <p className="text-[8px] font-black text-white uppercase tracking-widest">LEVEL ACHIEVED</p>
             </div>
           </div>

           {/* Signature Section */}
           <div className="text-right w-64">
             <div className="flex flex-col items-end relative">
                <p 
                  className="text-[#f97316] absolute bottom-[18px] right-6 font-sacramento text-[34px] font-bold"
                  style={{ fontFamily: 'var(--font-sacramento), cursive' }}
                >
                  Satish Mane
                </p>
                <div className="h-[1.5px] w-56 bg-[#cbd5e1] mt-10" />
             </div>
             <div className="mt-2">
                <p className="text-[10px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">SATISH MANE</p>
                <p className="text-[8px] font-black text-[#94a3b8] uppercase tracking-tighter opacity-70">FOUNDER & DIRECTOR, MY ABACUS PRO</p>
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
  const [isDownloading, setIsDownloading] = useState<'jpeg' | 'pdf' | null>(null);
  const [modalScale, setModalScale] = useState(0.5);

  useEffect(() => {
    // Confetti celebration
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#ffffff', '#fbbf24', '#0f172a'],
      zIndex: 10001
    });

    // Dynamic scaling for responsive preview
    const updateScale = () => {
      const padding = 40;
      const maxWidth = window.innerWidth - padding;
      const maxHeight = window.innerHeight - 250;
      const scaleW = maxWidth / A4_WIDTH;
      const scaleH = maxHeight / A4_HEIGHT;
      setModalScale(Math.min(scaleW, scaleH, 0.7));
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center w-full max-w-5xl gap-6">
        
        {/* --- HIDDEN MASTER FOR CAPTURE --- */}
        <div className="fixed left-[-9999px] top-0 pointer-events-none">
          <CertificateContent ref={cardRef} studentName={studentName} title={title} score={score} date={date} />
        </div>

        {/* --- VISUAL PREVIEW (SCALED) --- */}
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
          <CertificateContent studentName={studentName} title={title} score={score} date={date} />
        </div>

        {/* --- ACTIONS --- */}
        <div className="flex flex-wrap gap-4 w-full max-w-3xl px-4 relative z-[10002] animate-in slide-in-from-bottom-4 duration-500">
          <Button onClick={handleDownloadPDF} disabled={!!isDownloading} className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl border-none text-base">
            {isDownloading === 'pdf' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <FileText className="h-5 w-5 mr-2" />} 
            Save PDF (A4)
          </Button>
          <Button onClick={handleDownloadJPEG} disabled={!!isDownloading} className="flex-1 h-14 bg-white text-[#0f172a] hover:bg-slate-50 font-black uppercase tracking-widest rounded-2xl shadow-lg border-2 border-slate-200 text-base">
            {isDownloading === 'jpeg' ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />} 
            Save JPEG
          </Button>
          <Button onClick={onClose} variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white h-14 w-14 rounded-2xl shrink-0">
            <X className="h-6 w-6 stroke-[3px]" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
