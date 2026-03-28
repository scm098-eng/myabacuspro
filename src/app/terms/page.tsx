'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { FileText, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export default function TermsAndConditionsPage() {
    usePageBackground('');
  
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-8 border-b">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <FileText className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-headline font-black uppercase tracking-tight">Terms & Conditions</CardTitle>
                    <CardDescription className="text-lg font-medium">Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-8 text-muted-foreground leading-relaxed">
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <ShieldCheck className="w-6 h-6 text-primary" /> 1. Agreement to Terms
                        </h2>
                        <p>By accessing or using My Abacus Pro, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you are prohibited from using the service.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <ExternalLink className="w-6 h-6 text-primary" /> 2. Third-Party Links & Ads
                        </h2>
                        <div className="bg-muted/30 p-6 rounded-2xl border border-primary/10">
                            <p>Our website may contain links to third-party websites or services that are not owned or controlled by My Abacus Pro. We also display advertisements served by Google AdSense.</p>
                            <p className="mt-2 font-bold text-foreground">We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <AlertCircle className="w-6 h-6 text-primary" /> 3. User Accounts
                        </h2>
                        <p>When you create an account, you must provide accurate and complete information. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. Intellectual Property</h2>
                        <p>The Service and its original content (excluding content provided by users), features, and functionality are and will remain the exclusive property of My Abacus Pro and its licensors.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Prohibited Use</h2>
                        <p>You agree not to use the Service for any unlawful purpose or to solicit others to perform or participate in any unlawful acts. You may not attempt to reverse engineer or scrape data from our calculation tools or games.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">6. Termination</h2>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                    </section>

                    <section className="space-y-4 pt-8 border-t text-center">
                        <p>For any questions regarding these terms, please contact us at <a href="mailto:myabacuspro@gmail.com" className="text-primary hover:underline font-bold">myabacuspro@gmail.com</a>.</p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
