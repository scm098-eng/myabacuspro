
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { Eye, EyeOff, Loader2, Camera } from 'lucide-react';
import type { SignupData, ProfileData } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const grades = Array.from({ length: 12 }, (_, i) => `${i + 1}${['st', 'nd', 'rd'][i] || 'th'}`);
const majorCountries = ["India", "United States", "United Kingdom", "United Arab Emirates", "Australia", "Canada", "Singapore", "Malaysia", "Japan", "Germany", "France", "Other"];

const countryCodes: Record<string, string> = {
  "India": "+91 ",
  "United States": "+1 ",
  "United Kingdom": "+44 ",
  "United Arab Emirates": "+971 ",
  "Australia": "+61 ",
  "Canada": "+1 ",
  "Singapore": "+65 ",
  "Malaysia": "+60 ",
  "Japan": "+81 ",
  "Germany": "+49 ",
  "France": "+33 ",
  "Other": ""
};

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  middleName: z.string().optional(),
  surname: z.string().min(1, { message: "Surname is required." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date of birth is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  schoolName: z.string().optional(),
  grade: z.string().optional(),
  mobileNo: z.string().optional(),
  whatsappNo: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher'], { required_error: 'You must select a role.' }),
  teacherId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function calculateAge(dobStr: string | undefined) {
    if (!dobStr) return null;
    const birthDate = new Date(dobStr);
    if (isNaN(birthDate.getTime())) return null;
    const diff_ms = Date.now() - birthDate.getTime();
    return Math.abs(new Date(diff_ms).getUTCFullYear() - 1970);
}

async function getCroppedImg(image: HTMLImageElement, crop: Crop, fileName: string = 'cropped-image.jpg'): Promise<File | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx || !crop.width || !crop.height) return null;
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) resolve(null);
      else resolve(new File([blob], fileName, { type: 'image/jpeg', lastModified: Date.now() }));
    }, 'image/jpeg', 0.95);
  });
}

export default function SignupPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/signup_bg.jpg?alt=media');
  const router = useRouter();
  const { signup, loginWithGoogle, getApprovedTeachers } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<ProfileData[]>([]);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '', password: '', confirmPassword: '', firstName: '', middleName: '', surname: '',
      country: 'India', addressLine1: '', city: '', taluka: '', district: '', state: '', pincode: '',
      schoolName: '', mobileNo: '', whatsappNo: '', dob: '', grade: '', role: 'student',
    },
  });

  const { watch, setValue } = form;
  const ageValue = calculateAge(watch('dob'));
  const selectedRole = watch('role');
  const selectedCountry = watch('country');

  // AUTO COUNTRY CODE LOGIC
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'country') {
        const code = countryCodes[value.country || 'India'] || "+91 ";
        setValue('mobileNo', code);
        setValue('whatsappNo', code);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  useEffect(() => {
    getApprovedTeachers().then(setTeachers);
  }, [getApprovedTeachers]);
  
  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (e: any) {
      toast({ title: 'Sign-up Failed', description: e.message, variant: "destructive" });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const signupData: SignupData = { ...values, profilePhoto: croppedImageFile };
      await signup(signupData);
      toast({ title: "Welcome!", description: "Account created successfully." });
      router.push('/');
    } catch (e: any) {
      toast({ title: 'Sign-up Failed', description: e.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => { setImgSrc(reader.result?.toString() || ''); setIsPhotoDialogOpen(true); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropConfirm = async () => {
    if (!completedCrop || !imgRef.current) return;
    const file = await getCroppedImg(imgRef.current, completedCrop);
    if (file) {
      setCroppedImageFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setIsPhotoDialogOpen(false);
    }
  };

  return (
    <>
    <div className="flex flex-col items-center justify-center py-12">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create Account</CardTitle>
          <CardDescription>Join the My Abacus Pro family.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>Sign up with Google</Button>
           <div className="my-6 flex items-center"><Separator className="flex-1" /><span className="px-4 text-sm text-muted-foreground">OR</span><Separator className="flex-1" /></div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                          <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="student" /></FormControl><FormLabel className="font-normal">Student</FormLabel></FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="teacher" /></FormControl><FormLabel className="font-normal">Teacher</FormLabel></FormItem>
                        </RadioGroup>
                      </FormControl><FormMessage />
                    </FormItem>
                  )} />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                 <FormField control={form.control} name="surname" render={({ field }) => (<FormItem><FormLabel>Surname *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
               </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="dob" render={({ field }) => (<FormItem><FormLabel>Date of Birth *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <div className="space-y-2"><Label>Age</Label><Input value={ageValue !== null ? `${ageValue} years old` : 'Select DOB'} disabled /></div>
                </div>
                {selectedRole === 'student' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="teacherId" render={({ field }) => (
                        <FormItem><FormLabel>Assigned Teacher *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pick a Teacher" /></SelectTrigger></FormControl><SelectContent>{teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.firstName} {t.surname}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="grade" render={({ field }) => (
                        <FormItem><FormLabel>Grade/Std.</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger></FormControl><SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                  </div>
                )}
                <h3 className="text-lg font-medium pt-4 border-b">Residential Address</h3>
                <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{majorCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel>
                    {selectedCountry === 'India' ? (
                      <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                    ) : (<FormControl><Input {...field} /></FormControl>)}
                  <FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="addressLine1" render={({ field }) => (<FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <h3 className="text-lg font-medium pt-4 border-b">Contact & Login</h3>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20"><AvatarImage src={avatarPreview || ''} /><AvatarFallback>{watch('firstName')?.[0]}</AvatarFallback></Avatar>
                  <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Choose Photo</Button>
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Password *</FormLabel><FormControl><div className="relative"><Input type={showPassword ? 'text' : 'password'} {...field} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem><FormLabel>Confirm *</FormLabel><FormControl><div className="relative"><Input type={showConfirmPassword ? 'text' : 'password'} {...field} /><button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></FormControl><FormMessage /></FormItem>)} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting && <Loader2 className="animate-spin mr-2" />}Create Account</Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center"><p className="text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Log in</Link></p></CardFooter>
      </Card>
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Crop Photo</DialogTitle></DialogHeader>
          <div className="flex justify-center">
            {imgSrc && <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop><img ref={imgRef} src={imgSrc} alt="Crop" className="max-h-[60vh]"/></ReactCrop>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>Cancel</Button><Button onClick={handleCropConfirm}>Use Photo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
