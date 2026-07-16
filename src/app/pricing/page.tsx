
'use client';

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { ProfileData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, Zap, ShieldCheck, Gift, Ticket, Send, CheckCircle2, Globe, Landmark, Settings2, Info, X, Crown, Swords, LayoutGrid } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { CURRENCY_MAP } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const INDIA_PLANS = [
    {
        id: 'monthly',
        name: 'Monthly Pro',
        price: 360,
        originalPrice: 799,
        savings: '55% OFF',
        durationLabel: '/month',
        description: 'Billed monthly, cancel anytime.',
        type: 'recurring',
        planId: 'plan_S89FukHU9XcnKu',
        currency: 'INR'
    },
    {
        id: '6months',
        name: '6 Months Pro',
        price: 2040,
        originalPrice: 4794,
        savings: '57% OFF',
        durationLabel: 'for 6 months',
        description: 'One-time payment. Non-recurring.',
        type: 'one-time',
        currency: 'INR'
    },
    {
        id: '12months',
        name: 'Annual Pro',
        price: 3960,
        originalPrice: 9588,
        savings: '58% OFF',
        durationLabel: 'for 1 year',
        description: 'Best value. One-time payment.',
        type: 'one-time',
        isBestValue: true,
        currency: 'INR'
    }
];

const GLOBAL_PLANS = [
    {
        id: 'monthly',
        name: 'Monthly Pro',
        price: 19,
        originalPrice: 29,
        savings: '34% OFF',
        durationLabel: '/month',
        description: 'Recurring monthly access.',
        type: 'recurring',
        planId: 'plan_TAWayUWeX6rNiX',
        currency: 'USD'
    },
    {
        id: '6months',
        name: '6 Months Pro',
        price: 89,
        originalPrice: 149,
        savings: '40% OFF',
        durationLabel: 'for 6 months',
        description: 'One-time payment. Non-recurring.',
        type: 'one-time',
        currency: 'USD'
    },
    {
        id: '12months',
        name: 'Annual Pro',
        price: 129,
        originalPrice: 249,
        savings: '48% OFF',
        durationLabel: 'for 1 year',
        description: 'Elite training for 12 months.',
        type: 'one-time',
        isBestValue: true,
        currency: 'USD'
    }
];

const PRO_FEATURES = [
  'High-Speed Flash Anzan (0.2s)',
  'Unlimited 1v1 World Duels',
  'All Matrix Memory Patterns',
  'Full Formula Mastery Levels',
  'Official Certification & Ranks',
  'Hall of Fame Placement'
];

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface DynamicSubscriptionButtonProps {
    user: User | null;
    profile: ProfileData | null;
    selectedPlan: any;
    localEstimate?: string;
    onSuccess: (response: any) => void;
    onError: (message: string) => void;
}

