
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageBackground } from '@/hooks/usePageBackground';
import { BrainCircuit, Zap, Target, Trophy, BookOpen, Layers, MousePointer2, Timer, Sparkles, Rocket, Swords, LayoutGrid, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { Badge } from '@/components/ui/badge';

export default function PracticeFeaturesPage() {
  usePageBackground('');

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      <section className="text-center space-y-6 pt-8">
        <h1 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter text-foreground leading-tight">
          Master the <span className="text-primary">Ancient Art</span> of Calculation
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
          <span className="whitespace-nowrap">My Abacus Pro</span> is a comprehensive brain development platform designed to turn students into human calculators through visualization and formula mastery.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl">
            <Link href="/signup">Start Your Journey Now</Link>
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="bg-orange-100 p-4 rounded-3xl w-fit"><Zap className="h-10 w-10 text-orange-600" /></div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Flash Card Anzan Lab</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>Build incredible mental calculation speed with our sequential flashing engine. Pro members can access the elite lab to practice with intervals as fast as 0.2 seconds.</p>
            <p>This high-intensity drill activates the right hemisphere of the brain, creating a permanent mental image of the abacus beads.</p>
          </div>
        </div>
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image src={placeholderImages.flashAnzanFeature.src} alt="Flash Anzan" fill className="object-cover" />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image src={placeholderImages.matrixFeature.src} alt="Matrix Memory" fill className="object-cover" />
        </div>
        <div className="order-1 md:order-2 space-y-6">
          <div className="bg-teal-100 p-4 rounded-3xl w-fit"><LayoutGrid className="h-10 w-10 text-teal-600" /></div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Matrix Memory Flash</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>Develop a photographic memory. Observe pattern matrices that flash for a fraction of a second and reconstruct them from your mental "snapshot".</p>
            <p>As you improve, the grid expands up to a 5x5 complexity, sharpening your short-term spatial memory and visualization capacity.</p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="bg-red-100 p-4 rounded-3xl w-fit"><Swords className="h-10 w-10 text-red-600" /></div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">1v1 World Duels</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>Challenge friends or global rivals in high-speed math races. Our hybrid matchmaking ensures you always find an opponent instantly.</p>
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-bold">REAL-TIME MATCHMAKING</Badge>
                <Badge variant="secondary" className="font-bold">INTELLIGENT BOTS</Badge>
                <Badge variant="secondary" className="font-bold">GLOBAL RANKINGS</Badge>
            </div>
          </div>
        </div>
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image src={placeholderImages.duelsFeature.src} alt="Math Duels" fill className="object-cover" />
        </div>
      </section>

      <section className="text-center py-12 border-t">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Ready to Build a Better Brain?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="h-16 px-12 text-xl font-black rounded-2xl shadow-xl"><Link href="/signup">Join 1,00,000+ Students</Link></Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-12 text-xl font-black rounded-2xl"><Link href="/login">Login to Dashboard</Link></Button>
        </div>
      </section>
    </div>
  );
}
