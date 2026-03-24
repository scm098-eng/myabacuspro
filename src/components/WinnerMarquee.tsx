
'use client';

import { useEffect, useState } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Trophy, Megaphone, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

export default function WinnerMarquee() {
  const [winners, setWinners] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const unsub = onSnapshot(doc(db, "stats", "leaderboard"), 
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const weekly = data.lastWeeklyWinner;
          const monthly = data.lastMonthlyWinner;
          
          if (weekly || monthly) {
            setWinners({ weekly, monthly });
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        } else {
          setIsVisible(false);
        }
      },
      async (error) => {
        // Standard Firebase error handling
        if (error.code === 'permission-denied') {
          const permissionError = new FirestorePermissionError({
            path: 'stats/leaderboard',
            operation: 'get',
          });
          errorEmitter.emit('permission-error', permissionError);
        }
      }
    );
    return () => unsub();
  }, []);

  if (!isVisible || !winners) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white h-10 flex items-center overflow-hidden shadow-md relative z-[100] border-b border-white/20">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-12">
            {winners.weekly && (
              <div className="flex items-center gap-4 px-4 font-black uppercase tracking-tighter text-xs sm:text-sm italic">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 fill-white animate-bounce" />
                <span>WEEKLY CHAMPION: {winners.weekly.name} ({winners.weekly.points.toLocaleString()} PTS)</span>
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-white" />
              </div>
            )}
            {winners.monthly && (
              <div className="flex items-center gap-4 px-4 font-black uppercase tracking-tighter text-xs sm:text-sm italic text-yellow-100">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-100 animate-pulse" />
                <span>MONTHLY MASTER: {winners.monthly.name} ({winners.monthly.points.toLocaleString()} PTS)</span>
                <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 -rotate-12" />
              </div>
            )}
            <span className="text-white/80 font-bold text-[10px]">THE RACE HAS RESET—START PRACTICING NOW!</span>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
}
