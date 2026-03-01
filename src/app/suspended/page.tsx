
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogOut, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SuspendedPage() {
  const { profile, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile && !profile.isSuspended) {
      router.push('/dashboard');
    }
  }, [profile, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-red-200 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-red-100 p-4 rounded-full w-fit mb-4">
            <ShieldAlert className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-headline text-red-700">Account Suspended</CardTitle>
          <CardDescription className="text-lg mt-2">
            Access to your account has been restricted by administrators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            This typically happens due to a violation of our terms of service, suspicious activity, or a payment issue.
          </p>
          <div className="bg-muted p-4 rounded-lg flex items-center gap-3 text-sm font-medium">
            <Mail className="h-5 w-5 text-primary" />
            <span>Contact support: <a href="mailto:myabacuspro@gmail.com" className="text-primary hover:underline">myabacuspro@gmail.com</a></span>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
