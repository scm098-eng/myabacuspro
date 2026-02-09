
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Goal, BrainCircuit } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

export default function AboutPage() {
  usePageBackground('');
  
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl md:text-6xl">About <span className="text-primary">My Abacus Pro</span></h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Our mission is to provide a simple, powerful, and distraction-free tool to help students of all ages master mental arithmetic.
        </p>
      </div>

      <Card className="overflow-hidden shadow-lg border-2 border-primary/20">
        <div className="grid md:grid-cols-2 items-center">
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-semibold text-primary font-headline">Our Story</h2>
              <p className="mt-4 text-muted-foreground">
                My Abacus Pro was born from a simple idea: practice makes perfect. In a world full of distractions, we wanted to create a serene digital space where learners could focus on one thing—getting faster and more accurate at calculations. We believe that strong mental math skills are a foundation for success in STEM fields and everyday life.
              </p>
              <p className="mt-4 text-muted-foreground">
                Our platform is designed to be intuitive and motivating, turning the often tedious task of practice into an engaging challenge.
              </p>
            </div>
            <div className="relative h-64 md:h-full min-h-[250px]">
              <Image 
                src={placeholderImages.aboutStory.src}
                alt="A focused student practicing on an abacus"
                fill
                className="object-cover"
                data-ai-hint={placeholderImages.aboutStory.hint}
              />
            </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-8 text-center">
        <Card className="hover:border-primary/50 transition-colors duration-300">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Goal className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4">Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            To empower learners with the confidence that comes from mathematical fluency through accessible, focused practice.
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors duration-300">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <BrainCircuit className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4">Our Philosophy</CardTitle>
          </CardHeader>
          <CardContent>
            We believe in minimalism and focus. Our clean interface is intentionally designed to help you concentrate and achieve a state of flow.
          </CardContent>
        </Card>
        <Card className="hover:border-primary/50 transition-colors duration-300">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
                <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="mt-4">For Everyone</CardTitle>
          </CardHeader>
          <CardContent>
            Whether you're a student preparing for an exam or an adult looking to keep your mind sharp, <span className="text-primary font-semibold">My Abacus Pro</span> is built for you.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
