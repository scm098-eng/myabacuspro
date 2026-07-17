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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CalendarIcon, Camera, Edit, BadgeCheck, ShieldAlert, User, Image as ImageIcon } from 'lucide-react';
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
const grades = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th"];
const majorCountries = ["India", "United States", "United Kingdom", "United Arab Emirates", "Australia", "Canada", "Singapore", "Malaysia", "Japan", "Germany", "France", "Other"];

const AVATAR_OPTIONS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Leo",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Ruby",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Finn",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Willow"
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

const profileSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  middleName: z.string().optional(),
  surname: z.string().min(1, { message: "Surname is required." }),
  dob: z.date({ required_error: "A date of birth is required." }),
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
  teacherId: z.string().min(1, { message: "Teacher assignment is required." }),
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

const ReadOnlyField = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (<div className="space-y-2"><Label className="text-muted-foreground">{label}</Label><div className="p-2 border-b font-bold">{value}</div></div>);
};

export default function ProfilePage() {
  usePageBackground('https://firebasestorage.googleapis.com/v0/b/abacusace-mmnqw.appspot.com/o/profile_bg.jpg?alt=media');
  const router = useRouter();
  const { user, profile, isLoading, getApprovedTeachers, fetchProfile, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<ProfileData[]>([]);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isAvatarGalleryOpen, setIsAvatarGalleryOpen] = useState(false);
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
      firstName: '', middleName: '', surname: '', country: 'India', addressLine1: '', city: '', 
      taluka: '', district: '', state: '', pincode: '', schoolName: '', mobileNo: '', whatsappNo: '', grade: '', teacherId: '',
      instituteName: '', instituteCountry: 'India', instituteAddressLine1: '', instituteCity: '', instituteTaluka: '', instituteDistrict: '', instituteState: '', institutePincode: ''
    },
  });

  const { watch, setValue: setFormValue } = form;
  const dobValue = watch('dob');
  const age = calculateAge(dobValue);

  const isProfileEmpty = profile && !profile.grade && !profile.schoolName;

  useEffect(() => {
    if (isProfileEmpty && !isEditing) {
      setIsEditing(true);
    }
  }, [isProfileEmpty, isEditing]);

  const fetchTeachers = useCallback(async () => {
    if (profile?.role === 'student') {
      try {
        const approvedTeachers = await getApprovedTeachers();
        setTeachers(approvedTeachers);
      } catch (error) { setTeachers([]); }
    }
  }, [getApprovedTeachers, profile?.role]);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (profile) fetchTeachers();
  }, [profile, fetchTeachers]);
  
  useEffect(() => {
    if (profile && (teachers.length > 0 || profile.role !== 'student')) {
      form.reset({
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        surname: profile.surname || '',
        dob: profile.dob ? new Date(profile.dob) : new Date(),
        country: profile.country || 'India',
        addressLine1: profile.addressLine1 || '',
        city: profile.city || '',
        taluka: profile.taluka || '',
        district: profile.district || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        schoolName: profile.schoolName || '',
        grade: profile.grade || '',
        mobileNo: profile.mobileNo || '',
        whatsappNo: profile.whatsappNo || '',
        teacherId: profile.teacherId || '',
        instituteName: profile.instituteName || '',
        instituteCountry: profile.instituteCountry || 'India',
        instituteAddressLine1: profile.instituteAddressLine1 || '',
        instituteCity: profile.instituteCity || '',
        instituteTaluka: profile.instituteTaluka || '',
        instituteDistrict: profile.instituteDistrict || '',
        instituteState: profile.instituteState || '',
        institutePincode: profile.institutePincode || '',
      });
      if(profile.profilePhoto) setAvatarPreview(profile.profilePhoto);
    }
  }, [profile, teachers, form]);
  
  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const payload: UpdateProfilePayload = { ...values, dob: values.dob.toISOString() };
      
      if (croppedImageFile) {
        payload.profilePhoto = croppedImageFile;
      } else if (avatarPreview && avatarPreview.startsWith('http')) {
        // If it's a selected avatar URL, we need to pass it differently
        // but for now let's assume it's handled by the avatarPreview state
        // In a real app, you might want to fetch the image and convert it to a file
      }

      await updateUserProfile(user.uid, payload);
      await fetchProfile(user); 
      toast({ title: "Profile Updated", description: "Your details have been saved successfully." });
      setIsEditing(false);
      if (isProfileEmpty) {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally { setIsSubmitting(false); }
  }

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
    const response = await fetch(url);
    const blob = await response.blob();
    const file = new File([blob], 'avatar.svg', { type: 'image/svg+xml' });
    setCroppedImageFile(file);
    setAvatarPreview(url);
    setIsAvatarGalleryOpen(false);
  };

  const handleCancelEdit = () => {
      if (isProfileEmpty) {
        toast({ title: "Profile Incomplete", description: "Please fulfill your profile details to continue.", variant: "destructive" });
        return;
      }
      setIsEditing(false);
  }

  if (isLoading || !user || !profile || (profile.role === 'student' && teachers.length === 0)) return <div className="max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div>;

  const currentDisplayName = `${watch('firstName')} ${watch('surname')}`;
  const isStudentWithoutTeacher = profile.role === 'student' && (!watch('teacherId') || watch('teacherId') === 'unassigned');
  const teacherObj = teachers.find(t => t.uid === watch('teacherId'));
  const teacherName = teacherObj ? `${teacherObj.firstName} ${teacherObj.surname}` : 'Not Assigned';
  const roleName = profile.role === 'teacher' ? 'teacher' : 'student';

  return (
    <>
    <div className="max-w-4xl mx-auto pb-12">
      <Card className="shadow-lg rounded-[2rem] border-none overflow-hidden">
        <CardHeader className="bg-muted/30 p-8">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-2 font-headline">
                        My Profile
                        {profile.emailVerified ? <BadgeCheck className="w-8 h-8 text-green-500" /> : <ShieldAlert className="w-8 h-8 text-orange-500" />}
                    </CardTitle>
                    <CardDescription className="text-sm font-bold mt-1">
                      {isProfileEmpty ? `Welcome! Please complete your ${roleName} profile details first.` : (profile.emailVerified ? 'Verified Account' : 'Action Required: Verification Pending')}
                    </CardDescription>
                </div>
                {!isEditing && !isProfileEmpty && <Button onClick={() => setIsEditing(true)} className="rounded-xl font-bold h-11 px-6"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>}
            </div>
        </CardHeader>
        <CardContent className="p-8">
            {isStudentWithoutTeacher && <Alert variant="destructive" className="mb-6 rounded-2xl border-2"><ShieldAlert className="h-4 w-4" /><AlertTitle className="font-bold">Action Required</AlertTitle><AlertDescription className="font-medium">Please select a teacher to complete your profile.</AlertDescription></Alert>}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col sm:flex-row items-center gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="relative group">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                              <AvatarImage src={avatarPreview || ''} />
                              <AvatarFallback className="text-3xl font-black">{watch('firstName')?.[0]}</AvatarFallback>
                            </Avatar>
                            {isEditing && (
                              <div className="absolute -bottom-2 -right-2 flex flex-col gap-1">
                                <Button type="button" size="icon" variant="outline" className="rounded-full bg-white shadow-lg border-2" onClick={() => fileInputRef.current?.click()}><Camera className="h-5 w-5"/></Button>
                                <Button type="button" size="icon" variant="outline" className="rounded-full bg-white shadow-lg border-2" onClick={() => setIsAvatarGalleryOpen(true)}><ImageIcon className="h-5 w-5"/></Button>
                              </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                        </div>
                        <div className="text-center sm:text-left space-y-1">
                          <h2 className="text-3xl font-black uppercase tracking-tight italic">{currentDisplayName}</h2>
                          <p className="text-slate-500 font-bold">{user.email}</p>
                          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4">{profile.role}</Badge>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 text-primary border-b-2 pb-2 border-primary/10">
                        <User className="w-5 h-5" />
                        <h3 className="text-xl font-headline font-black uppercase tracking-tight">
                          {profile.role === 'teacher' ? 'Staff Details' : 'Student Details'}
                        </h3>
                      </div>

                      {isEditing ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">First Name *</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Middle Name</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="surname" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Surname *</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField control={form.control} name="dob" render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date of Birth *</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full h-11 justify-between text-left font-bold rounded-xl border-2", !field.value && "text-muted-foreground")}>
                                            <span>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</span>
                                            <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden" align="start">
                                            <Calendar mode="single" captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                        </PopoverContent>
                                      </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                               <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Calculated Age</Label><Input value={age !== null ? `${age} years old` : 'Select DOB'} disabled className="h-11 rounded-xl border-2 bg-slate-50 font-bold" /></div>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ReadOnlyField label="Full Name" value={currentDisplayName} />
                          <ReadOnlyField label="Age" value={age ? `${age} years` : 'Not set'} />
                        </div>
                      )}
                      
                      {profile.role === 'student' && (
                        isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <FormField control={form.control} name="teacherId" render={({ field }) => (
                                      <FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assigned Teacher *</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-11 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl">
                                          <SelectItem value="unassigned">Direct Entry (None)</SelectItem>
                                          {teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.firstName} {t.surname}</SelectItem>)}
                                      </SelectContent></Select><FormMessage /></FormItem>
                                  )} />
                                <FormField control={form.control} name="grade" render={({ field }) => (
                                    <FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Grade/Std. *</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-11 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl">{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                            </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Academy / Teacher" value={teacherName} />
                            <ReadOnlyField label="Grade/Std." value={watch('grade')} />
                          </div>
                        )
                      )}

                      {isEditing && profile.role === 'student' && (
                        <FormField control={form.control} name="schoolName" render={({ field }) => (
                            <FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">School Name *</FormLabel><FormControl><Input placeholder="Name of your school" {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>
                        )} />
                      )}

                      {!isEditing && profile.role === 'student' && <ReadOnlyField label="School Name" value={watch('schoolName')} />}
                    </div>

                    {isEditing ? (
                      <>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground pt-4 border-b pb-2">Location & Address</h3>
                        <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Country *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-11 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-xl">{majorCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">State</FormLabel>
                              {watch('country') === 'India' ? (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl><SelectTrigger className="h-11 rounded-xl border-2 font-bold"><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent className="rounded-xl max-h-60 overflow-y-auto">{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                              ) : (
                                <FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl>
                              )}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">City *</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="addressLine1" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Address *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your full house address..." {...field} rows={3} className="rounded-2xl border-2 font-bold p-4" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground pt-4 border-b pb-2">Contact Channels</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="mobileNo" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mobile No. *</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="whatsappNo" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground">WhatsApp No. *</FormLabel><FormControl><Input {...field} className="h-11 rounded-xl border-2 font-bold" /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                      </>
                    ) : <ReadOnlyField label="Full Address" value={`${watch('addressLine1') || ''}, ${watch('city') || ''}, ${watch('state') || ''}, ${watch('country') || ''}`} />}

                    {isEditing && (
                        <div className="flex justify-end gap-4 pt-8">
                            {!isProfileEmpty && <Button type="button" variant="ghost" onClick={handleCancelEdit} className="h-12 px-8 font-bold">Cancel</Button>}
                            <Button type="submit" disabled={isSubmitting} className="h-14 px-10 text-lg font-black uppercase tracking-widest rounded-2xl shadow-xl">
                              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldAlert className="mr-2 h-5 w-5" />}
                              Save & Secure Profile
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>

    <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md rounded-[2rem]">
            <DialogHeader><DialogTitle className="font-black uppercase tracking-tight">Crop Profile Photo</DialogTitle></DialogHeader>
            <div className="flex justify-center p-4">
                {imgSrc && <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop><img ref={imgRef} src={imgSrc} alt="Crop" className="max-h-[60vh] rounded-lg" /></ReactCrop>}
            </div>
             <DialogFooter className="p-4"><Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)} className="rounded-xl">Cancel</Button><Button onClick={handleCropConfirm} className="rounded-xl">Set as Profile Photo</Button></DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog open={isAvatarGalleryOpen} onOpenChange={setIsAvatarGalleryOpen}>
      <DialogContent className="max-w-2xl rounded-[2.5rem]">
        <DialogHeader><DialogTitle className="text-2xl font-black uppercase tracking-tight text-center">Avatar Gallery</DialogTitle></DialogHeader>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 p-6">
          {AVATAR_OPTIONS.map((url, i) => (
            <button key={i} onClick={() => selectAvatar(url)} className="relative group rounded-full overflow-hidden border-4 border-transparent hover:border-primary transition-all shadow-md hover:shadow-xl">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={url} />
                <AvatarFallback>AV</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}