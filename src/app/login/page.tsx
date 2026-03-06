
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { ProfileData, UserRole } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
});

function LoginForm({ role }: { role: UserRole }) {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleRedirect = (profile: ProfileData | null) => {
    if (profile) {
        if(profile.role === 'admin' || (profile.role === 'teacher' && profile.status === 'approved')) {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    } else {
        router.push('/profile');
    }
  };

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const loggedInProfile = await login(values.email, values.password);
       if (loggedInProfile?.role !== role) {
         throw new Error(`You are not registered as a ${role}.`);
       }
      handleRedirect(loggedInProfile);
    } catch (error: any) {
      toast({ title: 'Login Failed', description: error.message, variant: 'destructive' });
    }
  }

  async function handleGoogleLogin() {
    try {
      const loggedInProfile = await loginWithGoogle();
      handleRedirect(loggedInProfile);
    } catch (error) {
      toast({ title: 'Google Login Failed', description: 'Please try again.', variant: 'destructive' });
    }
  }
  
  return (
      <div className="space-y-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full">Login as {role.charAt(0).toUpperCase() + role.slice(1)}</Button>
            </form>
            </Form>
            <Separator className="my-4" /><Button variant="outline" className="w-full" onClick={handleGoogleLogin}>Sign in with Google</Button>
    </div>
  );
}

export default function LoginPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/login_bg.jpg?alt=media');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const forgotPasswordForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

   async function onForgotPasswordSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsResetting(true);
    try {
      await sendPasswordReset(values.email);
      toast({ title: 'Email Sent', description: 'Check your inbox for the reset link.' });
      setIsForgotPasswordOpen(false);
    } catch (error) {
       toast({ title: 'Error', description: 'Could not send reset link.', variant: 'destructive' });
    } finally { setIsResetting(false); }
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center"><CardTitle className="text-2xl font-headline">Welcome Back</CardTitle></CardHeader>
        <CardContent>
            <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="student">Student</TabsTrigger>
                    <TabsTrigger value="teacher">Teacher</TabsTrigger>
                    <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="student" className="pt-4"><LoginForm role="student" /></TabsContent>
                <TabsContent value="teacher" className="pt-4"><LoginForm role="teacher" /></TabsContent>
                <TabsContent value="admin" className="pt-4"><LoginForm role="admin" /></TabsContent>
            </Tabs>
             <div className="text-center mt-4">
                <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                    <DialogTrigger asChild><Button variant="link" className="p-0 text-xs">Forgot Password?</Button></DialogTrigger>
                    <DialogContent><DialogHeader><DialogTitle>Forgot Password</DialogTitle></DialogHeader>
                    <Form {...forgotPasswordForm}>
                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                                <FormField control={forgotPasswordForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            <DialogFooter><Button type="submit" disabled={isResetting}>{isResetting && <Loader2 className="animate-spin" />} Send Reset Link</Button></DialogFooter>
                        </form>
                    </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardContent>
        <CardFooter className="justify-center"><p className="text-sm text-muted-foreground">Don't have an account? <Link href="/signup" className="text-primary hover:underline font-semibold">Sign up</Link></p></CardFooter>
      </Card>
    </div>
  );
}
