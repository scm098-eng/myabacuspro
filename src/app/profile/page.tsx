
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
import { Loader2, CalendarIcon, Camera, Edit, X, BadgeCheck, ShieldAlert } from 'lucide-react';
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
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  schoolName: z.string().optional(),
  grade: z.string().optional(),
  mobileNo: z.string().min(5, { message: "Mobile number is required." }),
  whatsappNo: z.string().min(5, { message: "WhatsApp number is required." }),
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
  return (<div className="space-y-2"><Label className="text-muted-foreground">{label}</Label><div className="p-2 border-b">{value}</div></div>);
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

  const { watch, setValue } = form;
  const dobValue = watch('dob');
  const age = calculateAge(dobValue);
  const selectedCountry = watch('country');
  const selectedInstCountry = watch('instituteCountry');

  useEffect(() => {
    if (isEditing) {
      const subscription = watch((value, { name }) => {
        if (name === 'country') {
          const code = countryCodes[value?.country || 'India'] || "+91 ";
          const currentM = form.getValues('mobileNo');
          if (!currentM || Object.values(countryCodes).some(c => currentM === c)) setValue('mobileNo', code);
          const currentW = form.getValues('whatsappNo');
          if (!currentW || Object.values(countryCodes).some(c => currentW === c)) setValue('whatsappNo', code);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, setValue, isEditing, form]);

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
      if (croppedImageFile) payload.profilePhoto = croppedImageFile;
      await updateUserProfile(user.uid, payload);
      await fetchProfile(user); 
      toast({ title: "Profile Updated" });
      setIsEditing(false);
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

  const handleCancelEdit = () => {
      if (profile) {
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
      }
      setIsEditing(false);
  }

  if (isLoading || !user || !profile || (profile.role === 'student' && teachers.length === 0)) return <div className="max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div>;

  const currentDisplayName = `${watch('firstName')} ${watch('surname')}`;
  const isStudentWithoutTeacher = profile.role === 'student' && (!watch('teacherId') || watch('teacherId') === 'unassigned');
  const teacherObj = teachers.find(t => t.uid === watch('teacherId'));
  const teacherName = teacherObj ? `${teacherObj.firstName} ${teacherObj.surname}` : 'Not Assigned';

  return (
    <>
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-3xl font-headline flex items-center gap-2">
                        My Profile
                        {profile.emailVerified ? <BadgeCheck className="w-6 h-6 text-green-500" /> : <ShieldAlert className="w-6 h-6 text-orange-500" />}
                    </CardTitle>
                    <CardDescription>{profile.emailVerified ? 'Verified Account' : 'Action Required: Verification Pending'}</CardDescription>
                </div>
                {!isEditing && <Button onClick={() => setIsEditing(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>}
            </div>
        </CardHeader>
        <CardContent>
            {isStudentWithoutTeacher && <Alert variant="destructive" className="mb-6"><AlertTitle>Action Required</AlertTitle><AlertDescription>Please select a teacher to complete your profile.</AlertDescription></Alert>}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-primary/20"><AvatarImage src={avatarPreview || ''} /><AvatarFallback>{watch('firstName')?.[0]}</AvatarFallback></Avatar>
                            {isEditing && <Button type="button" size="icon" variant="outline" className="absolute bottom-0 right-0 rounded-full" onClick={() => fileInputRef.current?.click()}><Camera className="h-5 w-5"/></Button>}
                            <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                        </div>
                        <div><h2 className="text-2xl font-bold">{currentDisplayName}</h2><p className="text-muted-foreground">{user.email}</p></div>
                    </div>
                    
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel>Middle Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="surname" render={({ field }) => (<FormItem><FormLabel>Surname *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField control={form.control} name="dob" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel>Date of Birth *</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full justify-between text-left font-normal", !field.value && "text-muted-foreground")}>
                                          <span>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</span>
                                          <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar mode="single" captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                      </PopoverContent>
                                    </Popover>
                                  <FormMessage />
                                </FormItem>
                              )} />
                             <div className="space-y-2"><Label>Age</Label><Input value={age !== null ? `${age} years old` : 'Select DOB'} disabled /></div>
                        </div>
                      </>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReadOnlyField label="Full Name" value={currentDisplayName} />
                        <ReadOnlyField label="Age" value={age ? `${age} years` : 'Not set'} />
                      </div>
                    )}
                    
                    {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="teacherId" render={({ field }) => (
                                  <FormItem><FormLabel>Assigned Teacher *</FormLabel><Select onValueChange={field.onChange} value={field.value || ''} disabled={profile.role !== 'student'}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                      <SelectItem value="unassigned">None</SelectItem>
                                      {teachers.map(t => <SelectItem key={t.uid} value={t.uid}>{t.firstName} {t.surname}</SelectItem>)}
                                  </SelectContent></Select><FormMessage /></FormItem>
                              )} />
                          {profile.role === 'student' && (
                            <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem><FormLabel>Grade/Std.</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                            )} />
                          )}
                        </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ReadOnlyField label="Teacher" value={teacherName} />
                        {profile.role === 'student' && <ReadOnlyField label="Grade/Std." value={watch('grade')} />}
                      </div>
                    )}

                    {isEditing && profile.role === 'student' && (
                      <FormField control={form.control} name="schoolName" render={({ field }) => (
                          <FormItem><FormLabel>School Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    )}

                    {!isEditing && profile.role === 'student' && <ReadOnlyField label="School Name" value={watch('schoolName')} />}

                    {isEditing ? (
                      <>
                        <h3 className="text-lg font-medium pt-4 border-b">Residential Address</h3>
                        <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{majorCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="state" render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              {watch('country') === 'India' ? (
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                  <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                              ) : (
                                <FormControl><Input {...field} /></FormControl>
                              )}
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="addressLine1" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter your full address (House No, Street, Landmark...)" {...field} rows={3} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <h3 className="text-lg font-medium pt-4 border-b">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="mobileNo" render={({ field }) => (<FormItem><FormLabel>Mobile No. *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                          <FormField control={form.control} name="whatsappNo" render={({ field }) => (<FormItem><FormLabel>WhatsApp No. *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                      </>
                    ) : <ReadOnlyField label="Address" value={`${watch('addressLine1') || ''}, ${watch('city') || ''}, ${watch('state') || ''}, ${watch('country') || ''}`} />}

                    {profile.role === 'teacher' && (
                      isEditing ? (
                      <>
                        <FormField control={form.control} name="instituteName" render={({ field }) => (<FormItem><FormLabel>Name of Institute</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        <h3 className="text-lg font-medium pt-4 border-b">Institute Address</h3>
                        <FormField control={form.control} name="instituteCountry" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><Select onValueChange={field.onChange} value={field.value || 'India'}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{majorCountries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="instituteState" render={({ field }) => ( 
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            {watch('instituteCountry') === 'India' ? (
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                              </Select>
                            ) : (
                              <FormControl><Input {...field} /></FormControl>
                            )}
                            <FormMessage />
                          </FormItem> 
                        )} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="instituteDistrict" render={({ field }) => (<FormItem><FormLabel>District</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="instituteTaluka" render={({ field }) => (<FormItem><FormLabel>Taluka / Tehsil</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField control={form.control} name="instituteCity" render={({ field }) => (<FormItem><FormLabel>City / Town</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="institutePincode" render={({ field }) => (<FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="instituteAddressLine1" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institute Address</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter institute address" {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </>
                      ) : (
                          <>
                            <ReadOnlyField label="Name of Institute" value={watch('instituteName')} />
                            <h3 className="text-lg font-medium pt-4 border-b">Institute Address</h3>
                            <ReadOnlyField label="Address" value={`${watch('instituteAddressLine1') || ''}, ${watch('instituteCity') || ''}, ${watch('instituteState') || ''}, ${watch('instituteCountry') || ''}`} />
                          </>
                      )
                    )}

                    {isEditing && (
                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes</Button>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
    <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Crop Photo</DialogTitle></DialogHeader>
            <div className="flex justify-center">
                {imgSrc && <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop><img ref={imgRef} src={imgSrc} alt="Crop" style={{ maxHeight: "60vh" }} /></ReactCrop>}
            </div>
             <DialogFooter><Button variant="outline" onClick={() => setIsPhotoDialogOpen(false)}>Cancel</Button><Button onClick={handleCropConfirm}>Use Photo</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
