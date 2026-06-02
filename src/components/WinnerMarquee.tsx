'use client';

import { useEffect, useState, useMemo } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Trophy, Star, Crown, Megaphone, Calendar, Bell, ScrollText } from 'lucide-react';
import { errorEmitter } from '@/lib/error-emitter';
import { FirestorePermissionError } from '@/lib/errors';
import { isSameDay, parseISO, isAfter, isBefore, subHours } from 'date-fns';

export default function WinnerMarquee() {
  const [data, setData] = useState<{ winners: any, schedule: any }>({ winners: null, schedule: null });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    
    // Listen to leaderboard for winners
    const unsubWinners = onSnapshot(doc(db, "stats", "leaderboard"), (snapshot) => {
      if (snapshot.exists()) {
        setData(prev => ({ ...prev, winners: snapshot.data() }));
      }
    });

    // Listen to exam schedule for reminders
    const unsubSchedule = onSnapshot(doc(db, "stats", "examSchedule"), (snapshot) => {
      if (snapshot.exists()) {
        setData(prev => ({ ...prev, schedule: snapshot.data() }));
      }
    });

    return () => {
      unsubWinners();
      unsubSchedule();
    };
  }, []);

  const messages = useMemo(() => {
    const msgs: { text: string; icon: any; colorClass?: string }[] = [];
    const now = new Date();
    const { winners, schedule } = data;

    // 1. Result Declaration (24h window)
    if (schedule?.lastResultDeclaredAt) {
      const declaredAt = schedule.lastResultDeclaredAt.toDate ? schedule.lastResultDeclaredAt.toDate() : new Date(schedule.lastResultDeclaredAt);
      if (isAfter(now, declaredAt) && isBefore(now, new Date(declaredAt.getTime() + 24 * 60 * 60 * 1000))) {
        msgs.push({
          text: "OFFICIAL RESULTS DECLARED! CHECK YOUR PERFORMANCE TAB NOW!",
          icon: <ScrollText className="w-5 h-5 text-green-400" />,
          colorClass: "text-green-300"
        });
      }
    }

    // 2. Exam Day Notification
    if (schedule?.date) {
      const examDate = parseISO(schedule.date);
      if (isSameDay(now, examDate)) {
        msgs.push({
          text: `EXAM DAY IS HERE! ARENA IS OPEN FROM ${schedule.startTime} TO ${schedule.endTime}!`,
          icon: <Megaphone className="w-5 h-5 text-yellow-400 animate-pulse" />,
          colorClass: "text-yellow-200"
        });
      }
    }

    // 3. Registration Reminder (Declare Date -> Deadline)
    if (schedule?.date && schedule?.applicationDeadline) {
      const deadline = parseISO(schedule.applicationDeadline);
      const examDate = parseISO(schedule.date);
      if (isBefore(now, deadline) || isSameDay(now, deadline)) {
        msgs.push({
          text: `REGISTRATION OPEN: Official Exam on ${schedule.date}. Apply before deadline: ${schedule.applicationDeadline}!`,
          icon: <Calendar className="w-5 h-5 text-blue-400" />,
          colorClass: "text-blue-100"
        });
      }
    }

    // 4. Winners (24h window)
    if (winners) {
      const types = ['lastWeeklyWinner', 'lastMonthlyWinner'];
      types.forEach(type => {
        const winner = winners[type];
        if (winner?.declaredAt) {
          const declaredAt = winner.declaredAt.toDate ? winner.declaredAt.toDate() : new Date(winner.declaredAt);
          if (isAfter(now, declaredAt) && isBefore(now, new Date(declaredAt.getTime() + 24 * 60 * 60 * 1000))) {
            msgs.push({
              text: `${type === 'lastWeeklyWinner' ? 'WEEKLY CHAMPION' : 'MONTHLY MASTER'}: ${winner.name} (${winner.points.toLocaleString()} PTS)!`,
              icon: type === 'lastWeeklyWinner' ? <Trophy className="w-5 h-5 fill-white" /> : <Crown className="w-5 h-5 fill-yellow-100" />,
            });
          }
        }
      });
    }

    if (msgs.length > 0) setIsVisible(true);
    else setIsVisible(false);

    return msgs;
  }, [data]);

  if (!isVisible || messages.length === 0) return null;

  return (
    <div className="bg-slate-900 text-white h-10 flex items-center overflow-hidden shadow-md relative z-[100] border-b border-white/20">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-12">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex items-center gap-4 px-4 font-black uppercase tracking-tighter text-xs sm:text-sm italic ${m.colorClass || ''}`}>
                {m.icon}
                <span>{m.text}</span>
                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-white opacity-50" />
              </div>
            ))}
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
