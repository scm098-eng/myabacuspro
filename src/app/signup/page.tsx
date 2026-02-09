
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
import type { SignupData, ProfileData, UserRole } from '@/types';
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

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  middleName: z.string().optional(),
  surname: z.string().min(1, { message: "Surname is required." }),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "A valid date of birth is required." }),
  country: z.string().optional(),
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
  instituteName: z.string().optional(),
  instituteCountry: z.string().optional(),
  instituteAddressLine1: z.string().optional(),
  instituteCity: z.string().optional(),
  instituteTaluka: z.string().optional(),
  instituteDistrict: z.string().optional(),
  instituteState: z.string().optional(),
  institutePincode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

function calculateAge(dob: string | undefined) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;

    const diff_ms = Date.now() - birthDate.getTime();
    const age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

async function getCroppedImg(
  image: HTMLImageElement,
  crop: Crop,
  fileName: string = 'cropped-image.jpg'
): Promise<File | null> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx || !crop.width || !crop.height) {
    console.error('Canvas context not available or invalid crop dimensions');
    return null;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  canvas.width = crop.width;
  canvas.height = crop.height;

  const sourceX = crop.x * scaleX;
  const sourceY = crop.y * scaleY;
  const sourceWidth = crop.width * scaleX;
  const sourceHeight = crop.height * scaleY;

  try {
    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas to blob conversion failed');
            reject(new Error('Failed to create blob from canvas'));
            return;
          }
          
          const file = new File([blob], fileName, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(file);
        },
        'image/jpeg',
        0.95
      );
    });
  } catch (error) {
    console.error('Error in getCroppedImg:', error);
    return null;
  }
}


