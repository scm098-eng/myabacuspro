
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Loader2, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import { usePageBackground } from '@/hooks/usePageBackground';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }).refine(
    (email) => !email.endsWith('@example.com'),
    { message: 'Please use a real email address, not a test domain.' }
  ),
  whatsapp: z.string().min(10, { message: 'Please enter a valid 10-digit WhatsApp number.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  captchaAnswer: z.string().min(1, { message: 'Please solve the math challenge.' }),
});

export default function ContactPage() {
  usePageBackground('');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState({ q: '', a: 0 });
  
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 9) + 1;
    const num2 = Math.floor(Math.random() * 9) + 1;
    setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      whatsapp: '',
      message: '',
      captchaAnswer: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (parseInt(values.captchaAnswer) !== captcha.a) {
      form.setError('captchaAnswer', { message: 'Incorrect answer. Please try again.' });
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);
    setErrorDetails(null);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          message: `WhatsApp: ${values.whatsapp}\n\n${values.message}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to send message.');
      }

      toast({
        title: 'Message Sent!',
        description: "Thanks for reaching out. We'll get back to you soon on WhatsApp or Email.",
      });
      form.reset();
      generateCaptcha();
    } catch (error: any) {
      setErrorDetails(error.message);
      toast({
        title: 'Error',
        description: 'Could not send message. See details on page.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-foreground font-headline sm:text-5xl">Get in Touch</h1>
        <p className="mt-4 max-w-xl mx-auto text-lg text-muted-foreground">
          Real parents and teachers only. Bots will be blocked.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          {errorDetails && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="font-bold">Message Failed</AlertTitle>
              <AlertDescription className="text-xs">
                {errorDetails}
              </AlertDescription>
            </Alert>
          )}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>Fill out the form and our team will get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      name="whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number</FormLabel>
                          <FormControl>
                            <Input placeholder="10-digit mobile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="How can we help you?" {...field} rows={4} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="captchaAnswer"
                    render={({ field }) => (
                      <FormItem className="bg-muted/50 p-4 rounded-lg border border-primary/10">
                        <FormLabel className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          Human Verification
                        </FormLabel>
                        <FormDescription>
                          What is {captcha.q} ?
                        </FormDescription>
                        <FormControl>
                          <Input type="number" placeholder="Enter answer" {...field} className="bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {isSubmitting ? 'Verifying...' : 'Submit Message'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
            <div className="relative aspect-[3/2] w-full rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg mb-8">
                <Image
                    src={placeholderImages.contactHero.src}
                    alt="Customer support"
                    fill
                    className="object-cover"
                    data-ai-hint={placeholderImages.contactHero.hint}
                />
            </div>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                    <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h4 className="font-semibold text-lg">Email Us</h4>
                    <p className="text-muted-foreground">Our support team is available 24/7.</p>
                    <a href="mailto:myabacuspro@gmail.com" className="text-primary font-medium hover:underline">myabacuspro@gmail.com</a>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-full">
                    <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h4 className="font-semibold text-lg">WhatsApp Support</h4>
                    <p className="text-muted-foreground">Message us directly for faster response.</p>
                    <span className="text-green-600 font-bold">Priority for Pro Members</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
