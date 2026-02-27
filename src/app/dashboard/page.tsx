'use client';

import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, Trophy, Baby, ChevronRight, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function StudentDashboardPage() {
  usePageBackground('');
  const { profile, user, isLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !mounted) {
    return (
      <div className="max-w-[450px] mx-auto p-4 space-y-6">
        <Skeleton className="h-[220px] w-full rounded-b-[30px]" />
        <Skeleton className="h-[150px] w-full rounded-[20px]" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full rounded-[20px]" />
          <Skeleton className="h-24 w-full rounded-[20px]" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-[450px] mx-auto bg-[#f4f7f9] min-h-screen pb-32 -m-4 sm:-m-6 lg:-m-8 relative font-sans">
      {/* Header Card */}
      <div className="relative h-[240px] rounded-b-[35px] overflow-hidden shadow-xl shadow-blue-900/10">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-110"
          style={{ backgroundImage: "url('https://picsum.photos/seed/math/800/600')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-8 flex flex-col justify-start text-white">
          <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase italic drop-shadow-md">Road to Mastery</h2>
          
          <div className="flex items-center gap-2 bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-fit shadow-lg border border-blue-400/30">
            <Baby className="w-3.5 h-3.5" />
            <span>Current Rank: Junior Calculator 👶</span>
          </div>

          <div className="mt-auto">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2.5 text-blue-100">
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" /> 15 Days left in Month</span>
              <span>18% to next Badge</span>
            </div>
            <div className="h-3 w-full bg-white/20 rounded-full p-0.5 backdrop-blur-sm">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000" style={{ width: '18%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-white p-6 rounded-[25px] shadow-xl shadow-blue-900/5 border border-white">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-200">
                <Check className="w-4 h-4 text-white stroke-[4px]" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Week 1</h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter">Progress: 6/7 Days</span>
            </div>
          </div>

          <div className="flex items-center justify-between relative h-12">
            {/* Background Line */}
            <div className="absolute top-1/2 left-4 right-12 h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full overflow-hidden">
               <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: '80%' }} />
            </div>

            <div className="flex justify-between w-full relative z-10">
              {[1, 2, 3, 4, 5].map((day) => (
                <div key={day} className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 border-2 border-white">
                  <Check className="w-4 h-4 stroke-[4px]" />
                </div>
              ))}
              {/* Current Day */}
              <div className="w-9 h-9 rounded-full border-[3px] border-blue-600 bg-white flex items-center justify-center text-blue-600 text-xs font-black shadow-lg shadow-blue-100 animate-pulse">
                6
              </div>
              {/* Next Day */}
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-black border-2 border-white">
                7
              </div>
              {/* Trophy */}
              <div className="flex items-center justify-center pl-2">
                <div className="bg-slate-50 p-2 rounded-xl border-2 border-dashed border-slate-200 grayscale opacity-50">
                  <Trophy className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 mt-6">
        <div className="bg-white p-5 rounded-[25px] shadow-sm border border-white flex flex-col items-center justify-center gap-1 group hover:shadow-md transition-shadow cursor-default">
          <span className="text-3xl font-black text-blue-600 tracking-tighter group-hover:scale-110 transition-transform">42</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">Questions<br/>Today</span>
        </div>
        <div className="bg-white p-5 rounded-[25px] shadow-sm border border-white flex flex-col items-center justify-center gap-1 group hover:shadow-md transition-shadow cursor-default">
          <span className="text-3xl font-black text-blue-600 tracking-tighter group-hover:scale-110 transition-transform">92%</span>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">Avg.<br/>Accuracy</span>
        </div>
      </div>

      {/* Detailed Report Link */}
      <div className="mt-8 px-4">
        <Button 
          onClick={() => router.push('/progress')}
          variant="outline"
          className="w-full h-14 rounded-[20px] border-2 border-white bg-white/50 text-slate-600 font-bold hover:bg-white transition-all shadow-sm flex items-center justify-between px-6"
        >
          Detailed Progress Report
          <ChevronRight className="w-5 h-5 opacity-50" />
        </Button>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-6 z-50">
        <Button 
          onClick={() => router.push('/tests')}
          className="w-full h-18 py-8 rounded-full bg-blue-600 hover:bg-blue-700 text-2xl font-black shadow-[0_15px_30px_rgba(37,99,235,0.4)] uppercase tracking-widest flex items-center justify-center gap-3 group transition-all active:scale-95 text-white"
        >
          GO
          <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-6 h-6 text-white stroke-[4px]" />
          </div>
        </Button>
      </div>
    </div>
  );
}
