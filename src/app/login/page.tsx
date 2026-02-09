
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
import { Eye, EyeOff, Loader2, User, UserCog, GraduationCap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import type { ProfileData, UserRole } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email to reset your password." }),
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
    if (profile && profile.firstName) {
        if(profile.role === 'admin' || (profile.role === 'teacher' && profile.status === 'approved')) {
            router.push('/admin');
        } else {
            router.push('/');
        }
    } else {
        router.push('/profile');
    }
  };

  async function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const loggedInProfile = await login(values.email, values.password);
       if (loggedInProfile?.role !== role) {
         throw new Error(`You are not registered as a ${role}. Please use the correct login tab.`);
       }
      handleRedirect(loggedInProfile);
    } catch (error: any) {
      console.error(error);
      let description = 'Please check your email and password.';
      if (error.code === 'auth/invalid-credential') {
        description = 'Invalid email or password. Please try again.';
      } else if (error.message) {
        description = error.message;
      }
      
      toast({
        title: 'Login Failed',
        description: description,
        variant: 'destructive',
      });
    }
  }

  async function handleGoogleLogin() {
    try {
      const loggedInProfile = await loginWithGoogle();
      handleRedirect(loggedInProfile);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Google Login Failed',
        description: 'Could not log in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  }
  
  return (
      <div className="space-y-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Password</FormLabel>
                        {/* Note: Forgot password is in the main component */}
                    </div>
                    <FormControl>
                        <div className="relative">
                        <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                            ) : (
                            <Eye className="h-5 w-5" />
                            )}
                        </button>
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full">Login as {role.charAt(0).toUpperCase() + role.slice(1)}</Button>
            </form>
            </Form>
            <Separator className="my-4" />
            <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.245,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Sign in with Google
            </Button>
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
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for instructions to reset your password.',
      });
      setIsForgotPasswordOpen(false);
      forgotPasswordForm.reset();
    } catch (error) {
      console.error(error);
       toast({
        title: 'Error',
        description: 'Could not send password reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
        setIsResetting(false);
    }
  }


  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>Sign in to your <span className="text-primary font-semibold">My Abacus Pro</span> account</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="student" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="student"><GraduationCap className="mr-2"/>Student</TabsTrigger>
                    <TabsTrigger value="teacher"><User className="mr-2"/>Teacher</TabsTrigger>
                    <TabsTrigger value="admin"><UserCog className="mr-2"/>Admin</TabsTrigger>
                </TabsList>
                <TabsContent value="student" className="pt-4">
                    <LoginForm role="student" />
                </TabsContent>
                <TabsContent value="teacher" className="pt-4">
                    <LoginForm role="teacher" />
                </TabsContent>
                <TabsContent value="admin" className="pt-4">
                    <LoginForm role="admin" />
                </TabsContent>
            </Tabs>

             <div className="text-center mt-4">
                <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                    <DialogTrigger asChild>
                    <Button variant="link" type="button" className="p-0 h-auto text-xs">Forgot Password?</Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Forgot Password</DialogTitle>
                        <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...forgotPasswordForm}>
                        <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                                <FormField
                                control={forgotPasswordForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your.email@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <DialogFooter>
                                <Button type="submit" disabled={isResetting}>
                                    {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Reset Link
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardContent>
        <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Don't have an account? <Link href="/signup" className="text-primary hover:underline font-semibold">Sign up</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}

    
