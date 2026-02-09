
'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { ProfileData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Star, Loader2 } from 'lucide-react';
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
const RAZORPAY_PLAN_ID = 'plan_S89FukHU9XcnKu';
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;

interface DynamicSubscriptionButtonProps {
  user: User;
  profile: ProfileData | null;
  onSuccess: (response: any) => void;
  onError: (message: string) => void;
}

const DynamicSubscriptionButton = ({ user, profile, onSuccess, onError }: DynamicSubscriptionButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
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
    if (!user || !user.uid) {
      onError("Authentication failed. Please log in.");
      return;
    }

    if (!RAZORPAY_KEY_ID) {
        onError("Razorpay Key ID is not configured. Please contact support.");
        return;
    }

    setIsProcessing(true);

    try {
      await loadRazorpayScript();
      
      const functions = getFunctions(firebaseApp);
      const createSubscription = httpsCallable(functions, 'createRazorpaySubscription');

      const result = await createSubscription({ 
          planId: RAZORPAY_PLAN_ID 
      });

      const subscriptionData = (result.data as any)?.subscriptionData;

      if (!subscriptionData || !subscriptionData.id) {
        throw new Error('Could not create Razorpay subscription. Check Cloud Function logs.');
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        subscription_id: subscriptionData.id,
        name: 'Abacus Pro Subscription',
        description: 'Monthly Plan Access',
        image: 'https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/logo_icon.png?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9',
        modal: {
            ondismiss: function() {
                console.log("Subscription payment flow dismissed.");
                toast({ title: "Payment Canceled", description: "The subscription process was not completed." });
            }
        },
        handler: function (response: any) {
          onSuccess(response);
          router.push('/subscription-success');
        },
        prefill: {
          email: user.email || '',
          name: profile?.firstName ? `${profile.firstName} ${profile.surname}` : 'Customer'
        },
        theme: {
          color: '#2563EB'
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Subscription Initiation Error:', error);
      onError(error.message || 'Failed to start subscription process.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      onClick={handleSubscribe} 
      className="w-full text-lg py-6 bg-primary text-primary-foreground hover:bg-primary/90 transition duration-150 ease-in-out"
      disabled={isProcessing}
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Processing...
        </>
      ) : (
        'Upgrade to Pro'
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
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="text-center mb-12">
                <Skeleton className="h-12 w-3/4 mx-auto" />
                <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
            </div>
            <div className="flex justify-center px-4 sm:px-0">
                <Skeleton className="h-[500px] w-full max-w-md rounded-xl" />
            </div>
      </div>
    );
  }

  const isAlreadyPro = profile?.subscriptionStatus === 'pro';

  const handleSubscriptionSuccess = (response: any) => {
    toast({
        title: "Payment Successful!",
        description: "Your subscription is being activated. Thank you!"
    });
  }

  const handleSubscriptionError = (message: string) => {
    toast({
        title: "Subscription Error",
        description: message,
        variant: "destructive"
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">
          Unlock Your Full Potential
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Choose the plan that's right for you and start mastering mental math today.
        </p>
      </div>
      
      <div className="flex justify-center px-4 sm:px-0">
        <Card className="w-full max-w-md shadow-2xl border-2 border-primary md:scale-105">
           <CardHeader className="text-center bg-primary/10 p-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold">Abacus Pro</CardTitle>
                <CardDescription className="text-lg">
                    Everything you need to become a math whiz.
                </CardDescription>
                <div className="mt-4 flex flex-col items-center gap-2">
                  <div className="flex items-baseline gap-4">
                    <p className="text-2xl font-semibold text-muted-foreground line-through">₹799</p>
                    <Badge variant="destructive" className="text-base h-fit py-1 px-3 -rotate-12 transform">55% OFF</Badge>
                  </div>
                  <p className="text-5xl font-extrabold tracking-tight text-foreground">₹360<span className="text-base font-medium text-muted-foreground">/month</span></p>
                </div>
           </CardHeader>
           <CardContent className="p-6 md:p-8">
                <ul className="space-y-4">
                    {includedFeatures.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                            <Check className="h-6 w-6 text-green-500" />
                            <span className="text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
           </CardContent>
           <CardFooter>
             {isAlreadyPro ? (
                <p className="w-full text-center text-primary font-semibold">You are already a Pro member!</p>
             ) : (
                <div className="w-full flex justify-center">
                   <DynamicSubscriptionButton 
                       user={user} 
                       profile={profile}
                       onSuccess={handleSubscriptionSuccess} 
                       onError={handleSubscriptionError} 
                   />
                </div>
             )}
           </CardFooter>
        </Card>
      </div>
    </div>
  )
}

const includedFeatures = [
  'Unlimited Practice Tests',
  'All Difficulty Levels',
  'Detailed Progress Tracking',
  'No Advertisements',
  'Priority Support',
];

    