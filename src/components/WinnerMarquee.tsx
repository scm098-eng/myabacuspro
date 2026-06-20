
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Trophy, Star, Crown, Megaphone, Calendar, ScrollText, XCircle, MonitorOff } from 'lucide-react';
import { isSameDay, parseISO, isAfter, isBefore } from 'date-fns';

export default function WinnerMarquee() {
  const [data, setData] = useState<{ winners: any, schedule: any }>({ winners: null, schedule: null });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    const unsubWinners = onSnapshot(doc(db, "stats", "leaderboard"), (snap) => {
      if (snap.exists()) setData(prev => ({ ...prev, winners: snap.data() }));
    });
    const unsubSchedule = onSnapshot(doc(db, "stats", "examSchedule"), (snap) => {
      if (snap.exists()) setData(prev => ({ ...prev, schedule: snap.data() }));
    });
    return () => { unsubWinners(); unsubSchedule(); };
  }, []);

  const messages = useMemo(() => {
    const msgs: { text: string; icon: any }[] = [];
    const now = new Date();
    const { winners, schedule } = data;

    // 1. Exam Cancelled Message
    if (schedule?.isActive === false && schedule?.updatedAt) {
      const updatedAt = schedule.updatedAt.toDate?.() || new Date(schedule.updatedAt);
      const oneDayAfter = new Date(updatedAt.getTime() + 86400000);
      if (isAfter(now, updatedAt) && isBefore(now, oneDayAfter)) {
        msgs.push({ 
          text: "EXAM CANCELLED! ACCESS RESTRICTED FOR THIS CYCLE.", 
          icon: <XCircle className="w-5 h-5 text-red-400 animate-pulse" /> 
        });
      }
    }

    // 2. Results Declared Message
    if (schedule?.resultsDeclared && schedule?.lastResultDeclaredAt) {
      const declaredAt = schedule.lastResultDeclaredAt.toDate?.() || new Date(schedule.lastResultDeclaredAt);
      if (isAfter(now, declaredAt) && isBefore(now, new Date(declaredAt.getTime() + 86400000))) {
        msgs.push({ text: "OFFICIAL RESULTS DECLARED! CHECK YOUR PERFORMANCE TAB!", icon: <ScrollText className="w-5 h-5" /> });
      }
    }

    // 3. Exam Day Status (Open or Concluded) or Future Schedule
    if (schedule?.isActive !== false && schedule?.date && !schedule?.resultsDeclared) {
      const examDate = parseISO(schedule.date);
      const endTimeStr = schedule.endTime || '16:00';
      const endTimeDate = new Date(`${schedule.date}T${endTimeStr}:00`);

      if (isSameDay(now, examDate)) {
        if (isBefore(now, endTimeDate)) {
          msgs.push({ 
            text: `EXAM DAY IS HERE! ARENA OPEN UNTIL ${endTimeStr}!`, 
            icon: <Megaphone className="w-5 h-5 text-yellow-300 animate-pulse" /> 
          });
        } else {
          // Stay until end of day
          msgs.push({ 
            text: `GRAND FINAL HAS FINISHED AT ${endTimeStr}! THE ARENA IS NOW CLOSED.`, 
            icon: <MonitorOff className="w-5 h-5 text-red-400 animate-pulse" /> 
          });
        }
      } else if (isAfter(examDate, now)) {
        // Exam is in the future. We show relevant message for the scheduled date.
        if (schedule.lastApplyDate && isBefore(now, parseISO(schedule.lastApplyDate))) {
          msgs.push({ 
            text: `REGISTRATION OPEN: Official Exam on ${schedule.date}. Apply before deadline: ${schedule.lastApplyDate}!`, 
            icon: <Calendar className="w-5 h-5" /> 
          });
        } else {
          msgs.push({ 
            text: `UPCOMING EXAM: The Grand Final is scheduled for ${schedule.date}. Prepare for Mastery!`, 
            icon: <Calendar className="w-5 h-5" /> 
          });
        }
      }
    }

    // 4. Winner Announcements
    if (winners) {
      ['lastWeeklyWinner', 'lastMonthlyWinner'].forEach(k => {
        const w = winners[k];
        if (w?.declaredAt) {
          const dat = w.declaredAt.toDate?.() || new Date(w.declaredAt);
          if (isAfter(now, dat) && isBefore(now, new Date(dat.getTime() + 86400000))) {
            msgs.push({ 
              text: `${k === 'lastWeeklyWinner' ? 'WEEKLY CHAMPION' : 'MONTHLY MASTER'}: ${w.name} (${w.points.toLocaleString()} PTS)!`, 
              icon: <Trophy className="w-5 h-5 fill-white" /> 
            });
          }
        }
      });
    }
    return msgs;
  }, [data]);

  useEffect(() => setIsVisible(messages.length > 0), [messages]);

  if (!isVisible || messages.length === 0) return null;

  return (
    <div className="bg-indigo-600 text-white h-10 flex items-center overflow-hidden relative z-[100] border-b border-white/10">
      <div className="flex whitespace-nowrap animate-marquee items-center gap-12">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-12">
            {messages.map((m, idx) => (
              <div key={idx} className="flex items-center gap-4 px-4 font-black uppercase tracking-tighter text-xs sm:text-sm italic">
                {m.icon} <span>{m.text}</span> <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-white opacity-50" />
              </div>
            ))}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 60s linear infinite; }
      `}</style>
    </div>
  );
}
