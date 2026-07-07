'use client';

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { ProfileData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, Zap, ShieldCheck, Gift, Ticket, Send, CheckCircle2, Globe, Landmark, Settings2, Info, X } from 'lucide-react';
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

// --- CONFIGURATION ---
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

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
  'Unlimited Practice Tests',
  'Access All Difficulty Levels',
  'Advanced Progress Analytics',
  'Full Bubble Game Access',
  'Hall of Fame Placement',
  'Official Grand Final Exams',
  'Professional Certification & Ranks',
  'Abacus Mastery Labs (Mult/Div)'
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
        if (!user?.uid) {
            onError("Authentication failed. Please log in.");
            return;
        }

        if (!RAZORPAY_KEY_ID) {
            onError("Razorpay Key ID is not configured.");
            return;
        }

        setIsProcessing(true);

        try {
            await loadRazorpayScript();
            
            if (!window.Razorpay) {
                throw new Error("Razorpay SDK not available.");
            }
            
            const functions = getFunctions(firebaseApp, 'us-central1');
            let result: any;

            if (selectedPlan.type === 'recurring') {
                const createSubscription = httpsCallable<any, any>(functions, 'createRazorpaySubscription');
                result = await createSubscription({ 
                    planId: selectedPlan.planId,
                    amount: selectedPlan.price,
                    currency: selectedPlan.currency
                });
            } else {
                const createOneTimeOrder = httpsCallable<any, any>(functions, 'createOneTimeOrder');
                result = await createOneTimeOrder({ 
                    amount: selectedPlan.price,
                    currency: selectedPlan.currency,
                    planDuration: selectedPlan.id === '6months' ? 6 : 12
                });
            }
            
            const { subscriptionId, orderId, amount } = result.data; 

            const options = {
                key: RAZORPAY_KEY_ID,
                order_id: orderId, 
                subscription_id: subscriptionId || undefined, 
                amount: amount, 
                currency: selectedPlan.currency,
                name: 'Abacus Pro',
                description: localEstimate ? `${selectedPlan.name} (~${localEstimate})` : selectedPlan.name,
                image: 'https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/logo_icon.png?alt=media',
                handler: async function (response: any) {
                    const auth = getAuth();
                    if (auth.currentUser) {
                        await auth.currentUser.getIdToken(true);
                    }
                    onSuccess(response); 
                    router.push('/subscription-success'); 
                },
                modal: {
                    ondismiss: function() {
                        toast({ title: "Payment Canceled", description: "Process not completed." });
                        setIsProcessing(false); 
                    }
                },
                prefill: {
                    email: user.email || '',
                    name: profile?.firstName ? `${profile.firstName} ${profile.surname}` : 'Customer',
                },
                theme: { color: selectedPlan.isBestValue ? '#f97316' : '#2563EB' }
            };
            
            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error: any) {
            onError(error.message || 'Failed to start payment.');
            setIsProcessing(false); 
        }
    };

    return (
        <Button 
            onClick={handleSubscribe} 
            className={`w-full text-lg py-6 font-bold tracking-wide transition-all ${
                selectedPlan.isBestValue 
                ? 'bg-orange-500 hover:bg-orange-600 shadow-lg hover:scale-[1.02]' 
                : 'bg-primary hover:bg-primary/90'
            }`}
            disabled={isProcessing}
        >
            {isProcessing ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
            ) : (
                `Get ${selectedPlan.name}`
            )}
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
    const [isRatesLoading, setIsRatesLoading] = useState(true);
    
    const [couponCode, setCouponCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redemptionSuccess, setRedemptionSuccess] = useState<{ days: number } | null>(null);

    // Initial detection of country
    useEffect(() => {
      if (profile?.country) {
        setSelectedCountry(profile.country);
      }
    }, [profile]);

    // Fetch exchange rates daily (standard implementation)
    useEffect(() => {
      const fetchRates = async () => {
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/USD');
          const data = await res.json();
          if (data.rates) {
            setExchangeRates(data.rates);
          }
        } catch (err) {
          console.error("Exchange rate fetch failed:", err);
        } finally {
          setIsRatesLoading(false);
        }
      };
      fetchRates();
    }, []);

    const handleRedeemCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to redeem a gift code.", variant: "destructive" });
            return;
        }

        setIsRedeeming(true);
        try {
            const functions = getFunctions(firebaseApp, 'us-central1');
            const redeemFn = httpsCallable<{ code: string }, any>(functions, 'redeemCoupon');
            const result = await redeemFn({ code: couponCode });
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#f97316', '#fbbf24', '#ffffff']
            });

            setRedemptionSuccess({ days: result.data.durationDays });
            setCouponCode('');
        } catch (error: any) {
            toast({ 
                title: "Redemption Failed", 
                description: error.message || "Invalid or expired code.", 
                variant: "destructive" 
            });
        } finally {
            setIsRedeeming(false);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-4">
                <Skeleton className="h-12 w-3/4 mx-auto mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="h-[500px] w-full" />
                    <Skeleton className="h-[500px] w-full" />
                    <Skeleton className="h-[500px] w-full" />
                </div>
            </div>
        );
    }

    const isAlreadyPro = profile?.subscriptionStatus === 'pro';
    const isIndiaPlan = selectedCountry === 'India';
    const currentPlans = isIndiaPlan ? INDIA_PLANS : GLOBAL_PLANS;
    const currencyInfo = CURRENCY_MAP[selectedCountry] || CURRENCY_MAP["Other"];
    
    const isAdmin = profile?.role === 'admin';

    const getConvertedPrice = (usdPrice: number) => {
      if (isIndiaPlan) return null;
      const rate = exchangeRates[currencyInfo.code] || 1;
      return `${currencyInfo.symbol}${Math.round(usdPrice * rate).toLocaleString()}`;
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 space-y-24">
            {/* --- ADMIN PRICING SIMULATOR --- */}
            {isAdmin && (
              <section className="bg-slate-900 p-6 rounded-3xl border-4 border-primary/20 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 relative z-50">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg"><Settings2 className="text-primary w-6 h-6" /></div>
                    <div>
                      <h3 className="text-white font-black uppercase tracking-widest text-xs">Admin Pricing Simulator</h3>
                      <p className="text-slate-400 text-[10px] font-bold">Simulate how pricing appears in different global regions.</p>
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger className="h-12 bg-white/10 border-white/20 text-white font-bold rounded-xl focus:ring-primary">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 rounded-2xl">
                        {Object.keys(CURRENCY_MAP).map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>
            )}

            <div className="text-center space-y-6">
                <h1 className="text-4xl font-extrabold sm:text-6xl tracking-tight text-gray-900 font-headline uppercase">Upgrade to <span className="text-primary">Abacus Pro</span></h1>
                <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto font-medium">Unlock the full power of mental math training and join the global leaderboard.</p>
                
                {isTrialActive && !isAlreadyPro && (
                  <Badge className="bg-blue-600 text-white px-6 py-2 rounded-full font-black uppercase tracking-[0.2em] shadow-lg animate-pulse border-none">
                    TRIAL ACTIVE: UPGRADE TO KEEP YOUR RANK
                  </Badge>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
                {currentPlans.map((plan) => {
                    const convertedPrice = getConvertedPrice(plan.price);
                    const convertedOriginal = getConvertedPrice(plan.originalPrice);

                    return (
                    <Card key={plan.id} className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-2xl rounded-[2.5rem] overflow-hidden ${
                        plan.isBestValue 
                        ? 'border-orange-500 border-4 scale-105 z-10 bg-white' 
                        : 'border-2 border-gray-100 bg-white/80'
                    }`}>
                        {plan.isBestValue && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                <Badge className="bg-orange-500 text-white px-6 py-1 text-sm font-bold uppercase tracking-widest shadow-md border-none">
                                    Best Value
                                </Badge>
                            </div>
                        )}
                        
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="text-2xl font-bold uppercase">{plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px] mt-2 font-medium">{plan.description}</CardDescription>
                            
                            <div className="mt-6 flex flex-col items-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl text-muted-foreground line-through">
                                      {convertedOriginal || `${plan.currency === 'INR' ? '₹' : '$'}${plan.originalPrice}`}
                                    </span>
                                    <Badge variant="destructive" className="font-bold border-none">{plan.savings}</Badge>
                                </div>
                                <div className="flex flex-col items-center mt-2">
                                    <div className="flex items-baseline">
                                      <span className="text-5xl font-black">{convertedPrice || `${plan.currency === 'INR' ? '₹' : '$'}${plan.price}`}</span>
                                      <span className="text-muted-foreground ml-1 font-semibold text-lg">{plan.durationLabel}</span>
                                    </div>
                                    {!isIndiaPlan && (
                                      <div className="mt-3 bg-muted/50 px-4 py-2 rounded-xl border border-border/50">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                          Securely billed as ${plan.price}.00 USD
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                                          Actual deduction depends on your bank
                                        </p>
                                      </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-grow pt-8 px-8">
                            <ul className="space-y-4">
                                {PRO_FEATURES.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-6 pb-8 px-8">
                            {isAlreadyPro ? (
                                <Button className="w-full py-6 text-lg font-bold cursor-default rounded-xl" variant="secondary">
                                    Current Plan Active
                                </Button>
                            ) : (
                                <DynamicSubscriptionButton 
                                    selectedPlan={plan}
                                    localEstimate={convertedPrice}
                                    user={user} 
                                    profile={profile}
                                    onSuccess={() => toast({ title: "Payment Successful", description: "Your Pro features are now active!" })} 
                                    onError={(m) => toast({ title: "Payment Error", description: m, variant: "destructive" })} 
                                />
                            )}
                        </CardFooter>
                    </Card>
                )})}
            </div>

            {/* --- GIFT COUPON SECTION --- */}
            {!isAlreadyPro && (
                <section className="max-w-xl mx-auto animate-in slide-in-from-bottom-8 duration-700">
                    <Card className="rounded-[2.5rem] border-2 border-dashed border-primary/20 bg-primary/5 p-2">
                        <CardHeader className="text-center space-y-2">
                            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                                <Gift className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-black uppercase tracking-tight">Got a Gift Code?</CardTitle>
                            <CardDescription className="font-bold">Enter your coupon code below to unlock Pro access instantly.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleRedeemCoupon} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Enter code (e.g. GIFT-30-XYZ)" 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="h-12 pl-10 border-2 rounded-xl font-bold uppercase tracking-wider focus-visible:ring-primary"
                                    />
                                </div>
                                <Button type="submit" disabled={isRedeeming || !couponCode.trim()} className="h-12 px-6 rounded-xl font-black uppercase tracking-widest shadow-lg">
                                    {isRedeeming ? <Loader2 className="animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                                    Redeem
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* --- COMPREHENSIVE COMPARISON TABLE --- */}
            <section className="space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-black uppercase font-headline tracking-tight">Free vs Pro Comparison</h2>
                    <p className="text-muted-foreground font-medium text-lg">Compare our training modules and unlock your full cognitive potential.</p>
                </div>
                <Card className="rounded-[2.5rem] overflow-hidden border-2 shadow-2xl bg-white/50 backdrop-blur-sm">
                    <Table>
                        <TableHeader className="bg-slate-900">
                            <TableRow className="hover:bg-slate-900 border-none">
                                <TableHead className="w-[350px] font-black uppercase text-[10px] tracking-[0.2em] py-6 px-8 text-white">Training Feature</TableHead>
                                <TableHead className="text-center font-black uppercase text-[10px] tracking-[0.2em] py-6 text-white">Free Plan</TableHead>
                                <TableHead className="text-center font-black uppercase text-[10px] tracking-[0.2em] py-6 text-white">Pro Member</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Basic Add & Sub (Direct Movements)</TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Visualization Drills (Beads Value)</TableCell>
                                <TableCell className="text-center"><span className="text-[10px] font-black text-slate-400 uppercase">Limited Levels</span></TableCell>
                                <TableCell className="text-center"><span className="text-[10px] font-black text-primary uppercase">All 12 Mastery Levels</span></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Formula Mastery (Small/Big/Combi)</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Bubble Game Experience</TableCell>
                                <TableCell className="text-center"><span className="text-[10px] font-black text-slate-400 uppercase">First 5 Levels</span></TableCell>
                                <TableCell className="text-center"><span className="text-[10px] font-black text-primary uppercase">All 1,000+ Levels</span></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Official Grand Final Exams</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Professional Certification & Ranks</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Abacus Mastery Labs (Mult/Div)</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="border-b-slate-100 bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Global Hall of Fame Placement</TableCell>
                                <TableCell className="text-center"><X className="mx-auto text-slate-200 w-5 h-5 stroke-[3px]" /></TableCell>
                                <TableCell className="text-center"><Check className="mx-auto text-green-500 w-6 h-6 stroke-[3px]" /></TableCell>
                            </TableRow>
                            <TableRow className="bg-slate-50/30">
                                <TableCell className="font-bold py-6 px-8 text-slate-700">Advanced Progress Analytics</TableCell>
                                <TableCell className="text-center"><span className="text-[10px] font-black text-slate-400 uppercase">Basic Scores</span></TableCell>
                                <TableCell className="text-center"><span className="text-[10px] font-black text-primary uppercase">Full Performance Trends</span></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </section>

            <div className="text-center space-y-10 pt-12 border-t">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                    <div className="flex items-center gap-4 text-left">
                        <div className="bg-blue-100 p-3 rounded-2xl"><ShieldCheck className="w-10 h-10 text-blue-600" /></div>
                        <div>
                            <p className="font-black uppercase tracking-tight text-slate-900 leading-none mb-1">100% Secure Payments</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Industry-Standard Encryption</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-left">
                        <div className="bg-orange-100 p-3 rounded-2xl"><Globe className="w-10 h-10 text-orange-600" /></div>
                        <div>
                            <p className="font-black uppercase tracking-tight text-slate-900 leading-none mb-1">Global Training Ground</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mastery for all countries</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-100/50 p-6 rounded-2xl max-w-2xl mx-auto flex items-start gap-4">
                  <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-left text-xs font-medium text-slate-500 leading-relaxed">
                    Note: International payments are processed in USD. Your financial institution will automatically convert this to your local currency at their prevailing daily rate. Subscription prices shown in local currency are close estimates to help you understand the value in your region.
                  </p>
                </div>
            </div>

            {/* --- SUCCESS DIALOG --- */}
            <Dialog open={!!redemptionSuccess} onOpenChange={(open) => !open && setRedemptionSuccess(null)}>
              <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-w-sm">
                <div className="bg-green-600 p-8 text-center text-white">
                  <div className="mx-auto bg-white/20 p-4 rounded-full w-fit mb-4">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight">Gift Redeemed!</DialogTitle>
                </div>
                <div className="p-8 text-center space-y-6">
                  <DialogDescription className="text-lg font-bold text-slate-700 leading-relaxed">
                    Congratulations! You now have <span className="text-green-600">{redemptionSuccess?.days} days</span> of Pro access.
                  </DialogDescription>
                  <Button asChild className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg" onClick={() => setRedemptionSuccess(null)}>
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>
    );
}
