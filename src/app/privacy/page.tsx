'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Shield, Eye, Lock, Globe } from 'lucide-react';

export default function PrivacyPolicyPage() {
    usePageBackground('');
  
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-none shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="text-center pb-8 border-b">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                        <Shield className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-4xl font-headline font-black uppercase tracking-tight">Privacy Policy</CardTitle>
                    <CardDescription className="text-lg font-medium">Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-8 text-muted-foreground leading-relaxed">
                    
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Eye className="w-6 h-6 text-primary" /> 1. Introduction
                        </h2>
                        <p>Welcome to My Abacus Pro. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at myabacuspro@gmail.com.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Globe className="w-6 h-6 text-primary" /> 2. Google AdSense & Cookies
                        </h2>
                        <div className="bg-muted/30 p-6 rounded-2xl border border-primary/10 space-y-4">
                            <p>We use third-party advertising companies to serve ads when you visit our website. These companies may use information (not including your name, address, email address, or telephone number) about your visits to this and other websites in order to provide advertisements about goods and services of interest to you.</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Google AdSense:</strong> Google, as a third-party vendor, uses cookies to serve ads on your site.</li>
                                <li><strong>DART Cookie:</strong> Google's use of the DART cookie enables it to serve ads to your users based on their visit to your sites and other sites on the Internet.</li>
                                <li><strong>User Opt-out:</strong> Users may opt out of the use of the DART cookie by visiting the <a href="https://policies.google.com/technologies/ads" className="text-primary underline" target="_blank">Google Ad and Content Network privacy policy</a>.</li>
                            </ul>
                            <p>You can also opt out of personalized advertising by visiting <a href="https://www.aboutads.info/" className="text-primary underline" target="_blank">www.aboutads.info</a>.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Lock className="w-6 h-6 text-primary" /> 3. Information We Collect
                        </h2>
                        <p>We collect personal information that you voluntarily provide to us when you register on the website, such as name, email address, school details, and progress data. This information is used strictly to enhance your learning experience and manage your account.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">4. How We Use Your Information</h2>
                        <p>We use personal information collected via our Website for a variety of business purposes, including:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>To facilitate account creation and logon process.</li>
                            <li>To send administrative information to you.</li>
                            <li>To fulfill and manage your orders/subscriptions.</li>
                            <li>To post testimonials with your consent.</li>
                            <li>To deliver targeted advertising to you (with your consent where required).</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">5. Data Security</h2>
                        <p>We aim to protect your personal information through a system of organizational and technical security measures. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
                    </section>

                    <section className="space-y-4 pt-8 border-t">
                        <h2 className="text-2xl font-bold text-foreground">6. Contact Us</h2>
                        <p>If you have questions or comments about this policy, you may email us at <a href="mailto:myabacuspro@gmail.com" className="text-primary hover:underline font-bold">myabacuspro@gmail.com</a>.</p>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
