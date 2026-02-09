
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
    usePageBackground('');
  
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Shield className="w-8 h-8 text-primary" />
                        <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
                    </div>
                    <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                        <p>Welcome to My Abacus Pro. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">2. Information We Collect</h2>
                        <p>We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website (such as posting messages in our online forums or entering competitions, contests or giveaways) or otherwise contacting us.</p>
                        <p>The personal information that we collect depends on the context of your interactions with us and the Website, the choices you make and the products and features you use. The personal information we collect can include the following: name, email address, mailing address, phone number, and other similar contact data.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
                        <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">4. Will Your Information Be Shared With Anyone?</h2>
                        <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. We do not sell, trade, or rent your personal identification information to others.</p>
                    </div>
                     <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">5. How Do We Keep Your Information Safe?</h2>
                        <p>We aim to protect your personal information through a system of organizational and technical security measures. We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">6. Contact Us</h2>
                        <p>If you have questions or comments about this policy, you may email us at <a href="mailto:myabacuspro@gmail.com" className="text-primary hover:underline">myabacuspro@gmail.com</a>.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
