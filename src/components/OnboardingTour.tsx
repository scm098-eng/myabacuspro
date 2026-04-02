'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Brain, ChevronRight, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const STEPS = [
  {
    title: "Welcome to My Abacus Pro!",
    description: "Our platform is designed to turn you into a human calculator. Let's take a quick look at how it works.",
    icon: <Brain className="w-12 h-12 text-primary" />,
    buttonText: "Start the Tour"
  },
  {
    title: "Step 1: Visualization",
    description: "Start with 'Beads Value' practice to master identifying numbers on the Soroban abacus without counting.",
    icon: <Sparkles className="w-12 h-12 text-yellow-500" />,
    buttonText: "Next Step"
  },
  {
    title: "Step 2: Formula Training",
    description: "Learn 'Small Sister' and 'Big Brother' formulas. These are the secret shortcuts used by mental math champions.",
    icon: <Sparkles className="w-12 h-12 text-purple-500" />,
    buttonText: "Almost There"
  },
  {
    title: "Step 3: Play & Win",
    description: "Practice your speed in the 'Bubble Game' and climb the global Hall of Fame by earning Mastery Points!",
    icon: <Sparkles className="w-12 h-12 text-pink-500" />,
    buttonText: "Get Started"
  }
];

export default function OnboardingTour() {
  const { user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Only trigger the tour if the user is logged in and loading is finished
    if (!isLoading && user) {
      const hasSeenTour = localStorage.getItem('onboarding_v1_complete');
      if (!hasSeenTour) {
        const timer = setTimeout(() => setIsOpen(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [user, isLoading]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      localStorage.setItem('onboarding_v1_complete', 'true');
      setIsOpen(false);
    }
  };

  // Do not render anything if user is not logged in or loading
  if (!user || isLoading) return null;

  const step = STEPS[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={(val) => {
      if (!val) {
        localStorage.setItem('onboarding_v1_complete', 'true');
        setIsOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-md text-center rounded-[2rem] overflow-hidden border-2 border-primary/20 shadow-2xl animate-in zoom-in-95">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 py-6">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6 shadow-inner animate-bounce duration-1000">
            {step.icon}
          </div>
          
          <DialogHeader>
            <DialogTitle className="text-3xl font-black font-headline uppercase tracking-tighter text-foreground leading-none">
              {step.title}
            </DialogTitle>
            <DialogDescription className="mt-4 text-lg font-medium text-muted-foreground px-4 leading-relaxed">
              {step.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-2 mt-8">
            {STEPS.map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300", 
                  currentStep === i ? "w-8 bg-primary" : "w-2 bg-muted"
                )} 
              />
            ))}
          </div>
        </div>

        <DialogFooter className="relative z-10 px-6 pb-6">
          <Button onClick={handleNext} className="w-full h-14 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
            {step.buttonText}
            {currentStep === STEPS.length - 1 ? <CheckCircle2 className="ml-2 h-5 w-5" /> : <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
