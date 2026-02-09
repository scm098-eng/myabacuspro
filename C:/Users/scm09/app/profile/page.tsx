
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2, CalendarIcon, Camera, Edit, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import type { ProfileData, UpdateProfilePayload } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  middleName: z.string().optional(),
  surname: z.string().min(1, { message: "Surname is required." }),
  dob: z.date({ required_error: "A date of birth is required." }),
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
  teacherId: z.string().optional(),
  instituteName: z.string().optional(),
  instituteCountry: z.string().optional(),
  instituteAddressLine1: z.string().optional(),
  instituteCity: z.string().optional(),
  instituteTaluka: z.string().optional(),
  instituteDistrict: z.string().optional(),
  instituteState: z.string().optional(),
  institutePincode: z.string().optional(),
});


function calculateAge(dob: Date | undefined) {
  if (!dob) return null;
  const diff_ms = Date.now() - dob.getTime();
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

const ReadOnlyField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <Label className="text-muted-foreground">{label}</Label>
      <div className="p-2 border-b">{value}</div>
    </div>
  );
};


export default function ProfilePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/profile_bg.jpg?alt=media&token=c4d5e6f7-g8h9-i0j1-k2l3-m4n5o6p7q8r9');
  const router = useRouter();
  const { user, profile, isLoading, getApprovedTeachers, fetchProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
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

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '', middleName: '', surname: '',
      country: 'India', addressLine1: '', city: '', taluka: '', district: '', state: '', pincode: '',
      schoolName: '', mobileNo: '', whatsappNo: '', grade: '', teacherId: '',
      instituteName: '', instituteCountry: 'India', instituteAddressLine1: '', instituteCity: '', instituteTaluka: '', instituteDistrict: '', instituteState: '', institutePincode: ''
    },
  });

  const fetchTeachers = useCallback(async () => {
    if (profile?.role === 'student') {
      try {
        const approvedTeachers = await getApprovedTeachers();
        setTeachers(approvedTeachers);
      } catch (error) {
        console.error("Failed to fetch teachers", error);
        setTeachers([]);
      }
    }
  }, [getApprovedTeachers, profile?.role]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (profile) {
      fetchTeachers();
    }
  }, [profile, fetchTeachers]);
  
  useEffect(() => {
    if (profile && (teachers.length > 0 || profile.role !== 'student')) {
      form.reset({
        ...profile,
        dob: profile.dob ? new Date(profile.dob) : new Date(),
        grade: profile.grade || '',
        teacherId: profile.teacherId || '',
        country: profile.country || 'India',
        state: profile.state || '',
        instituteCountry: profile.instituteCountry || 'India',
        instituteState: profile.instituteState || ''
      });
      if(profile.profilePhoto) {
        setAvatarPreview(profile.profilePhoto);
      }
    }
  }, [profile, teachers, form]);
  
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) {
      toast({ title: "Not Authenticated", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateProfilePayload = {
        ...values,
        dob: values.dob.toISOString(),
      };

      if (croppedImageFile) {
        payload.profilePhoto = croppedImageFile;
      }

      await updateUserProfile(user.uid, payload);
      
      await fetchProfile(user); 

      toast({ title: "Profile Updated", description: "Your information has been saved successfully." });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Update failed:', error);
      toast({ title: "Update Failed", description: error.message || "Could not update your profile. Please check the console for details.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

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
      toast({ title: "Photo Ready", description: "Photo cropped successfully. It will be saved when you save your changes." });
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
  
  const handleCancelEdit = () => {
      if (profile) {
        form.reset({
            ...profile,
            dob: profile.dob ? new Date(profile.dob) : new Date(),
            grade: profile.grade || '',
            teacherId: profile.teacherId || '',
            country: profile.country || 'India',
            state: profile.state || '',
            instituteCountry: profile.instituteCountry || 'India',
            instituteState: profile.instituteState || ''
        });
      }
      setIsEditing(false);
  }

  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);


  const { watch } = form;
  const dob = watch('dob');
  const age = calculateAge(dob);
  const firstName = watch('firstName');
  const surname = watch('surname');

  const isStudentRole = profile?.role === 'student';
  const isTeacherListLoading = isStudentRole && teachers.length === 0;

  if (isLoading || !user || !profile || isTeacherListLoading) {
    return (
       <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4">
             <Skeleton className="h-24 w-24 rounded-full" />
             <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
             </div>
          </CardHeader>
          <CardContent className="space-y-4 mt-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
             <Skeleton className="h-20 w-full" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
             <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
       </div>
    );
  }
  
  const displayName = (firstName && surname) ? `${firstName} ${surname}` : user.displayName || 'User';
  const displayInitial = (firstName && surname) 
    ? (firstName?.[0] || '') + (surname?.[0] || '') 
    : user.email?.charAt(0).toUpperCase() || 'U';

  const isStudentWithoutTeacher = profile.role === 'student' && !watch('teacherId');
  const disableTeacherSelect = profile.role === 'teacher' || profile.role === 'admin';
  const teacherName = teachers.find(t => t.uid === watch('teacherId'))?.firstName + ' ' + teachers.find(t => t.uid === watch('teacherId'))?.surname || 'Not Assigned';
  const fullResidentialAddress = [watch('addressLine1'), watch('city'), watch('taluka'), watch('district'), watch('state'), watch('pincode'), watch('country')].filter(Boolean).join(', ');
  const fullInstituteAddress = [watch('instituteAddressLine1'), watch('instituteCity'), watch('instituteTaluka'), watch('instituteDistrict'), watch('instituteState'), watch('institutePincode'), watch('instituteCountry')].filter(Boolean).join(', ');

  return (
    <>
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl font-headline">My Profile</CardTitle>
                    <CardDescription>View and edit your personal information.</CardDescription>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            {isStudentWithoutTeacher && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                        Please select a teacher from the list below to complete your profile and access all features.
                    </AlertDescription>
                </Alert>
            )}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-primary/20">
                                <AvatarImage src={avatarPreview || ''} alt={displayName} />
                                <AvatarFallback className="text-3xl">{displayInitial}</AvatarFallback>
                            </Avatar>
                            {isEditing && (
                                <>
                                    <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                                    <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current?.click()}>
                                        <Camera className="h-5 w-5"/>
                                    </Button>
                                </>
                            )}
                        </div>
                        <div className="text-center sm:text-left">
                            <h2 className="text-2xl font-bold">{displayName}</h2>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name *</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="middleName" render={({ field }) => ( <FormItem> <FormLabel>Middle Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="surname" render={({ field }) => ( <FormItem> <FormLabel>Surname *</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField
                              control={form.control}
                              name="dob"
                              render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date of Birth *</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant={"outline"}
                                          className={cn( "w-full justify-start text-left font-normal", !field.value && "text-muted-foreground" )}
                                        >
                                           <div className="flex w-full items-center justify-between">
                                            <span>
                                              {field.value ? ( format(field.value, "PPP") ) : ( "Pick a date" )}
                                            </span>
                                            <CalendarIcon className="h-4 w-4 opacity-50" />
                                           </div>
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                          mode="single"
                                          captionLayout="dropdown-buttons"
                                          fromYear={1950}
                                          toYear={new Date().getFullYear()}
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                          initialFocus
                                          />
                                      </PopoverContent>
                                    </Popover>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                             <div className="space-y-2">
                                 <Label>Age</Label>
                                 <Input value={age !== null ? `${age} years old` : 'Select DOB to calculate'} disabled />
                             </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ReadOnlyField label="First Name" value={watch('firstName')} />
                            <ReadOnlyField label="Middle Name" value={watch('middleName')} />
                            <ReadOnlyField label="Surname" value={watch('surname')} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Date of Birth" value={dob ? format(dob, "PPP") : 'Not set'} />
                            <ReadOnlyField label="Age" value={age !== null ? `${age} years old` : 'Not set'} />
                        </div>
                      </>
                    )}
                    
                    {isEditing ? (
                        <FormField
                            control={form.control}
                            name="teacherId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned Teacher *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={disableTeacherSelect}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a teacher" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="" disabled={profile.role === 'student'}>
                                                {profile.role === 'student' ? 'Select a teacher' : 'Not Applicable'}
                                            </SelectItem>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.uid} value={teacher.uid}>
                                                    {`${teacher.firstName} ${teacher.surname}`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : (
                        <ReadOnlyField label="Assigned Teacher" value={teacherName} />
                    )}

                    {profile.role === 'student' && (
                        isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="schoolName" render={({ field }) => ( <FormItem> <FormLabel>School Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                                <FormField control={form.control} name="grade" render={({ field }) => ( <FormItem> <FormLabel>Grade/Std.</FormLabel> <FormControl><Input placeholder="e.g. 5th" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReadOnlyField label="School Name" value={watch('schoolName')} />
                                <ReadOnlyField label="Grade/Std." value={watch('grade')} />
                            </div>
                        )
                    )}
                    {profile.role === 'teacher' && (
                      isEditing ? (
                      <>
                        <FormField control={form.control} name="instituteName" render={({ field }) => (<FormItem><FormLabel>Name of Institute</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <h3 className="text-lg font-medium pt-4 border-b">Institute Address</h3>
                        <FormField
                            control={form.control}
                            name="instituteCountry"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Country</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || 'India'}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a country" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="India">India</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                          control={form.control}
                          name="instituteState"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Select a state</SelectItem>
                                  {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="instituteDistrict" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="instituteTaluka" render={({ field }) => (<FormItem><FormLabel>Taluka / Tehsil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="instituteCity" render={({ field }) => (<FormItem><FormLabel>City / Town</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="institutePincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="instituteAddressLine1" render={({ field }) => (<FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="House No, Street, Area" {...field} /></FormControl><FormMessage /></FormItem>)} />
                      </>
                      ) : (
                          <>
                            <ReadOnlyField label="Name of Institute" value={watch('instituteName')} />
                            <h3 className="text-lg font-medium pt-4 border-b">Institute Address</h3>
                            <ReadOnlyField label="Address" value={fullInstituteAddress} />
                          </>
                      )
                    )}

                    <h3 className="text-lg font-medium pt-4 border-b">Residential Address</h3>
                     {isEditing ? (
                        <>
                            <FormField
                                control={form.control}
                                name="country"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || 'India'}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                        <SelectItem value="India">India</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>State</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a state" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="">Select a state</SelectItem>
                                      {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField control={form.control} name="district" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="taluka" render={({ field }) => (<FormItem><FormLabel>Taluka / Tehsil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City / Town</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField control={form.control} name="addressLine1" render={({ field }) => (<FormItem><FormLabel>Address Line 1</FormLabel><FormControl><Input placeholder="House No, Street, Area" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </>
                     ) : (
                        <ReadOnlyField label="Address" value={fullResidentialAddress} />
                     )}

                    <h3 className="text-lg font-medium pt-4 border-b">Contact Details</h3>
                     {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="mobileNo" render={({ field }) => ( <FormItem> <FormLabel>Mobile No.</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                            <FormField control={form.control} name="whatsappNo" render={({ field }) => ( <FormItem> <FormLabel>WhatsApp No. (Optional)</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                         </div>
                     ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Mobile No." value={watch('mobileNo')} />
                            <ReadOnlyField label="WhatsApp No." value={watch('whatsappNo')} />
                        </div>
                     )}

                    {isEditing && (
                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>
                               <X className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                               {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               Save Changes
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
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

    