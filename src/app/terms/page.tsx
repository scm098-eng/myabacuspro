
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePageBackground } from '@/hooks/usePageBackground';
import { FileText } from 'lucide-react';

export default function TermsAndConditionsPage() {
    usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/terms_bg.jpg?alt=media');
  
    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <FileText className="w-8 h-8 text-primary" />
                        <CardTitle className="text-3xl font-headline">Terms and Conditions</CardTitle>
                    </div>
                    <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 text-muted-foreground">
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">1. Agreement to Terms</h2>
                        <p>By using our services, you agree to be bound by these terms. If you do not agree to these terms, please do not use our services. We may update these terms from time to time, and we will notify you of any changes by posting the new terms on this page.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">2. User Accounts</h2>
                        <p>When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">3. Prohibited Activities</h2>
                        <p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">4. Intellectual Property</h2>
                        <p>The Service and its original content, features and functionality are and will remain the exclusive property of My Abacus Pro and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.</p>
                    </div>
                     <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">5. Termination</h2>
                        <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-foreground">6. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the land, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
