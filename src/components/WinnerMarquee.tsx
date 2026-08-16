
'use client';

import { useEffect, useState, useMemo } from 'react';
import { getFirestore, doc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Trophy, Star, Crown, Megaphone, Calendar, ScrollText, XCircle, MonitorOff, Zap, ShieldCheck } from 'lucide-react';
import { isAfter, isBefore } from 'date-fns';

export default function WinnerMarquee() {
  const [data, setData] = useState<{ winners: any, schedule: any, publicAchievements: any[] }>({ winners: null, schedule: null, publicAchievements: [] });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const db = getFirestore(firebaseApp);
    
    const unsubWinners = onSnapshot(doc(db, "stats", "leaderboard"), (snap) => {
      if (snap.exists()) setData(prev => ({ ...prev, winners: snap.data() }));
    });
    
    const unsubSchedule = onSnapshot(doc(db, "stats", "examSchedule"), (snap) => {
      if (snap.exists()) setData(prev => ({ ...prev, schedule: snap.data() }));
    });

    const achievementsQuery = query(collection(db, "publicAchievements"), orderBy("timestamp", "desc"), limit(10));
    const unsubAchievements = onSnapshot(achievementsQuery, (snap) => {
      setData(prev => ({ 
        ...prev, 
        publicAchievements: snap.docs.map(d => ({ id: d.id, ...d.data() })) 
      }));
    });

    return () => { unsubWinners(); unsubSchedule(); unsubAchievements(); };
  }, []);

  const messages = useMemo(() => {
    const msgs: { text: string; icon: any }[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const { winners, schedule, publicAchievements } = data;

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

    // 3. Exam Schedule & Deadline
    if (schedule?.isActive !== false && schedule?.date && !schedule?.resultsDeclared) {
      const isExamToday = schedule.date === todayStr;
      const endTimeStr = schedule.endTime || '16:00';
      const endTimeDate = new Date(`${schedule.date}T${endTimeStr}:00`);

      if (isExamToday) {
        if (isBefore(now, endTimeDate)) {
          msgs.push({ 
            text: `EXAM DAY IS HERE! ARENA OPEN UNTIL ${endTimeStr}!`, 
            icon: <Megaphone className="w-5 h-5 text-yellow-300 animate-pulse" /> 
          });
        } else {
          msgs.push({ 
            text: `GRAND FINAL HAS FINISHED AT ${endTimeStr}! THE ARENA IS NOW CLOSED.`, 
            icon: <MonitorOff className="w-5 h-5 text-red-400 animate-pulse" /> 
          });
        }
      } else if (schedule.date > todayStr) {
        const deadlineDateStr = schedule.lastApplyDate;
        const isDeadlineActive = deadlineDateStr && deadlineDateStr >= todayStr;

        if (isDeadlineActive) {
          msgs.push({ 
            text: `REGISTRATION OPEN: Official Exam on ${schedule.date}. Apply before deadline: ${schedule.lastApplyDate}!`, 
            icon: <Calendar className="w-5 h-5 text-sky-400" /> 
          });
        } else {
          msgs.push({ 
            text: `UPCOMING EXAM: The Grand Final is scheduled for ${schedule.date}. (Registration Closed on ${schedule.lastApplyDate || 'N/A'}). Prepare for Mastery!`, 
            icon: <Calendar className="w-5 h-5" /> 
          });
        }
      }
    }

    // 4. Public Rank Achievements (Show for 24 hours)
    publicAchievements.forEach(ach => {
      if (ach.timestamp) {
        const timestamp = ach.timestamp.toDate?.() || new Date(ach.timestamp);
        const oneDayAfter = new Date(timestamp.getTime() + 86400000);
        if (isAfter(now, timestamp) && isBefore(now, oneDayAfter)) {
          const isHighRank = ach.rankName === 'Human Calculator' || ach.rankName === 'Grandmaster';
          msgs.push({
            text: `${isHighRank ? 'LEGENDARY ACHIEVEMENT' : 'NEW RANK'}: ${ach.name} reached ${ach.rankName.toUpperCase()}! 🎉`,
            icon: isHighRank ? <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400 animate-bounce" /> : <Zap className="w-5 h-5 text-primary" />
          });
        }
      }
    });

    // 5. Winner Announcements
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
        .animate-marquee { animation: marquee 150s linear infinite; }
      `}</style>
    </div>
  );
}