const DynamicSubscriptionButton = ({ user, profile, selectedPlan, localEstimate, onSuccess, onError }: DynamicSubscriptionButtonProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    if (!user) {
        return (
            <Button asChild className="w-full h-14 text-lg font-bold rounded-xl shadow-lg">
                <Link href="/login">Login to Upgrade</Link>
            </Button>
        );
    }

    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            if (typeof document === 'undefined') return;
            if (document.getElementById('razorpay-checkout-js')) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.id = 'razorpay-checkout-js';
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
            document.body.appendChild(script);
        });
    };

    const handleSubscribe = async () => {
        const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!user?.uid || !RAZORPAY_KEY_ID) {
            onError("Gateway configuration or auth missing.");
            return;
        }
        setIsProcessing(true);
        try {
            await loadRazorpayScript();
            const functions = getFunctions(firebaseApp, 'us-central1');
            let result: any;
            if (selectedPlan.type === 'recurring') {
                const createSubscription = httpsCallable<any, any>(functions, 'createRazorpaySubscription');
                result = await createSubscription({ planId: selectedPlan.planId, amount: selectedPlan.price, currency: selectedPlan.currency });
            } else {
                const createOneTimeOrder = httpsCallable<any, any>(functions, 'createOneTimeOrder');
                result = await createOneTimeOrder({ amount: selectedPlan.price, currency: selectedPlan.currency, planDuration: selectedPlan.id === '6months' ? 6 : 12 });
            }
            const { subscriptionId, orderId, amount } = result.data; 
            const options = {
                key: RAZORPAY_KEY_ID,
                order_id: orderId, 
                subscription_id: subscriptionId || undefined, 
                amount: amount, 
                currency: selectedPlan.currency,
                name: 'My Abacus Pro',
                description: localEstimate ? `${selectedPlan.name} (~${localEstimate})` : selectedPlan.name,
                image: 'https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/logo_icon.png?alt=media',
                handler: async function (response: any) {
                    onSuccess(response); 
                    router.push('/subscription-success'); 
                },
                modal: { ondismiss: () => setIsProcessing(false) },
                prefill: { email: user.email || '', name: profile?.firstName ? `${profile.firstName} ${profile.surname}` : 'Customer' },
                theme: { color: '#f97316' }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error: any) {
            onError(error.message || 'Failed to start payment.');
            setIsProcessing(false); 
        }
    };

    return (
        <Button onClick={handleSubscribe} className={cn("w-full text-lg py-6 font-bold rounded-xl shadow-lg transition-all", selectedPlan.isBestValue ? 'bg-orange-500 hover:bg-orange-600 hover:scale-[1.02]' : 'bg-primary')} disabled={isProcessing}>
            {isProcessing ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</> : `Get ${selectedPlan.name}`}
        </Button>
    );
};

