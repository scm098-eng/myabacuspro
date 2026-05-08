'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Goal, BrainCircuit, ShieldCheck, Award } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export default function AboutPage() {
  usePageBackground('');
  
  return (
    <div className="space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-foreground font-headline sm:text-6xl uppercase">
          Mastery Through <span className="text-primary">Vision</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground font-medium">
          Modernizing ancient mental math techniques for the 2026 digital landscape.
        </p>
      </div>

      <Card className="overflow-hidden shadow-2xl border-none bg-card/50 backdrop-blur-sm rounded-[2.5rem]">
        <div className="grid md:grid-cols-2 items-stretch">
            <div className="p-8 md:p-14 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-primary font-headline uppercase tracking-tighter italic">Founded by Satish Mane</h2>
                <div className="h-1 w-20 bg-primary/20 rounded-full" />
              </div>
              <div className="space-y-4 text-slate-700 font-medium leading-relaxed">
                <p>
                  Founded by <strong>Satish Mane</strong>, a dedicated educator and business leader based in India, My Abacus Pro is a specialized digital platform designed to modernize ancient mental math techniques.
                </p>
                <p>
                  With a deep background in abacus pedagogy and a passion for technology, Satish developed this platform to bridge the gap between traditional learning and the 2026 digital landscape.
                </p>
                <p>
                  Beyond the classroom, our founder also operates <strong>S.M. Enterprises</strong>, ensuring that our educational standards are backed by professional integrity and community trust.
                </p>
              </div>
            </div>
            <div className="relative h-64 md:h-auto min-h-[350px]">
              <Image 
                src={placeholderImages.aboutStory.src}
                alt="Founder and student training"
                fill
                className="object-cover"
                data-ai-hint={placeholderImages.aboutStory.hint}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-card/20 to-transparent md:bg-gradient-to-l" />
            </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 rounded-3xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6">
            <div className="mx-auto bg-primary/10 p-4 rounded-2xl w-fit">
                <Goal className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4 text-center font-black uppercase tracking-tight">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center text-slate-600 font-medium leading-relaxed">
            To empower the next generation of thinkers by providing scientifically backed tools for brain development, focus, and competitive excellence.
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 rounded-3xl overflow-hidden">
          <CardHeader className="bg-orange-50 pb-6">
            <div className="mx-auto bg-orange-100 p-4 rounded-2xl w-fit">
                <Award className="h-10 w-10 text-orange-600" />
            </div>
            <CardTitle className="mt-4 text-center font-black uppercase tracking-tight">Professional Integrity</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center text-slate-600 font-medium leading-relaxed">
            Our platform is managed with the same high standards of trust and excellence that define S.M. Enterprises.
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm hover:-translate-y-2 transition-all duration-300 rounded-3xl overflow-hidden">
          <CardHeader className="bg-blue-50 pb-6">
            <div className="mx-auto bg-blue-100 p-4 rounded-2xl w-fit">
                <BrainCircuit className="h-10 w-10 text-blue-600" />
            </div>
            <CardTitle className="mt-4 text-center font-black uppercase tracking-tight">Scientific Edge</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 text-center text-slate-600 font-medium leading-relaxed">
            We focus on Anzan (mental visualization) which is scientifically proven to activate both hemispheres of the brain.
          </CardContent>
        </Card>
      </div>

      <div className="bg-slate-900 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">Start Your Journey Today</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of students who are transforming their cognitive abilities through focused abacus practice.
          </p>
          <div className="flex justify-center gap-4">
             <div className="bg-white/10 px-6 py-2 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest">
               LEARN • PRACTICE • SUCCEED
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}