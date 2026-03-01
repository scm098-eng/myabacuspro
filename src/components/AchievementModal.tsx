
'use client';

import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { toJpeg } from 'html-to-image';
import { X, Download, Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface AchievementProps {
  studentName: string;
  title: string;
  icon: string;
  color: string;
  totalPoints: number;
  totalDays: number;
  onClose: () => void;
}

const AchievementModal: React.FC<AchievementProps> = ({ studentName, title, icon, color, totalPoints, totalDays, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 🎊 Trigger Confetti Blast
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: [color, '#ffffff', '#fbbf24']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: [color, '#ffffff', '#fbbf24']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [color]);

  const handleDownload = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 0.95, 
        cacheBust: true,
        backgroundColor: '#0f172a' // slate-900
      });
      const link = document.createElement('a');
      link.download = `${studentName}-${title.replace(/\s+/g, '-')}-MyAbacusPro.jpeg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Oops, something went wrong!', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="flex flex-col items-center max-w-sm w-full">
        
        {/* 🖼️ The Card (This is what gets downloaded) */}
        <div 
          ref={cardRef}
          className="bg-slate-900 border-4 rounded-3xl p-8 text-center w-full shadow-2xl relative overflow-hidden"
          style={{ borderColor: color }}
        >
          {/* Subtle background glow */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none" 
            style={{ background: `radial-gradient(circle at center, ${color}, transparent)` }} 
          />
          
          <div className="relative z-10">
            <div className="text-7xl mb-4 drop-shadow-lg animate-bounce">{icon}</div>
            <h1 className="text-white text-3xl font-black uppercase tracking-tighter font-headline">Level Up!</h1>
            <p className="text-slate-400 mt-2 font-medium">Congratulations</p>
            <h2 className="text-white text-2xl font-bold italic font-headline truncate">{studentName}</h2>
            
            <div className="my-6 py-3 px-6 rounded-full inline-block shadow-lg" style={{ backgroundColor: color + '33', border: `1px solid ${color}` }}>
               <span className="font-black text-xl tracking-tight" style={{ color: color }}>{title}</span>
            </div>

            <div className="flex justify-around text-white text-sm border-t border-white/10 pt-6">
              <div className="text-center">
                <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mb-1">Total Points</p>
                <strong className="text-lg">{totalPoints.toLocaleString()}</strong>
              </div>
              <div className="w-px bg-white/10" />
              <div className="text-center">
                <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest mb-1">Practice Days</p>
                <strong className="text-lg">{totalDays}</strong>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Official Mastery Rank</p>
                <p className="text-[9px] text-slate-700 mt-1 italic">Verified by MyAbacusPro.com</p>
            </div>
          </div>
        </div>

        {/* 🔘 Control Buttons */}
        <div className="mt-8 flex gap-4 w-full">
          <Button 
            onClick={handleDownload}
            className="flex-1 h-14 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl shadow-xl shadow-green-900/20 transition-all hover:scale-[1.02]"
          >
            <Share2 className="mr-2 h-5 w-5" /> Share with Parents
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white h-14 w-14 rounded-2xl transition-all"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AchievementModal;
