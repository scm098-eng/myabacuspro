
'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import BeadDisplay from '@/components/BeadDisplay';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, RotateCcw, Calculator, Info, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiplicationStep {
  text: string;
  add: number;
  atRodFromRight: number; // 1 is units, 2 is tens, etc.
  explanation: string;
}

function ToolPreviewContent() {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('value');
  
  // States
  const [value, setValue] = useState(0);
  const [multiplicand, setMultiplicand] = useState(123);
  const [multiplier, setMultiplier] = useState(45);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [labRods, setLabRods] = useState<number[]>(new Array(7).fill(0));

  useEffect(() => {
    if (initialValue !== null) {
      const num = parseInt(initialValue, 10);
      if (!isNaN(num) && num >= 0 && num <= 9999999) {
        setValue(num);
      }
    }
  }, [initialValue]);

  // multiplication logic
  const multiplicationSteps = useMemo(() => {
    const steps: MultiplicationStep[] = [];
    const m1Str = multiplicand.toString();
    const m2Str = multiplier.toString();

    // Iterate through each digit of multiplier (right to left)
    for (let i = 0; i < m2Str.length; i++) {
      const m2Digit = parseInt(m2Str[i]);
      const m2Power = m2Str.length - 1 - i;

      // Iterate through each digit of multiplicand
      for (let j = 0; j < m1Str.length; j++) {
        const m1Digit = parseInt(m1Str[j]);
        const m1Power = m1Str.length - 1 - j;
        
        const product = m1Digit * m2Digit;
        const targetRodFromRight = m1Power + m2Power + 1;

        steps.push({
          text: `${m2Digit} × ${m1Digit} = ${product.toString().padStart(2, '0')}`,
          add: product,
          atRodFromRight: targetRodFromRight,
          explanation: `Multiply the digit ${m2Digit} (from ${multiplier}) by ${m1Digit} (from ${multiplicand}). Place the result on the abacus starting from Rod ${targetRodFromRight}.`
        });
      }
    }
    return steps;
  }, [multiplicand, multiplier]);

  // Update lab rods based on current step
  const currentLabValue = useMemo(() => {
    let rods = new Array(7).fill(0);
    for (let i = 0; i <= currentStepIndex; i++) {
      const step = multiplicationSteps[i];
      let valToAdd = step.add;
      let rodIdx = 7 - step.atRodFromRight; // Convert from right-based to 0-indexed left-based

      // Add and handle carries
      rods[rodIdx] += valToAdd;
      for (let k = 6; k >= 0; k--) {
        if (rods[k] >= 10) {
          const carry = Math.floor(rods[k] / 10);
          rods[k] %= 10;
          if (k > 0) rods[k-1] += carry;
        }
      }
    }
    return parseInt(rods.join(''), 10);
  }, [currentStepIndex, multiplicationSteps]);

  const activeRodIndex = useMemo(() => {
    if (currentStepIndex < 0) return -1;
    return 7 - multiplicationSteps[currentStepIndex].atRodFromRight;
  }, [currentStepIndex, multiplicationSteps]);

  const handleResetLab = () => {
    setCurrentStepIndex(-1);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline flex items-center justify-center gap-3">
          <Calculator className="w-10 h-10 text-primary" />
          Interactive Abacus Tool
        </h1>
        <p className="text-muted-foreground text-lg">Master visualization and complex operations with our digital Soroban.</p>
      </div>

      <Tabs defaultValue="freeplay" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 mb-8">
          <TabsTrigger value="freeplay" className="font-bold">Free Play</TabsTrigger>
          <TabsTrigger value="lab" className="font-bold">Multiplication Lab</TabsTrigger>
        </TabsList>

        <TabsContent value="freeplay" className="space-y-8">
          <Card className="shadow-xl border-primary/10 overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="font-headline">Abacus Playground</CardTitle>
              <CardDescription>Click the beads to change their position and visualize any number.</CardDescription>
            </CardHeader>
            <CardContent className="pt-10 flex flex-col items-center gap-10">
              <div className="w-full max-w-xs space-y-3">
                <Label htmlFor="abacus-value" className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Current Value</Label>
                <div className="relative">
                  <Input
                    id="abacus-value"
                    type="number"
                    value={value || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setValue(isNaN(val) ? 0 : Math.min(val, 9999999));
                    }}
                    className="h-16 text-center text-4xl font-black rounded-xl border-2 focus:ring-primary"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground"
                    onClick={() => setValue(0)}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <BeadDisplay value={value} onChange={setValue} rodCount={7} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Calculation Setup</CardTitle>
                  <CardDescription>Define the numbers you want to multiply step-by-step.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Multiplicand</Label>
                    <Input 
                      type="number" 
                      value={multiplicand} 
                      onChange={(e) => setMultiplicand(parseInt(e.target.value) || 0)} 
                      disabled={currentStepIndex >= 0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Multiplier</Label>
                    <Input 
                      type="number" 
                      value={multiplier} 
                      onChange={(e) => setMultiplier(parseInt(e.target.value) || 0)} 
                      disabled={currentStepIndex >= 0}
                    />
                  </div>
                  <div className="pt-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                      <p className="text-sm font-bold text-primary uppercase">Final Target</p>
                      <p className="text-3xl font-black">{(multiplicand * multiplier).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleResetLab} variant="outline" className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset Lab
                  </Button>
                </CardFooter>
              </Card>

              {currentStepIndex >= 0 && (
                <Card className="border-primary bg-primary/5 animate-in fade-in slide-in-from-bottom-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-tighter">
                      <Lightbulb className="w-4 h-4" />
                      Step {currentStepIndex + 1} Instructions
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-black text-foreground">{multiplicationSteps[currentStepIndex].text}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {multiplicationSteps[currentStepIndex].explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Abacus Lab View</CardTitle>
                    <CardDescription>Observe how the value builds on the rods.</CardDescription>
                  </div>
                  <div className="px-4 py-2 bg-slate-900 text-white rounded-lg font-mono text-xl shadow-inner">
                    {currentLabValue.toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="py-10 flex justify-center">
                  <BeadDisplay 
                    value={currentLabValue} 
                    rodCount={7} 
                    activeRodIndex={activeRodIndex}
                  />
                </CardContent>
                <CardFooter className="bg-muted/30 border-t flex items-center justify-between p-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStepIndex(p => Math.max(-1, p - 1))}
                    disabled={currentStepIndex < 0}
                    className="h-12 px-6"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous Step
                  </Button>
                  <div className="text-center">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                      {currentStepIndex + 1} / {multiplicationSteps.length}
                    </span>
                  </div>
                  <Button 
                    onClick={() => setCurrentStepIndex(p => Math.min(multiplicationSteps.length - 1, p + 1))}
                    disabled={currentStepIndex >= multiplicationSteps.length - 1}
                    className="h-12 px-6"
                  >
                    Next Step <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-dashed">
                <CardContent className="p-6 flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                  <div className="space-y-1">
                    <p className="font-bold">Pro Tip: Moving the Product</p>
                    <p className="text-sm text-muted-foreground">
                      In the multiplication lab, we follow the "Product Placement" rule. If your multiplication gives a single digit (like $2 \times 3 = 6$), we treat it as $06$ and shift properly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ToolPreviewPage() {
  usePageBackground('');

  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading Abacus Lab...</div>}>
      <ToolPreviewContent />
    </Suspense>
  );
}
