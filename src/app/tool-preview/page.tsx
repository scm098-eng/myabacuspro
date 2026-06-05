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
import { ChevronLeft, ChevronRight, RotateCcw, Calculator, Info, Lightbulb, Plus, Minus } from 'lucide-react';
import { parseCalculationSteps } from '@/lib/utils';
import PageGuide from '@/components/shared/PageGuide';

interface Step {
  operation: string;
  value: number;
  explanation?: string;
  atRodFromRight?: number;
}

interface MultiplicationStep {
  text: string;
  add: number;
  atRodFromRight: number;
  explanation: string;
}

interface DivisionStep15 {
  explanation: string;
  operation: string;
  dividend: number;
  quotient: number;
  divisor: number;
  dividendLen: number;
}

const PlaceValueGuide = () => (
  <Card className="mt-8 border-primary/20 bg-muted/30">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-bold flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" />
        Place Value Guide
      </CardTitle>
      <CardDescription>
        Understand the significance of each rod on the abacus.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
        {[
          { short: 'T.L', long: 'Ten Lakhs', val: '10,00,000' },
          { short: 'L', long: 'Lakhs', val: '1,00,000' },
          { short: 'T.Th', long: 'Ten Thousands', val: '10,000' },
          { short: 'Th', long: 'Thousands', val: '1,000' },
          { short: 'H', long: 'Hundreds', val: '100' },
          { short: 'T', long: 'Tens', val: '10' },
          { short: 'U', long: 'Unit (Ones)', val: '1' },
        ].map((item) => (
          <div key={item.short} className="flex flex-col items-center text-center p-3 bg-background rounded-xl border-2 border-primary/10 shadow-sm transition-transform hover:scale-105">
            <span className="text-xl font-black text-primary mb-1">{item.short}</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground">{item.long}</span>
            <span className="text-[9px] font-mono mt-1 opacity-60">x{item.val}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const RodLegend = () => (
  <Card className="mt-8 border-primary/20 bg-muted/30">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-bold flex items-center gap-2">
        <Info className="w-5 h-5 text-primary" />
        15-Rod Lab Legend
      </CardTitle>
      <CardDescription>
        Professional rod mapping for division visualization.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border-2 border-slate-100 shadow-sm">
           <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Dividend (D1-D7)</span>
           <p className="text-xs text-muted-foreground font-medium">The leftmost area where the initial number and its remaining balance (Remainder) reside.</p>
        </div>
        <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border-2 border-slate-100 shadow-sm">
           <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Quotient (Q1-Q5)</span>
           <p className="text-xs text-muted-foreground font-medium">The central segment where your result digits are calculated and stored.</p>
        </div>
        <div className="flex flex-col gap-2 p-4 bg-background rounded-2xl border-2 border-slate-100 shadow-sm">
           <span className="text-sm font-black text-slate-700 uppercase tracking-widest">Divisor (S1-S3)</span>
           <p className="text-xs text-muted-foreground font-medium">The far-right segment where the number you are dividing by stays fixed.</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ZoomControls = ({ zoom, setZoom }: { zoom: number, setZoom: React.Dispatch<React.SetStateAction<number>> }) => (
  <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-xl border shadow-sm">
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-lg" 
      onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
      title="Zoom Out"
    >
      <Minus className="w-4 h-4" />
    </Button>
    <span className="text-[10px] font-black uppercase tracking-widest min-w-[3rem] text-center">
      {Math.round(zoom * 100)}%
    </span>
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 rounded-lg" 
      onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
      title="Zoom In"
    >
      <Plus className="w-4 h-4" />
    </Button>
    <div className="h-4 w-px bg-border mx-1" />
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 px-2 text-[10px] font-black uppercase" 
      onClick={() => setZoom(1)}
    >
      Reset
    </Button>
  </div>
);

function ToolPreviewContent() {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('value');
  
  // App States
  const [zoom, setZoom] = useState(1);
  const [value, setValue] = useState(0);

  // Addition & Subtraction Lab States
  const [addSubInput, setAddSubInput] = useState('123 + 456 - 78');
  const [addSubStepIndex, setAddSubStepIndex] = useState(-1);

  // Multiplication Lab States
  const [multiplicand, setMultiplicand] = useState(123);
  const [multiplier, setMultiplier] = useState(45);
  const [multStepIndex, setMultStepIndex] = useState(-1);

  // Division Lab States (15-Rod specialized)
  const [dividend, setDividend] = useState(2256);
  const [divisor, setDivisor] = useState(5);
  const [divStepIndex, setDivStepIndex] = useState(-1);

  useEffect(() => {
    if (initialValue !== null) {
      const num = parseInt(initialValue, 10);
      if (!isNaN(num) && num >= 0 && num <= 9999999) {
        setValue(num);
      }
    }
  }, [initialValue]);

  // Addition & Subtraction Steps
  const addSubSteps = useMemo(() => {
    return parseCalculationSteps(addSubInput);
  }, [addSubInput]);

  const currentAddSubValue = useMemo(() => {
    if (addSubStepIndex < 0) return 0;
    return addSubSteps[addSubStepIndex]?.value || 0;
  }, [addSubStepIndex, addSubSteps]);

  // Multiplication Steps
  const multiplicationSteps = useMemo(() => {
    const steps: MultiplicationStep[] = [];
    const m1Str = multiplicand.toString();
    const m2Str = multiplier.toString();

    for (let i = 0; i < m2Str.length; i++) {
      const m2Digit = parseInt(m2Str[i]);
      const m2Power = m2Str.length - 1 - i;

      for (let j = 0; j < m1Str.length; j++) {
        const m1Digit = parseInt(m1Str[j]);
        const m1Power = m1Str.length - 1 - j;
        
        const product = m1Digit * m2Digit;
        const targetRodFromRight = m1Power + m2Power + 1;

        steps.push({
          text: `${m2Digit} × ${m1Digit} = ${product.toString().padStart(2, '0')}`,
          add: product,
          atRodFromRight: targetRodFromRight,
          explanation: `Multiply the digit ${m2Digit} by ${m1Digit}. Place the result on the abacus starting from Rod ${targetRodFromRight}.`
        });
      }
    }
    return steps;
  }, [multiplicand, multiplier]);

  const currentMultValue = useMemo(() => {
    let rods = new Array(7).fill(0);
    for (let i = 0; i <= multStepIndex; i++) {
      const step = multiplicationSteps[i];
      let valToAdd = step.add;
      let rodIdx = 7 - step.atRodFromRight;

      rods[rodIdx] += valToAdd;
      for (let k = 6; k >= 0; k--) {
        if (rods[k] >= 10) {
          const carry = Math.floor(rods[k] / 10);
          rods[k] %= 10;
          if (k > 0) rods[k-1] += carry;
        }
      }
    }
    return parseInt(rods.join(''), 10) || 0;
  }, [multStepIndex, multiplicationSteps]);

  const multActiveRodIndex = useMemo(() => {
    if (multStepIndex < 0) return -1;
    return 7 - multiplicationSteps[multStepIndex].atRodFromRight;
  }, [multStepIndex, multiplicationSteps]);

  // Division Steps (15 Rod Logic)
  const divisionSteps15 = useMemo(() => {
    if (divisor <= 0) return [];
    const steps: DivisionStep15[] = [];
    const quotientValue = Math.floor(dividend / divisor);
    const qStr = quotientValue.toString();
    const dLen = dividend.toString().length;
    
    steps.push({
      explanation: `Set the dividend ${dividend} starting from Rod 1 (left). Set the divisor ${divisor} on the right side.`,
      operation: `Initialize Lab`,
      dividend: dividend,
      quotient: 0,
      divisor: divisor,
      dividendLen: dLen
    });

    let currentDividend = dividend;
    let currentQuotient = 0;

    for (let i = 0; i < qStr.length; i++) {
      const qDigit = parseInt(qStr[i]);
      if (qDigit === 0) continue;

      const power = qStr.length - 1 - i;
      const subtrahend = qDigit * divisor * Math.pow(10, power);
      
      currentDividend -= subtrahend;
      currentQuotient += qDigit * Math.pow(10, power);
      
      steps.push({
        operation: `Build Quotient: ${currentQuotient}`,
        explanation: `${divisor} goes into the current segment ${qDigit} times. Subtract the result from the dividend and increment the quotient.`,
        dividend: currentDividend,
        quotient: currentQuotient,
        divisor: divisor,
        dividendLen: dLen
      });
    }

    return steps;
  }, [dividend, divisor]);

  const currentDivState15 = useMemo(() => {
    const abacus = new Array(15).fill(0);
    if (divStepIndex < 0) return abacus;
    
    const step = divisionSteps15[divStepIndex];
    
    // Dividend on Left 7 Rods (Fixed mapping D1-D7)
    const dStr = step.dividend.toString().padStart(step.dividendLen, '0');
    for(let i=0; i < dStr.length && i < 7; i++) {
        abacus[i] = parseInt(dStr[i]);
    }

    // Quotient on Rods 8 to 12 (Indices 7-11)
    const qStr = step.quotient.toString();
    for(let i=0; i < qStr.length && i < 5; i++) {
        abacus[7 + i] = parseInt(qStr[i]);
    }

    // Divisor on Last 3 Rods (Indices 12-14)
    const sStr = step.divisor.toString().split('').reverse().join('');
    for(let i=0; i < sStr.length && i < 3; i++) {
        abacus[14 - i] = parseInt(sStr[i]);
    }

    return abacus;
  }, [divStepIndex, divisionSteps15]);

  const divisionLabels = [
    'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 
    'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 
    'S1', 'S2', 'S3'
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight font-headline flex items-center justify-center gap-3">
          <Calculator className="w-10 h-10 text-primary" />
          Interactive Abacus Tool
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-muted-foreground text-lg font-medium">Master visualization and complex operations with our digital Soroban.</p>
          <PageGuide guideKey="abacus_tool" triggerLabel="How to Use Tool" />
        </div>
      </div>

      <Tabs defaultValue="freeplay" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-4xl mx-auto h-auto p-1 mb-12 bg-muted/50 rounded-2xl">
          <TabsTrigger value="freeplay" className="font-bold py-3 px-2 rounded-xl">Free Play</TabsTrigger>
          <TabsTrigger value="addsub" className="font-bold py-3 px-2 rounded-xl">Add & Sub Lab</TabsTrigger>
          <TabsTrigger value="multlab" className="font-bold py-3 px-2 rounded-xl">Multiplication Lab</TabsTrigger>
          <TabsTrigger value="divlab" className="font-bold py-3 px-2 rounded-xl">Division Lab</TabsTrigger>
        </TabsList>

        <TabsContent value="freeplay" className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <Card className="shadow-xl border-primary/10 overflow-hidden rounded-[2.5rem]">
            <CardHeader className="bg-muted/30">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <CardTitle className="font-headline text-2xl">Abacus Playground</CardTitle>
                  <CardDescription className="text-base font-medium">Click the beads to change their position and visualize any number.</CardDescription>
                </div>
                <ZoomControls zoom={zoom} setZoom={setZoom} />
              </div>
            </CardHeader>
            <CardContent className="pt-10 flex flex-col items-center gap-10 overflow-hidden">
              <div className="w-full max-w-xs space-y-3">
                <Label htmlFor="abacus-value" className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Current Value</Label>
                <div className="relative">
                  <Input
                    id="abacus-value"
                    type="number"
                    value={value || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setValue(isNaN(val) ? 0 : Math.min(val, 9999999));
                    }}
                    className="h-16 text-center text-4xl font-black rounded-2xl border-4 focus:ring-primary shadow-inner"
                  />
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground rounded-full"
                    onClick={() => setValue(0)}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              <div className="w-full overflow-x-auto py-10 scrollbar-none" style={{ minHeight: `${260 * zoom + 120}px` }}>
                <div 
                  className="transition-transform duration-200"
                  style={{ 
                    transform: `scale(${zoom})`, 
                    transformOrigin: 'top center',
                    width: 'max-content',
                    margin: '0 auto'
                  }}
                >
                  <BeadDisplay value={value} onChange={setValue} rodCount={7} />
                </div>
              </div>
            </CardContent>
          </Card>
          <PlaceValueGuide />
        </TabsContent>

        <TabsContent value="addsub" className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-3xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Calculation Builder</CardTitle>
                  <CardDescription className="font-medium text-muted-foreground">Enter any multi-step arithmetic problem.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase text-[10px] text-muted-foreground tracking-widest">Enter Problem</Label>
                    <Input 
                      placeholder="e.g. 12 + 34 - 5" 
                      value={addSubInput} 
                      onChange={(e) => { setAddSubInput(e.target.value); setAddSubStepIndex(-1); }}
                      className="h-12 border-2 rounded-xl font-bold"
                    />
                  </div>
                  <div className="pt-4">
                    <div className="p-6 bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl text-center">
                      <p className="text-xs font-black text-primary uppercase tracking-tighter">Final Result</p>
                      <p className="text-4xl font-black text-slate-900 mt-1">{addSubSteps[addSubSteps.length - 1]?.value || 0}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setAddSubStepIndex(-1)} variant="outline" className="w-full h-12 rounded-xl font-bold border-2">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset Training
                  </Button>
                </CardFooter>
              </Card>

              {addSubStepIndex >= 0 && (
                <Card className="border-primary border-2 bg-primary/5 rounded-3xl animate-in slide-in-from-bottom-4 shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                      <Lightbulb className="w-4 h-4" />
                      Step {addSubStepIndex + 1} of {addSubSteps.length}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-3xl font-black text-slate-900">{addSubSteps[addSubStepIndex].operation}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                      {addSubSteps[addSubStepIndex].explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-2xl rounded-[3rem] border-none overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Abacus Lab View</CardTitle>
                      <CardDescription className="font-bold text-slate-400">Step-by-Step Visualization</CardDescription>
                    </div>
                    <div className="flex items-center gap-6">
                      <ZoomControls zoom={zoom} setZoom={setZoom} />
                      <div className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-2xl font-mono text-3xl font-black shadow-inner border border-white/10">
                        {currentAddSubValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-16 px-10 overflow-hidden">
                  <div className="w-full overflow-x-auto scrollbar-none" style={{ minHeight: `${260 * zoom + 50}px` }}>
                    <div 
                      className="transition-transform duration-200"
                      style={{ 
                        transform: `scale(${zoom})`, 
                        transformOrigin: 'top center',
                        width: 'max-content',
                        margin: '0 auto'
                      }}
                    >
                      <BeadDisplay value={currentAddSubValue} rodCount={7} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between p-8 gap-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setAddSubStepIndex(p => Math.max(-1, p - 1))}
                    disabled={addSubStepIndex < 0}
                    className="h-14 px-8 w-full sm:w-auto rounded-2xl border-2 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous Step
                  </Button>
                  <Button 
                    onClick={() => setAddSubStepIndex(p => Math.min(addSubSteps.length - 1, p + 1))}
                    disabled={addSubStepIndex >= addSubSteps.length - 1}
                    className="h-14 px-10 w-full sm:w-auto rounded-2xl shadow-xl font-black uppercase tracking-widest text-base"
                  >
                    Next Operation <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="multlab" className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-3xl shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Multiplication Input</CardTitle>
                  <CardDescription className="font-medium">Watch the product build rod-by-rod.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] text-muted-foreground tracking-widest">Multiplicand</Label>
                    <Input 
                      type="number" 
                      value={multiplicand} 
                      onChange={(e) => setMultiplicand(parseInt(e.target.value) || 0)} 
                      disabled={multStepIndex >= 0}
                      className="h-12 border-2 font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] text-muted-foreground tracking-widest">Multiplier</Label>
                    <Input 
                      type="number" 
                      value={multiplier} 
                      onChange={(e) => setMultiplier(parseInt(e.target.value) || 0)} 
                      disabled={multStepIndex >= 0}
                      className="h-12 border-2 font-bold rounded-xl"
                    />
                  </div>
                  <div className="pt-4">
                    <div className="p-6 bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl text-center">
                      <p className="text-xs font-black text-primary uppercase tracking-tighter">Target Product</p>
                      <p className="text-4xl font-black text-slate-900 mt-1">{(multiplicand * multiplier).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setMultStepIndex(-1)} variant="outline" className="w-full h-12 rounded-xl border-2 font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset Lab
                  </Button>
                </CardFooter>
              </Card>

              {multStepIndex >= 0 && (
                <Card className="border-primary border-2 bg-primary/5 rounded-3xl shadow-xl animate-in slide-in-from-bottom-4">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest">
                      <Lightbulb className="w-4 h-4" />
                      Step {multStepIndex + 1} of {multiplicationSteps.length}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-3xl font-black text-slate-900">{multiplicationSteps[multStepIndex].text}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                      {multiplicationSteps[multStepIndex].explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-2xl rounded-[3rem] border-none overflow-hidden">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Building the Product</CardTitle>
                      <CardDescription className="font-bold text-slate-400">Visualization Lab</CardDescription>
                    </div>
                    <div className="flex items-center gap-6">
                      <ZoomControls zoom={zoom} setZoom={setZoom} />
                      <div className="px-6 py-3 bg-white/10 border border-white/10 rounded-2xl font-mono text-3xl font-black shadow-inner">
                        {currentMultValue.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-16 px-10 overflow-hidden">
                  <div className="w-full overflow-x-auto scrollbar-none" style={{ minHeight: `${260 * zoom + 50}px` }}>
                    <div 
                      className="transition-transform duration-200"
                      style={{ 
                        transform: `scale(${zoom})`, 
                        transformOrigin: 'top center',
                        width: 'max-content',
                        margin: '0 auto'
                      }}
                    >
                      <BeadDisplay 
                        value={currentMultValue} 
                        rodCount={7} 
                        activeRodIndex={multActiveRodIndex}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between p-8 gap-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setMultStepIndex(p => Math.max(-1, p - 1))}
                    disabled={multStepIndex < 0}
                    className="h-14 px-8 w-full sm:w-auto rounded-2xl border-2 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous
                  </Button>
                  <Button 
                    onClick={() => setMultStepIndex(p => Math.min(multiplicationSteps.length - 1, p + 1))}
                    disabled={multStepIndex >= multiplicationSteps.length - 1}
                    className="h-14 px-10 w-full sm:w-auto rounded-2xl shadow-xl font-black uppercase tracking-widest text-base"
                  >
                    Next Step <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="divlab" className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <Card className="rounded-3xl shadow-lg border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Division Input</CardTitle>
                  <CardDescription className="font-medium text-muted-foreground text-sm">Visualize Soroban segment mapping.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] text-muted-foreground tracking-widest">Dividend</Label>
                    <Input 
                      type="number" 
                      value={dividend} 
                      onChange={(e) => setDividend(parseInt(e.target.value) || 0)} 
                      disabled={divStepIndex >= 0}
                      className="h-12 border-2 font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-black uppercase text-[10px] text-muted-foreground tracking-widest">Divisor</Label>
                    <Input 
                      type="number" 
                      value={divisor} 
                      onChange={(e) => setDivisor(parseInt(e.target.value) || 0)} 
                      disabled={divStepIndex >= 0}
                      className="h-12 border-2 font-bold rounded-xl"
                    />
                  </div>
                  <div className="pt-4">
                    <div className="p-6 bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl text-center">
                      <p className="text-xs font-black text-primary uppercase tracking-tighter">Target Result</p>
                      <div className="flex flex-col items-center mt-2">
                        <p className="text-3xl font-black text-slate-900">Q: {divisor > 0 ? Math.floor(dividend / divisor) : 'Err'}</p>
                        {divisor > 0 && dividend % divisor > 0 && (
                          <p className="text-lg font-bold text-orange-600 mt-1">R: {dividend % divisor}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={() => setDivStepIndex(-1)} variant="outline" className="w-full h-12 rounded-xl border-2 font-bold">
                    <RotateCcw className="w-4 h-4 mr-2" /> Reset Lab
                  </Button>
                </CardFooter>
              </Card>

              {divStepIndex >= 0 && (
                <Card className="border-primary border-2 bg-primary/5 rounded-3xl animate-in slide-in-from-bottom-4 shadow-xl">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                      <Lightbulb className="w-4 h-4" />
                      Step {divStepIndex + 1} of {divisionSteps15.length}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-2xl font-black text-slate-900 leading-tight">{divisionSteps15[divStepIndex].operation}</p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium italic">
                      {divisionSteps15[divStepIndex].explanation}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-2xl rounded-[3rem] border-none overflow-hidden bg-slate-50">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-2xl font-black uppercase tracking-tight italic">Professional 15-Rod View</CardTitle>
                      <CardDescription className="font-bold text-slate-400">Division Segment Visualization</CardDescription>
                    </div>
                    <ZoomControls zoom={zoom} setZoom={setZoom} />
                  </div>
                </CardHeader>
                <CardContent className="py-12 px-6 overflow-hidden">
                  <div className="w-full overflow-x-auto scrollbar-none" style={{ minHeight: `${260 * zoom + 50}px` }}>
                    <div 
                      className="transition-transform duration-200"
                      style={{ 
                        transform: `scale(${zoom})`, 
                        transformOrigin: 'top center',
                        width: 'max-content',
                        margin: '0 auto'
                      }}
                    >
                      <BeadDisplay 
                        rodCount={15} 
                        manualDigits={currentDivState15}
                        manualLabels={divisionLabels}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t flex flex-col sm:flex-row items-center justify-between p-8 gap-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setDivStepIndex(p => Math.max(-1, p - 1))}
                    disabled={divStepIndex < 0}
                    className="h-14 px-8 w-full sm:w-auto rounded-2xl border-2 font-bold"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" /> Previous Step
                  </Button>
                  <Button 
                    onClick={() => setDivStepIndex(p => Math.min(divisionSteps15.length - 1, p + 1))}
                    disabled={divStepIndex >= divisionSteps15.length - 1}
                    className="h-14 px-10 w-full sm:w-auto rounded-2xl shadow-xl font-black uppercase tracking-widest text-base"
                  >
                    Next Calculation <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
              <RodLegend />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ToolPreviewPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading Abacus Lab...</div>}>
      <ToolPreviewContent />
    </Suspense>
  );
}
