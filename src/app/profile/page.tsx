'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CalendarIcon, Camera, Edit, BadgeCheck, ShieldAlert, User, Image as ImageIcon, X, ChevronRight, Sparkles } from 'lucide-react';
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
  return (<div className="space-y-2"><Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{label}</Label><div className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-bold">{value}</div></div>);
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
      taluka: '', district: '', state: '', pincode: '', schoolName: '', mobileNo: '', whatsappNo: '', grade: '', teacherId: ''
    },
  });

  const { watch } = form;
  const age = calculateAge(watch('dob'));
  const isProfileEmpty = profile && !profile.grade && !profile.schoolName;

  useEffect(() => {
    if (isProfileEmpty && !isEditing) setIsEditing(true);
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
      if (isProfileEmpty) router.push('/dashboard');
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
    const highResUrl = url.replace('size=64', 'size=256');
    const response = await fetch(highResUrl);
    const blob = await response.blob();
    const file = new File([blob], 'avatar.svg', { type: 'image/svg+xml' });
    setCroppedImageFile(file);
    setAvatarPreview(highResUrl);
    setIsAvatarGalleryOpen(false);
  };

  if (isLoading || !user || !profile) return <div className="max-w-4xl mx-auto"><Skeleton className="h-96 w-full" /></div>;

  const teacherObj = teachers.find(t => t.uid === watch('teacherId'));
  const teacherName = teacherObj ? `${teacherObj.firstName} ${teacherObj.surname}` : 'Not Assigned';

  return (
    <>
    <div className="max-w-4xl mx-auto pb-12 px-4">
      <Card className="shadow-2xl rounded-[2.5rem] border-none overflow-hidden bg-white/90 backdrop-blur-md">
        <CardHeader className="bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                  <div className="relative group">
                      <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                        <AvatarImage src={avatarPreview || ''} />
                        <AvatarFallback className="text-3xl font-black bg-primary text-white">{watch('firstName')?.[0]}</AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                          <Button type="button" size="icon" className="rounded-full bg-primary text-white shadow-xl h-10 w-10 border-2 border-white hover:scale-110 transition-transform" onClick={() => fileInputRef.current?.click()}><Camera className="h-5 w-5"/></Button>
                          <Button type="button" size="icon" variant="outline" className="rounded-full bg-white text-primary shadow-xl h-10 w-10 border-2 border-primary hover:scale-110 transition-transform" onClick={() => setIsAvatarGalleryOpen(true)}><Sparkles className="h-5 w-5"/></Button>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} onChange={onFileSelect} accept="image/*" className="hidden" />
                  </div>
                  <div>
                      <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                        <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1">{profile.role}</Badge>
                        {profile.subscriptionStatus === 'pro' && <Badge className="bg-yellow-400 text-slate-900 border-none font-black text-[10px] uppercase tracking-widest px-4 py-1">PRO MEMBER</Badge>}
                      </div>
                      <CardTitle className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none mb-2">
                          {`${watch('firstName')} ${watch('surname')}`}
                      </CardTitle>
                      <p className="text-slate-400 font-bold text-lg">{user.email}</p>
                  </div>
                </div>
                {!isEditing && !isProfileEmpty && (
                  <Button onClick={() => setIsEditing(true)} className="rounded-[1.2rem] font-black uppercase tracking-widest h-14 px-8 bg-white text-slate-900 hover:bg-slate-100 shadow-xl shrink-0">
                    <Edit className="mr-2 h-5 w-5" /> Edit Profile
                  </Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="p-8 sm:p-12">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 text-primary border-b-2 pb-3 border-primary/10">
                        <User className="w-6 h-6" />
                        <h3 className="text-xl sm:text-2xl font-headline font-black uppercase tracking-tight">Identity Details</h3>
                      </div>

                      {isEditing ? (
                        <div className="grid gap-8">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">First Name *</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl border-2 font-bold text-lg focus:ring-primary shadow-sm" /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="middleName" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Middle Name</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl border-2 font-bold text-lg focus:ring-primary shadow-sm" /></FormControl><FormMessage /></FormItem>)} />
                              <FormField control={form.control} name="surname" render={({ field }) => (<FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Surname *</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl border-2 font-bold text-lg focus:ring-primary shadow-sm" /></FormControl><FormMessage /></FormItem>)} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <FormField control={form.control} name="dob" render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Date of Birth *</FormLabel>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button variant={"outline"} className={cn("w-full h-14 justify-between text-left font-bold rounded-2xl border-2 text-lg shadow-sm px-4", !field.value && "text-muted-foreground")}>
                                            <span>{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}</span>
                                            <CalendarIcon className="ml-2 h-5 w-5 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-[2rem] overflow-hidden border-2 shadow-2xl" align="start">
                                            <Calendar mode="single" captionLayout="dropdown-buttons" fromYear={1950} toYear={new Date().getFullYear()} selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                        </PopoverContent>
                                      </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )} />
                               <div className="space-y-2"><Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Verified Age</Label><Input value={age !== null ? `${age} years old` : 'Pending Selection'} disabled className="h-14 rounded-2xl border-2 bg-slate-50 font-black text-lg text-primary shadow-inner" /></div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <ReadOnlyField label="Full Registration Name" value={`${watch('firstName')} ${watch('surname')}`} />
                          <ReadOnlyField label="Calculated Maturity" value={age ? `${age} years` : 'Not verified'} />
                        </div>
                      )}
                      
                      {profile.role === 'student' && (
                        isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <FormField control={form.control} name="teacherId" render={({ field }) => (
                                      <FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Academy / Teacher *</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-14 rounded-2xl border-2 font-bold text-lg focus:ring-primary shadow-sm px-4"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-2xl border-2 shadow-xl">
                                          <SelectItem value="unassigned" className="font-bold text-red-600">DIRECT ENTRY (NONE)</SelectItem>
                                          {teachers.map(t => <SelectItem key={t.uid} value={t.uid} className="font-medium">{t.firstName} {t.surname}</SelectItem>)}
                                      </SelectContent></Select><FormMessage /></FormItem>
                                  )} />
                                <FormField control={form.control} name="grade" render={({ field }) => (
                                    <FormItem><FormLabel className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Current Grade/Standard *</FormLabel><Select onValueChange={field.onChange} value={field.value || ''}><FormControl><SelectTrigger className="h-14 rounded-2xl border-2 font-bold text-lg focus:ring-primary shadow-sm px-4"><SelectValue /></SelectTrigger></FormControl><SelectContent className="rounded-2xl border-2 shadow-xl">{grades.map(g => <SelectItem key={g} value={g} className="font-bold">{g}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                            </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <ReadOnlyField label="Training Academy" value={teacherName} />
                            <ReadOnlyField label="Mastery Grade" value={watch('grade')} />
                          </div>
                        )
                      )}
                    </div>

                    {isEditing && (
                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8">
                            {!isProfileEmpty && <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="h-14 px-10 rounded-2xl font-bold text-slate-500">Cancel Changes</Button>}
                            <Button type="submit" disabled={isSubmitting} className="h-16 px-12 text-lg font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-transform hover:scale-[1.01] active:scale-95">
                              {isSubmitting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <ShieldAlert className="mr-3 h-6 w-6" />} Complete Verification
                            </Button>
                        </div>
                    )}
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>

    <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="max-w-md rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
            <DialogHeader className="p-8 bg-slate-900 text-white">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Perfect Crop</DialogTitle>
                <CardDescription className="text-slate-400 font-bold">Align your profile photo for the best look.</CardDescription>
            </DialogHeader>
            <div className="flex justify-center p-8 bg-slate-50">
                {imgSrc && <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={1} circularCrop><img ref={imgRef} src={imgSrc} alt="Crop" className="max-h-[50vh] rounded-2xl shadow-xl" /></ReactCrop>}
            </div>
             <DialogFooter className="p-8 bg-white border-t flex gap-3">
               <Button variant="ghost" onClick={() => setIsPhotoDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
               <Button onClick={handleCropConfirm} className="rounded-xl px-8 font-black uppercase tracking-widest shadow-lg">Set Photo</Button>
             </DialogFooter>
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
                        <button key={i} onClick={() => selectAvatar(url)} className="relative aspect-square group rounded-xl overflow-hidden border-2 border-transparent hover:border-primary transition-all shadow-sm bg-white hover:shadow-lg active:scale-95">
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
        <div className="p-4 bg-white border-t text-center shrink-0">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" /> Scroll to explore all variations
          </p>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
