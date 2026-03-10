'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Brain, Menu, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Logo } from './Logo';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, profile, logout, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && profile?.role === 'teacher' && profile.status === 'pending') {
        toast({
            title: 'Approval Pending',
            description: 'Your teacher account is awaiting admin approval to access the dashboard.',
            duration: 10000,
        });
    }
  }, [profile, toast, isMounted]);


  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/tests', label: 'Practice & Games' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/contact', label: 'Contact us' },
    { href: '/tool-preview', label: 'Abacus Tool' },
  ];
  
  const displayName = profile?.firstName ? `${profile.firstName} ${profile.surname}` : user?.email?.split('@')[0] || 'User';
  const displayInitial = (profile?.firstName?.[0] || '') + (profile?.surname?.[0] || displayName.charAt(0).toUpperCase());
  const canSeeDashboard = profile?.role === 'admin' || (profile?.role === 'teacher' && profile.status === 'approved');

  const handleLinkClick = (path: string) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  }

  const handleMobileLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    router.push('/');
  }

  const userActions = (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                <AvatarImage src={profile?.profilePhoto || user.photoURL || ''} />
                <AvatarFallback>{displayInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  {(profile?.subscriptionStatus === 'pro' || profile?.role === 'admin' || profile?.role === 'teacher') && (
                  <Badge variant="secondary" className="w-fit mt-2 bg-yellow-400 text-yellow-900">
                    <Crown className="mr-1 h-3 w-3" />
                    {profile?.role === 'admin' ? 'Admin' : profile?.role === 'teacher' ? 'Teacher' : 'Pro'}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {canSeeDashboard && (
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                Admin Dashboard
              </DropdownMenuItem>
            )}
            {profile?.role === 'student' && (
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                My Dashboard
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/progress')}>
              Progress Report
            </DropdownMenuItem>
             {profile?.subscriptionStatus !== 'pro' && profile?.role === 'student' && (
                <DropdownMenuItem onClick={() => router.push('/pricing')} className="text-primary focus:text-primary">
                    Upgrade to Pro
                </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
          <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                  <Link href="/signup">Sign Up</Link>
              </Button>
          </div>
      )}
    </>
  );

  return (
    <header className="bg-card/90 backdrop-blur-sm shadow-md sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex flex-col items-center group">
              <div className="flex items-end gap-2">
                <Brain className="h-8 w-8 text-primary" />
                <Logo />
              </div>
              <p className="text-[0.55rem] text-muted-foreground tracking-widest mt-1 uppercase font-bold hidden sm:block">
                LEARN • PRACTICE • SUCCEED
              </p>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
            {isMounted && !isLoading ? userActions : <Skeleton className="h-10 w-28" />}
          </div>

          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xs p-0">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Mobile Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="flex flex-col items-center group">
                                    <div className="flex items-end gap-2 pb-1">
                                        <Brain className="h-8 w-8 text-primary" />
                                        <Logo />
                                    </div>
                                    <p className="text-[0.55rem] text-muted-foreground tracking-widest mt-1 uppercase font-bold">
                                        LEARN • PRACTICE • SUCCEED
                                    </p>
                                </div>
                            </Link>
                        </div>
                        <div className="flex-1 overflow-y-auto py-4">
                            <nav className="flex flex-col px-4">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.href}
                                        className="text-lg font-medium text-muted-foreground hover:text-primary transition-colors py-3 text-left border-b border-muted last:border-0"
                                        onClick={() => handleLinkClick(link.href)}
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </nav>
                            
                            <div className="mt-4 px-4 pb-8">
                                {isMounted && !isLoading ? (
                                    user ? (
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                                                <Avatar className="h-12 w-12 border-2 border-primary/50">
                                                    <AvatarImage src={profile?.profilePhoto || user.photoURL || ''} />
                                                    <AvatarFallback>{displayInitial}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col min-w-0">
                                                    <p className="text-sm font-bold truncate">{displayName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-2">
                                                {canSeeDashboard && <Button className="w-full justify-start" variant="outline" onClick={() => handleLinkClick('/admin')}>Admin Dashboard</Button>}
                                                {profile?.role === 'student' && <Button className="w-full justify-start" variant="outline" onClick={() => handleLinkClick('/dashboard')}>My Dashboard</Button>}
                                                <Button className="w-full justify-start" variant="ghost" onClick={() => handleLinkClick('/profile')}>Profile</Button>
                                                <Button className="w-full justify-start" variant="ghost" onClick={() => handleLinkClick('/progress')}>Progress Report</Button>
                                                {profile?.subscriptionStatus !== 'pro' && profile?.role === 'student' && (
                                                    <Button className="w-full justify-start text-primary" variant="ghost" onClick={() => handleLinkClick('/pricing')}>Upgrade to Pro</Button>
                                                )}
                                                <Separator className="my-2" />
                                                <Button className="w-full" variant="destructive" onClick={handleMobileLogout}>Log out</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 pt-4">
                                            <Button asChild variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Link href="/login">Login</Link>
                                            </Button>
                                            <Button asChild className="w-full" onClick={() => setIsMobileMenuOpen(false)}>
                                                <Link href="/signup">Sign Up</Link>
                                            </Button>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-4 pt-4">
                                        <Skeleton className="h-16 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}