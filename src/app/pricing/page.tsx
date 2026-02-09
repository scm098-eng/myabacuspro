'use client';

import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import type { User } from 'firebase/auth';
import type { ProfileData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';

// --- CONFIGURATION ---
const RAZORPAY_PLAN_ID = 'plan_S89FukHU9XcnKu'; // Monthly Recurring
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

const PLANS = [
    {
        id: 'monthly',
        name: 'Monthly Pro',
        price: 360,
        originalPrice: 799,
        savings: '55% OFF',
        durationLabel: '/month',
        description: 'Billed monthly, cancel anytime.',
        type: 'recurring'
    },
    {
        id: '6months',
        name: '6 Months Pro',
        price: 2040,
        originalPrice: 4794,
        savings: '57% OFF',
        durationLabel: 'for 6 months',
        description: 'One-time payment. Non-recurring.',
        type: 'one-time'
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
        isBestValue: true
    }
];

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface DynamicSubscriptionButtonProps {
    user: User;
    profile: ProfileData | null;
    selectedPlan: typeof PLANS[0];
    onSuccess: (response: any) => void;
    onError: (message: string) => void;
}

const DynamicSubscriptionButton = ({ user, profile, selectedPlan, onSuccess, onError }: DynamicSubscriptionButtonProps) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

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
            
            const functions = getFunctions(firebaseApp);
            let result: any;

            // Logic selection based on plan type
            if (selectedPlan.type === 'recurring') {
                const createSubscription = httpsCallable<any, any>(functions, 'createRazorpaySubscription');
                result = await createSubscription({ 
                    planId: RAZORPAY_PLAN_ID,
                    amountInRupees: selectedPlan.price, 
                });
            } else {
                const createOneTimeOrder = httpsCallable<any, any>(functions, 'createOneTimeOrder');
                result = await createOneTimeOrder({ 
                    amountInRupees: selectedPlan.price,
                    planDuration: selectedPlan.id === '6months' ? 6 : 12
                });
            }
            
            const { subscriptionId, orderId, amount } = result.data; 

            const options = {
                key: RAZORPAY_KEY_ID,
                order_id: orderId, 
                subscription_id: subscriptionId || undefined, 
                amount: amount, 
                currency: 'INR',
                name: 'Abacus Pro',
                description: selectedPlan.name,
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
    const { user, profile, isLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        if (!isLoading && !user) router.push('/login');
    }, [isLoading, user, router]);

    if (isLoading || !user) {
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

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-extrabold sm:text-6xl tracking-tight text-gray-900">Upgrade to Abacus Pro</h1>
                <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">Choose the plan that fits your learning pace and master mental math today.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative">
                {PLANS.map((plan) => (
                    <Card key={plan.id} className={`relative flex flex-col h-full transition-all duration-300 hover:shadow-2xl ${
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
                            <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px] mt-2 font-medium">{plan.description}</CardDescription>
                            
                            <div className="mt-6 flex flex-col items-center">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-xl text-muted-foreground line-through">₹{plan.originalPrice}</span>
                                    <Badge variant="destructive" className="font-bold border-none">{plan.savings}</Badge>
                                </div>
                                <div className="flex items-baseline mt-2">
                                    <span className="text-5xl font-black">₹{plan.price}</span>
                                    <span className="text-muted-foreground ml-1 font-semibold text-lg">{plan.durationLabel}</span>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="flex-grow pt-8">
                            <ul className="space-y-4">
                                {[
                                    'Unlimited Practice Tests',
                                    'Access All Difficulty Levels',
                                    'Advanced Progress Analytics',
                                    'Ad-Free Learning Experience',
                                    'Priority Support'
                                ].map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <div className="mt-1 bg-green-100 p-1 rounded-full shrink-0">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-6 pb-8 px-8">
                            {isAlreadyPro ? (
                                <Button className="w-full py-6 text-lg font-bold cursor-default" variant="secondary">
                                    Current Plan Active
                                </Button>
                            ) : (
                                <DynamicSubscriptionButton 
                                    selectedPlan={plan}
                                    user={user} 
                                    profile={profile}
                                    onSuccess={() => toast({ title: "Payment Successful", description: "Your Pro features are now active!" })} 
                                    onError={(m) => toast({ title: "Payment Error", description: m, variant: "destructive" })} 
                                />
                            )}
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <div className="mt-20 text-center flex flex-col items-center justify-center gap-4">
                <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200" />
                    ))}
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    Join 1,000+ students mastering Abacus mental math.
                </p>
            </div>
        </div>
    );
}