'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageBackground } from '@/hooks/usePageBackground';
import { BrainCircuit, Zap, Target, Trophy, BookOpen, Layers, MousePointer2, Timer } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export default function PracticeFeaturesPage() {
  usePageBackground('');

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8">
        <h1 className="text-4xl md:text-6xl font-black font-headline uppercase tracking-tighter text-foreground">
          Master the <span className="text-primary">Ancient Art</span> of Calculation
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
          My Abacus Pro is more than a calculator—it's a comprehensive brain development platform designed to turn students into human calculators through visualization and formula mastery.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="h-14 px-10 text-lg font-black rounded-2xl shadow-xl">
            <Link href="/signup">Get Started for Free</Link>
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
              Speed is the ultimate test of abacus mastery. Our platform offers two distinct modes of practice to build your "concentration muscle."
            </p>
            <p>
              <strong>Foundation Mode:</strong> Perfect for beginners, this mode provides multiple-choice options, allowing students to build confidence and accuracy in Addition, Subtraction, Multiplication, and Division.
            </p>
            <p>
              <strong>Mastery Mode:</strong> For the elite calculators. No hints, no options. Students must calculate the result mentally and input the answer directly. This develops high-speed information processing that rivals electronic calculators.
            </p>
          </div>
        </div>
        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/abacus_hero.webp?alt=media"
            alt="Timed math challenges"
            fill
            className="object-cover"
            data-ai-hint="math test"
          />
        </div>
      </section>

      {/* Feature 2: Visual Bead Mastery */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1 relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-muted shadow-2xl">
          <Image 
            src="https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.firebasestorage.app/o/student_learning.webp?alt=media"
            alt="Visual bead recognition"
            fill
            className="object-cover"
            data-ai-hint="abacus tool"
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
              This visual training activates the right hemisphere of the brain, creating a mental image of the abacus. Through our <strong>Identify</strong> and <strong>Set</strong> modes, students practice from single digits to 4-digit complexity.
            </p>
            <p>
              By mastering visualization, students can eventually perform complex arithmetic entirely in their heads—a skill known as Anzan that provides a lifelong cognitive edge.
            </p>
          </div>
        </div>
      </section>

      {/* The Curriculum Grid */}
      <section className="bg-slate-900 text-white p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative z-10 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic">A Structured Journey</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">From first movement to human calculator, we guide you through every formula.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-black uppercase mb-4 text-purple-400">Small Sister</h3>
              <p className="text-sm text-slate-300">Master the base-5 heavenly bead logic. We cover all +1 to +4 and -1 to -4 variations for foundation building.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-black uppercase mb-4 text-red-400">Big Brother</h3>
              <p className="text-sm text-slate-300">Learn the power of base-10 carries and borrows. These formulas are the engine of multi-digit speed.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
              <h3 className="text-xl font-black uppercase mb-4 text-green-400">Combinations</h3>
              <p className="text-sm text-slate-300">The peak of Soroban logic. Use simultaneous base-5 and base-10 techniques for complex calculations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Ready to Build a Better Brain?</h2>
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
