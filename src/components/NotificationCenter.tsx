
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import type { Notification } from '@/types';
import { Bell, Trophy, Calendar, Zap, Trash2, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function NotificationCenter() {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    const q = query(
      collection(db, 'users', user.uid, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate ? d.data().createdAt.toDate() : new Date(d.data().createdAt)
      } as Notification)));
    });
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Function to clear the home screen app icon badge
  const clearAppIconBadge = async () => {
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (error) {
        console.error('Error clearing app icon badge:', error);
      }
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { isRead: true });

    // Clear home screen icon badge
    await clearAppIconBadge();
  };

  const deleteNotif = async (id: string) => {
    if (!user) return;
    const db = getFirestore(firebaseApp);
    await deleteDoc(doc(db, 'users', user.uid, 'notifications', id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'practice_reminder': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'leaderboard_alert': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'exam_alert': return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'rank_up': return <Sparkles className="w-4 h-4 text-primary" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  if (profile?.role === 'admin' || profile?.role === 'teacher') return null;

  return (
    <Popover open={isOpen} onOpenChange={(open) => {setIsOpen(open);if (open) {clearAppIconBadge();}}}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-primary/10">
          <Bell className={cn("h-5 w-5", unreadCount > 0 ? "text-primary animate-swing" : "text-muted-foreground")} />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white border-2 border-background">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 rounded-2xl shadow-2xl border-none overflow-hidden" align="end">
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-black uppercase tracking-widest text-xs">Activity Hub</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 text-white/50 hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={cn(
                    "p-4 transition-colors group relative",
                    !n.isRead ? "bg-primary/5" : "bg-white"
                  )}
                  onMouseEnter={() => !n.isRead && markAsRead(n.id)}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 p-2 bg-muted rounded-xl shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-black text-xs uppercase text-slate-900 truncate">{n.title}</h4>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                          {format(n.createdAt, 'MMM d, p')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 leading-tight">
                        {n.message}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deleteNotif(n.id)} 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center opacity-20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Inbox Zero</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Check back later for rewards and tips.</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
