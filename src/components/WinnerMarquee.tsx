
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Trophy, Megaphone, Star, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';

export default function WinnerMarquee() {
  const [lastWinner, setLastWinner] = useState<any>(null);
  const [isVisible, setIsOpen] = useState(false);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const unsub = onSnapshot(doc(db, "stats", "leaderboard"), 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const winner = data.lastWeeklyWinner;
          
          if (winner && winner.declaredAt) {
            const declaredAt = winner.declaredAt.toDate();
            const now = new Date();
            // Show for 24 hours (86,400,000 ms)
            if (now.getTime() - declaredAt.getTime() < 86400000) {
              setLastWinner(winner);
              setIsOpen(true);
            } else {
              setIsOpen(false);
            }
          }
        }
      },
      async (error) => {
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

  if (!isVisible || !lastWinner) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white h-10 flex items-center overflow-hidden shadow-md relative z-[100]">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-12">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 font-black uppercase tracking-tighter text-sm italic">
            <Trophy className="w-5 h-5 fill-white animate-bounce" />
            <span>WEEKLY CHAMPION: {lastWinner.name}</span>
            <Star className="w-4 h-4 fill-white" />
            <span>{lastWinner.points.toLocaleString()} Mastery Points!</span>
            <Megaphone className="w-5 h-5 -rotate-12" />
            <span className="text-yellow-100">THE RACE HAS RESET—START PRACTICING NOW!</span>
            <Crown className="w-5 h-5 fill-white" />
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
