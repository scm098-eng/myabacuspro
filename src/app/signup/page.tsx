'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, User, Lock, Camera, Sparkles, X } from 'lucide-react';
import type { SignupData, ProfileData } from '@/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
const grades = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const majorCountries = ["India", "United States", "United Kingdom", "United Arab Emirates", "Australia", "Canada", "Singapore", "Malaysia", "Japan", "Germany", "France", "Other"];

const AVATAR_STYLES = [
  { id: 'avataaars', label: 'People', total: 200 },
  { id: 'bottts', label: 'Robots', total: 200 },
  { id: 'pixel-art', label: 'Retro', total: 200 },
  { id: 'fun-emoji', label: 'Emojis', total: 200 },
  { id: 'lorelei', label: 'Sketches', total: 200 },
  { id: 'notionists', label: 'Notion Style', total: 200 },
  { id: 'adventurer', label: 'Adventure', total: 200 },
  { id: 'big-ears', label: 'Friendly', total: 200 },
];

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
  addressLine1: z.string().min(5, { message: "Full address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  schoolName: z.string().min(3, { message: "School name is required." }),
  grade: z.string().min(1, { message: "Grade is required." }),
  mobileNo: z.string().min(5, { message: "Mobile number is required." }),
  whatsappNo: z.string().min(5, { message: "WhatsApp number is required." }),
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

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signup, sendVerificationEmail, loginWithGoogle, user, profile, isLoading, getApprovedTeachers } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isAvatarGalleryOpen, setIsAvatarGalleryOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<ProfileData[]>([]);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '', password: '', confirmPassword: '', firstName: '', middleName: '', surname: '',
      country: 'India', addressLine1: '', city: '', taluka: '', district: '', state: '', pincode: '',
      schoolName: '', mobileNo: '', whatsappNo: '', dob: '', grade: '', role: 'student', teacherId: '',
    },
  });

  const { watch, setValue } = form;
  const ageValue = calculateAge(watch('dob'));
  const selectedRole = watch('role');
  const selectedCountry = watch('country');
  const refParam = searchParams.get('ref');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const approved = await getApprovedTeachers();
        setTeachers(approved);
        
        // Auto-detect teacher from Referral Code
        if (refParam) {
          const db = getFirestore(firebaseApp);
          const q = query(collection(db, 'users'), where('referralCode', '==', refParam));
          const snap = await getDocs(q);
          
          if (!snap.empty) {
            const teacherDoc = snap.docs[0];
            const data = teacherDoc.data() as ProfileData;
            setValue('teacherId', teacherDoc.id);
            toast({ title: "Referral Applied", description: `Registering under ${data.firstName} ${data.surname}.` });
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchTeachers();
  }, [getApprovedTeachers, refParam, setValue, toast]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'country') {
        const code = countryCodes[value.country || 'India'] || "+91 ";
        const currentM = form.getValues('mobileNo');
        if (!currentM || Object.values(countryCodes).some(c => currentM === c)) setValue('mobileNo', code);
        const currentW = form.getValues('whatsappNo');
        if (!currentW || Object.values(countryCodes).some(c => currentW === c)) setValue('whatsappNo', code);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue, form]);
  
  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
      router.push('/profile');
    } catch (e: any) {
      toast({ title: 'Sign-up Failed', description: e.message, variant: "destructive" });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const signupData: SignupData = { ...values, profilePhoto: croppedImageFile };
      await signup(signupData);
      await sendVerificationEmail();
      toast({ title: "Account Created", description: "Verification email sent. Please check your inbox." });
      router.push('/dashboard');
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

  const selectAvatar = async (url: string) => {
    const highResUrl = url.replace('size=64', 'size=256');
    const response = await fetch(highResUrl);
    const blob = await response.blob();
    const file = new File([blob], 'avatar.svg', { type: 'image/svg+xml' });
    setCroppedImageFile(file);
    setAvatarPreview(highResUrl);
    setIsAvatarGalleryOpen(false);
  };

  if (isLoading || (user && profile)) {
    return <div className="p-20 text-center font-bold">Redirecting...</div>;
  }

  return (
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

               <div className="space-y-6">
                 <div className="flex items-center gap-2 text-primary border-b pb-2">
                    <User className="w-5 h-5" />
                    <h3 className="text-xl font-headline font-bold uppercase tracking-tight">Personal Details</h3>
                 </div>
                 
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
                      <FormField control={form.control} name="schoolName" render={({ field }) => (
                          <FormItem><FormLabel>School Name *</FormLabel><FormControl><Input placeholder="Enter your school name" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="grade" render={({ field }) => (
                          <FormItem><FormLabel>Grade/Std. *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger></FormControl><SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                      )} />
                    </div>
                  )}

                  {selectedRole === 'student' && (
                    <FormField control={form.control} name="teacherId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Assigned Teacher *
                          {refParam && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          disabled={!!refParam}
                        >
                          <FormControl><SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="unassigned">Direct Registration (None)</SelectItem>
                            {teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.firstName} {t.surname}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        {refParam && <p className="text-[10px] font-bold text-primary uppercase">Locked by referral code</p>}
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
               </div>

                <h3 className="text-lg font-medium pt-4 border-b">Residential Address</h3>
                <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{majorCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel>
                    {selectedCountry === 'India' ? (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="State" /></SelectTrigger></FormControl>
                        <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : (<FormControl><Input {...field} /></FormControl>)}
                  <FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="addressLine1" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your full address (House No, Street, Landmark...)" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <h3 className="text-lg font-medium pt-4 border-b">Contact & Login</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="mobileNo" render={({ field }) => (<FormItem><FormLabel>Mobile No. *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="whatsappNo" render={({ field }) => (<FormItem><FormLabel>WhatsApp No. *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20"><AvatarImage src={avatarPreview || ''} /><AvatarFallback>{watch('firstName')?.[0]}</AvatarFallback></Avatar>
                  <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2"><Camera className="w-4 h-4"/> Choose Photo</Button>
                    <Button type="button" variant="ghost" onClick={() => setIsAvatarGalleryOpen(true)} className="flex items-center gap-2 text-primary"><Sparkles className="w-4 h-4"/> Use Avatar Hub</Button>
                  </div>
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

      <Dialog open={isAvatarGalleryOpen} onOpenChange={setIsAvatarGalleryOpen}>
        <DialogContent className="max-w-2xl max-h-[70vh] rounded-[2.5rem] border-none shadow-2xl flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-8 bg-slate-900 text-white shrink-0 flex flex-row items-center justify-between">
            <div><DialogTitle className="text-3xl font-black uppercase tracking-tighter">Avatar Hub</DialogTitle><p className="text-slate-400 font-bold text-xs mt-1">Over 1,600 unique characters to choose from.</p></div>
            <Button variant="ghost" size="icon" onClick={() => setIsAvatarGalleryOpen(false)} className="rounded-full text-white/40 hover:text-white hover:bg-white/10"><X className="w-6 h-6"/></Button>
          </DialogHeader>
          
          <Tabs defaultValue="avataaars" className="flex-1 flex flex-col min-h-0 bg-slate-50">
            <TabsList className="bg-slate-900 border-t border-white/5 p-1 h-auto flex flex-wrap justify-center gap-1 shrink-0">
              {AVATAR_STYLES.map(style => (
                <TabsTrigger key={style.id} value={style.id} className="text-[9px] font-black uppercase px-3 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-white/50">{style.label}</TabsTrigger>
              ))}
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              {AVATAR_STYLES.map(style => (
                <TabsContent key={style.id} value={style.id} className="h-full m-0 p-4 outline-none">
                  <ScrollArea className="h-full">
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 pb-8">
                      {Array.from({ length: style.total }).map((_, i) => {
                        const url = `https://api.dicebear.com/7.x/${style.id}/svg?seed=${style.id}-${i}&size=64`;
                        return (
                          <button type="button" key={i} onClick={() => selectAvatar(url)} className="relative aspect-square group rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-sm bg-white hover:shadow-lg active:scale-95">
                            <img src={url} alt={style.label} className="w-full h-full object-cover p-1" loading="lazy" />
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SignupPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/signup_bg.jpg?alt=media');
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