export default function PricingPage() {
    usePageBackground('');
    const { user, profile, isLoading, isTrialActive } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [selectedCountry, setSelectedCountry] = useState('India');
    const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
    const [isMounted, setIsMounted] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redemptionSuccess, setRedemptionSuccess] = useState<{ days: number } | null>(null);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
      if (!isMounted) return;
      const urlCountry = new URLSearchParams(window.location.search).get('country');
      if (urlCountry && CURRENCY_MAP[urlCountry]) { setSelectedCountry(urlCountry); return; }
      if (profile?.country) { setSelectedCountry(profile.country); }
    }, [profile, isMounted]);

    useEffect(() => {
      fetch('https://open.er-api.com/v6/latest/USD').then(res => res.json()).then(data => setExchangeRates(data.rates)).catch(console.error);
    }, []);

    const handleRedeemCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim() || !user) return;
        setIsRedeeming(true);
        try {
            const redeemFn = httpsCallable<{ code: string }, any>(getFunctions(firebaseApp), 'redeemCoupon');
            const result = await redeemFn({ code: couponCode });
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            setRedemptionSuccess({ days: result.data.durationDays });
            setCouponCode('');
        } catch (error: any) {
            toast({ title: "Redemption Failed", description: error.message, variant: "destructive" });
        } finally { setIsRedeeming(false); }
    };

    if (isLoading || !isMounted) return <div className="max-w-6xl mx-auto p-4"><Skeleton className="h-12 w-3/4 mx-auto mb-12" /><div className="grid grid-cols-1 md:grid-cols-3 gap-8"><Skeleton className="h-[500px] w-full" /><Skeleton className="h-[500px] w-full" /><Skeleton className="h-[500px] w-full" /></div></div>;

    const isAlreadyPro = profile?.subscriptionStatus === 'pro';
    const isIndiaPlan = selectedCountry === 'India';
    const currentPlans = isIndiaPlan ? INDIA_PLANS : GLOBAL_PLANS;
    const currencyInfo = CURRENCY_MAP[selectedCountry] || CURRENCY_MAP["Other"];
    
    const getConvertedPrice = (usdPrice: number) => {
      if (isIndiaPlan) return null;
      const rate = exchangeRates[currencyInfo.code] || 1;
      return `${currencyInfo.symbol}${Math.round(usdPrice * rate).toLocaleString()}`;
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-24">
            <div className="text-center space-y-6">
                <h1 className="text-4xl font-extrabold sm:text-6xl tracking-tight text-gray-900 font-headline uppercase">Upgrade to <span className="text-primary italic">My Abacus Pro</span></h1>
                <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Unlock the full power of mental math training and join the elite global leaderboard.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
                {currentPlans.map((plan) => {
                    const convertedPrice = getConvertedPrice(plan.price);
                    const convertedOriginal = getConvertedPrice(plan.originalPrice);
                    return (
                    <Card key={plan.id} className={cn("relative flex flex-col h-full transition-all duration-300 hover:shadow-2xl rounded-[2.5rem] overflow-hidden", plan.isBestValue ? 'border-orange-500 border-4 scale-105 z-10' : 'border-2 border-gray-100')}>
                        {plan.isBestValue && <div className="absolute -top-5 left-1/2 -translate-x-1/2"><Badge className="bg-orange-500 text-white px-6 py-1 text-sm font-bold uppercase tracking-widest shadow-md">Best Value</Badge></div>}
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold uppercase">{plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px] mt-2 font-medium">{plan.description}</CardDescription>
                            <div className="mt-6 flex flex-col items-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl text-muted-foreground line-through">{convertedOriginal || `${plan.currency === 'INR' ? '₹' : '$'}${plan.originalPrice}`}</span>
                                    <Badge variant="destructive" className="font-bold border-none">{plan.savings}</Badge>
                                </div>
                                <div className="flex flex-col items-center mt-2">
                                    <div className="flex items-baseline">
                                      <span className="text-5xl font-black">{convertedPrice || `${plan.currency === 'INR' ? '₹' : '$'}${plan.price}`}</span>
                                      <span className="text-muted-foreground ml-1 font-semibold text-lg">{plan.durationLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow pt-8 px-8">
                            <ul className="space-y-4">
                                {PRO_FEATURES.map((f) => (
                                    <li key={f} className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0"><Check className="h-4 w-4 text-green-600" /></div>
                                        <span className="text-sm font-bold text-gray-700">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter className="pt-6 pb-8 px-8">
                            {isAlreadyPro ? <Button className="w-full py-6 text-lg font-bold rounded-xl" variant="secondary">Active</Button> : <DynamicSubscriptionButton selectedPlan={plan} localEstimate={convertedPrice ?? undefined} user={user} profile={profile} onSuccess={() => toast({ title: "Success!" })} onError={(m) => toast({ title: "Error", description: m, variant: "destructive" })} />}
                        </CardFooter>
                    </Card>
                )})}
            </div>

            <section className="space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase font-headline tracking-tight">Free vs <span className="text-primary">Pro</span> Comparison</h2>
                </div>
                <Card className="rounded-[2.5rem] overflow-hidden border-2 shadow-2xl">
                    <Table>
                        <TableHeader className="bg-slate-900">
                            <TableRow className="hover:bg-slate-900 border-none">
                                <TableHead className="w-[350px] font-black uppercase text-[10px] tracking-[0.2em] py-6 px-8 text-white">Training Feature</TableHead>
                                <TableHead className="text-center font-black uppercase text-[10px] tracking-[0.2em] py-6 text-white">Free Plan</TableHead>
                                <TableHead className="text-center font-black uppercase text-[10px] tracking-[0.2em] py-6 text-white">Pro Member</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Basic Add & Sub (Direct Movements)</TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Visualization Drills (Beads Value)</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-muted-foreground uppercase">LIMITED LEVELS</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-primary uppercase">ALL 12 MASTERY LEVELS</TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Formula Mastery (Small/Big/Combi)</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Bubble Game Experience</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-muted-foreground uppercase">FIRST 5 LEVELS</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-primary uppercase">ALL 1,000+ LEVELS</TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Official Grand Final Exams</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Flash Card Anzan Lab</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-muted-foreground uppercase">1.5S MIN SPEED</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-primary uppercase">0.2S ELITE SPEED</TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Matrix Memory Cognitive Drills</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-muted-foreground uppercase">3x3 GRID ONLY</TableCell>
                                <TableCell className="text-center font-black text-[9px] text-primary uppercase">UP TO 5x5 GRID</TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">1v1 World Championship Duels</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </section>
        </div>
    );
}
