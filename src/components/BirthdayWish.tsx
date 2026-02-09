
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Cake } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';

export default function BirthdayWish() {
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (profile?.dob && isToday(parseISO(profile.dob))) {
      // Use a timeout to avoid showing the dialog immediately on page load, which can be jarring.
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [profile]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 mb-4">
            <Cake className="h-10 w-10 text-pink-600" />
          </div>
          <DialogTitle className="text-2xl font-bold">Happy Birthday, {profile?.firstName}!</DialogTitle>
          <DialogDescription className="mt-2 text-lg">
            Wishing you a fantastic day filled with joy and success. Keep shining!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
           <p className="text-sm text-muted-foreground">From the My Abacus Pro Team</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
