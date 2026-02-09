
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { FileX2 } from 'lucide-react';

export default function CancellationRefundPage() {
    usePageBackground('');
  
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <FileX2 className="w-8 h-8 text-primary" />
                        <CardTitle className="text-3xl font-headline">Cancellation & Refund Policy</CardTitle>
                    </div>
                    <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">1. Subscription Cancellation</h2>
                        <p>You can cancel your "My Abacus Pro" Pro subscription at any time. When you cancel your subscription, you will continue to have access to Pro features until the end of your current billing period. After the billing period ends, your account will be downgraded to the free plan.</p>
                        <p>To cancel your subscription, please navigate to your profile settings on the Razorpay customer portal or contact our support team at <a href="mailto:myabacuspro@gmail.com" className="text-primary hover:underline">myabacuspro@gmail.com</a> for assistance.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">2. Refund Policy</h2>
                        <p>We offer a 7-day money-back guarantee for all new Pro subscriptions. If you are not satisfied with our service, you can request a full refund within 7 days of your initial purchase.</p>
                        <p>To request a refund, please contact our support team with your purchase details. Refunds will be processed to the original payment method within 5-7 business days. Please note that after the 7-day period, we do not offer refunds or credits for partial subscription periods or unused services.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">3. How to Request a Refund</h2>
                        <p>To initiate a refund, please send an email to <a href="mailto:myabacuspro@gmail.com" className="text-primary hover:underline">myabacuspro@gmail.com</a> with the subject line "Refund Request". Include your account email and the reason for your request. Our team will review your request and get back to you as soon as possible.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">4. Changes to This Policy</h2>
                        <p>We reserve the right to modify this cancellation and refund policy at any time. Any changes will be effective immediately upon posting the updated policy on our website. Your continued use of our service after any changes constitutes your acceptance of the new policy.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
