
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
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <h1 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter text-foreground leading-tight whitespace-nowrap">
          Master the <span className="text-primary">Ancient Art</span> of Calculation
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
          <span className="whitespace-nowrap">My Abacus Pro</span> is more than a digital calculator—it's a comprehensive brain development platform designed to turn students into human calculators through visualization and formula mastery.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl">
            <Link href="/signup">Join 1,000+ Students</Link>
          </Button>
        </div>
      </section>

      {/* Feature 1: Timed Challenges */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="bg-green-100 p-4 rounded-3xl w-fit">
            <Timer className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Timed Challenges & Mastery Modes</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>
              Speed is the ultimate test of abacus mastery. Our platform offers two distinct modes of practice to build your "concentration muscle," specifically tuned for competitive standards.
            </p>
            <p>
              <strong>Foundation Mode:</strong> Perfect for beginners, this mode provides multiple-choice options, allowing students to build confidence and accuracy in Addition, Subtraction, Multiplication, and Division.
            </p>
            <p>
              <strong>Mastery Mode:</strong> For the elite calculators. No hints, no options. Students must calculate the result mentally and input the answer directly, preparing them for international abacus competitions.
            </p>
          </div>
        </div>
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src={placeholderImages.timedFeature.src}
            alt="Timed math challenges arena"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.timedFeature.hint}
          />
        </div>
      </section>

      {/* Feature 2: Visual Bead Mastery */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src={placeholderImages.anzanFeature.src}
            alt="Anzan Mental Visualization Training"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.anzanFeature.hint}
          />
        </div>
        <div className="order-1 md:order-2 space-y-6">
          <div className="bg-blue-100 p-4 rounded-3xl w-fit">
            <Target className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">The Science of Anzan (Visualization)</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>
              At the heart of our pedagogy is "Beads Value" mastery. We teach students to recognize the value of abacus beads at a glance, bypassing the need to count.
            </p>
            <p>
              This visual training activates the right hemisphere of the brain, creating a permanent mental image of the abacus. By mastering visualization (Anzan), students can perform complex arithmetic entirely in their heads.
            </p>
            <p>
              Our specialized <strong>Identify</strong> and <strong>Set</strong> modes provide a progressive roadmap from single digits to 4-digit complexity.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 3: Flash Card Anzan */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="bg-orange-100 p-4 rounded-3xl w-fit">
            <Zap className="h-10 w-10 text-orange-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Flash Card Anzan</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>
              Build incredible mental calculation speed with our high-performance flashing engine. Numbers appear sequentially at rapid intervals, requiring total mental focus.
            </p>
            <p>
              In our <strong>Custom Anzan Lab</strong>, Pro members can adjust the number of digits, sequence length (up to 50 rows), and intervals down to a lightning-fast 0.2 seconds.
            </p>
            <p>
              This elite drill is designed to sharpen cognitive processing and ensure your mental abacus stays clear even under extreme pressure.
            </p>
          </div>
        </div>
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src={placeholderImages.flashAnzanFeature.src}
            alt="Flash Anzan sequence training"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.flashAnzanFeature.hint}
          />
        </div>
      </section>

      {/* Feature 4: Matrix Memory Flash */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src={placeholderImages.matrixFeature.src}
            alt="Matrix memory grid drill"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.matrixFeature.hint}
          />
        </div>
        <div className="order-1 md:order-2 space-y-6">
          <div className="bg-teal-100 p-4 rounded-3xl w-fit">
            <LayoutGrid className="h-10 w-10 text-teal-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">Matrix Memory Flash</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>
              Master spatial visualization by reconstructing high-speed pattern matrices. This cognitive game trains the brain to take "mental snapshots" of information.
            </p>
            <p>
              As you clear rounds, the grid expands from a 3x3 to a complex 5x5 matrix, challenging your short-term visual memory and spatial reasoning.
            </p>
            <p>
              This technique is essential for building a rock-solid mental abacus that doesn't "fade" during long, complex calculations.
            </p>
          </div>
        </div>
      </section>

      {/* Feature 5: 1v1 Duels */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="bg-red-100 p-4 rounded-3xl w-fit">
            <Swords className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight font-headline">World Championship Duels</h2>
          <div className="space-y-4 text-muted-foreground font-medium leading-relaxed text-lg">
            <p>
              The ultimate test of nerves and speed. Challenge your friends or wait for a global opponent in our real-time <strong>1v1 Duel Arena</strong>.
            </p>
            <p>
              Both players face the exact same randomized sequence in either Standard Math or Flash Anzan modes. Every second counts in this high-stakes race to the top.
            </p>
            <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-bold">REAL-TIME MATCHMAKING</Badge>
                <Badge variant="secondary" className="font-bold">PRIVATE LOBBIES</Badge>
                <Badge variant="secondary" className="font-bold">ANTI-CHEAT SYSTEM</Badge>
            </div>
          </div>
        </div>
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src={placeholderImages.duelsFeature.src}
            alt="Global 1v1 math duel arena"
            fill
            className="object-cover"
            data-ai-hint={placeholderImages.duelsFeature.hint}
          />
        </div>
      </section>

      {/* The Curriculum Grid */}
      <section className="bg-slate-900 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">A Structured Digital Curriculum</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">From first movement to human calculator, we guide you through every critical formula.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-black uppercase mb-4 text-purple-400">Small Sister</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The foundation of the Soroban. Master the base-5 heavenly bead logic. We cover all +1 to +4 and -1 to -4 variations for early-stage brain development and tactile accuracy.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-black uppercase mb-4 text-red-400">Big Brother</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Learn the power of base-10 carries and borrows. These formulas are the engine of multi-digit speed. Our digital modules provide instant feedback on every carry-over movement.
              </p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-black uppercase mb-4 text-green-400">Combinations</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                The peak of Soroban logic. Use simultaneous base-5 and base-10 techniques for high-speed complex calculations. These levels are designed for advanced students seeking grandmaster status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 border-t">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Ready to Build a Better Brain?</h2>
        <p className="text-muted-foreground font-medium mb-10 max-w-2xl mx-auto">
          Join a community of dedicated learners and teachers using the most advanced digital abacus training tools available today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="h-16 px-12 text-xl font-black rounded-2xl shadow-xl">
            <Link href="/signup">Join 1,000+ Students</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 px-12 text-xl font-black rounded-2xl">
            <Link href="/login">Login to Dashboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