export default function SignupPage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/signup_bg.jpg?alt=media');
  const router = useRouter();
  const { signup, getApprovedTeachers, loginWithGoogle } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      middleName: '',
      surname: '',
      country: 'India',
      addressLine1: '',
      city: '',
      taluka: '',
      district: '',
      state: '',
      pincode: '',
      schoolName: '',
      mobileNo: '',
      whatsappNo: '',
      dob: '',
      grade: '',
      role: 'student',
      instituteName: '',
      instituteCountry: 'India',
      instituteAddressLine1: '',
      instituteCity: '',
      instituteTaluka: '',
      instituteDistrict: '',
      instituteState: '',
      institutePincode: '',
    },
  });

  const { watch } = form;
  const dob = watch('dob');
  const age = calculateAge(dob);
  
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

  async function handleGoogleSignup() {
    try {
      const loggedInProfile = await loginWithGoogle();
      handleRedirect(loggedInProfile);
    } catch (error: any) {
      let description = 'Could not sign up with Google. Please try again.';
      if (error.code === 'auth/account-exists-with-different-credential') {
        description = 'An account with this email already exists. Please log in with your original method.'
      }
      toast({
        title: 'Google Sign-up Failed',
        description: description,
        variant: 'destructive',
      });
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const signupData: SignupData = { 
        ...values, 
        profilePhoto: croppedImageFile || undefined,
      };
      await signup(signupData);
       toast({
        title: 'Signup Successful!',
        description: values.role === 'teacher' 
            ? 'Your application has been submitted. Please wait for admin approval.'
            : 'Welcome aboard! Please complete your profile.',
      });
      router.push(values.role === 'teacher' ? '/' : '/profile');
    } catch (error: any) {
      console.error(error);
      let description = 'Could not create an account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        description = 'This email is already registered. Please log in instead.';
      }
      toast({
        title: 'Sign-up Failed',
        description: description,
        variant: 'destructive',
      });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const selectedRole = form.watch('role');

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive" });
        return;
      }
      setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result?.toString() || '');
        setIsPhotoDialogOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) {
      toast({ title: "Invalid Crop", description: "Please select an area to crop.", variant: "destructive" });
      return;
    }
    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop, `profile-photo-${Date.now()}.jpg`);
      if (!croppedFile) {
        throw new Error('Failed to process the cropped image');
      }
      setCroppedImageFile(croppedFile);
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      const newPreviewUrl = URL.createObjectURL(croppedFile);
      setAvatarPreview(newPreviewUrl);
      setIsPhotoDialogOpen(false);
      setImgSrc('');
      toast({ title: "Photo Ready", description: "Photo cropped successfully. It will be saved when you create your account." });
    } catch (error: any) {
      console.error('Crop error:', error);
      toast({ title: "Crop Failed", description: error.message || "Could not process the image. Please try again.", variant: "destructive" });
    }
  };

  const handleCancelCrop = () => {
    setIsPhotoDialogOpen(false);
    setImgSrc('');
    setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
    setCompletedCrop(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);


  return (
    <>
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Join <span className="text-primary font-semibold">My Abacus Pro</span> to start your journey to mathematical mastery.</CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" className="w-full" onClick={handleGoogleSignup}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" role="img" aria-label="Google logo">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,35.245,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Sign up with Google
            </Button>
             <div className="my-6 flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-sm text-muted-foreground">OR</span>
                <Separator className="flex-1" />
             </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>I am a...</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="student" />
                            </FormControl>
                            <FormLabel className="font-normal">Student</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="teacher" />
                            </FormControl>
                            <FormLabel className="font-normal">Teacher</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl><Input placeholder="First Name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Middle Name</FormLabel>
                            <FormControl><Input placeholder="Middle Name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="surname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Surname *</FormLabel>
                            <FormControl><Input placeholder="Surname" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
               </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="dob"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of Birth *</FormLabel>
                                <FormControl><Input type="date" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-2">
                        <Label>Age</Label>
                        <Input value={age !== null ? `${age} years old` : 'Select DOB to calculate'} disabled />
                    </div>
                </div>


                {selectedRole === 'student' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="schoolName" render={({ field }) => (<FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="School Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      {isMounted && <FormField control={form.control} name="grade" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade/Std.</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a grade" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {grades.map(grade => <SelectItem key={grade} value={grade}>{grade}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />}
                    </div>
                  </>
                )}

                {selectedRole === 'teacher' && (
                  <>
                    <FormField control={form.control} name="instituteName" render={({ field }) => (<FormItem><FormLabel>Name of Institute</FormLabel><FormControl><Input placeholder="Institute Name" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <h3 className="text-lg font-medium pt-4 border-b">Institute Address</h3>
                      <FormField control={form.control} name="instituteCountry" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent><SelectItem value="India">India</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                      <FormField control={form.control} name="instituteState" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="instituteDistrict" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="District" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="instituteTaluka" render={({ field }) => (<FormItem><FormLabel>Taluka / Tehsil</FormLabel><FormControl><Input placeholder="Taluka" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="instituteCity" render={({ field }) => (<FormItem><FormLabel>City / Town</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="institutePincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="Pincode" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    </div>
                     <FormField control={form.control} name="instituteAddressLine1" render={({ field }) => (<FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="House No, Street, Area" {...field} /></FormControl><FormMessage /></FormItem>)} />
                  </>
                )}
                
                <h3 className="text-lg font-medium pt-4 border-b">Residential Address</h3>
                <FormField control={form.control} name="country" render={({ field }) => ( <FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger></FormControl><SelectContent><SelectItem value="India">India</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                <FormField control={form.control} name="state" render={({ field }) => ( <FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input placeholder="District" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="taluka" render={({ field }) => (<FormItem><FormLabel>Taluka / Tehsil</FormLabel><FormControl><Input placeholder="Taluka" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City / Town</FormLabel><FormControl><Input placeholder="City" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="Pincode" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField control={form.control} name="addressLine1" render={({ field }) => (<FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="House No, Street, Area" {...field} /></FormControl><FormMessage /></FormItem>)} />

                <h3 className="text-lg font-medium pt-4 border-b">Contact & Login Details</h3>
                 
                <FormItem>
                  <FormLabel>Profile Photo (Optional)</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={avatarPreview || ''} alt="Avatar Preview" />
                      <AvatarFallback>
                        {(form.getValues('firstName')?.[0] || '') + (form.getValues('surname')?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                       <Camera className="mr-2 h-4 w-4" />
                       Choose Photo
                    </Button>
                  </div>
                   {croppedImageFile && ( <p className="text-sm text-green-600">New photo ready to save</p> )}
                </FormItem>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="mobileNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mobile No.</FormLabel>
                                <FormControl><Input placeholder="Mobile Number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="whatsappNo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>WhatsApp No. (Optional)</FormLabel>
                                <FormControl><Input placeholder="WhatsApp Number" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password *</FormLabel>
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
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Confirm Password *</FormLabel>
                        <FormControl>
                        <div className="relative">
                            <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            {...field}
                            className="pr-10"
                            />
                            <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            >
                            {showConfirmPassword ? (
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
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
                Already have an account? <Link href="/login" className="text-primary hover:underline font-semibold">Log in</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
     <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Crop your new photo</DialogTitle>
            </DialogHeader>
            {imgSrc && (
                <div className="flex justify-center">
                    <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop minWidth={50} minHeight={50} >
                        <img ref={imgRef} src={imgSrc} alt="Crop preview" style={{ maxHeight: "60vh", maxWidth: "100%" }} onLoad={() => { if (imgRef.current) { const { width, height } = imgRef.current; const size = Math.min(width, height) * 0.9; const x = (width - size) / 2; const y = (height - size) / 2; setCrop({ unit: 'px', x, y, width: size, height: size, }); } }} />
                    </ReactCrop>
                </div>
            )}
             <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleCancelCrop}> Cancel </Button>
                <Button onClick={handleCropConfirm} disabled={!completedCrop?.width}> Crop & Use </Button>
             </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
